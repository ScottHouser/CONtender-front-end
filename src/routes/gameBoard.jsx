import '../App.css';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'

export default function GameBoard({...props}) {
  const [gameState, setGameState ] = useState('')
  const [answerToQuestion, setAnswerToQuestion ] = useState('')
  const [votedForImpostor, setVotedForImpostor ] = useState(false)
  const [countDownTimer, setCountDownTimer] = useState(59)
  const reduxId = useSelector(state => state.playerData)

  useEffect(() => {
       
    props.client.onopen = () => {

    }
    props.client.onmessage = (message) =>{
      const dataFromServer = JSON.parse(message.data);

      if(dataFromServer.type === 'STATE_UPDATE'){
        setGameState(dataFromServer.payload)
      }
      if(dataFromServer.type === 'OTHER_PLAYER_ACTION'){
        setGameState(dataFromServer.payload)
      }
      if(dataFromServer.type === 'GAME_STARTING'){
        setVotedForImpostor(false)
      }
    }

    props.client.send(JSON.stringify({
      type: "giveStateUpdate",
      userName: reduxId.playerName,
      userId: reduxId.id,
      lobbyId: reduxId.lobbyId
    }))
  }, []);

  const returnCheckSvg = () => {
    return(
      <svg xmlns="http://www.w3.org/2000/svg" fill="crimson" height="24" width="24" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
    )
  }

  const submitAnAnswer = () => {

    let answerToQuestionFromState = answerToQuestion
        
    props.client.send(JSON.stringify({
      type: "submitAnswer",
      submittedAnswer: answerToQuestionFromState,
      playerId: reduxId.id,
      lobbyId: reduxId.lobbyId,
      playerName: reduxId.playerName,
      stageOfTheGame: gameState.stageOfTheGame,
    }))

    setAnswerToQuestion('')
  }

  const submitVoteForImpostor = (playerId) =>{
        
    setVotedForImpostor(true)

    props.client.send(JSON.stringify({
      type: "voteForImpostor",
      submittedVote: playerId,
      playerId: reduxId.id,
      lobbyId: reduxId.lobbyId,
    }))
  }

  const returnHeaderText = () => {
        
    if(gameState && gameState.directionsToPlayersTakeAction){

      if(gameState.stageOfTheGame > 3){
        return(
          <p style={{fontSize:20,textAlign:'center'}}>{'Vote for who you think is the impostor'}</p>
        )
      }

      if( hasPlayerSubmittedAnswer() ){
        if(isPlayerTheImpostor() && gameState.stageOfTheGame <= 1){
          return(
            <p style={{fontSize:20,textAlign:'center'}}>{'You are the Impostor! Pick a contender and try to blend in'}</p>
          )
        }

        if(gameState.stageOfTheGame > 1){
          if(gameState.votesForImpostor.length === gameState.players.length){
            let impostor = ''
            gameState.players.forEach(playerObj => {
              if(playerObj.playerID == gameState.impostorId){
                impostor = playerObj.playerName
              }
            })
            return(
              <p style={{fontSize:20,textAlign:'center'}}>{impostor +' was the impostor'}</p>
            )
          }else{
            return(
              <p style={{fontSize:20,textAlign:'center'}}>{'Vote for who you think is the impostor'}</p>
            )
          }
        }else{
          return(
            <p style={{fontSize:20,textAlign:'center'}}>{'Pick a contender who best matches the challenge'}</p>
          )
        }
        }else{
          return(
            <p style={{fontSize:20,textAlign:'center'}}>{'Wait for other players to answer'}</p>
          )
        }
      }
    }

  const question = () => {
    if(gameState && gameState.questionsAndAnswers && gameState.questionsAndAnswers[gameState.stageOfTheGame - 1]){

      if(isPlayerTheImpostor()){
        return(
          <></>
        )
      }else{
        return(
          <div className='full-width-centered'>
            <div className='white-rounded-background'>
              <p style={{fontSize:30, textAlign:'center', margin:'0px'}}>
                {gameState.questionsAndAnswers[gameState.stageOfTheGame - 1].question}
              </p>
            </div>
          </div>
        )
      }        
    }
  }

  const returnPlayersAndAnswers = (stageOfGame) => { //needs refactoring and cleaning
        
    let answers = {}
    let answersArray = []
    let totalAnswers = 0
    let hideBecauseTimer = stageOfGame == gameState.stageOfTheGame && countDownTimer < 59
    try{
      answers = gameState.questionsAndAnswers[stageOfGame-1].playerAnswers

      for(const key in answers) {
        answers[key].playerId = key
        answersArray.push(answers[key])
        totalAnswers++
      }
    }catch(e){

    }

    if(stageOfGame > gameState.stageOfTheGame || hideBecauseTimer){
      return(
        <></>
      )
    }

    answersArray.sort((a, b) => (a.playerName > b.playerName) ? 1 : -1)
    console.log(answersArray);

    let playerAnswersDisplay = answersArray.map(item => {

      let onClick = () => {};
      let outterStyle = 'player-in-lobby-row';
      let canSubmitVoteForImpostor = gameState && gameState.stageOfTheGame > 1 && !votedForImpostor;


      if(canSubmitVoteForImpostor){
        if(item.playerId !== reduxId.id){
          onClick = () => {submitVoteForImpostor(item.playerId)}
          outterStyle = 'player-in-lobby-row with-hover'
        }else{
          outterStyle = 'player-in-lobby-row with-grey'
        }

      }
               
      return (
        <>
          <div className={outterStyle} onClick={onClick}>
            <div style={{flex:1, display:'flex', flexDirection:'row',alignItems:'center'}}>
              <div style={{width:'40px', height:'40px', backgroundColor:'crimson',borderRadius:'90px',margin:'6px'}}></div>
                <p style={{fontSize:20, margin:'0px'}}>{item.playerName}</p>
                {gameState && gameState?.votesForImpostor &&
                  gameState?.votesForImpostor.map(item2 => {
                    if(item.playerId == item2){
                      return(returnCheckSvg())
                    }
                  })
                }
            </div>
                            
              <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:'10px',margin:'0px'}}>
                {gameState.stageOfTheGame > stageOfGame &&
                  <p style={{textAlign:'end', fontSize:24, margin:'0px'}}>{item.answer}</p>
                }
                {gameState.stageOfTheGame <= stageOfGame &&
                  <p style={{textAlign:'end', fontSize:24, margin:'0px'}}>{'Answer Submitted'}</p>
                }
              </div>
            </div>
          </>    
        )
      })
        

      return(
        <>
          {returnQuestionBanner(gameState, stageOfGame, totalAnswers)}
          {playerAnswersDisplay}
        </>
      )
  }

  const returnQuestionBanner = (gameState, gameStageMinimum, submittedAnswers) => {
 
    let numberSubmitted = submittedAnswers;
    let totalNumner = gameState?.players?.length;
    return(
      <div className='players-in-lobby'>
        <div style={{flex:2, fontSize:20, paddingLeft:'10px'}}>
          {gameState.stageOfTheGame <= gameStageMinimum &&
            <p>{'Current Question'}</p>
          }
          {gameState.stageOfTheGame > gameStageMinimum &&
            <p>{gameState.questionsAndAnswers[gameStageMinimum-1].question}</p>
          }      
        </div>
        <div style={{flex:1, fontSize:20}}>
          {gameState.stageOfTheGame <= gameStageMinimum &&
            <p style={{textAlign:'end'}}>{numberSubmitted + '/' + totalNumner}</p>
          }
          {gameState.stageOfTheGame > gameStageMinimum &&
            <p style={{textAlign:'end'}}>{gameState.questionsAndAnswers[gameStageMinimum-1].answer}</p>
          }
        </div>
      </div>
    )
  }

  const hasPlayerSubmittedAnswer = () => {
    let answers = {}
       
    try{
      answers = gameState.questionsAndAnswers[gameState.stageOfTheGame-1].playerAnswers

      for(const key in answers) {
        if(key === reduxId.id){
          return(false)
        }
      }
    }catch(e){

    }
        
    return(true)
  }

  function resetTheGame() {
    props.client.send(JSON.stringify({
      type: "startTheGame",
      lobbyId: reduxId.lobbyId
    }))
  }

  const isPlayerTheImpostor = () => {
    let impostorId = gameState?.impostorId;

    if(impostorId === reduxId.id){
      return(true)
    }else{
      return(false)
    }
  }

  const voteForImpostor = () => { //here for impostor vote

    if(gameState && gameState.directionsToPlayersTakeAction){
      return(
        gameState.players.map(player => {
          if(player.playerID != reduxId.id){
            return(
              <button className='app-button unselected-contender' onClick={()=>{submitVoteForImpostor(player.playerID)}}>
                {player.playerName}
              </button>
            )
          }
        })
      )
    }
  }

  const impostorVoteContainer = () => {
    if(gameState && gameState.stageOfTheGame > 1 && !votedForImpostor){
      return(
        <div className='full-width-centered-row'>
          {voteForImpostor()}
        </div>
      )
    }
  }

  const questionsOver = () => {//gameState.votesForImpostor.length === gameState.players.length
    if(gameState && gameState.stageOfTheGame > 1){
      return(true)
      }else{
        return(false)
    }
  }

  const questionsAndVotingOver = () => {
    if(gameState && gameState.stageOfTheGame > 1 && gameState.votesForImpostor.length === gameState.players.length){
      return(true)
      }else{
        return(false)
    }
  }

  const amITheHost = () => {
    let isHost = false

    try{
      gameState.players.forEach( player => {
        if(player.playerID === reduxId.id){
          isHost = player.isHost
        }
      })
    }catch(e){

    }

    return isHost
  }

  const returnPlayerChallengers = () => {
    try{
      let yourOptions = []
        
      gameState.players.forEach((player) => {
        if(player.playerID == reduxId.id){
          yourOptions = [...player.playerChoices]
        }
      })

      return(
        yourOptions.map((item) => {
          return(
            <button 
              className={answerToQuestion === item ? 'selected-contender app-button' : 'unselected-contender app-button'} 
              onClick={()=>{setAnswerToQuestion(item)}}>{item}
            </button>
          )
        })
      )
    }catch(e){
      return(<></>)
    }
  }

  const returnWinner = () =>{
    if(gameState && gameState.votesForImpostor && gameState.votesForImpostor.length === gameState.players.length){
      let mostFrequentItem = '';
      let numberOfTimes = 0;
      let winner = '';
      let winningPlayers = [];
      let winningPlayersByName = [];

      gameState.votesForImpostorWithVoter.forEach(( object ) => {//here
        if(object.votedFor == gameState?.impostorId){
          winningPlayers.push(object.playerId)
        }
      })
      //calulate most common item in impostor votes
      gameState.votesForImpostor.forEach((item, index)=>{//remove this layer
        let ItemInquestion = item
        let occurances = 0
        gameState.votesForImpostor.forEach((item2,index2) => {
          if(item2===ItemInquestion){
            occurances ++
            if(occurances > numberOfTimes){
              numberOfTimes = occurances
              mostFrequentItem = ItemInquestion
            }
          }
        })
      })

      if(numberOfTimes/gameState.players.length <= .5){
        winningPlayers.push(gameState?.impostorId)
      }
      else if(numberOfTimes/gameState.players.length > .5){
        if(mostFrequentItem !== gameState?.impostorId){
          winningPlayers.push(gameState?.impostorId)
        }
        // gameState.players.forEach(player => {
        //   if(player.playerID == mostFrequentItem){
        //     if(player.playerID == gameState.impostorId ){
        //       winner = 'Contenders! (impostor loses)'
        //     }else{
        //       winner = 'impostor'
        //     }
        //   }
        // })
      }

      winningPlayers.forEach(player => {
        gameState.players.forEach(playerObj => {
          if(player == playerObj.playerID){
            winningPlayersByName.push(playerObj.playerName)
          }
        })
      })

      return(
        <div className='full-width-centered'>
          <p style={{textAlign:'end', fontSize:20, marginTop: '10px', marginBottom:'0px'}}>{'winners: '}</p>
            {winningPlayersByName.map(player => {
              return(
                <p style={{textAlign:'end', fontSize:20, marginTop: '10px', marginBottom:'0px'}}>{player}</p>
              )
            })}
        </div>
      )
    }
  }
    

  return (
    <div className={'Container'}>
      <div className='max-width-container'>

      <div className='title-container'>
        {returnHeaderText()}
      </div>

      {/* {impostorVoteContainer()} */}
      {returnWinner()}

      {!questionsOver() && hasPlayerSubmittedAnswer() && 
        <>
          {question()}
        </>
      }

      {hasPlayerSubmittedAnswer() && !questionsOver() &&
        <div className='full-width-centered'>
          <div className='full-width-centered-row'>
            {returnPlayerChallengers()}
          </div>
          <button onClick={answerToQuestion === '' ? ()=>{} : submitAnAnswer} className={answerToQuestion === '' ? 'btn-submit-answer' : 'btn-submit-answer full-opacity'}>
            SUBMIT ANSWER
          </button>
        </div>
      }
           
           
      <div className='full-width-centered'>
        {returnPlayersAndAnswers(1)}
      </div>
            
      {amITheHost() && hasPlayerSubmittedAnswer() && questionsAndVotingOver() &&
        <div className='full-width-centered'>
          <button
            className='app-button unselected-contender'
            onClick={()=>{resetTheGame()}}
          >
            Reset the game
          </button>
        </div>
      }
    </div>        
    </div>
  );
}
