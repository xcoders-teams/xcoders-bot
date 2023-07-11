'use strict';

export default {
    views: ['imdb < url >'], // view for message in  menu
    command: /^imdb(|dl|down)$/i, //another command.
    description: 'Download video from IMDB Url',
    query: true,
    url: true,
    usage: '%cmd% url IMDB',
    execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, parseResult, getJson, addHitCommand }) => {
        try {
            if (!regex.media(query)) return invalidUrlMessage(m.chat);
            const data = await getJson(`${host}/api/download/imdb?url=${query}&apikey=${apikeys}`);
            if (!data.status) return errorMessage(m.chat, getMessage(data), 'IMDB Downloader');
            await waitingMessage(m.chat);
            const result = parseResult(data.result);
            const caption = styleMessage('IMDB Video Downloader', result);
            addHitCommand('IMDB Downloader', true);
            return xcoders.sendFileFromUrl(m.chat, data.result.data[0].url, caption, x);
        } catch (error) {
            return errorMessage(m.chat, error, 'IMDB Downloader');
        }
    }
};