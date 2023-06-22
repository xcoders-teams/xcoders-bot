'use strict';

import _ from 'lodash';

export default {
  views: ['sendaudio < url >'], // view for message in  menu
  command: /^send(audio|music|musik)$/i, //another command.
  description: 'Send Video from Url valid',
  query: true,
  url: true,
  video: true,
  usage: '%cmd% url valid audio',
  execute: async ({ xcoders, waitingMessage, errorMessage, m, x, response, query, isAudioUrl }) => {
    try {
      if (!await isAudioUrl(query)) throw _.sample(response.error.url);
      await waitingMessage(m.chat);
      return xcoders.sendAudioFromUrl(m.chat, query, x, { ffmpeg: false });
    } catch (error) {
      return errorMessage(m.chat, error);
    }
  }
};