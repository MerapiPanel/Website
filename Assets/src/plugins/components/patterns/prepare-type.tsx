import React, { useCallback, useEffect } from "react";
import { Editor } from "grapesjs";
import { usePatternContext } from "../../Patterns";


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


export const PrepareType = () => {

    const { editor } = usePatternContext();


    const AddType = useCallback(() => {

        editor.Components.addType("pattern", {
            model: {
                defaults: {
                    ...options,
                    selectable: true,
                    highlightable: true,
                    layerable: true,
                    draggable: true,
                    removable: true,
                    components: [],
                    traits: [
                        {

                        },
                        {
                            type: 'button',
                            text: 'Reset',
                            full: true, // Full width button
                            command: editor => { alert('Hello') },
                        }],
                    toolbar: [
                        {
                            attributes: { class: 'fa fa-pen-nib' },
                            command: {
                                run() {

                                }
                            },
                        },
                        {
                            attributes: { class: 'fa fa-link-slash' },
                            command: 'tlb-move',
                        },
                        {
                            attributes: { class: 'fa fa-trash' },
                            command: 'tlb-delete',
                        }
                    ],
                },
                init() {
                    setTimeout(() => this.applyConfigToChild(this.get("components") || []), 300);
                },
                applyConfigToChild(components: any = []) {
                    components.forEach(component => {
                        component.set({ ...options, toolbar: [], traits: [] });
                        const childComponents = component.components();
                        if (childComponents.length) {
                            this.applyConfigToChild(childComponents.models);
                        }
                    });
                },
            },
            view: {
                render() {
                    this.$el.addClass("pattern-block");
                    this.renderChildren();
                    return this;
                }
            }
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