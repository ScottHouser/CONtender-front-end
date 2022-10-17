import '../App.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux'

export default function ExistingGame({...props}) {
  const [userName, setUserName] = useState('');
  const [lobbyId, setLobbyId] = useState('')
  const navigate = useNavigate();
  const dispatch = useDispatch()

  useEffect(() => {
       
    props.client.onopen = () => {
          
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

  function joinGame () {
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
        <button onClick={joinGame} className={'btn'}>JOIN GAME</button>
      )
    }
  }

  return (
    <div className={'Container'}>
      <div className='max-width-container'>
        <div className='title-container'>
          <p className='title'>{'CONtender'}</p>
        </div>
        <div className='full-width-centered'>
          <input onChange={ e =>{setUserName(e.target.value)}} placeholder='PLAYER NAME' className="existing-game-input-text" type="text" maxLength="15"/>
          <input onChange={ e =>{setLobbyId(e.target.value)}} placeholder='Lobby Code' className="existing-game-input-text" type="text" maxLength="4" style={{textTransform:'uppercase'}}/>
            {returnJoinGameButton()}
        </div>
        <div className='white-rounded-background-title'>
          <span>
            <span className='gradient-text' style={{fontSize:'26px'}}>{'How to Play: '}</span>
            <span className='gradient-text' style={{fontSize:'20px'}}>{'CONtender is game of social deduction and absurd debate. Players are given a hand of condenders to submit for a crazy challenge. The twist is that one player never sees the challenge. They are the impostor and must avoid detection as honest players try to sus them out.'}</span>
          </span>
          <span style={{marginTop:'30px'}}>
            <span className='gradient-text' style={{fontSize:'26px'}}>{'How to start: '}</span>
            <span className='gradient-text' style={{fontSize:'20px'}}>{'Click CREATE GAME and create a player name. This will put you in a lobby with a unique lobby ID. Share this with the friends you want to join. They will need to click JOIN GAME and enter the lobby ID along with a player name.'}</span>
          </span>
        </div>
      </div>
    </div>
  );
}