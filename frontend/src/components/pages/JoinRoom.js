import Button from '../UI/Button';
import logoImg from '../../assets/images/logo.png';

import { Store } from '../../store/store-reducer';
import { useContext, useState, useEffect, updatePageAction } from 'react';
import { updateRoomAction } from '../../store/actions';

export default function JoinRoom() {

    const { state, dispatch } = useContext(Store);
    const [roomCode, setRoomCode] = useState('');

    function joinRoom() {
        state.emit('join', { nickname: state.name, gameCode: roomCode });
    }

    useEffect(() => {
        state.listener(true, 'join-success', data => {
            updateRoomAction(dispatch, data);
            localStorage.setItem('roomData', JSON.stringify(data));
            updatePageAction(dispatch, 'createRoom');
        });
        return () => {
            state.listener(false, 'join-success'); 
        }
    });

    return (

        <div className='landing-wrapper'>
            <img src={logoImg} alt="logo" className='landing-logo' />
            <h1>DrawGuess.ru</h1>
            <div className='join-wrapper'>
                <input 
                    type="text" 
                    placeholder='Введи код комнаты'
                    value={roomCode}
                    onInput={e => setRoomCode(e.target.value)}
                />
                <div className='flex-wrapper'>
                    <Button onClick={joinRoom}>Присоединиться</Button>
                </div>
            </div>
        </div>
    );
}