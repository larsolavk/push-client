import React from 'react';
import logo from './logo.svg';
import './App.css';
import ChatWsProvider from './chat/ChatWsProvider';
import ChatRoom from './chat/ChatRoom';
import ServiceWorkerProvider from './ServiceWorkerProvider';

function App() {
  return (
    <ServiceWorkerProvider>
      <div className="App">
        <ChatWsProvider>
          <ChatRoom />
        </ChatWsProvider>
      </div>
    </ServiceWorkerProvider>
  );
}

export default App;
