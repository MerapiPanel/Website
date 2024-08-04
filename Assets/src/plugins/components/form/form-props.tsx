import React, { createContext, useCallback, useEffect, useState } from "react";
import { TPageProp, usePageContext } from "../../Pages2";
import Row from "./props/row";
import { debounce } from "lodash";
import { useFormContext } from "../pages-form";

type TFormPropsContext = {
    props: TPageProp[],
    setProps: React.Dispatch<React.SetStateAction<TPageProp[]>>
}
export const FormPropsContext = createContext<TFormPropsContext>({} as any);
const FormProps = () => {
    const { _properties, setProperties } = useFormContext();
    const [props, setProps] = useState<TPageProp[] | []>([]);

    const debouncedSetValue = useCallback(
        debounce((props: TPageProp[] | []) => {
            setProperties(props);
        }, 50), // Adjust debounce delay as needed
        [props] // Include setEditing in dependency array if it's a stable reference
    );

    useEffect(() => {
        debouncedSetValue(props);
    }, [props]);

    useEffect(() => {
        setProps(_properties || []);
    }, [_properties]);

    return (
        <FormPropsContext.Provider value={{
            props,
            setProps
        }}>
            <div className='form-group mb-3'>
                <label className='form-label w-100'>PROPERTIES</label>
                <table className="table">
                    <colgroup>
                        <col style={{
                            width: "20%"
                        }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>NAME</th>
                            <th>VALUE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.map((prop, i) => <Row key={i} prop={prop} />)}
                    </tbody>
                </table>
            </div>
        </FormPropsContext.Provider>
    )
}

export default FormProps;