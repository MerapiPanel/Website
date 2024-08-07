import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useFormContext } from "../pages-form";


const FormTitle = ({ children }: { children: string }) => {

    const { title, setTitle } = useFormContext();

    useEffect(() => {
        setTitle(title);
    }, [title]);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setTitle(e.currentTarget.value);
    }

    return (
        <>
            <div className='form-group mb-3'>
                <label className='form-label w-100'>TITLE</label>
                <input type='text' className='form-control' id='form-page-title' placeholder='Enter title' value={title} required onChange={handleChange}></input>
                <small>{(title || "").length}/255</small>
            </div>
        </>
    )
}

export default FormTitle;