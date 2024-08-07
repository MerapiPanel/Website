import React from "react";
import { Pattern } from "../../Patterns";


export const ActionRename = () => {

    return (
        <>
            <li><a className="dropdown-item" href="#">Rename</a></li>
        </>
    )
}

export const ActionCustomize = () => {

    return (
        <>
            <li><a className="dropdown-item" href="#">Customize</a></li>
        </>
    );
}

export const ActionReset = () => {

    return (
        <>
            <li><a className="dropdown-item" href="#">Reset</a></li>
        </>
    );
}


export const ActionRemove = () => {

    return (
        <>
            <li><a className="dropdown-item" href="#">Remove</a></li>
        </>
    );
}


export const ActionWrapper = ({ pattern }: { pattern: Pattern }) => {

    if (pattern.name) {
        return (
            <>
                <ActionCustomize />
                <ActionRename />
            </>
        )
    }

    if (pattern.id) {
        if (pattern.name) {
            return (
                <>
                    <ActionCustomize />
                    <ActionRename />
                    <ActionReset />
                </>
            )
        }
        return (
            <>
                <ActionCustomize />
                <ActionRename />
                <ActionRemove />
            </>
        )
    }
    return (
        <></>
    )
}