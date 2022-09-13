import React, { useEffect, useContext } from 'react';
import { updateConnectionStateAction, updateSocketAction, updateListenerAction } from './store/actions';
import { Store } from './store/store-reducer';
import Landing from './components/pages/Landing';
import JoinRoom from './components/pages/JoinRoom';
import CreateRoom from './components/pages/CreateRoom';
import io from 'socket.io-client';
import './App.css';

const socket = io("http://127.0.0.1:3001", { transports : ['websocket'] });

function App() {

  const { state, dispatch } = useContext(Store);

  function emit(event, data) {
    socket.emit(event, data);
  }
  function listener(active = true, event, callback) {
    if (active) {
      socket.on(event, callback, true); 
    } else {
      socket.off(event); 
    }
  }
  console.log(state);
  useEffect(() => {
    updateSocketAction(dispatch, emit);
    updateListenerAction(dispatch, listener);

    socket.on('connect', () => updateConnectionStateAction(dispatch, true));
    socket.on('disconnect', () => updateConnectionStateAction(dispatch, false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <>
      {state.page === 'landing' && <Landing/>}
      {state.page === 'createRoom' && <CreateRoom/>}
      {state.page === 'join' && <JoinRoom/>}
    </>
  );
}

export default App;
