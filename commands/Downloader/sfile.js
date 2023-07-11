'use strict';

export default {
    views: ['sfile < url >'], // view for message in  menu
    command: /^(sfiledl|sfile)$/i, //another command.
    description: 'Download Files from Sfile Url',
    query: true,
    url: true,
    usage: '%cmd% url Sfile',
    execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, parseResult, getJson, addHitCommand }) => {
        try {
            if (!regex.media(query)) return invalidUrlMessage(m.chat);
            const data = await getJson(`${host}/api/download/sfile?url=${query}&apikey=${apikeys}`);
            if (!data.status) return errorMessage(m.chat, getMessage(data), 'Sfile Downloader');
            await waitingMessage(m.chat);
            const result = parseResult(data.result);
            const caption = styleMessage('Sfile Downloader', result);
            addHitCommand('Sfile Downloader', true);
            return xcoders.sendFileFromUrl(m.chat, data.result.url, caption, x);
        } catch (error) {
            return errorMessage(m.chat, error, 'Sfile Downloader');
        }
    }
};