import React from 'react';
import logo from './logo.svg';
import './App.css';
import ChatWsProvider from './chat/ChatWsProvider';
import ChatRoom from './chat/ChatRoom';

function App() {
  return (
    <div className="App">
      <ChatWsProvider>
        <ChatRoom />
      </ChatWsProvider>
    </div>
  );
}

export default App;
