import React, { useEffect, useState, useContext } from "react";
import { TPageProp } from "../../../Pages2";
import { FormPropsContext } from "../form-props"; // Assuming you have this context in a separate file
import { ItemContext } from "./prop-item-context";
import CellValue from "./cell-value";

const Row = ({ prop }: { prop: TPageProp }) => {
    const [value, setValue] = useState<string>(prop.value);
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
        setValue(prop.value);
    }, [prop]);

    return (
        <ItemContext.Provider value={{ setValue }}>
            <tr className="border-0">
                <td className="border-0">{prop.label}</td>
                <td className="border-0">
                    <CellValue value={value} type={prop.type} name={prop.name} />
                </td>
            </tr>
        </ItemContext.Provider>
    );
};

export default Row;
