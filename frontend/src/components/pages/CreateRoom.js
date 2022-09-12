import Button from '../UI/Button';
import profileImg from '../../assets/images/profile.svg';
import { useState, useContext } from 'react';
import { updatePageAction } from '../../store/actions';
import { Store } from '../../store/store-reducer';

export default function CreateRoom() {

    const { state, dispatch } = useContext(Store);

    const players = [
        {
            name: 'Андрей Беседин (гей)'
            //other data
        },
        {
            name: 'Дмитрий Колпаков'
        },
        {
            name: 'Костя Котлин'
        },
        {
            name: 'Андрей Беседин (гей)'
            //other data
        },
        {
            name: 'Дмитрий Колпаков'
        },
        {
            name: 'Костя Котлин'
        },
        {
            name: 'Андрей Беседин (гей)'
            //other data
        },
        {
            name: 'Дмитрий Колпаков'
        },
        {
            name: 'Костя Котлин'
        },
        {
            name: 'Костя Котлин'
        }
    ];

    function Player(props) {
        return (
            <div className="room-players__profile">
                <div>
                    <div className="room-players__avatar-wrapper">
                        <img src={profileImg} alt="" />
                        <h4>#{props.number+1}</h4>
                    </div>
                    <h5>{props.name}</h5>
                </div>
            </div>
        );
    }


    const [roundsAmount, setRoundsAmount] = useState(3);
    const [drawingTime, setDrawingTime] = useState(80);

    return (
        <div className="create-room-wrapper">
            <div className="room-settings-wrapper">
                <div className="room-setting">
                    <h3>Настройки комнаты</h3>

                    <div>
                        <p>Количество раундов (тут потом будет селект, но пока инпут)</p>
                        <input type="text" onChange={setRoundsAmount} value={roundsAmount}/>
                        <p>Время на рисование (тут потом будет селект, но пока инпут)</p>
                        <input type="text" onChange={setDrawingTime} value={drawingTime}/>
                    </div>
                </div>

                <p>Код комнаты:</p>
                <input type="text" value={'9EJoij704p7g'} readOnly/>
                <p>Ссылка на подключение к комнате:</p>
                <input type="text" value={'https://drawguess.ru/?9EJoij704p7g'} readOnly/>
            </div>
            <div className="room-settings-wrapper">
                <div className="players-wrapper">
                    <h3>Присоединившиеся игроки</h3>
                    <div className="room-players">
                        {players.map((player, i) => <Player {...{ ...player, number: i}} key={player.name + i}/>)}
                    </div>
                </div>
                <Button 
                    onClick={() => updatePageAction(dispatch, 'game')}
                >
                    Играть
                </Button>
            </div>
        </div>
    );
}