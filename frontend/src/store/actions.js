export const updateConnectionStateAction = (dispatch, newState) => {
    return dispatch({
        type: "CONNECTION_STATE_UPDATED",
        payload: newState,
    });
};