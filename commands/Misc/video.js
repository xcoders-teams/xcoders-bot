'use strict';

export default {
  views: ['sendvideo < url >'], // view for message in  menu
  command: /^send(video|vidio)$/i, //another command.
  description: 'Send Video from Url valid',
  query: true,
  url: true,
  video: true,
  usage: '%cmd% url valid video',
  execute: async ({ xcoders, waitingMessage, errorMessage, m, x, response, query, isVideoUrl }) => {
    try {
      await waitingMessage(m.chat);
      return xcoders.sendFileFromUrl(m.chat, query, response.success, x);
    } catch (error) {
      return errorMessage(m.chat, error);
    }
  }
};