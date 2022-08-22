import logoImg from '../../assets/images/logo.png';
import '../../assets/css/landing.css';
import ChooseAction from '../ChooseAction';
import { useState } from 'react';

export default function () {
    const [page, setPage] = useState('choose');
    return (
        <div className={'landing-wrapper'}>
            <img src={logoImg} alt="logo" className={'landing-logo'} />
            <h1>DrawGuess.ru</h1>
            {page === 'choose' &&
                <ChooseAction setPage={setPage}/>
            }
        </div>
    );
}