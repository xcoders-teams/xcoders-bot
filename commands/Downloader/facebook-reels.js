'use strict';

export default {
    views: ['fbreels < url >'], // view for message in  menu
    command: /^fbree?ls?$/i, //another command.
    description: 'Download video reels from Facebook Url',
    query: true,
    url: true,
    usage: '%cmd% url reels facebook',
    execute: async ({ xcoders, x, m, query, styleMessage, errorMessage, waitingMessage, apikeys, host, getMessage, parseResult, getJson, addHitCommand }) => {
        try {
            const data = await getJson(`${host}/api/download/fb-reels?url=${query}&apikey=${apikeys}`);
            if (!data.status) return errorMessage(m.chat, getMessage(data), 'Facebook Reels Downloader');
            await waitingMessage(m.chat);
            const result = parseResult(data.result);
            const caption = styleMessage('Facebook Reels Downloader', result);
            addHitCommand('Facebook Reels Downloader', true);
            return xcoders.sendFileFromUrl(m.chat, data.result.data[0].url, caption, x);
        } catch (error) {
            return errorMessage(m.chat, error, 'Facebook Reels Downloader');
        }
    }
};