export interface Message {
  user: string;
  text: string;
}

export interface ChatState {
  messages: Message[];
  realtime: boolean;
}

export const initialState = {
  messages: [],
  realtime: false,
};

export interface MessageAction {
  user: string;
  message: string;
}

export interface ChatReducerProps {
  state: ChatState;
  action:
    | ChatMessageReceivedAction
    | ChatWsConnectedAction
    | ChatWsDisconnectedAction;
}

export const CHAT_MESSAGE_RECEIVED = 'CHAT_MESSAGE_RECEIVED';
export const CHAT_WS_CONNECTED = 'CHAT_WS_CONNECTED';
export const CHAT_WS_DISCONNECTED = 'CHAT_WS_DISCONNECTED';

export interface ChatMessageReceivedAction {
  type: typeof CHAT_MESSAGE_RECEIVED;
  payload: Message;
}

export interface ChatWsConnectedAction {
  type: typeof CHAT_WS_CONNECTED;
  payload: never;
}

export interface ChatWsDisconnectedAction {
  type: typeof CHAT_WS_DISCONNECTED;
  payload: never;
}

export const ChatReducer = (
  state: ChatState,
  action:
    | ChatMessageReceivedAction
    | ChatWsConnectedAction
    | ChatWsDisconnectedAction
): ChatState => {
  switch (action.type) {
    case CHAT_WS_CONNECTED:
      return { ...state, realtime: true };
    case CHAT_WS_DISCONNECTED:
      return { ...state, realtime: false };
    case CHAT_MESSAGE_RECEIVED:
      return { ...state, messages: [...state.messages, action.payload] };
    default:
      return state;
  }
};
