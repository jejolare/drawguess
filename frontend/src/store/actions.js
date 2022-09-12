export const updateConnectionStateAction = (dispatch, newState) => {
    return dispatch({
        type: "CONNECTION_STATE_UPDATED",
        payload: newState,
    });
};
export const updatePageAction = (dispatch, page) => {
    return dispatch({
        type: "PAGE_UPDATED",
        payload: page,
    });
};