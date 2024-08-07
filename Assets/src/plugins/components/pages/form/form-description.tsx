import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { usePageContext } from "../../../Pages2";
import { debounce } from 'lodash';

const FormDescription = ({ children }: { children: string }) => {

    const [description, setDescription] = useState(children);
    const { setCurrent, current, isReload } = usePageContext();

    const debouncedSetValue = useCallback(
        debounce((description: string) => {
            setCurrent(current => current ? { ...current, description } : null);
        }, 0), // Adjust debounce delay as needed
        [setCurrent] // Include setEditing in dependency array if it's a stable reference
    );

    useEffect(() => {
        debouncedSetValue(description);
    }, [description]);

    useEffect(() => {
        setDescription(current?.description || "");
    }, [current]);


    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setDescription(e.currentTarget.value);
    }

    return (
        <>
            <div className='form-group mb-3'>
                <label className='form-label w-100'>DESCRIPTION</label>
                <textarea className='form-control' id='form-page-description' placeholder='Enter description' rows={3} maxLength={255} value={description} onChange={handleChange}></textarea>
                <small>{(children || "").length}/255</small>
            </div>
        </>
    )
}

export default FormDescription;