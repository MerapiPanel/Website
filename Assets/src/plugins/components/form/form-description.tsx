import React from "react";


const FormDescription = ({ children }: { children: string }) => {

    return (
        <>
            <div className='form-group mb-3'>
                <label className='form-label w-100'>DESCRIPTION</label>
                <textarea className='form-control' id='description' placeholder='Enter description' rows={3} maxLength={255} value={children}></textarea>
                <small>{(children || "").length}/255</small>
            </div>
        </>
    )
}

export default FormDescription;