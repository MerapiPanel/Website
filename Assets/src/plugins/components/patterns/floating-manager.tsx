import React, { useContext, useEffect, useRef, useState } from "react";
import { Pattern, usePatternContext } from "../../Patterns";
import { ActionWrapper } from "./actions";
import * as rasterizeHTML from 'rasterizehtml';


const AddForm = () => {

    const inputRefs = useRef<HTMLInputElement | any>();
    const { __, addPattern } = usePatternContext();

    const handleClick = () => {
        if (inputRefs.current) {
            const input = inputRefs.current;
            if ((input.value || "").length <= 0) {
                inputRefs.current.focus();
                __.toast("Please enter pattern name", 5, 'text-danger');
            } else {
                addPattern({
                    name: Date.now().toString(16),
                    label: input.value,
                    media: "Pattern",
                    components: [{
                        classes: ["text-center", "py-5", "fw-bold"],
                        components: [
                            {
                                type: "text",
                                content: "Custom Pattern"
                            }
                        ]
                    }],
                    removable: true
                });
                input.value = "";
            }
        }
    }

    return (
        <div className="row">
            <div className="col-12 col-lg-6">
                <div className="d-flex p-3 gap-3">
                    <input type="text" className="form-control" ref={inputRefs} placeholder="Enter name new pattern" />
                    <button className="ms-3 btn btn-sm btn-outline-primary text-nowrap" onClick={handleClick}>
                        <i className="fa-solid fa-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    )
}


const CollectionMedia = ({ pattern }: { pattern: Pattern }) => {

    const isHTML = (str: string) => {
        // Simple regex to detect HTML tags
        const htmlRegex = /<[^>]*>/;
        return htmlRegex.test(str);
    };

    const isURL = (str: string) => {
        try {
            new URL(str);
            return true;
        } catch (_) {
            return false;
        }
    };

    const detectStringType = (str: string) => {
        if (isHTML(str)) {
            return 'html';
        }
        if (isURL(str)) {
            return 'url';
        }
        return 'plaint';
    };

    const mediaParentStyle = {
        width: '180px',
        height: '100px',
        overflow: "hidden",
        display: "inline-block"
    }


    const updateHtmlCanvas = (canvas: HTMLCanvasElement, html: string) => {
        const assets: any[] = [];
        document.querySelectorAll("link[rel='stylesheet']").forEach(link => {
            assets.push($(link).prop("outerHTML"));
        });
        document.querySelectorAll("style").forEach(style => {
            assets.push($(style).prop("outerHTML"));
        });
        rasterizeHTML.drawHTML(`<html><head>${assets.join('')}</head><body>${pattern.html}</body></html>`, canvas);
    }



    if (pattern.html) {
        const cavasRefs = useRef(null);

        useEffect(() => {
            if (cavasRefs.current) {
                updateHtmlCanvas(cavasRefs.current, pattern.html);
            }
        }, [pattern]);
        
        useEffect(() => {
            if (cavasRefs.current) {
                updateHtmlCanvas(cavasRefs.current, pattern.html);
            }
        }, [cavasRefs]);
        return (
            <div style={mediaParentStyle}>
                <canvas style={{ width: '100%' }} ref={cavasRefs}></canvas>
            </div>
        )
    }

    const mediaType = detectStringType(pattern.media);
    return (
        <>
            {mediaType == "html" && (
                <div style={mediaParentStyle} dangerouslySetInnerHTML={{ __html: pattern.media }}></div>
            )}
            {mediaType == "url" && (
                <div style={mediaParentStyle}>
                    <img className="object-fit-contain" src={pattern.media} alt="Media" />
                </div>
            )}
            {mediaType == "plaint" && (
                <div style={mediaParentStyle}>
                    {pattern.media}
                </div>
            )}
        </>
    )
}

const CollectionItem = ({ pattern }: { pattern: Pattern }) => {

    return (
        <div style={{
            flexBasis: "230px",
            boxShadow: "0 0 4px aliceblue",
            margin: "4px 10px",
            borderRadius: "0.3rem",
            overflow: "hidden",
            padding: "1rem",
            cursor: "pointer",
            position: "relative"
        }}>
            <CollectionMedia pattern={pattern} />
            <div>{pattern.label}</div>
            <div className="dropdown position-absolute top-0 end-0 m-1 text-white">
                <button className="btn px-2 text-white" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="fa-solid fa-ellipsis-vertical fa-lg"></i>
                </button>
                <ul className="dropdown-menu">
                    <ActionWrapper pattern={pattern} />
                </ul>
            </div>
        </div >
    )
}


const PatternCollection = () => {

    const { patterns } = usePatternContext();

    return (
        <div className="d-flex flex-wrap px-4 py-2">
            {(patterns || []).map((pattern, i) => (
                <CollectionItem key={i} pattern={pattern} />
            ))}
        </div>
    )
}


const FloatingManager = ({ toggler }: { toggler?: HTMLElement }) => {
    const { openLayerManager, setOpenLayerManager } = usePatternContext();
    // Toggle the visibility of the floating manager
    const handleToggle = () => {
        setOpenLayerManager(openLayerManager => !openLayerManager);
    };

    useEffect(() => {
        if (toggler) {
            // Define the event handler function
            const handleClick = () => {
                handleToggle();
            };

            // Add event listener
            toggler.addEventListener("click", handleClick);

            // Cleanup event listener on component unmount or toggler change
            return () => {
                if (toggler) {
                    toggler.removeEventListener("click", handleClick);
                }
            };
        }
    }, [toggler]);

    return (
        <div
            className="text-bg-dark w-100 h-100 position-fixed top-0 start-0 overflow-hidden"
            style={{
                maxWidth: openLayerManager ? "100vw" : "0px",
                zIndex: 9999,
                transition: "max-width 0.3s ease" // Smooth transition
            }}>
            <div style={{ minWidth: "fit-content" }}>
                <div className="w-100 d-flex p-3">
                    <div className="fs-4 fw-semibold">Pattern Manager</div>
                    <button className="btn btn-outline-danger ms-auto" onClick={handleToggle}>
                        <i className="fa-solid fa-x"></i>
                    </button>
                </div>
                <AddForm />
                <PatternCollection />
            </div>
        </div>
    );
};

export default FloatingManager;
