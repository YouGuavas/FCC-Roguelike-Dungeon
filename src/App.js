import React, { Component } from 'react';
import logo from './logo.svg';
import { Game } from './Game.js';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Game />
      </div>
    );
  }
}

export default App;
