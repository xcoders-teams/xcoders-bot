'use strict';

export default {
    views: ['nulis < text >'], // view for message in  menu
    command: /^nulis$/i, //another command.
    description: 'Create write text to paper',
    usage: '%cmd% xcoders',
    query: true,
    text: true,
    execute: async ({ xcoders, m, x, host, query, getBuffer, waitingMessage, errorMessage, addHitCommand, apikeys }) => {
        try {
            const result = await getBuffer(`${host}/api/maker/nulis?text=${query}&apikey=${apikeys}`);
            await waitingMessage(m.chat);
            addHitCommand('Writes Maker', true);
            return xcoders.sendMessage(m.chat, { image: result, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Writes Maker');
        }
    }
};