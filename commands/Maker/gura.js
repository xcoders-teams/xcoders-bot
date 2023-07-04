'use strict';  

export default {
    views: ['gura < text >'], // view for message in  menu
    command: /^gura$/i, //another command.
    description: 'Create Gura images',
    usage: '%cmd% xcoders',
    query: true,
    execute: async ({ xcoders, m, x, apikeys, query, waitingMessage, errorMessage, host, getBuffer, response, addHitCommand }) => {
        try {
            const data = await getBuffer(`${host}/api/maker/gura?text=${query}&apikey=${apikeys}`);
            await waitingMessage(m.chat);
            addHitCommand('Gura Maker', true);
            return xcoders.sendMessage(m.chat, { image: data, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Gura Maker');
        }
    }
};