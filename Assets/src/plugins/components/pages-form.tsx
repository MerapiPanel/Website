import React, { useEffect } from "react";
import { usePageContext } from "../Pages2";
import FormTitle from "./form/form-title";
import FormDescription from "./form/form-description";
import FormRoute from "./form/form-route";
import FormProps from "./form/form-props";

const FormContiner = () => {

    const { editing, current, setEditing } = usePageContext();

    useEffect(() => {
        setEditing(current);
    }, [current]);

    return (
        <div className="position-absolute w-100 h-100 bg-white"
            style={{
                zIndex: 1,
                maxWidth: 0,
                transition: '1s',
                boxShadow: "0 0 4px #000000AA",
                overflow: 'hidden',
                ...(editing && {
                    maxWidth: '100vw',
                })
            }}>

            <div style={{ minWidth: "max-content" }}>
                <div className="d-flex align-items-center py-3 px-2 bg-light">
                    <button type="button" className="btn btn-sm text-primary border-primary rounded-0 border py-2 px-3 m-1">Go Back</button>
                    <h5 className="ms-2 mb-0 fs-4">Edit Page</h5>
                </div>
            </div>

            <div className="px-4 py-2">
                <FormTitle>{editing?.title as any}</FormTitle>
                <FormDescription>{editing?.description as any}</FormDescription>
                <FormRoute>{editing?.route as any}</FormRoute>
                <FormProps properties={editing?.properties || []} />
            </div>
        </div>
    )
}

export default FormContiner;
