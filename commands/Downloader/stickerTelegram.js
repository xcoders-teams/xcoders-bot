'use strict';

export default {
    views: ['stele < url >'], // view for message in  menu
    command: /^(st(dl|down)|stele)$/i, //another command.
    description: 'Download Sticker from telegram Url',
    query: true,
    url: true,
    usage: '%cmd% url sticker telegram',
    execute: async ({ xcoders, x, m, query, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, getJson, addHitCommand }) => {
        try {
            if (!regex.media(query)) return invalidUrlMessage(m.chat);
            const data = await getJson(`${host}/api/download/telesticker?url=${query}&apikey=${apikeys}`);
            if (!data.status) return errorMessage(m.chat, getMessage(data), 'Sticker Telegram');
            await waitingMessage(m.chat);
            addHitCommand('Sticker Telegram', true);
            for (let i = 0; i < 10; i++) {
                await xcoders.sendMessage(m.chat, { sticker: { url: data.result.url[i] }, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
            }
            return true;
        } catch (error) {
            return errorMessage(m.chat, error, 'Sticker Telegram');
        }
    }
};