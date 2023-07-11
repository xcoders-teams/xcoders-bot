'use strict';

export default {
  views: ['capcut < url >'], // view for message in  menu
  command: /^(cc(|dl|down)|capcut)$/i, //another command.
  description: 'Download video from Capcut Url',
  query: true,
  url: true,
  usage: '%cmd% url Capcut',
  execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, parseResult, getJson, addHitCommand }) => {
    try {
      if (!regex.media(query)) return invalidUrlMessage(m.chat);
      const data = await getJson(`${host}/api/download/capcut?url=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Capcut');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('Capcut Video Downloader', result);
      addHitCommand('Capcut', true);
      return xcoders.sendFileFromUrl(m.chat, data.result.url, caption, x);
    } catch (error) {
      return errorMessage(m.chat, error, 'Capcut');
    }
  }
};