import React from "react";
import { TPage, usePageContext } from "../../Pages2";


const Header = () => {

    const { setCurrent, __, setReload, addCallback } = usePageContext();

    function handleAdd() {

        const newpage: TPage = {
            name: Date.now().toString(16),
            title: "Untitled",
            description: "",
            route: "/" + Date.now().toString(16),
            components: [],
            styles: "",
            isChanged: true,
            removable: true,
            properties: []
        }
        const clone = {};
        Object.keys(newpage).forEach(key => {
            let val = newpage[key];
            clone[key] = typeof val == "string" ? val : JSON.stringify(val);
        });
        __.Website.Pages.handle("save", clone)
            .then((e) => {
                __.toast("New page added successful!", 5, 'text-success')
                addCallback(e);
            }).catch((err: string) => {
                __.toast(err || "Failed add page!", 5, 'text-danger')
            });

    }
    
    return (
        <div className="d-flex justify-content-between w-100">
            <h5>Pages</h5>
            <button type="button" className="btn btn-sm text-primary border-primary rounded-0 border py-0 m-1" onClick={handleAdd}>Add</button>
        </div>
    )
}

export default Header;