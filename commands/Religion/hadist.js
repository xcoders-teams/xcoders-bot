'use strict';

export default {
    views: ['hadist < name|number >'],
    command: /^hadi(st|ts)$/i,
    description: 'Get Hadist Shahih',
    query: true,
    usage: '%cmd% bukhari|5',
    execute: async ({ xcoders, m, x, errorMessage, waitingMessage, query, host, getJson, apikeys, parseResult, styleMessage, addHitCommand }) => {
        try {
            const [kitab, number] = query.split('|');
            const data = await getJson(`${host}/api/religion/hadits?kitab=${kitab}&number=${number}&apikey=${apikeys}`);
            if (!data.status) return errorMessage(m.chat, getMessage(data), 'Hadits');
            await waitingMessage(m.chat);
            const result = parseResult(data.result);
            const caption = styleMessage('Hadist Shahih', result);
            addHitCommand('Hadits', true);
            return xcoders.sendMessage(m.chat, { image: { url: data.result.thumbnail }, caption: caption, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Hadits');
        }
    }
}