import React, { createContext, useContext, useEffect, useState } from "react";
import { TPageProp, usePageContext } from "../Pages2";
import FormTitle from "./form/form-title";
import FormDescription from "./form/form-description";
import FormRoute from "./form/form-route";
import FormProps from "./form/form-props";
import { isEmpty } from "lodash";

type TFormContext = {
    title: string,
    setTitle: React.Dispatch<React.SetStateAction<string>>,
    description: string,
    setDescription: React.Dispatch<React.SetStateAction<string>>,
    route: string,
    setRoute: React.Dispatch<React.SetStateAction<string>>,
    _properties: TPageProp[],
    setProperties: React.Dispatch<React.SetStateAction<TPageProp[]>>
}
const FormContext = createContext<TFormContext>({} as TFormContext);
export const useFormContext = () => useContext(FormContext);

const FormContainer = () => {
    const { isEditLayerOpen, current, setCurrent, setIsEditLayerOpen } = usePageContext();
    const [title, setTitle] = useState(current?.title || "");
    const [description, setDescription] = useState(current?.description || "");
    const [route, setRoute] = useState(current?.route || "");
    const [_properties, setProperties] = useState(current?.properties || []);

    useEffect(() => {
        setTitle(current?.title || "");
        setDescription(current?.description || "");
        setRoute(current?.route || "");
        setProperties(current?.properties || []);
    }, [current]);

    useEffect(() => {
        setCurrent(current => current ? { ...current, title } : null);
    }, [title]);

    useEffect(() => {
        setCurrent(current => current ? { ...current, description } : null);
    }, [description]);

    useEffect(() => {
        setCurrent(current => current ? { ...current, route } : null);
    }, [route]);

    useEffect(() => {
        setCurrent(current => current ? { ...current, properties: _properties } : null);
    }, [_properties]);


    function clickCloseHandle() {
        setIsEditLayerOpen(false);
    }

    return (
        <FormContext.Provider value={{
            title, setTitle,
            description, setDescription,
            route, setRoute,
            _properties, setProperties
        }}>
            <div className="d-flex flex-column position-absolute w-100 h-100 bg-white"
                style={{
                    zIndex: -1,
                    opacity: 0,
                    transition: '1s',
                    boxShadow: "0 0 4px #000000AA",
                    overflow: 'hidden',
                    ...(isEditLayerOpen && { zIndex: 2, opacity: 1 })
                }}>
                <div className="d-flex flex-column overflow-hidden" style={{ minWidth: "max-content" }}>
                    <div className="d-flex align-items-center py-3 px-2 bg-light">
                        <button type="button" className="btn btn-sm text-primary border-primary rounded-3 border py-2 px-3 m-1" onClick={clickCloseHandle}>Go Back</button>
                        <h5 className="ms-2 mb-0 fs-4">Edit Page</h5>
                    </div>
                    <div className="px-4 py-2 pb-5 overflow-y-auto overflow-x-hidden flex-grow-1">
                        {isEditLayerOpen && (
                            <>
                                <FormTitle>{title}</FormTitle>
                                <FormDescription>{description}</FormDescription>
                                <FormRoute>{route}</FormRoute>
                                {_properties.length > 0 && <FormProps />}
                                <div className="py-5"></div>

                            </>
                        )}
                    </div>
                </div>
            </div>
        </FormContext.Provider>
    );
}

export default FormContainer;
