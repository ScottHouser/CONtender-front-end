import '../App.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { connect, useDispatch, useSelector } from 'react-redux'

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

          if(dataFromServer.type === 'GAME_STARTING'){
            navigate('/GameBoard')
          }

          console.log('got reply! ',dataFromServer)
        }

    }, []);
      
    function handleClick3(userName, userId) {
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

    function handleClick1() {
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



    function testRedux()  {

        dispatch({type:'ADD_USER_ID',payload:'test'})

        console.log(reduxId)

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
                    <input onChange={ e =>{setUserName(e.target.value)}} placeholder='Player Name' className="existing-game-input-text" type="text"/>
                    <button onClick={()=>{handleClick3(userName, userId)}} className={'btn'}>CREATE LOBBY</button>
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
                    <p style={{textAlign:'end'}}>{ returnPlayerCount()+ '/6' }</p>
                </div>
                <div style={{flex:1, fontSize:20, display:'flex', alignItems:'center', justifyContent:'flex-end'}}>
                    {AmITheHost() &&
                        <button style={{marginBottom:'20px'}} onClick={handleClick1} className={'btn'}>START GAME</button>
                    }
                </div>  
            </div>
           )
       }
    }

    const reduxTest = ()=>{
        console.log(reduxId)
    }

    const reduxButton = () => {
        if(userName && lobbyId){
            return(
                <button onClick={reduxTest} className={'btn'}>ReduxButton</button>
            )
        }
    }
    

    return (
        <div className={'Container'}>
             <div className='title-container'>
                <p className='title'>{'INQUIZITOR'}</p>
            </div>

            {returnCreateLobbyInput()}

            {returnLobbyCodeDisplay()}
            
            <div className='lobby-roster-container'>
                {returnPlayersHeader()}
                
                {returnPlayersInQueue(gameState.players)}
            </div>    

        </div>
    );
  }
