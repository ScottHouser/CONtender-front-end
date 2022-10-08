import logo from './logo.svg';
import React, { useState, useContext, useEffect, Component } from 'react';
import './App.css';
import { useNavigate } from "react-router-dom";

function App({...props}) {

  // use for debugging server
  // useEffect(() => {
    
  //   props.client.onopen = () => {
  //     console.log('websocket connected')
  //   }
  //   props.client.onmessage = (message) =>{
  //     const dataFromServer = JSON.parse(message.data);
  //     console.log('got reply! ',dataFromServer)
  //   }
  // }, []);

  const navigate = useNavigate();

  function joinGame() {
    navigate('/existingGame');
  }

  function createGame() {
    navigate('/preGameLobby');
  }

  return (

    <div className={'Container'}>
      <div className='title-container'>
        <p className='title'>{'CONtender'}</p>
      </div>
      <div className='full-width-centered'>
        <button id='btn1' onClick={joinGame} className={'btn'}>JOIN GAME</button>
        <button onClick={createGame} className={'btn'}>CREATE GAME</button>
      <svg  focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SearchIcon" width="100" height="100"> 
        <g transform="scale(.8) translate(5,5)">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z">
            <animateTransform attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="0 9.5 9.5"
              to="360 9.5 9.5"
              dur="10s"
              repeatCount="indefinite"
            />
            </path>
            <path transform="scale(.4) translate(11.75,11.5)" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z">
          </path>
        </g>
      </svg>
      </div>
    </div>
  );
}

export default App;

//put svg in seperate file