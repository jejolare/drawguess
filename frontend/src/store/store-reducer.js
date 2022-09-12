import React, { createContext, useReducer } from "react";

const initialState = {
    isConnected: false,
    page: 'landing'
};
export const Store = createContext(initialState);

const reducer = (state, action) => {
    switch (action.type) {
    case "CONNECTION_STATE_UPDATED":
        return { ...state, isConnected: action.payload };
    case "PAGE_UPDATED":
        return { ...state, page: action.payload };
    default:
        return { state };
    }
}

export const StoreProvider = (props) => {
    const [state, dispatch] =  useReducer(reducer, initialState);
    return (
        <Store.Provider value={{ state, dispatch }}>
            {props.children}
        </Store.Provider>
    );
};
  