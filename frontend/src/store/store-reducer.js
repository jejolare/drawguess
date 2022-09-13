import React, { createContext, useReducer } from "react";

const initialState = {
    isConnected: false,
    page: 'landing',
    emit: undefined,
    listener: undefined,
    room: {},
    name: ''
};
export const Store = createContext(initialState);

const reducer = (state, action) => {
    switch (action.type) {
    case "CONNECTION_STATE_UPDATED":
        return { ...state, isConnected: action.payload };
    case "PAGE_UPDATED":
        return { ...state, page: action.payload };
    case "EMITTER_UPDATED":
        return { ...state, emit: action.payload };
    case "LISTENER_UPDATED":
        return { ...state, listener: action.payload };
    case "ROOM_UPDATED":
        return { ...state, room: action.payload };
    case "NAME_UPDATED":
        return { ...state, name: action.payload };
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
  