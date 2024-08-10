import React, { useCallback, useEffect } from "react";
import { Pattern, usePatternContext } from "../../Patterns";
import { __MP } from "../../../../../../../Buildin/src/main";
import { title } from "process";
import { Customization } from "../../../partials/pattern-customization";

const __: __MP = (window as any).__;

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
    selectable: true,
}


export const PrepareType = () => {

    const { editor } = usePatternContext();
    const defaultType = editor.DomComponents.getType('default');

    editor.Commands.add("detacth-pattern", {
        run(editor, sender, options) {
            const selected = editor.getSelected();
            if (selected) {
                const parent = selected.parent(); // Get the parent component
                const components = selected.getChildAt(0).components(); // Get child components

                if (parent && components.length) {
                    const index = selected.index() // Get the index of the selected component

                    // Loop through each child component and insert it at the selected component's position
                    components.each((component, i) => {
                        parent.components().add(JSON.parse(JSON.stringify(component)), { at: index + i });
                    });

                    // Remove the selected component after inserting its children
                    selected.remove();
                    editor.refresh();
                }
            }
        }
    });
    editor.Commands.add("customize-pattern", {
        run(editor, sender, options) {
            const selected = editor.getSelected();
            if (selected) {
                const name = (selected.get("attributes") || [])['pattern-name'] || null;
                if (name) {
                    let findPattern = (__.Website.Pattern.data as Pattern[]).find(e => e.name == name);
                    if (findPattern) {
                        let oldCallback = __.Website.Pattern.Customization.closeCallback;
                        __.Website.Pattern.Customization.closeCallback = function () {
                            __.Website.Pattern.Customization.updateRecords();
                            __.Website.Pattern.Customization.closeCallback = oldCallback;
                        }
                        Customization(editor).start(findPattern);
                    }
                }
            }
        }
    });


    const AddType = useCallback(() => {

        editor.Components.addType("website-pattern-wrapper", {
            model: {
                defaults: {
                    ...options,
                    locked: true,
                    components: [],
                    traits: [],
                    toolbar: []
                }
            }
        })

        editor.Components.addType("website-pattern", {
            model: {
                defaults: {
                    ...options,
                    selectable: true,
                    highlightable: true,
                    layerable: true,
                    draggable: true,
                    removable: true,
                    components: [],
                    traits: [],
                    toolbar: [
                        {
                            attributes: {
                                class: 'fa fa-pen-nib',
                                title: "Customizing"
                            },
                            command: "customize-pattern"
                        },
                        {
                            attributes: {
                                class: 'fa fa-link-slash',
                                title: "detacth pattern"
                            },
                            command: "detacth-pattern"
                        },
                        {
                            attributes: {
                                class: 'fa fa-trash',
                                title: 'remove component'
                            },
                            command: 'tlb-delete',
                        }
                    ],

                },
                init() {
                    const name = this.get("attributes")['pattern-name'] || null;

                    __.Website.Pattern.on("update", (e: Event, patterns: Pattern[]) => {
                        const pattern = patterns.find(e => e.name == name);
                        if (pattern) {
                            this.components([
                                {
                                    type: "website-pattern-wrapper",
                                    components: pattern.components
                                }
                            ]);
                            this.view.render();
                        }
                    });

                    setTimeout(() => {
                        let findPattern = (__.Website.Pattern.data as Pattern[]).find(e => e.name == name);
                        if (findPattern) {
                            this.components([
                                {
                                    type: "website-pattern-wrapper",
                                    components: findPattern.components
                                }
                            ]);
                            this.view.render();
                        }
                    }, 100);
                }
            },
            view: defaultType.view.extend({
                events: {
                    dblclick: () => {
                        editor.runCommand("customize-pattern");
                    }
                },
                render() {

                    this.$el.addClass("pattern-block");
                    this.renderChildren();
                    if (this.model.get("components").length < 1) {
                        this.$el.append($(`<div class='py-5 text-center text-muted'>Empty Pattern</div>`));
                    }
                    this.$el.css({ position: "relative" })
                    const label = $(`<span>${this.model.get("attributes")["pattern-name"] || "Unknown Pattern"}</span>`)
                        .css({
                            position: "absolute",
                            color: "white",
                            left: 0,
                            padding: ".1rem 1rem",
                            background: "#da86a2 ",
                            fontSize: "10px"
                        })
                    this.$el
                        .on("mouseenter", () => {
                            if (this.model.index() <= 0) {
                                label.css({
                                    bottom: "-1.2rem",
                                    top: "unset"
                                })
                            }
                            this.$el.append(label);
                        })
                        .on("mouseleave", () => {
                            label.remove();
                        })

                    return this;
                }
            })
        });

        const doc = editor.Canvas.getDocument();
        const style = doc.createElement("style");
        style.innerHTML = `
            .pattern-block.gjs-selected {
                margin: 2px;
                outline: 2px solid #da86a2 !important;
                outline-offset: unset !important;
                background: #f8aef8;
            }
            .pattern-block.gjs-selected>* {
                opacity: 0.9;
            }`;
        doc.head.appendChild(style);

        editor.on('component:selected', (component) => {
            const name = component.get('name') || 'Unnamed Component';
            const componentNameElement = document.getElementById('component-name');
            if (componentNameElement) {
                componentNameElement.innerHTML = `Selected Component: ${name}`;
            }
        });
    }, []);


    useEffect(() => {
        if (editor) {
            AddType();
        }
    }, [AddType]);

    return (
        <></>
    )
}