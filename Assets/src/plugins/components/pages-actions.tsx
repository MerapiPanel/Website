import React, { useEffect, useRef, useState } from "react";
import { TPage, usePageContext } from "../Pages2";
import { useItemContext } from "./pages-item";


export const Actions = ({ page }: { page: TPage }) => {
    const { active } = useItemContext();
    return (
        <div className="d-flex justify-content-end position-absolute bottom-0 end-0 w-100">
            {active && page.id && (
                page.removable
                    ? <ActionRemove page={page} />
                    : <ActionReset page={page} />)}
            {active && (<ActionEdit page={page} />)}
            <ActionCustomize page={page} />
        </div>
    )
}


export const ActionCustomize = ({ page }: { page: TPage }) => {

    const { active } = useItemContext();
    const [enable, setEnable] = useState(true);
    const { startCustomize } = usePageContext();
    const btn = useRef(null);

    useEffect(() => {
        setEnable(true);
        if (active) {
            setEnable(false);
        }
        if (btn.current && active) {
            $(btn.current).removeClass("text-primary border-primary").addClass("text-muted border-muted");
        } else if (btn.current) {
            $(btn.current).removeClass("text-muted border-muted").addClass("text-primary border-primary");

        }
    }, [active]);

    function handleClick() {
        startCustomize(page);
    }

    return (
        <button ref={btn} type="button" className="btn btn-sm text-primary border-primary rounded-0 border py-0 m-1" {...{ disabled: !enable }} onClick={handleClick}>
            <i className="fa-solid fa-paintbrush"></i>
        </button>
    )
}


export const ActionEdit = ({ page }: { page: TPage }) => {

    const { isEditLayerOpen, setIsEditLayerOpen } = usePageContext();
    const btnRef = useRef(null);

    useEffect(() => {
        if (btnRef.current) {
            const btn = btnRef.current;
            if (isEditLayerOpen) {
                $(btn).removeClass("text-primary border-primary").addClass("text-muted border-muted");
            } else {
                $(btn).addClass("text-primary border-primary").removeClass("text-muted border-muted");
            }
        }
    }, [isEditLayerOpen]);

    function handleClick() {
        setIsEditLayerOpen(!isEditLayerOpen);
    }
    return (
        <button ref={btnRef} type="button" className="btn btn-sm text-primary border-primary rounded-0 border py-0 m-1" onClick={handleClick}>
            <i className="fa-regular fa-pen-to-square"></i>
        </button>
    )
}



export const ActionReset = ({ page }: { page: TPage }) => {

    const { __, resetCallback } = usePageContext();

    function clickHandle() {

        __.dialog.warning("Are you sure?", "Are you sure to reset customization page <b>" + page.title + '</b>')
            .then(() => {
                __.Website.Pages.handle("clear", page)
                    .then(() => {
                        __.toast('Page clear successful!', 5, 'text-success');
                        resetCallback();
                    }).catch((err) => {
                        __.toast(err || 'Failed clear page!', 5, 'text-danger');
                    });
            })
    }

    return (
        <button type="button" className="btn btn-sm text-warning border-warning rounded-0 border py-0 m-1" onClick={clickHandle}>
            <i className="fa-solid fa-eraser"></i>
        </button>
    )
}



export const ActionRemove = ({ page }: { page: TPage }) => {

    const { __, setReload, setIsEditLayerOpen } = usePageContext();

    function handleClick() {
        __.dialog.danger("Are you sure?", "Are you sure to delete this page <b>" + page.title + '</b> with id <i>' + page.id + '</i>')
            .then(() => {
                __.Website.Pages.handle("remove", page)
                    .then(() => {
                        setIsEditLayerOpen(false);
                        __.toast('Page removed successful', 5, 'text-success');
                        setReload(true);
                    }).catch((err) => {
                        __.toast(err || 'Failed remove page', 5, 'text-danger');
                    });
            })
    }
    return (
        <button type="button" className="btn btn-sm text-danger border-danger rounded-0 border py-0 m-1" onClick={handleClick}>
            <i className="fa-regular fa-trash-can"></i>
        </button>
    )
}