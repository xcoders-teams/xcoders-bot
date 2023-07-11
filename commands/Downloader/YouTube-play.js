'use strict';

export default {
    views: ['ytplay < query >'], // view for message in  menu
    command: /^(yt)?play$/i, //another command.
    description: 'Download music from YouTube Play',
    query: true,
    text: true,
    usage: '%cmd% monolog pamungkas',
    execute: async ({ xcoders, x, m, query, styleMessage, errorMessage, waitingMessage, canvas, getMessage, parseResult, getBuffer, addHitCommand, getJson, host, apikeys }) => {
        try {
            const data = await getJson(`${host}/api/download/play-mp3?query=${query}&apikey=${apikeys}`);
            if (!data.status) return errorMessage(m.chat, getMessage(data), 'YouTube Play');
            await waitingMessage(m.chat);
            const parseCaption = parseResult(data);
            const caption = styleMessage('YouTube Play Downloader', parseCaption);
            const canvasThumbnail = await canvas.create('YouTube Play Downloder');
            const thumbnail = await getBuffer(data.result.thumbnail);
            await xcoders.sendMessage(m.chat, { image: canvasThumbnail, caption, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
            addHitCommand('YouTube Play', true);
            return xcoders.sendAudioFromUrl(m.chat, data.result.url, x, { fileName: data.result.title + '.mp3', title: data.result.title, thumbnail, source: query, stream: true });
        } catch (error) {
            return errorMessage(m.chat, error, 'YouTube Play');
        }
    }
};