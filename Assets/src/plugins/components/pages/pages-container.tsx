import React, { useContext } from "react";
import { usePageContext } from "../../Pages2";
import Item from "./pages-item";


const Container = () => {

    const { pages } = usePageContext();

    return (
        <>
            <div className="d-flex flex-wrap flex-grow-1 gap-2">
                {pages.sort((a, b) => a.route > b.route ? 1 : -1).map(page => {
                    return (<Item key={page.name} page={page}></Item>);
                })}
            </div>
        </>
    )
}

export default Container;