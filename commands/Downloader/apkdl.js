'use strict';

export default {
    views: ['apkdl < url >'], // view for message in  menu
    command: /^apk(|dl|down)$/i, //another command.
    description: 'Download Files from apkdl Url',
    query: true,
    url: true,
    usage: '%cmd% url apk-dl.com',
    execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, parseResult, getJson, addHitCommand }) => {
        try {
            if (!regex.media(query)) return invalidUrlMessage(m.chat);
            const data = await getJson(`${host}/api/download/apkdl?url=${query}&apikey=${apikeys}`);
            if (!data.status) return errorMessage(m.chat, getMessage(data), 'Apkdl Downloader');
            await waitingMessage(m.chat);
            const result = parseResult(data.result);
            const caption = styleMessage('Apkdl Files Downloader', result);
            addHitCommand('Apkdl Downloader', true);
            return xcoders.sendFileFromUrl(m.chat, data.result.url, caption, x, { name: data.result.title });
        } catch (error) {
            return errorMessage(m.chat, error, 'Apkdl Downloader');
        }
    }
};