'use strict';

export default {
    views: ['mediafire < url >'], // view for message in  menu
    command: /^(mfdl|mediafire)$/i, //another command.
    description: 'Download Files from Mediafire Url',
    query: true,
    url: true,
    usage: '%cmd% url Mediafire',
    execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, parseResult, getJson, addHitCommand }) => {
        try {
            if (!regex.media(query)) return invalidUrlMessage(m.chat);
            const data = await getJson(`${host}/api/download/mediafire?url=${query}&apikey=${apikeys}`);
            if (!data.status) return errorMessage(m.chat, getMessage(data), 'Mediafire Downloader');
            await waitingMessage(m.chat);
            const result = parseResult(data.result);
            const caption = styleMessage('Mediafire Downloader', result);
            addHitCommand('Mediafire Downloader', true);
            return xcoders.sendFileFromUrl(m.chat, data.result.url, caption, x);
        } catch (error) {
            return errorMessage(m.chat, error, 'Mediafire Downloader');
        }
    }
};