import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";

import { AddComponentTypeOptions, Components, Editor } from "grapesjs";
import { EditorView, basicSetup, minimalSetup } from 'codemirror';
import { autocompletion } from "@codemirror/autocomplete";
import { html } from '@codemirror/lang-html';
import { __MP } from "../../../../../Buildin/src/main";
import { PrepareType } from "./components/patterns/prepare-type";
import PatternManager from "./components/patterns/pattern-manager";


const __: __MP = (window as any).__;

export type Pattern = {
    id?: string
    name?: string // uniq name
    label: string
    media: any
    content: any
    components: any[]
    isChanged: boolean
    [key: string]: any
}


type TPatternsContext = {
    editor: Editor
    patterns: Pattern[]
    [key: string]: any
    __: __MP
    addPattern: (pattern: Pattern) => void
}


const PatternsContext = createContext<TPatternsContext>({} as any);
export const usePatternContext = () => useContext(PatternsContext);

const Patterns = ({ editor }: { editor: Editor }) => {

    const [patterns, setPatterns] = useState<Pattern[]>([]);
    var initial = true;


    const fetchPatterns = (callback: (patterns: Pattern[]) => void = () => { }) => {
        __.Website.Pattern.handle("fetch")
            .then((patterns: Pattern[]) => {
                if (Array.isArray(patterns)) {
                    setPatterns((patterns || []).map(pattern => {
                        pattern.content = {
                            type: "pattern",
                            components: [pattern.content],
                            attributes: {
                                "pattern-name": pattern.name
                            }
                        }
                        return pattern;
                    }));
                    callback(patterns);
                } else {
                    __.toast("List pattern is must be array, " + typeof patterns + " was passed.", 5, 'text-danger');
                }
            }).catch((reason: string) => {
                __.toast(reason || "Caught an error!", 5, 'text-danger');

            })
    }

    const addPattern = (pattern: Pattern) => {
        __.Website.Pattern.handle("save", pattern)
            .then(() => {
                __.toast("Success add pattern", 5, 'text-success');
                fetchPatterns();
            })
            .catch((reason: string) => {
                __.toast(reason || "Caught an error!", 5, 'text-danger');
            })
    }


    /** INITIAL LOAD */
    useEffect(() => {
        if (initial) fetchPatterns(() => { initial = false })
    }, []);

    const value = {
        editor, patterns, __,
        addPattern
    }

    return (
        <PatternsContext.Provider value={value}>
            <PrepareType />
            <PatternManager />
        </PatternsContext.Provider>
    )
}

export default Patterns;

// export const Register = (editor: Editor, opts: {
//     appendTo?: string
// } = {}) => {


//     const blockManager = editor.BlockManager;
//     var newBlocksEl: any;

const options = {
    removable: false,

    // Indicates if it's possible to drag the component inside other
    // Tip: Indicate an array of selectors where it could be dropped inside
    draggable: false,

    // Indicates if it's possible to drop other components inside
    // Tip: Indicate an array of selectors which could be dropped inside
    droppable: false,

    // Set false if don't want to see the badge (with the name) over the component
    badgable: false,

    // True if it's possible to style it
    // Tip:  Indicate an array of CSS properties which is possible to style
    stylable: false,

    // Highlightable with 'dotted' style if true
    highlightable: false,

    // True if it's possible to clone the component
    copyable: false,

    // Indicates if it's possible to resize the component (at the moment implemented only on Image Components)
    resizable: false,
    // Hide the component inside Layers
    layerable: false,

    // Allow to edit the content of the component (used on Text components)
    editable: false,
    selectable: false,
}

//     editor.Components.addType("pattern", {
//         model: {
//             defaults: {
//                 ...options,
//                 selectable: true,
//                 highlightable: true,
//                 layerable: true,
//                 draggable: true,
//                 removable: true,
//                 components: [],
//                 traits: [
//                     {

//                     },
//                     {
//                         type: 'button',
//                         text: 'Reset',
//                         full: true, // Full width button
//                         command: editor => { alert('Hello') },
//                     }],
//                 toolbar: [
//                     {
//                         attributes: { class: 'fa fa-pen-nib' },
//                         command: {
//                             run() {

//                             }   
//                         },
//                     },
//                     {
//                         attributes: { class: 'fa fa-link-slash' },
//                         command: 'tlb-move',
//                     },
//                     {
//                         attributes: { class: 'fa fa-trash' },
//                         command: 'tlb-delete',
//                     }
//                 ],
//             },
//             init() {
//                 setTimeout(() => this.applyConfigToChild(this.get("components") || []), 300);
//             },
//             applyConfigToChild(components: any = []) {
//                 components.forEach(component => {
//                     component.set({ ...options, toolbar: [], traits: [] });
//                     const childComponents = component.components();
//                     if (childComponents.length) {
//                         this.applyConfigToChild(childComponents.models);
//                     }
//                 });
//             },
//         },
//         view: {
//             render() {
//                 this.$el.addClass("pattern-block");
//                 this.renderChildren();
//                 return this;
//             }
//         }
//     });



//     editor.on('change', (e, d, c) => {
//         const selected = editor.getSelected();
//         // console.log(selected?.get("selectable"));
//     })





//     editor.Commands.add("pattern:customize", {

//         run: function (editor, sender, opts) {
//             console.log(opts);
//             editor.setComponents(opts.content);
//             adjustCanvas();
//         }
//     });

//     // Function to adjust canvas size based on content
//     function adjustCanvas() {
//         const wrapper: any = editor.getWrapper();
//         wrapper.addStyle({
//             'min-height': '100vh',
//             'display': 'flex',
//             'flex-direction': 'column',
//             'align-content': 'center',
//             'justify-content': 'center'
//         });
//     }

//     function render() {

//         if (opts.appendTo) {
//             const container = $(opts.appendTo);

//             container.html("");
//             container.append(
//                 $(`<div class="d-flex justify-content-between w-100">`)
//                     .append(
//                         $(`<h5>Patterns</h5>`),
//                         $(`<button type="button" class="btn btn-sm text-primary border-primary rounded-0 border py-0 m-1"><i class="fa-solid fa-gears"></i></button>`)
//                             .on('click', () => { })
//                     ),
//                 $(`<div class="flex-grow-1">`)
//                     .append(
//                         newBlocksEl as any
//                     )
//             );
//         }

//     }

//     render();
// }