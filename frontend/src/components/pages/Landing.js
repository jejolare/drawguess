import logoImg from '../../assets/images/logo.png';
import '../../assets/css/landing.css';
import '../../assets/css/game.css';
import Button from '../UI/Button';
import { updatePageAction, updateRoomAction } from '../../store/actions';
import { Store } from '../../store/store-reducer';
import { useContext, useState, useEffect } from 'react';

export default function Landing() {

    const { state, dispatch } = useContext(Store);

    const [username, setUsername] = useState('');

    function createRoom() {
        if (!username) return alert('no username');
        state.emit('create-room', { nickname: username });
    }
    useEffect(() => {
        if (!state.listener) return;
        
        state.listener(true, 'change-localstorage-data', data => {
            localStorage.setItem('roomData', JSON.stringify(data));
            updateRoomAction(dispatch, data);
            updatePageAction(dispatch, 'createRoom');
        });
        return () => {
            state.listener(false, 'change-localstorage-data');
        }
    }, [state.listener]);
    return (
        <div className='landing-wrapper'>
            <img src={logoImg} alt="logo" className='landing-logo' />
            <h1>DrawGuess.ru</h1>
            <input type="text" placeholder='Твой ник' value={username} onInput={e => setUsername(e.target.value)}/>
            <div className='flex-wrapper'>
                <Button onClick={() => updatePageAction(dispatch, 'join')}>Присоединиться</Button>
                <Button 
                    onClick={createRoom}
                >
                    Создать игру
                </Button>
            </div>
            <p>
                ST holder swap part or all his tokens for a higher price. Swapped
                Savior tokens are not going back into circulation, they are stored in
                the reserve pool before someone else buys them. This process
                secures continuous ST price growth.
            </p>
        </div>
    );
}