'use strict';

export default {
    views: ['ssweb < text >'], // view for message in  menu
    command: /^ssweb$/i, //another command.
    description: 'Screenshot Website Convert To images',
    usage: '%cmd% https://api-xcoders.site',
    query: true,
    url: true,
    execute: async ({ xcoders, m, x, apikeys, query, regex, waitingMessage, errorMessage, host, getJson, addHitCommand }) => {
        try {
            const data = await getJson(`${host}/api/maker/ssweb?url=${query}&result_type=json&apikey=${apikeys}`);
            if (data.status) return errorMessage(m.chat, null, 'Screenshot Website');
            const result = Buffer.from(data);
            await waitingMessage(m.chat);
            addHitCommand('Screenshot Website', true);
            return xcoders.sendMessage(m.chat, { image: result, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Screenshot Website');
        }
    }
};