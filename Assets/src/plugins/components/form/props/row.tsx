import React, { useEffect, useState, useContext } from "react";
import { TPageProp } from "../../../Pages2";
import { FormPropsContext } from "../form-props"; // Assuming you have this context in a separate file
import { ItemContext } from "./prop-item-context";
import Cell from "./cell-value";

const Row = ({ prop }: { prop: TPageProp }) => {
    const [value, setValue] = useState<string>(prop.value ?? prop.default ?? "");
    const { setProps } = useContext(FormPropsContext);

    useEffect(() => {
        setProps(props => {
            const updatedProps = [...props];
            const idx = updatedProps.findIndex(p => p.name === prop.name);
            if (idx >= 0) {
                updatedProps[idx].value = value;
            }
            return updatedProps;
        });
    }, [value, setProps, prop.name]);

    useEffect(() => {
        setValue(prop.value ?? prop.default ?? "");
    }, [prop]);


    const updateProp = (name: string, prop: TPageProp) => {
        setProps(props => {
            const idx = props.findIndex(p => p.name === name);
            if (idx >= 0) {
                Object.keys(prop).forEach(key => {
                    props[idx][key] = prop[key];
                })
            }
            return props;
        });
    }

    return (
        <ItemContext.Provider value={{ setValue, updateProp }}>
            <tr>
                <td className="py-3">{prop.label}</td>
                <td className="py-3">
                    <Cell {...prop} />
                </td>
            </tr>
        </ItemContext.Provider>
    );
};

export default Row;
