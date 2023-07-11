'use strict';

export default {
  views: ['sendaudio < url >'], // view for message in  menu
  command: /^send(audio|music|musik)$/i, //another command.
  description: 'Send Video from Url valid',
  query: true,
  url: true,
  audio: true,
  usage: '%cmd% url valid audio',
  execute: async ({ xcoders, waitingMessage, errorMessage, m, x, response, query, isAudioUrl }) => {
    try {
      await waitingMessage(m.chat);
      return xcoders.sendAudioFromUrl(m.chat, query, x, { stream: false });
    } catch (error) {
      return errorMessage(m.chat, error);
    }
  }
};