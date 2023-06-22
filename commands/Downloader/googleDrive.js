'use strict';

export default {
    views: ['gdrive < url >'],
    command: /^gdrive$/i,
    description: 'Google Drive Download From url',
    query: true,
    url: true,
    usage: '%cmd% url google drive',
    execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, parseResult, getJson, addHitCommand }) => {
        try {
            if (!regex.media(query)) return invalidUrlMessage(m.chat);
            const data = await getJson(`${host}/api/download/google-drive?url=${query}&apikey=${apikeys}`);
            if (!data.status) return errorMessage(m.chat, getMessage(data), 'Google Drive');
            await waitingMessage(m.chat);
            const result = parseResult(data.result);
            const response = styleMessage('Google Drive Downloader', result);
            addHitCommand('Google Drive', true);
            return xcoders.sendFileFromUrl(m.chat, data.result.url, response, x, { mimetype: data.result.mimetype });
        } catch (error) {
            return errorMessage(m.chat, error, 'Google Drive');
        }
    }
}