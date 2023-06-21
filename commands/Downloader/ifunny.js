'use strict';

export default {
  views: ['ifunny'], // view for message in  menu
  command: /^(ifunny(|dl|down))$/i, //another command.
  description: 'Download video from Ifunny Url',
  query: true,
  url: true,
  usage: '%cmd% url ifunny',
  execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, parseResult, getJson, addHitCommand }) => {
    try {
      if (!regex.media(query)) return invalidUrlMessage(m.chat);
      const data = await getJson(`${host}/api/download/ifunny?url=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Ifunny');
      await waitingMessage(m.chat);
      const metadata = _.sample(data.result.data);
      const result = parseResult({ ...data.result.title, metadata });
      const caption = styleMessage('Ifunny Video Downloader', result);
      addHitCommand('Ifunny', true);
      return xcoders.sendFileFromUrl(m.chat, metadata.url, caption, x, { thumbnail: null });
    } catch (error) {
      addHitCommand('Ifunny', false);
      throw error;
    }
  }
};