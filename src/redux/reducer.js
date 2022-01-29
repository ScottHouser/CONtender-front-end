import { combineReducers } from 'redux'

const INITIAL_STATE = {
    id:'',
    lobbyId:'',
    playerName:'',
};

const postsReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case "ADD_POST":
            return [...state, { text: action.payload.text, id: action.payload.id }]
        case "UPDATE_PLAYER":
            
            const newState = Object.assign({}, state, {id: action.payload.id, lobbyId: action.payload.lobbyId, playerName: action.payload.playerName});
            return newState
        default: return state
    }
}

const rootReducer = combineReducers({
    playerData: postsReducer
});

export default rootReducer;