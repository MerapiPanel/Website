import React from "react";

type TItemContext = {
    setValue: React.Dispatch<React.SetStateAction<string>>;
};

export const ItemContext = React.createContext<TItemContext>({} as any);
