import React, { createContext, useContext, useEffect, useState } from "react";
import { TPage, usePageContext } from "../../Pages2";
import { Actions } from "./pages-actions";


const Description = ({ children }: { children?: any }) => {
    return (
        <small className="card-children d-block" dangerouslySetInnerHTML={{ __html: (children || "")?.length > 55 ? children?.substring(0, 55) + '...' : children || '<span class="text-muted">No description</span>' }}></small>
    )
}

const RouteLabel = ({ children }: { children?: any }) => {
    return (
        <small className="card-text text-muted d-block" dangerouslySetInnerHTML={{
            __html: (window.location.origin + children || '<span class="text-muted">No route</span>')
        }}></small>
    )
}

type TItemContext = {
    active: boolean
    setActive: React.Dispatch<React.SetStateAction<boolean>>
}

const ItemContext = createContext<TItemContext>({} as any);
export const useItemContext = () => useContext(ItemContext);

const Item = ({ page }: { page: TPage }) => {

    const [active, setActive] = useState<boolean>(false);
    const { current, pages } = usePageContext();
    const [isChanged, setChanged] = useState<boolean>(false);
    const value: TItemContext = {
        active,
        setActive
    }

    useEffect(() => {
        setActive(false);
        if (page.name == current?.name) {
            setActive(true);
        }
        setTimeout(() => {
            setChanged(page.isChanged == true);
        }, 400)
    }, [current]);

    useEffect(() => {
        setTimeout(() => {
            setChanged(page.isChanged == true);
        }, 600)
    }, [pages]);

    return (
        <ItemContext.Provider value={value}>
            <div
                className="card shadow-sm rounded-0 w-100 mb-1 position-relative"
                aria-hidden="true"
                style={{
                    border: "2px dashed #00000005",
                    flexBasis: "230px",
                    ...(active && {
                        border: "2px dashed #007fff",
                        backgroundColor: '#f8f9fa'
                    })
                }}>
                <div className="card-body pb-5">
                    <h5 className="card-title">
                        {page.title.length > 35 ? page.title?.substring(0, 35) + '...' : page.title || 'No title'}
                    </h5>
                    <Description>{page.description}</Description>
                    <RouteLabel>{page.route}</RouteLabel>
                    <Actions page={page} />
                    {isChanged == true && (<span className="badge bg-warning position-absolute top-0 end-0 m-1">Changed</span>)}
                </div>
            </div>
        </ItemContext.Provider>
    )
}

export default Item;