import React, { useEffect, useContext } from 'react';
import { updateConnectionStateAction } from './store/actions';
import { Store } from './store/store-reducer';

import Landing from './components/pages/Landing';

import io from 'socket.io-client';
import './App.css';

const socket = io("http://127.0.0.1:3001", { transports : ['websocket'] });

function App() {

  const { state, dispatch } = useContext(Store);
  console.log(state);
  useEffect(() => {
    socket.on('connect', () => updateConnectionStateAction(dispatch, true));
    socket.on('disconnect', () => updateConnectionStateAction(dispatch, false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <Landing/>
  );
}

export default App;
