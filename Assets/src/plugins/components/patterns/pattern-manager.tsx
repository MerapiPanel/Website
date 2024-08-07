import React, { useEffect, useRef, useState } from "react";
import { usePatternContext } from "../../Patterns";
import FloatingManager from "./floating-maanager";

const PatternManager = () => {
    const { patterns, editor } = usePatternContext();
    const { BlockManager } = editor;
    const blockContainerRef = useRef<HTMLDivElement | null>(null);
    const buttonRefs = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (patterns.length && blockContainerRef.current) {
            // Render blocks using BlockManager and append to the container
            const blocksComponents = BlockManager.render(patterns as any, { external: true });
            blockContainerRef.current.innerHTML = '';
            blockContainerRef.current.appendChild(blocksComponents as any);
        }
    }, [patterns]);

    return (
        <>
            <div className="d-flex text-start mb-2">
                <div className="fw-semibold fs-5">Patterns</div>
                <button className="btn btn-sm btn-outline-secondary ms-auto" ref={buttonRefs}>
                    <i className="fa-solid fa-up-right-from-square"></i>
                </button>
            </div>
            <div ref={blockContainerRef}></div>

            <FloatingManager toggler={buttonRefs.current as any} />
        </>
    );
}

export default PatternManager;
