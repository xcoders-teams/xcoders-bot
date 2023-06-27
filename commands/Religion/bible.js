'use strict';

export default {
    views: ['bible'],
    command: /^bible$/i,
    description: 'Qoute Bible days',
    usage: '',
    execute: async ({ xcoders, m, x, errorMessage, waitingMessage, host, getJson, apikeys, parseResult, styleMessage, addHitCommand }) => {
        try {
            const data = await getJson(`${host}/api/religion/bible-days?apikey=${apikeys}`);
            if (!data.status) return errorMessage(m.chat, getMessage(data), 'Bible Day');
            await waitingMessage(m.chat);
            const result = parseResult(data.result);
            const caption = styleMessage('Bible days', result);
            addHitCommand('Bible Day', true);
            return xcoders.sendMessage(m.chat, { image: { url: data.result.thumbnail }, caption: caption, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Bible Day');
        }
    }
}