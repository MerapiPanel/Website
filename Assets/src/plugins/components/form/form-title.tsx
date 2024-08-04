import React from "react";


const FormTitle = ({ children }: { children: string }) => {

    return (
        <>
            <div className='form-group mb-3'>
                <label className='form-label w-100'>TITLE</label>
                <input type='text' className='form-control' id='title' placeholder='Enter title' value={children} required></input>
                <small>{(children || "").length}/255</small>
            </div>
        </>
    )
}

export default FormTitle;