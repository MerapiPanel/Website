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
    name: string // uniq name
    label: string
    media?: any
    components: any[]
    removable: boolean
    [key: string]: any
}


type TPatternsContext = {
    editor: Editor
    patterns: Pattern[]
    [key: string]: any
    __: __MP
    addPattern: (pattern: Pattern) => void
    removePattern: (pattern: Pattern) => void
    savePattern: (pattern: Pattern) => void
    openLayerManager: boolean
    setOpenLayerManager: React.Dispatch<React.SetStateAction<boolean>>
}


const PatternsContext = createContext<TPatternsContext>({} as any);
export const usePatternContext = () => useContext(PatternsContext);

const Patterns = ({ editor }: { editor: Editor }) => {

    const requiredKeys = ["name", "label", "components"];
    const [openLayerManager, setOpenLayerManager] = useState(false);
    const [patterns, setPatterns] = useState<Pattern[]>([]);
    var initial = true;


    __.Website.Pattern.Customization = {
        closeCallback() {
            setOpenLayerManager(true);
            this.updateRecords();
        },
        updateRecords() {
            fetchPatterns((patterns) => {
                setTimeout(() => __.Website.Pattern.fire("update", patterns), 100);
            });
        }
    }

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

    const fetchPatterns = (callback: (patterns: Pattern[]) => void = () => { }) => {
        __.Website.Pattern.handle("fetch")
            .then((patterns: Pattern[]) => {
                if (Array.isArray(patterns)) {
                    setPatterns((patterns || []).map(pattern => {

                        if (!pattern.media) {
                            pattern.media = `<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" class="bi bi-columns-gap" viewBox="0 0 16 16"><path d="M6 1v3H1V1zM1 0a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1zm14 12v3h-5v-3zm-5-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1zM6 8v7H1V8zM1 7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zm14-6v7h-5V1zm-5-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1z"/></svg>`;
                        }

                        pattern.content = {
                            type: "website-pattern",
                            components: [
                                {
                                type: "website-pattern-wrapper",
                                components: pattern.components
                            }
                            ],
                            attributes: {
                                "pattern-name": pattern.name,
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

        __.Website.Pattern.handle("save", cleanPatternData(pattern))
            .then(() => {
                __.toast("Success add pattern", 5, 'text-success');
                fetchPatterns();
            })
            .catch((reason: string) => {
                __.toast(reason || "Caught an error!", 5, 'text-danger');
            })
    }

    const removePattern = (pattern: Pattern) => {
        __.Website.Pattern.handle("remove", cleanPatternData(pattern))
            .then(() => {
                __.toast("Success remove pattern", 5, 'text-success');
                fetchPatterns();
            })
            .catch((reason: string) => {
                __.toast(reason || "Caught an error!", 5, 'text-danger');
            })
    }

    const savePattern = (pattern: Pattern) => {
        __.Website.Pattern.handle("save", cleanPatternData(pattern))
            .then(() => {
                __.toast("Success save pattern", 5, 'text-success');
                fetchPatterns();
            })
            .catch((reason: string) => {
                __.toast(reason || "Caught an error!", 5, 'text-danger');
            })
    }


    useEffect(() => {
        __.Website.Pattern.data = patterns;
    }, [patterns]);

    /** INITIAL LOAD */
    useEffect(() => {
        if (initial) fetchPatterns(() => { initial = false })
    }, []);

    const value = {
        editor, patterns, __,
        addPattern, removePattern, savePattern,
        openLayerManager, setOpenLayerManager
    }

    return (
        <PatternsContext.Provider value={value}>
            <PrepareType />
            <PatternManager />
        </PatternsContext.Provider>
    )
}

export default Patterns;