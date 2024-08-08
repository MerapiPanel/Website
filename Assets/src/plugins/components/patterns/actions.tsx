import React, { createContext, useContext } from "react";
import Patterns, { Pattern, usePatternContext } from "../../Patterns";
import { Customization } from "../../../partials/pattern-customization";


export const ActionRename = () => {

    const { pattern } = useContext(ActionWrapperContext);
    const { __, savePattern } = usePatternContext();


    const handleClick = () => {
        const input = $(`<input class="form-control" placeholder="Enter name pattern" value="${pattern.label}">`);

        __.dialog.confirm("Rename Pattern", input)
            .then(({ avoid }) => {
                const name = input.val() as string;
                if (name.length <= 0) {
                    __.toast("Please enter new name", 5, 'text-danger');
                    input.trigger("focus");
                    return avoid();
                }
                pattern.label = name;
                savePattern(pattern);
            });
    }

    return (
        <>
            <li>
                <a className="dropdown-item" onClick={handleClick}>
                    <i className="fa-solid fa-pen"></i> Rename
                </a>
            </li>
        </>
    )
}


export const ActionCustomize = () => {

    const { editor, setOpenLayerManager } = usePatternContext();
    const { pattern } = useContext(ActionWrapperContext);


    const handleClick = () => {
        Customization(editor).start(pattern);
        setOpenLayerManager(false);
    }


    return (
        <>
            <li>
                <a className="dropdown-item" onClick={handleClick}>
                    <i className="fa-solid fa-paint-roller"></i> Customize
                </a>
            </li>
        </>
    );
}


export const ActionReset = () => {

    return (
        <>
            <li>
                <a className="dropdown-item text-warning">
                    <i className="fa-solid fa-broom"></i> Reset
                </a>
            </li>
        </>
    );
}


export const ActionRemove = () => {

    const { pattern } = useContext(ActionWrapperContext);
    const { removePattern } = usePatternContext();

    const handleClick = () => removePattern(pattern);

    return (
        <>
            <li>
                <a className="dropdown-item text-danger" onClick={handleClick}>
                    <i className="fa-solid fa-ban"></i> Remove
                </a>
            </li>
        </>
    );
}


type TActionWrapperContext = {
    pattern: Pattern
}
const ActionWrapperContext = createContext({} as TActionWrapperContext);
export const ActionWrapper = ({ pattern }: { pattern: Pattern }) => {

    const value = {
        pattern
    }
    return (
        <ActionWrapperContext.Provider value={value}>
            {pattern.removable && (
                <>
                    <ActionCustomize />
                    <ActionRename />
                    <ActionRemove />
                </>
            )}
            {!pattern.removable && (
                <>
                    <ActionCustomize />
                    <ActionRename />
                    <ActionReset />
                </>
            )}
        </ActionWrapperContext.Provider>
    )
}