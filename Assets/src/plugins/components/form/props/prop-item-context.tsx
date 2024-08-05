import React from "react";
import { TPageProp } from "../../../Pages2";

type TItemContext = {
    setValue: React.Dispatch<React.SetStateAction<string>>
    updateProp: (name: string, prop: TPageProp) => void
};

export const ItemContext = React.createContext<TItemContext>({} as any);
