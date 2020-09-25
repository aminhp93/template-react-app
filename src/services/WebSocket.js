import config from 'config';
import toastr from 'toastr';


class WebSocketService {
  static instance = null;

  callbacks = {};

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }

    return WebSocketService.instance;
  }

  constructor() {
    this.socketRef = null;
    this.action = null;
  }

  connect(parentType, parentId) {
    const path = config.API_PATH(parentType, parentId);
    this.socketRef = new WebSocket(path);

    this.socketRef.onmessage = (e) => {
      this.socketNewComment(e.data);
    };

    this.socketRef.onerror = (e) => {
      toastr.error(e.message);
    };

    this.socketRef.onclose = () => {
      toastr.error('WebSocket closed let\'s reopen');
      this.connect();
    };
  }

  socketNewComment(data) {
    const parsedData = JSON.parse(data);
    if (Object.keys(this.callbacks).length === 0) {
      return;
    }

    if (this.action === 'replyComment') {
      this.callbacks.newSubComment(parsedData.comment);
    } else {
      this.callbacks.newComment(parsedData.comment);
    }
  }

  addCallbacks(action, newCommentCallback) {
    if (action() === 'replyComment') {
      this.action = 'replyComment';
      this.callbacks.newSubComment = newCommentCallback;
    } else {
      this.action = 'commentPost';
      this.callbacks.newComment = newCommentCallback;
    }
  }

  state() {
    return this.socketRef.readyState;
  }

  waitForSocketConnection(callback) {
    const socket = this.socketRef;
    const recursion = this.waitForSocketConnection;
    setTimeout(() => {
      if (socket.readyState === 1) {
        if (callback != null) {
          callback();
        }
      } else {
        toastr.error('wait for connection...');
        recursion(callback);
      }
    }, 1);
  }
}

const WebSocketInstance = WebSocketService.getInstance();

export default WebSocketInstance;
