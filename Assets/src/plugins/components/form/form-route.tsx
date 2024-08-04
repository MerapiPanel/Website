import React from "react";
import { usePageContext } from "../../Pages2";


const FormRoute = ({ children }: { children: string }) => {

    const { editing } = usePageContext();
    const params = exteractParams(children);

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
        return (editing?.name || "").toLocaleLowerCase() == "website/index";
    }

    return (
        <>
            <div className={"form-group mb-3" + (isIndex() ? " text-muted" : "")}>
                <label className='form-label w-100'>ROUTE</label>
                {isIndex() && (
                    <small className="text-warning">Can't change route of the home page</small>
                )}
                <input type='text' className='form-control' id='route' placeholder='Enter route' value={children} maxLength={255} {...{ disabled: isIndex() }} required></input>
                <small>{(children || "").length}/255</small>
                {params.length && (
                    <div className="border-5 border-start border-secondary ps-3 py-2">
                        <div className="fw-semibold">Route params</div>
                        {params.map((param, i) => <span key={i} className="badge bg-primary text-white me-1">{param}</span>)}
                    </div>
                )}
            </div>
        </>
    )
}

export default FormRoute;