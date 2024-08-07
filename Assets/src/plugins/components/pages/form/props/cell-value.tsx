import React, { useContext, ChangeEvent, useState, useEffect } from "react";
import { TPageProp, TypeList, usePageContext } from "../../../../Pages2";
import { ItemContext } from "./prop-item-context";


const CellWithMultiple = ({ types, prop }: { types: TypeList[], prop: TPageProp }) => {

    const { name } = prop;
    const { updateProp } = useContext(ItemContext);
    const [selectedType, setSelectedType] = useState(prop.selectedType ?? types[0]);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setSelectedType(e.currentTarget.value as any);
    }
    useEffect(() => {
        if (selectedType) {
            updateProp(name, { ...prop, selectedType });
        }
    }, [selectedType]);

    return (
        <>
            {types.map((type, i) => (
                <div key={i}>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name={name}
                            value={type}
                            id={"cell-" + name + "-" + type + "" + i}
                            {...{ checked: selectedType == type ? true : false }}
                            onChange={handleChange}
                            {...{ disabled: prop.disabled }} />
                        <label className="form-check-label" htmlFor={"cell-" + name + "-" + type + "" + i}>{type}</label>
                    </div>
                    <div className={"collapse" + (type == selectedType ? " show" : "")}>
                        <div className="p-3">
                            <CellInput {...{ ...prop, type }} />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}



const CellInput = (prop: TPageProp) => {

    const { value, type, name } = prop;

    const { setValue } = useContext(ItemContext);
    const { __ } = usePageContext();
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(e.target.value);
    };
    const filePickerHandler = (e: React.MouseEvent<HTMLElement>) => __.FileManager.select().then((source: any) => setValue(source.path));
    const checkChangeHandle = (e: ChangeEvent<HTMLInputElement>) => {
        setValue((e.target.checked ? 1 : 0) as any);
    };

    return (
        <>
            {type === TypeList.text && (
                <input
                    className="form-control"
                    id={"form-page-prop-value-" + name}
                    value={value ?? prop.default ?? ""}
                    placeholder={prop.placeholder ?? `Please enter ${prop.name} value`}
                    onChange={handleChange}
                    {...{ disabled: prop.disabled }} />
            )}
            {type === TypeList.logtext && (
                <textarea
                    className="form-control"
                    id={"form-page-prop-value-" + name}
                    rows={3}
                    value={value ?? prop.default ?? ""}
                    placeholder={prop.placeholder ?? `Please enter ${prop.name} value`}
                    onChange={handleChange}></textarea>
            )}
            {type === TypeList.color && (
                <input
                    type="color"
                    id={"form-page-prop-value-" + name}
                    className="form-control"
                    value={value ?? prop.default ?? ""}
                    placeholder={prop.placeholder ?? `Please enter ${prop.name} value`}
                    onChange={handleChange}
                    {...{ disabled: prop.disabled }} />
            )}
            {type == TypeList.asset && (
                <>
                    <input
                        type="color"
                        id={"form-page-prop-value-" + name}
                        className="form-control"
                        value={value ?? prop.default ?? ""}
                        placeholder={prop.placeholder ?? `Please enter ${prop.name} value`}
                        onChange={handleChange}
                        {...{ disabled: prop.disabled }} />
                </>
            )}
            {type === TypeList.image && (
                <>
                    <img
                        style={{
                            width: "200px",
                            height: "128px",
                            objectFit: "contain",
                            borderRadius: "0.3rem",
                            border: "2px solid #bad0e4",
                            background: "#bababa"
                        }}
                        src={(value || "").length > 0 ? value : (prop.default ?? '/public/assets/Website/img/placeholder.svg')}
                        alt="Provided" onClick={prop.disabled ? () => { } : filePickerHandler} />
                    <small className="d-block">Click image to change value</small>
                </>
            )}
            {type === TypeList.check && (
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        name={name}
                        value="1"
                        id={"cell-" + name + "-" + type}
                        onChange={checkChangeHandle}
                        {...{
                            checked: (value as any == '1' ?? prop.default),
                            disabled: prop.disabled
                        }} />
                    <label className="form-check-label" htmlFor={"cell-" + name + "-" + type}>{(prop.placeholder || "").length ? prop.placeholder : "Active"}</label>
                </div>
            )}
            {!Object.values(TypeList).includes(type) && (
                <>Unknown Type <code>{type}</code></>
            )}
        </>
    );
}


const Cell = (prop: TPageProp) => {

    const { type } = prop;

    if (/\|/.test(type)) {
        const types = type.split('|') as TypeList[];
        return CellWithMultiple({ types, prop });
    }

    return CellInput(prop);
};

export default Cell;
