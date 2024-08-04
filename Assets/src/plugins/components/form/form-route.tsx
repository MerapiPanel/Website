import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { usePageContext } from "../../Pages2";
import { debounce } from "lodash";


const FormRoute = ({ children }: { children: string }) => {

    const { current, isReload } = usePageContext();
    const [route, setRoute] = useState(children);
    const { setCurrent } = usePageContext();

    const debouncedSetValue = useCallback(
        debounce((route: string) => {
            setCurrent(current => current ? { ...current, route } : null);
        }, 0), // Adjust debounce delay as needed
        [setCurrent] // Include setEditing in dependency array if it's a stable reference
    );

    useEffect(() => {
        debouncedSetValue(route);
    }, [route]);

    useEffect(() => {
        setRoute(current?.route||'');
    }, [current]);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setRoute(e.currentTarget.value);
    }

    function exteractParams(route: string = "") {
        const params: string[] = [];
        const match = route.match(/\{(.*?)\}/gim);
        if (match && match.length > 0) {

            match.forEach((param: string) => {
                let val = param.replace(/^\{/, '').replace(/\}$/, '');
                if (val.length > 0) params.push(val);
            })
        }

        return params;
    }

    function isIndex() {
        return (current?.name || "").toLocaleLowerCase() == "website/index";
    }

    return (
        <>
            <div className={"form-group mb-3" + (isIndex() ? " text-muted" : "")}>
                <label className='form-label w-100'>ROUTE</label>
                {isIndex() && (
                    <small className="text-warning">Can't change route of the home page</small>
                )}
                <input type='text' className='form-control' id="form-page-route" placeholder='Enter route' value={route} maxLength={255} {...{ disabled: isIndex() }} required onChange={handleChange}></input>
                <small>{(children || "").length}/255</small>
                {exteractParams(route).length > 0 && (
                    <div className="border-5 border-start border-secondary ps-3 py-2">
                        <div className="fw-semibold">Route params</div>
                        {exteractParams(route).map((param, i) => <span key={i} className="badge bg-primary text-white me-1">{param}</span>)}
                    </div>
                )}
            </div>
        </>
    )
}

export default FormRoute;