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
export const updateSocketAction = (dispatch, emitter) => {
    return dispatch({
        type: "EMITTER_UPDATED",
        payload: emitter,
    });
};
export const updateListenerAction = (dispatch, listener) => {
    return dispatch({
        type: "LISTENER_UPDATED",
        payload: listener,
    });
};
export const updateRoomAction = (dispatch, room) => {
    return dispatch({
        type: "ROOM_UPDATED",
        payload: room,
    });
};