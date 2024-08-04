import React from "react";
import { TPageProp, TypeList } from "../../Pages2";


const ColValue = ({ value, type }: { value: string, type: TypeList }) => {

    return (
        <>
            {type == TypeList.text && (
                <input className="form-control" value={value} />
            )}
            {type == TypeList.logtext && (
                <textarea className="form-control" rows={3} value={value}></textarea>
            )}
            {type == TypeList.color && (
                <input type="color" className="form-control" value={value} />
            )}
            {type == TypeList.color && (
                <img className="w-100" src={value} />
            )}
            {!Object.values(TypeList).includes(type) && (
                <>Unknown Type <code>{type}</code></>
            )}
        </>
    )
}

const ItemRow = ({ prop }: { prop: TPageProp }) => {

    return (
        <tr className="border-0">
            <td className="border-0">{prop.label}</td>
            <td className="border-0">
                <ColValue value={prop.value} type={prop.type} />
            </td>
        </tr>
    )
}

const FormProps = ({ properties }: { properties: TPageProp[] }) => {

    return (
        <>
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
                        {properties.map((prop, i) => <ItemRow key={i} prop={prop} />)}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default FormProps;