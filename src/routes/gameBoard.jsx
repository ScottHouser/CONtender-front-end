import '../App.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { connect, useDispatch, useSelector } from 'react-redux'

const testArray = [1,2,3,4];

export default function GameBoard({...props}) {
    const [gameState, setGameState ] = useState('')
    const [answerToQuestion, setAnswerToQuestion ] = useState('')
    const [votedForImpostor, setVotedForImpostor ] = useState(false)
    const [countDownTimer, setCountDownTimer] = useState(59)
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const reduxId = useSelector(state => state.playerData)

    useEffect(() => {

        //client = new W3CWebSocket('ws://127.0.0.1:8000');
       
        props.client.onopen = () => {
          console.log('websocket connected')
        }
        props.client.onmessage = (message) =>{
          const dataFromServer = JSON.parse(message.data);

            if(dataFromServer.type === 'STATE_UPDATE'){
                setGameState(dataFromServer.payload)
            }
            if(dataFromServer.type === 'OTHER_PLAYER_ACTION'){
                setGameState(dataFromServer.payload)
            }
            if(dataFromServer.type === 'SET_A_TIMEOUT'){
                setCountDownTimer(58)
                startTheCountdown()
            }

          console.log('got reply! ',dataFromServer)
        }

        props.client.send(JSON.stringify({
            type: "giveStateUpdate",
            userName: reduxId.playerName,
            userId: reduxId.id,
            lobbyId: reduxId.lobbyId
        }))

        //return () => client.close();
    }, []);

    const startTheCountdown = () => {
        let a = countDownTimer        

        const interval = setInterval(() => {
            if(a > 0){
                setCountDownTimer(prevCount => prevCount - 1)
                a--
            }else{
                setCountDownTimer(59)
                clearInterval(interval)
            }
          
        }, 1000);

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

    const directionsNow = () => {
        
        if(gameState && gameState.directionsToPlayersTakeAction){

            if(gameState.stageOfTheGame > 3){
                return(
                    <p style={{fontSize:20,textAlign:'center'}}>{'Vote for who you think is the impostor'}</p>
                )
            }

            if(hasPlayerSubmittedAnswer()){
                if(isPlayerTheImpostor() && gameState.stageOfTheGame <= 3){
                    return(
                        <>
                            <p style={{fontSize:20,textAlign:'center'}}>{'You are the Impostor! Write the answer below, or a similar answer in the category of ' + gameState.questionsAndAnswers[gameState.stageOfTheGame - 1].category}</p>
                            
                        </>
                    )
                }

                if(gameState.stageOfGame > 2){
                    return(
                        <p style={{fontSize:20,textAlign:'center'}}>{'Vote for who you think is the impostor'}</p>
                    )
                }

                return(
                    <p style={{fontSize:20,textAlign:'center'}}>{gameState.directionsToPlayersTakeAction}</p>
                )
            }else{
                return(
                    <p style={{fontSize:20,textAlign:'center'}}>{gameState.directionsToPlayersAfterAction}</p>
                )
            }
        }
    }

    const directionsAfter = () => {
        if(gameState && gameState.directionsToPlayersafterAction){
            return(
                <p style={{fontSize:20,textAlign:'center'}}>{gameState.directionsToPlayersAfterAction}</p>
            )
        }
    }

    const question = () => {
        if(gameState && gameState.questionsAndAnswers && gameState.questionsAndAnswers[gameState.stageOfTheGame - 1]){

            if(isPlayerTheImpostor()){
                return(
                    <p style={{fontSize:30, textAlign:'center', margin:'0px'}}>{gameState.questionsAndAnswers[gameState.stageOfTheGame - 1].answer}</p>
                )
            }else{
                return(
                    <p style={{fontSize:30, textAlign:'center', margin:'0px'}}>{gameState.questionsAndAnswers[gameState.stageOfTheGame - 1].question}</p>
                )
            }
            
        }
    }

    const returnPlayersAndAnswers = (stageOfGame) =>{
        
        let answers = {}
        let answersArray = []
        let totalAnswers = 0
        let hideBecauseTimer = stageOfGame == gameState.stageOfTheGame && countDownTimer < 59
        try{
            answers = gameState.questionsAndAnswers[stageOfGame-1].playerAnswers

            for(const key in answers) {
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

        
        let playerAnswersDisplay = answersArray.map(item => {
               
                return (
                    <>
                        <div className='player-in-lobby-row' >
                            <div style={{flex:1, display:'flex', flexDirection:'row',alignItems:'center'}}>
                                <div style={{width:'40px', height:'40px', backgroundColor:'crimson',borderRadius:'90px',margin:'6px'}}></div>
                                <p style={{fontSize:20, margin:'0px'}}>{item.playerName}</p>
                            </div>
                            
                            <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:'10px',margin:'0px'}}>
                                {gameState.stageOfTheGame > stageOfGame &&
                                    <p style={{textAlign:'end', fontSize:20, margin:'0px'}}>{item.answer}</p>
                                }
                                {gameState.stageOfTheGame <= stageOfGame &&
                                    <p style={{textAlign:'end', fontSize:20, margin:'0px'}}>{'Answer Submitted'}</p>
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
        //gameState = gameState
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

    const isPlayerTheImpostor = () => {
        let impostorId = gameState?.impostorId
       

        if(impostorId === reduxId.id){

           
            return(true)
        }else{
            return(false)
        }
    }

    const voteForImpostor = () => {

        if(gameState && gameState.directionsToPlayersTakeAction){
            return(
                gameState.players.map(player =>{
                    if(player.playerID != reduxId.id){
                        return(
                            <button onClick={()=>{submitVoteForImpostor(player.playerID)}}>{player.playerName}</button>
                        )
                    }
                })
            )
        }
    }

    const impostorVoteContainer = () => {
        if(gameState && gameState.stageOfTheGame > 3 && !votedForImpostor){
            return(
                <>
                    {voteForImpostor()}
                </>
            )
        }
    }

    const questionsOver = () => {
        if(gameState && gameState.stageOfTheGame > 3){
            return(
               true
            )
        }else{
            return(
                false
            )
        }
    }

    const returnWinner = () =>{
        if(gameState && gameState.votesForImpostor && gameState.votesForImpostor.length === gameState.players.length){
            let mostFrequentItem = ''
            let numberOfTimes = 0
            let votedForPlayer = ''
            let winner = ''

            gameState.votesForImpostor.forEach((item,index)=>{
                let ItemInquestion = item
                let occurances = 0
                gameState.votesForImpostor.forEach((item2,index2)=>{
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
                winner = 'impostor'
            }else if(numberOfTimes/gameState.players.length > .5){
                gameState.players.forEach(player => {
                    if(player.playerID == mostFrequentItem){
                        if(player.playerID == gameState.impostorId ){
                            winner = 'inquizitors'
                        }else{
                            winner = 'impostor'
                        }
                    }
                })
            }

            return(
                <p style={{textAlign:'end', fontSize:20}}>{'winner: '+winner}</p>
            )
        }
    }
    

    return (
        <div className={'Container'}>

            {countDownTimer <= 58 &&
                <>
                    <p>{'discuss the answers and try to find the impostor'}</p>
                    <p>{countDownTimer}</p>
                </>
            }
            
            {countDownTimer > 58 &&
                <div className='title-container'>
                    {directionsNow()}
                </div>
            }

            {impostorVoteContainer()}
            {returnWinner()}

            {!questionsOver() && hasPlayerSubmittedAnswer() && countDownTimer > 58 &&
                <div className='white-rounded-background'>
                    {question()}
                </div>
            }

            {hasPlayerSubmittedAnswer() && !questionsOver() && countDownTimer > 58 &&
                <>
                  <input onChange={ e =>{setAnswerToQuestion(e.target.value)}} placeholder='Answer Here' value={answerToQuestion} className="game-board-input" type="text"/>
                  <button onClick={submitAnAnswer} className={'btn'}>SUBMIT ANSWER</button>
                </>
            }
           
           
            <div className='lobby-roster-container'>
                {returnPlayersAndAnswers(3)}
                {returnPlayersAndAnswers(2)}
                {returnPlayersAndAnswers(1)}

            </div>    

            
        </div>
    );
  }
