import Button from '../UI/Button';
import logoImg from '../../assets/images/logo.png';

export default function JoinRoom() {

    return (

        <div className='landing-wrapper'>
            <img src={logoImg} alt="logo" className='landing-logo' />
            <h1>DrawGuess.ru</h1>
            <div className='join-wrapper'>
                <input type="text" placeholder='Введи код комнаты'/>
                <div className='flex-wrapper'>
                    <Button onClick={() => {}}>Присоединиться</Button>
                </div>
            </div>
        </div>
    );
}