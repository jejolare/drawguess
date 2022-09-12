import logoImg from '../../assets/images/logo.png';
import '../../assets/css/landing.css';
import '../../assets/css/game.css';
import Button from '../UI/Button';
import { updatePageAction } from '../../store/actions';
import { Store } from '../../store/store-reducer';
import { useContext } from 'react';

export default function Landing() {

    const { dispatch } = useContext(Store);

    return (
        <div className='landing-wrapper'>
            <img src={logoImg} alt="logo" className='landing-logo' />
            <h1>DrawGuess.ru</h1>
            <input type="text" placeholder='Твой ник'/>
            <div className='flex-wrapper'>
                <Button onClick={() => updatePageAction(dispatch, 'join')}>Присоединиться</Button>
                <Button 
                    onClick={() => updatePageAction(dispatch, 'createRoom')}
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