import Pusher from 'pusher-js';
import config from 'config';


class PusherService {
  static instance = [];

  constructor() {
    // this.action = null;
    this.pusher = null;
    this.channelName = null;
    this.callbacks = {};
    this.currentIndex = null;
    this.updateCommentCount = null;
  }

  static getInstance(index) {
    PusherService.instance[index] = new PusherService();
    PusherService.instance.currentIndex = index;
    return PusherService.instance[index];
  }

  addCallbacks(action, newCommentCallback) {
    if (action === 'replyComment') {
      // this.action = 'replyComment';
      this.callbacks.newSubComment = newCommentCallback;
    } else {
      // this.action = 'commentPost';
      this.callbacks.newComment = newCommentCallback;
    }
  }

  connect(channelName) {
    if (!this.pusher) {
      this.pusher = new Pusher(config.pusher.key, {
        cluster: config.pusher.cluster,
      });
    }

    this.channelName = channelName;
    const channel = this.pusher.subscribe(channelName);

    channel.bind('comment', (data) => {
      const pusherInstance = PusherService.instance;

      if (Object.keys(pusherInstance[pusherInstance.currentIndex].callbacks).length === 0) {
        return;
      }

      if (data.type === 'reply') {
        if (pusherInstance[pusherInstance.currentIndex].callbacks.newSubComment) {
          pusherInstance[pusherInstance.currentIndex].callbacks.newSubComment(data.comment);
        } else {
          pusherInstance[pusherInstance.currentIndex].updateCommentCount(data.comment.object_id);
        }
      } else {
        pusherInstance[pusherInstance.currentIndex].callbacks.newComment(data.comment);
      }
    });
  }

  disconnect() {
    PusherService.instance[PusherService.instance.currentIndex].pusher
      .unsubscribe(PusherService.instance.channelName);
  }
}

export default PusherService;
