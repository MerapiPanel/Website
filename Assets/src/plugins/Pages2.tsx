import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { Editor } from "grapesjs";
import Container from "./components/pages-container";
import Header from "./components/pages-header";
import { __MP } from "../../../../../Buildin/src/main";
import FormContainer from "./components/pages-form";
const __: __MP = (window as any).__;

export enum TypeList {
    text = "text",
    logtext = "logtext",
    color = "color",
    asset = "asset"
}
export type TPageProp = {
    type: TypeList
    name: string
    label: string
    value: string
}

export type TPage = {
    id?: string
    name: string
    title: string
    description: string | undefined | null
    route: string
    components: any[]
    styles: string | undefined | null
    header?: string
    post_date?: string
    update_date?: string
    isChanged?: boolean
    removable: boolean
    properties: TPageProp[]
}

type TPageContext = {
    editor: Editor
    pages: TPage[]
    setPages: React.Dispatch<React.SetStateAction<TPage[]>>
    current: TPage | null
    setCurrent: React.Dispatch<React.SetStateAction<TPage | null>>
    __: __MP
    reload: boolean
    setReload: React.Dispatch<React.SetStateAction<boolean>>
    editing: TPage | null
    setEditing: React.Dispatch<React.SetStateAction<TPage | null>>
}

// Create a context
const PageContext = createContext<TPageContext>({} as any);
export const usePageContext = () => useContext(PageContext);

const PageProvider = ({ editor, children }: { editor: Editor, children?: React.JSX.Element }) => {

    const pageKeys = ["id", "name", "title", "description", "route", "components", "styles", "variables", "header", "post_date", "update_date", "isChanged"];
    const [pages, setPages] = useState<TPage[]>([]);
    const [current, setCurrent] = useState<TPage | null>(null);
    const [editing, setEditing] = useState<TPage | null>(null);
    const [reload, setReload] = useState<boolean>(true);


    useEffect(() => {
        if (reload) {
            __.Website.Pages.handle("fetch")
                .then((result: TPage[]) => {
                    setPages(result);
                    setCurrent(null);
                })
                .catch((err: string) => {
                    __.toast(err || "Failed fetch pages", 5, 'text-danger')
                });
            setReload(false);
        }
    }, [reload]);

    useEffect(() => {
        if (current == null) {
            loadInitialCustomize();
        }
        if (current != null) {
            if (editing && editing.name != current.name) {
                setEditing(null);
            }
            if (pageKeys.filter(key => Object.keys(current).includes(key)).length <= 3) {
                setCurrent(null);
                return;
            }
            window.localStorage.setItem('customize-page', JSON.stringify(current));
            const components = typeof current.components === "string" ? JSON.parse(current.components) : current.components || [];
            const styles = current.styles || "";
            editor.setComponents(components);
            editor.setStyle(styles);
            const wrapper: any = editor.getWrapper();
            wrapper.addStyle({
                'min-height': '100vh',
                'display': 'block'
            });
            __.Editor.callbackHandler = handleSaveCallback;
        }
    }, [current, pages]);


    function handleSaveCallback() {
        const _this = this;
        if (current) {
            current.components = JSON.stringify(editor.getComponents()) as any;
            current.styles = editor.getCss() as any;
            current.isChanged = false;
        }
        __.Website.Pages.handle("save", current)
            .then(() => {
                _this.resolve("Save successful");
                setReload(true);
            }).catch((err: string) => {
                _this.reject(err || "Failed save page!")
            });
    }

    function startCustomize(page: TPage) {

        const pageKeys = ["id", "name", "title", "description", "route", "components", "styles", "variables", "header", "post_date", "update_date", "isChanged"];
        if (pageKeys.filter(key => Object.keys(page).includes(key)).length <= 3) {
            return;
        }
        setCurrent(page);
        window.localStorage.setItem('customize-page', JSON.stringify(page));
    }

    function loadInitialCustomize() {
        const storageCustomizePage = window.localStorage.getItem('customize-page');
        if (storageCustomizePage) {
            const spage = JSON.parse(storageCustomizePage);
            let find = pages.find(page => page.name == spage.name);
            if (pages.length) {
                startCustomize(find || pages.sort((a, b) => a.route > b.route ? 1 : -1)[0]);
            }
        }
    }


    const value: TPageContext = {
        editor,
        pages, setPages,
        current, setCurrent, __,
        reload, setReload,
        editing, setEditing
    }

    const rootRefs = useRef(new Map());

    useEffect(() => {
        document.querySelectorAll('.editor-canvas-wrapper').forEach(canvas => {
            let mainContent = canvas.querySelector('.pages-form-container');

            if (!mainContent) {
                mainContent = document.createElement('div');
                mainContent.classList.add('pages-form-container');
                canvas.append(mainContent);
            }

            let root = rootRefs.current.get(mainContent);
            if (!root) {
                root = ReactDOM.createRoot(mainContent);
                rootRefs.current.set(mainContent, root);
            }

            root.render(
                <React.StrictMode>
                    <PageContext.Provider value={value}>
                        <FormContainer />
                    </PageContext.Provider>
                </React.StrictMode>
            );
        });
    }, [value]);

    return (
        <PageContext.Provider value={value}>
            <Header />
            <Container />
        </PageContext.Provider>
    )
}
export default PageProvider;