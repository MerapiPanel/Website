import React, { useContext, ChangeEvent } from "react";
import { TypeList } from "../../../Pages2";
import { ItemContext } from "./prop-item-context";


const CellValue = ({ value, type, name }: { value: string, type: TypeList, name: string }) => {
    
    const { setValue } = useContext(ItemContext);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(e.target.value);
    };

    return (
        <>
            {type === TypeList.text && (
                <input className="form-control" id={"form-page-prop-value-" + name} value={value} onChange={handleChange} />
            )}
            {type === TypeList.logtext && (
                <textarea className="form-control" id={"form-page-prop-value-" + name} rows={3} value={value} onChange={handleChange}></textarea>
            )}
            {type === TypeList.color && (
                <input type="color" id={"form-page-prop-value-" + name} className="form-control" value={value} onChange={handleChange} />
            )}
            {type === TypeList.asset && (
                <img className="w-100" src={value} alt="Provided" />
            )}
            {!Object.values(TypeList).includes(type) && (
                <>Unknown Type <code>{type}</code></>
            )}
        </>
    );
};

export default CellValue;
