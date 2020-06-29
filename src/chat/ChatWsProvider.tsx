import React, {
  createContext,
  useReducer,
  useEffect,
  useState,
  useRef,
} from 'react';
import {
  ChatReducer,
  initialState,
  ChatState,
  CHAT_MESSAGE_RECEIVED,
} from './ChatReducer';

export interface ChatWsContext {
  state: ChatState;
  dispatch: any;
  sendMessage: (message: string) => void;
}

export const ChatWsContext = createContext<ChatWsContext>({} as ChatWsContext);

export const createGuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const ChatWsProvider = (props: { children: JSX.Element }): JSX.Element => {
  const { children } = props;
  const [state, dispatch] = useReducer(ChatReducer, initialState);
  const [username] = useState(createGuid());
  const ws = useRef<WebSocket>();
  const pingInterval = useRef<NodeJS.Timeout>();
  const pongTimer = useRef<NodeJS.Timeout>();
  const reconnectTimer = useRef<NodeJS.Timeout>();

  const pingIntervalValue = 30000;
  const pongTimeoutValue = 5000;
  const reconnectIntervalValue = 10000;

  const sendMessage = (message: string) => {
    if (!ws.current) {
      console.log('Ingen WS');
      return;
    }

    const msg = {
      message: 'sendmessage',
      data: { user: username, message },
    };

    ws.current.send(JSON.stringify(msg));
  };

  const sendPing = (pongTimeoutMs: number) => {
    if (!ws.current) {
      console.log('Ingen WS');
      return;
    }

    const msg = {
      message: 'pingpong',
      data: { message: 'pingpong' },
    };

    console.log('Sending ping to server...');
    ws.current.send(JSON.stringify(msg));

    if (pongTimer.current) clearTimeout(pongTimer.current);
    pongTimer.current = setTimeout(() => onPongTimeout(), pongTimeoutMs);
  };

  const onPongTimeout = () => {
    ws.current?.close();
  };

  const initWebSocket = () => {
    ws.current = new WebSocket(
      'wss://pkkpa2aidl.execute-api.eu-west-1.amazonaws.com/Prod/'
    );

    ws.current.onopen = (e) => {
      console.log('onopen', e);
      if (pingInterval.current) clearInterval(pingInterval.current);
      pingInterval.current = setInterval(
        () => sendPing(pongTimeoutValue),
        pingIntervalValue
      );
      sendPing(pongTimeoutValue);
    };

    ws.current.onmessage = (e) => {
      console.log('onmessage', e);
      var data = JSON.parse(e.data);

      if (!data.user && data.message === 'pong') {
        console.log('Received pong from server');
        if (pongTimer.current) clearTimeout(pongTimer.current);
        return;
      }

      dispatch({
        type: CHAT_MESSAGE_RECEIVED,
        payload: {
          user: data.user === username ? 'Me' : data.user,
          text: data.message,
        },
      });
    };

    ws.current.onclose = (e) => {
      console.log('onclose', e);
      cleanupWebSocket();

      if (e.code > 1003) {
        reconnect(reconnectIntervalValue);
      }
    };

    ws.current.onerror = (e) => {
      console.log('onerror', e);
      //reconnect(reconnectIntervalValue);
    };
  };

  const cleanupWebSocket = () => {
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
    }
    ws.current?.close();
  };

  const reconnect = (timeoutMs: number) => {
    console.log(`Will reconnect in ${timeoutMs} ms`);

    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    reconnectTimer.current = setTimeout(() => {
      console.log('reconnecting...');
      initWebSocket();
    }, timeoutMs);
  };

  useEffect(() => {
    initWebSocket();

    return () => {
      cleanupWebSocket();
    };
  }, []);

  return (
    <ChatWsContext.Provider value={{ state, dispatch: dispatch, sendMessage }}>
      {children}
    </ChatWsContext.Provider>
  );
};

export default ChatWsProvider;
