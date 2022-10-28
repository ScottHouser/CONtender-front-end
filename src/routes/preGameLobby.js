import '../App.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'

export default function PreGameLobby({...props}) {

  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [lobbyId, setLobbyId] = useState('')
  const [gameState, setGameState ] = useState('')
  const dispatch = useDispatch()
  const reduxId = useSelector(state => state.playerData)
  const navigate = useNavigate();

    useEffect(() => {
       
        props.client.onopen = () => {
          console.log('websocket connected')
        }
        props.client.onmessage = (message) =>{
          const dataFromServer = JSON.parse(message.data);

          if(dataFromServer.type === 'STATE_UPDATE'){
            setUserId(dataFromServer.userId)
            setUserName(dataFromServer.playerName)
            setLobbyId(dataFromServer.lobbyId)
            setGameState(dataFromServer.payload)
            dispatch({type:'UPDATE_PLAYER',payload: {id: dataFromServer.userId, lobbyId: dataFromServer.lobbyId, playerName: dataFromServer.playerName}});
          }

          if(dataFromServer.type === 'OTHER_PLAYER_ACTION'){
            setGameState(dataFromServer.payload)
          }

          if(dataFromServer.type === 'LOBBY_CLOSED'){
            window.alert('player left lobby. Game disbanded')
            dispatch({type:'UPDATE_PLAYER',payload: {}});
            console.log('fuck')
            navigate('/')
          }

          if(dataFromServer.type === 'GAME_STARTING'){
            navigate('/GameBoard')
          }

          console.log('got reply! ',dataFromServer)
        }
        // return () => {
        //     dispatch({type:'UPDATE_PLAYER',payload: {}});
        // };

    }, []);
      
    function makeALobby(userName, userId) {
        if(userName !== ''){
            props.client.send(JSON.stringify({
            type: "makeNewLobby",
            userName: userName,
            userId: userId,
            }))
        }else{
            console.log('make a user name')
        }
    }

    function startGame() {
        if(userName && lobbyId){
            props.client.send(JSON.stringify({
                type: "startTheGame",
                lobbyId: lobbyId
        }))
        }else{
            console.log('start game failure')
        }
    }

    const AmITheHost = () => {
        let isHost = false

        try{
            gameState.players.forEach( player => {
                if(player.playerID === userId){
                    isHost = player.isHost
                }
            })
        }catch(e){

        }

        return isHost
    }

    const returnPlayerCount = () => {
        if(!gameState){
            return ''
        }else{
            return(gameState.players.length)
        }
    }

    const returnPlayersInQueue = (array) =>{
        if(!array){
            return(
                <>
                </>
            )
        }

        return(
        array.map(item => {
            return (
                <div style={{backgroundColor: item.playerID === reduxId.id ? 'white':'lightgray'}} className='player-in-lobby-row' >
                    <div style={{flex:1,display:'flex', flexDirection:'row',alignItems:'center'}}>
                        <div style={{width:'50px', height:'50px', backgroundColor:'crimson',borderRadius:'90px',margin:'6px'}}></div>
                        <p style={{fontSize:20}}>{item.playerName}</p>
                    </div>
                    
                    <div style={{flex:1, alignItems:'flex-end', paddingRight:'10px',margin:'0px'}}>
                        <p style={{textAlign:'end', fontSize:20}}>{ item.isHost ? 'Host':'' }</p>
                    </div>
                </div>
            )
        })
        )
    }

    const returnCreateLobbyInput = () => {
        if(!reduxId.lobbyId){
            return(
                <>
                    <input onChange={ e =>{setUserName(e.target.value)}} placeholder='Player Name' className="existing-game-input-text" type="text" maxLength="15"/>
                    <button onClick={()=>{makeALobby(userName, userId)}} className={'btn'}>CREATE LOBBY</button>
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
                </>
            )
        }
    }

    const returnLobbyCodeDisplay = () => {
        if(reduxId.lobbyId){
            return(
                <div className='white-rounded-background'>
                    <p className='lobby-code-text'>{'Lobby Code'}</p>
                    <p className='lobby-code'>{reduxId.lobbyId}</p>
                </div>
            )
        }
    }

    const returnPlayersHeader = () => {
       if(reduxId.lobbyId){
           return(
            <div className='players-in-lobby'>
                
                <div style={{flex:1, display:'flex', fontSize:20,justifyContent:'flex-start',alignItems:'center'}}>
                    <svg  focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SearchIcon" width="100" height="100">
                        <g transform="scale(.8) translate(5,5)">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z">
                        <animateTransform attributeName="transform"
                                        attributeType="XML"
                                        type="rotate"
                                        from="0 9.5 9.5"
                                        to="360 9.5 9.5"
                                        dur="10s"
                                        repeatCount="indefinite"/>
                        </path>
                        <path transform="scale(.4) translate(11.75,11.5)" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z">
                        </path>
                        </g>
                    </svg>
                    <p>{'Players ready: '}</p>
                    <p style={{textAlign:'end'}}>{ returnPlayerCount()+ '/7' }</p>
                </div>
                <div style={{flex:1, fontSize:20, display:'flex', alignItems:'center', justifyContent:'flex-end'}}>
                    {returnPlayerCount() < 3 &&
                        <p style={{textAlign:'end'}}>{'3 or more players required'}</p>
                    }
                    {AmITheHost() && returnPlayerCount() > 2 &&
                        <button style={{marginBottom:'20px'}} onClick={startGame} className={'btn'}>START GAME</button>
                    }
                </div>  
            </div>
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

                {returnCreateLobbyInput()}

                {returnLobbyCodeDisplay()}

            </div>
            
            <div className='lobby-roster-container'>
                {returnPlayersHeader()}
                <div className='full-width-centered'>
                    {returnPlayersInQueue(gameState.players)}
                </div>
            </div>    
            </div>
        </div>
    );
}
