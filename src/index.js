import { render } from "react-dom";
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import App from "./App";
import Expenses from "./routes/expenses";
import Invoices from "./routes/invoices";
import ExistingGame from "./routes/existingGame";
import PreGameLobby from "./routes/preGameLobby";
import GameBoard from "./routes/gameBoard";
import {Provider} from 'react-redux'
import store from './redux/store'
import { w3cwebsocket as W3CWebSocket } from 'websocket';
const client = new W3CWebSocket('ws://127.0.0.1:8000');

const rootElement = document.getElementById("root");
render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App client={client} />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="existingGame" element={<ExistingGame client={client}/>} />
        <Route path="preGameLobby" element={<PreGameLobby client={client} />} />
        <Route path="gameBoard" element={<GameBoard client={client} /> } />
      </Routes>
    </BrowserRouter>
  </Provider>,
  rootElement
);