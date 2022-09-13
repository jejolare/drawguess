import Button from '../UI/Button';
import profileImg from '../../assets/images/profile.svg';
import { useEffect, useContext } from 'react';
import { updatePageAction, updateRoomAction } from '../../store/actions';
import { Store } from '../../store/store-reducer';

export default function CreateRoom() {

    const { state, dispatch } = useContext(Store);

    const players = state.room.players.map(name => ({ name }));
    const isOwner = state.room.isOwner;

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

    function setRoundsAmount(amount) {
        updateRoomAction(dispatch, { ...state.room, rounds: amount });
    }
    function setDrawingTime(amount) {
        updateRoomAction(dispatch, { ...state.room, drawingTime: amount });
    }


    // useEffect(() => {
    //     if (!isOwner) return;
    //     state.emit('change-room-parameters', state.room);
    // }, [state.room]);

    return (
        <div className="create-room-wrapper">
            <div className="room-settings-wrapper">
                <div className="room-setting">
                    <h3>Настройки комнаты</h3>

                    <div>
                        <p>Количество раундов</p>
                        <input 
                            type="text" 
                            onInput={e => setRoundsAmount(e.value)} 
                            value={state.room.rounds} 
                            className={!isOwner ? 'btn_disabled' : undefined}
                        />
                        <p>Время на рисование</p>
                        <input 
                            type="text" 
                            onInput={e => setDrawingTime(e.value)} 
                            value={state.room.drawingTime}
                            className={!isOwner ? 'btn_disabled' : undefined}
                        />
                    </div>
                </div>

                <p>Код комнаты:</p>
                <input type="text" value={state.room.gameCode} readOnly/>
                <p>Ссылка на подключение к комнате:</p>
                <input type="text" value={`https://drawguess.ru?code=${state.room.gameCode}`} readOnly/>
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
                    className={!isOwner ? 'btn_disabled' : undefined}
                >
                    Играть
                </Button>
            </div>
        </div>
    );
}