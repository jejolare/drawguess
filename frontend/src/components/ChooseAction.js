import Button from './UI/Button';
import { useState } from 'react';

export default function ChooseAction(props) {
    function processJoin(e) {
        
    }
    return (
        <>
            <input type="text" placeholder='Твой ник'/>
            <div className='flex-wrapper'>
                <Button onClick={processJoin}>Присоединиться</Button>
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
        </>
    );
}