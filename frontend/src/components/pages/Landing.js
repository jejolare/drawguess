import logoImg from '../../assets/images/logo.png';
import '../../assets/css/landing.css';
import Button from '../UI/Button';

export default function () {
    return (
        <div className={'landing-wrapper'}>
            <img src={logoImg} alt="logo" className={'landing-logo'} />
            <h1>DrawGuess.ru</h1>
            <div className='flex-wrapper'>
                <Button>Присоединиться</Button>
                <Button
                    onClick={() => {}}
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