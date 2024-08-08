import { Editor } from "grapesjs";
import { Pattern } from "../plugins/Patterns";
import { __MP } from "../../../../../Buildin/src/main";
import _, { isEmpty } from "underscore";
const __: __MP = (window as any).__;


const requiredKeys = ["name", "label", "components", "style"];
const cleanPatternData = (pattern: Pattern) => {
    const clone = {};
    Object.keys(pattern).forEach(key => {
        if (requiredKeys.includes(key)) {
            let val = pattern[key];
            if (typeof val !== "string") {
                val = JSON.stringify(val);
            }
            clone[key] = val;
        }
    });
    return clone;
}

export const findDifferences = (obj1: any, obj2: any, path: string[] = []): Record<string, any> => {
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
            differences[currentPath.join('.')] = { obj1: value1, obj2: value2 };
        }
    });

    return differences;
}


const Customization = (editor: Editor) => {

    let pattern: Pattern;
    let patternComponents: any = [];
    let patternStyle: any = "";

    let oldSaveHandler: any;
    let oldComponents: any;
    let oldCss: any;
    let isChanged = false;


    const updateHandler = () => {

        if (!pattern) return;
        const components = JSON.parse(JSON.stringify(editor.getComponents()));
        const style = editor.getCss() || "";

        if (!isEmpty(findDifferences(components, patternComponents)) || (patternStyle || "") !== (style || "")) {
            isChanged = true;
        } else isChanged = false;

        pattern.style = style;
        pattern.components = components;
    }


    const saveHandler = function () {
        __.Website.Pattern.handle("save", cleanPatternData(pattern))
            .then(() => {
                isChanged = false;
                patternComponents = JSON.parse(JSON.stringify(pattern.components));
                patternStyle = String(pattern.style || "").toString();
                this.resolve("Pattern saved successful!");
                setTimeout(() => {
                    __.Website.Pattern.fire("update:" + pattern.name, JSON.parse(JSON.stringify(pattern)));
                }, 100);
            })
            .catch((reason: string) => {
                this.reject(reason || "Failed save pattern!", 5, 'text-danger');
            })
    }



    const doc = editor.Canvas.getDocument();
    let styleEl = doc.createElement("style");
    styleEl.innerHTML =
        `html {
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 100vh;
            background: #0000000a;
        }
        body {
            outline: 2px solid #ff10ff;
            margin: 2px;
            padding: 0;
            min-height: unset;
        }
        [data-gjs-type="wrapper"] {
            min-height: unset !important;
        }`;


    const exitButton = $(`<button class='btn btn-danger rounded-circle' type="button" title="Exit editing pattern"><i class="fa-solid fa-x"></i></button>`)
        .css({
            position: "fixed",
            top: "65px",
            right: "15px",
            margin: "1rem",
            zIndex: 99999,
            boxShadow: "0px 5px 25px #FFFFFF55"
        })
        .on("click", () => exit());




    const exit = () => {

        if (isChanged) {
            __.dialog.warning("Are You Sure?", "you have unsaved changes, this action will reset the changes.")
                .then(() => forward())
        } else forward()

        function forward() {

            exitButton.remove();
            styleEl.remove();

            __.Editor.callbackHandler = oldSaveHandler;
            // clear editor
            editor.Components.clear();
            editor.StyleManager.clear();

            // set old instance
            editor.setComponents(oldComponents);
            editor.setStyle(oldCss);

            editor.Panels.getButton('sidebar-panel', 'pages')?.set("disable", false);
            editor.Panels.getButton('sidebar-panel', 'patterns')?.set("disable", false);
            // editor.Panels.getButton("action-panel", 'code-btn')?.set("disable", false);
            editor.Panels.getButton('sidebar-panel', 'patterns')?.set("active", true);

            editor.off("update", updateHandler);

            if (__.Website.Pattern.Customization.closeCallback instanceof Function) {
                __.Website.Pattern.Customization.closeCallback();
            }
        }

    }


    const start = (_pattern: Pattern) => {

        if (pattern) exit();
        isChanged = false;
        pattern = JSON.parse(JSON.stringify(_pattern));
        patternComponents = JSON.parse(JSON.stringify(pattern.components));
        patternStyle = String(pattern.style || '').toString();
        styleEl.remove();
        doc.body.appendChild(styleEl);

        // save old instance
        oldSaveHandler = __.Editor.callbackHandler;
        oldComponents = JSON.parse(JSON.stringify(editor.getComponents()));
        oldCss = editor.getCss();

        // clear editor
        editor.Components.clear();
        editor.StyleManager.clear();

        // replace new instance
        editor.setStyle(pattern.style);
        editor.setComponents(pattern.components);

        __.Editor.callbackHandler = saveHandler;

        editor.Panels.getButton('sidebar-panel', 'pages')?.set("disable", true);
        editor.Panels.getButton('sidebar-panel', 'patterns')?.set("disable", true);
        // editor.Panels.getButton("action-panel", 'code-btn')?.set("disable", true);
        editor.Panels.getButton('sidebar-panel', 'blocks-btn')?.set("active", true);

        editor.on("update", updateHandler);

        return {
            exit
        }
    }

    $(document.body).append(
        exitButton
    )


    return {
        start,
        exit
    }
}

export { Customization };