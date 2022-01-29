import '../App.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { connect, useDispatch, useSelector } from 'react-redux'

export default function ExistingGame({...props}) {
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [lobbyId, setLobbyId] = useState('')
    const [gameState, setGameState ] = useState('')
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const reduxId = useSelector(state => state.playerData)

    useEffect(() => {
       
        props.client.onopen = () => {
          console.log('websocket connected')
        }
        props.client.onmessage = (message) =>{
          const dataFromServer = JSON.parse(message.data);

            if(dataFromServer.type === 'STATE_UPDATE'){
                let userId = dataFromServer.userId;
                let playerName = dataFromServer.playerName;
                let lobbyId = dataFromServer.lobbyId
                let gameState = dataFromServer.payload

                if(userId && playerName && lobbyId && gameState){
                    dispatch({type:'UPDATE_PLAYER',payload: {id: userId, lobbyId: lobbyId, playerName: playerName}})
                    navigate('/preGameLobby');
                }

            }
          console.log('got reply! ',dataFromServer)
        }

      }, []);

    function handleClick3() {
        if(userName && lobbyId){
                props.client.send(JSON.stringify({
                    type: "joinLobby",
                    userName: userName,
                    lobbyId: lobbyId
            }))
        }else{
            console.log('make a user name')
        }
    }

    const returnJoinGameButton = () => {
        if(userName && lobbyId && lobbyId.length === 4){
            return(
                <button onClick={handleClick3} className={'btn'}>JOIN GAME</button>
            )
        }
    }

    return (
        <div className={'Container'}>
            <div className='title-container'>
                <p className='title'>{'INQUIZITOR'}</p>
            </div>
            <input onChange={ e =>{setUserName(e.target.value)}} placeholder='PLAYER NAME' className="existing-game-input-text" type="text" maxLength="20"/>
            <input onChange={ e =>{setLobbyId(e.target.value)}} placeholder='Lobby Code' className="existing-game-input-text" type="text" maxLength="4" style={{textTransform:'uppercase'}}/>
            {returnJoinGameButton()}
        </div>
    );
  }