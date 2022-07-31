import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io("http://127.0.0.1:3001", { transports : ['websocket'] });

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [andrewLox, setAndrewLox] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    socket.on('testResponse', (msg) => {
      setAndrewLox(msg);
    });
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('testResponse');
    };
  }, []);

  function sendData() {
    if (!isConnected) return;
    socket.emit("test", "Андрей лох");
  }

  return (
    <>
      <div>Андрей лох</div>
      <button onClick={() => sendData()}>Кнопка для теста бекенда</button>
      <h1>{andrewLox}</h1>
    </>
  );
}

export default App;
