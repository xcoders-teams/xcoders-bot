'use strict';

export default {
    views: ['toimage'], // view for message in  menu
    command: /^to(images?|img)$/i, //another command.
    description: 'Convert Sticker To Images',
    usage: '%cmd% and Reply Sticker Message',
    media: true,
    execute: async ({ xcoders, m, x, quoted, mimetype, response, downloadContentMediaMessage, waitingMessage, errorMessage, addHitCommand }) => {
        try {
            if (!/webp/i.test(mimetype)) return errorMessage(m.chat, 'Reply Sticker and try again');
            const result = await downloadContentMediaMessage(quoted, { optional: true });
            await waitingMessage(m.chat);
            addHitCommand('Image Convert', true);
            return xcoders.sendMessage(m.chat, { image: result, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Image Convert');
        }
    }
};