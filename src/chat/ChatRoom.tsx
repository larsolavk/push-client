import React, { useContext, useState } from 'react';
import { ChatWsContext, createGuid } from './ChatWsProvider';
import { ServiceWorkerContext } from '../ServiceWorkerProvider';
import './Chat.scss';

const ChatRoom = () => {
  const { state, sendMessage } = useContext(ChatWsContext);
  const {
    initialized: swInitialized,
    subscribeToPushAsync,
    pushSubscription,
  } = useContext(ServiceWorkerContext);
  const [message, setMessage] = useState('');
  const [showPushSubscription, setShowPushSubscription] = useState(false);

  const onChange = (e: any) => {
    setMessage(e.target.value);
  };

  const onKeyDown = (e: any) => {
    if (e.keyCode === 13) {
      sendMessage(message);
      setMessage('');
    }
  };

  return (
    <>
      <div className="messages">
        <div>
          <div>
            {`ServiceWorker er ${swInitialized ? '' : 'IKKE'} initialisert`}
          </div>
          <div>{`PUSH er ${pushSubscription ? '' : 'IKKE'} initialisert`}</div>
          {!pushSubscription && (
            <button
              onClick={() => subscribeToPushAsync && subscribeToPushAsync()}
            >
              Motta pushvarsler
            </button>
          )}
          {pushSubscription && (
            <button
              onClick={() => setShowPushSubscription(!showPushSubscription)}
            >
              Vis/skjul push subscription
            </button>
          )}
          {pushSubscription && showPushSubscription && (
            <div>{pushSubscription}</div>
          )}
        </div>
        {state.messages.map((m) => (
          <div
            key={createGuid()}
            className={`message-row ${m.user === 'Me' ? 'from-self' : ''}`}
          >
            <div className="message-container">
              <div className="user">{m.user}</div>
              <div className="text">{m.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="input">
        <input
          type="text"
          placeholder="Skriv din melding her..."
          value={message}
          onChange={onChange}
          onKeyDown={onKeyDown}
        ></input>
      </div>
    </>
  );
};

export default ChatRoom;
