'use strict';

export default {
    views: ['tolol < text >'], // view for message in  menu
    command: /^tolol$/i, //another command.
    description: 'Create Tolol Certificate images',
    usage: '%cmd% xcoders',
    query: true,
    text: true,
    execute: async ({ xcoders, m, x, apikeys, query, waitingMessage, errorMessage, host, getBuffer, addHitCommand }) => {
        try {
            const data = await getBuffer(`${host}/api/maker/serti-tolol?text=${query}&apikey=${apikeys}`);
            await waitingMessage(m.chat);
            addHitCommand('Tolol Maker', true);
            return xcoders.sendMessage(m.chat, { image: data, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Tolol Maker');
        }
    }
};