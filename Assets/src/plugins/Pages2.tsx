import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { Editor } from "grapesjs";
import Container from "./components/pages/pages-container";
import Header from "./components/pages/pages-header";
import { __MP } from "../../../../../Buildin/src/main";
import FormContainer from "./components/pages/pages-form";
import { debounce, isEmpty } from "lodash";
import _ from "underscore";
import { convertKeysToCamelCase } from "../partials/converter";

const __: __MP = (window as any).__;

export enum TypeList {
    text = "text",
    logtext = "logtext",
    color = "color",
    image = "image",
    asset = "asset",
    check = "check"
}

export type TPageProp = {
    disabled?: boolean
    type: TypeList
    selectedType?: any
    name: string
    placeholder?: string
    label: string
    value?: string
    default?: string
    [key: string]: any
}

export type TPage = {
    id?: string;
    name: string;
    title: string;
    description?: string | null;
    route: string;
    components: any[];
    styles?: string | null;
    header?: string;
    post_date?: string;
    update_date?: string;
    isChanged?: boolean;
    removable: boolean;
    properties: TPageProp[];
}

type TPageContext = {
    editor: Editor;
    pages: TPage[];
    setPages: React.Dispatch<React.SetStateAction<TPage[]>>;
    current: TPage | null;
    setCurrent: React.Dispatch<React.SetStateAction<TPage | null>>;
    startCustomize: (page: TPage) => void;
    __: __MP;
    reload: boolean;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
    isEditLayerOpen: boolean;
    setIsEditLayerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    [key: string]: any
}


const PageContext = createContext<TPageContext>({} as TPageContext);
export const usePageContext = () => useContext(PageContext);

const PageProvider = ({ editor, children }: { editor: Editor, children?: React.ReactNode }) => {


    const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);

    const [pages, setPages] = useState<TPage[]>([]);
    const [current, setCurrent] = useState<TPage | null>(null);
    const [currentName, setCurrentName] = useState<string | null>(null);
    const [isEditLayerOpen, setIsEditLayerOpen] = useState<boolean>(false);
    const [reload, setReload] = useState<boolean>(true);



    const fetchPages = (callback: (pages: TPage[]) => void) => {
        __.Website.Pages.handle("fetch")
            .then((result: TPage[]) => {
                if (Array.isArray(result)) {
                    callback(result);
                }
            })
            .catch((err: string) => {
                __.toast(err || "Failed fetch pages", 5, 'text-danger');
            });
    }

    // update request handler
    const updatePagesRecords = () => {
        return new Promise<TPage[]>((acc, rej) => {
            fetchPages((pages) => {
                const newpages = pages.map(p => {
                    p.properties = convertKeysToCamelCase(p.properties);
                    return p;
                });
                setPages(newpages);
                setTimeout(() => acc(newpages), 200);
            });
        })
    }


    const resetCallback = () => {
        updatePagesRecords().then((pages) => {
            const foundPage = pages.find(p => p.name === current?.name);
            if (foundPage) {
                editor.setStyle(foundPage.styles);
                editor.setComponents(foundPage.components);
                setCurrent(current => current ? { ...current, ...foundPage } : null);
            }
        })
    }


    const removeCallback = () => {
        // filter records pages 
        setPages(pages => pages.filter(p => p.name != current?.name));
        const indexPage = pages.find(p => p.name.toLocaleLowerCase() == "website/index");
        editor.setStyle(indexPage?.styles || "");
        editor.setComponents(indexPage?.components || []);
        setCurrent(indexPage ?? null);
    }


    const addCallback = (newp: TPage) => {
        updatePagesRecords().then((pages) => {
            const foundPage = pages.find(p => p.name === newp?.name);
            if (foundPage) {
                editor.setStyle(foundPage.styles);
                editor.setComponents(foundPage.components);
                setCurrent(foundPage);
            }
        })
    }


    const startCustomize = (page: TPage) => {

        const foundPage = pages.find(p => p.name === page?.name);
        if (!foundPage) {
            return;
        }
        if (foundPage?.isChanged) {
            __.dialog.warning("Are you sure?", "You have unsave changes, move page will discard the changes.")
                .then(() => {
                    foundPage.isChanged = false;
                    process();
                })
            return;
        }

        process();

        function process() {
            if (foundPage) {
                setCurrent(foundPage);
                window.localStorage.setItem('customize-page', foundPage.name);
                editor.Components.clear();
                editor.StyleManager.clear();
                editor.setStyle(foundPage.styles);
                editor.setComponents(foundPage.components);

                const wrapper = editor.getWrapper() as any;
                wrapper.addStyle({
                    'min-height': '100vh',
                    'display': 'block'
                });
                if (isEditLayerOpen) setIsEditLayerOpen(false);
            }
        }
    }


    // initial customization pages
    useEffect(() => {
        if ((pages || []).length && isFirstLoad) {
            const storageCustomizeName = window.localStorage.getItem('customize-page');
            const foundPage = storageCustomizeName ? pages.find(page => page.name === storageCustomizeName) : null;
            const initPage = foundPage || pages.sort((a, b) => a.route.localeCompare(b.route))[0];
            startCustomize(initPage);
            setIsFirstLoad(false);
        }
    }, [pages, isFirstLoad]);

    // load initial data and setPages
    useEffect(() => {
        if (isFirstLoad) updatePagesRecords();
    }, [isFirstLoad]);


    useEffect(() => {
        if (!isFirstLoad) {
            if (current !== null) {
                const foundPage = pages.find(p => p.name === current.name);
                if (foundPage) {
                    foundPage.isChanged = deepCompare(current, foundPage);
                }
                window.localStorage.setItem('customize-page', current.name);
            }
        }
        if (current?.name && currentName != current?.name) {
            __.Editor.callbackHandler = handleSaveCallback;
            setCurrentName(current?.name || null);
        }
    }, [current]);

    const reorderJsonKeys = (data: any): any => {
        if (Array.isArray(data)) {
            return data.map(reorderJsonKeys);
        } else if (typeof data === 'object' && data !== null) {
            return Object.keys(data).sort().reduce((result, key) => {
                result[key] = reorderJsonKeys(data[key]);
                return result;
            }, {} as Record<string, any>);
        } else {
            return data;
        }
    }

    const filterComponent = (component: any): any => ({
        type: component.type,
        tagName: component.tagName,
        components: component.components ? component.components.map(filterComponent) : [],
        classes: component.classes || [],
        attributes: component.attributes || {},
    });

    const filterPage = (page: TPage): TPage => {
        const filteredPage = {
            title: page.title || "",
            description: page.description || "",
            properties: page.properties || [],
            components: page.components.map(filterComponent),
            route: page.route || "",
        };
        return reorderJsonKeys(filteredPage) as TPage;
    }

    const findDifferences = (obj1: any, obj2: any, path: string[] = []): Record<string, any> => {
        const differences: Record<string, any> = {};

        const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
        keys.forEach(key => {
            const value1 = obj1[key];
            const value2 = obj2[key];
            const currentPath = [...path, key];

            if (value1 == value2 || (typeof value1 == "undefined" && isEmpty(value2)) || (typeof value2 == "undefined" && isEmpty(value1))) {
                return;
            }

            if (_.isObject(value1) && _.isObject(value2)) {
                const nestedDifferences = findDifferences(value1, value2, currentPath);
                if (!_.isEmpty(nestedDifferences)) {
                    differences[currentPath.join('.')] = nestedDifferences;
                }
            } else {
                if (value1 == value2) return;
                // console.log(key, value1);
                // console.log(key, value2);
                differences[currentPath.join('.')] = { obj1: value1, obj2: value2 };
            }
        });

        return differences;
    }

    const deepCompare = (a: TPage, b: TPage): boolean => {
        if (!Array.isArray(a.components) || !Array.isArray(b.components)) return false;

        const cloneA = filterPage(a);
        const cloneB = filterPage(b);
        const differences = findDifferences(cloneA, cloneB);
        return !_.isEmpty(differences);
    }

    const handleSaveCallback = function () {

        const clone = JSON.parse(JSON.stringify(current));
        clone.components = JSON.stringify(editor.getComponents());
        clone.styles = editor.getCss();

        __.Website.Pages.handle("save", clone)
            .then((e: any) => {
                this.resolve("Save successful");
                updatePagesRecords().then((pages) => {
                    let findIndex = pages.find(o => o.id == e.id);
                    if (findIndex) {
                        setCurrent(current => current ? { ...current, ...findIndex } : null);
                    }
                });
            })
            .catch((err: string) => {
                this.reject(err || "Failed save page!");
            });
    }

    const debouncedSetValue = useCallback(
        debounce(() => {
            const components = JSON.parse(JSON.stringify(editor.getComponents()));
            const styles = editor.getCss() || "";
            setCurrent(current => current ? { ...current, components, styles } : null);
        }, 0),
        []
    );

    useEffect(() => {
        editor.on("update", () => {
            if (current) debouncedSetValue();
        });
    }, [editor, current, debouncedSetValue]);

    const value: TPageContext = {
        editor,
        pages,
        setPages,
        current,
        setCurrent,
        __,
        startCustomize,
        reload,
        setReload,
        isEditLayerOpen,
        setIsEditLayerOpen,
        resetCallback, removeCallback, addCallback
    }

    const rootRefs = useRef<Map<HTMLElement, ReactDOM.Root>>(new Map());

    useEffect(() => {
        document.querySelectorAll('.editor-canvas-wrapper').forEach(canvas => {
            let mainContent = canvas.querySelector('.pages-form-container') as any

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
