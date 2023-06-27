'use strict';

export default {
    views: ['take < author|pack >'], // view for message in  menu
    command: /^(take|wm)$/i, //another command.
    description: 'Create Watermark in sticker message',
    usage: '%cmd% watermark',
    media: true,
    execute: async ({ xcoders, m, x, query, quoted, mimetype, errorMessage, createWatermark, addHitCommand }) => {
        try {
            const [pack, author] = query.split('|');
            const buffer = await quoted.download();
            if (!/webp/i.test(mimetype)) return errorMessage(m.chat, 'Type not supported');
            const result = await createWatermark(buffer, { packname: pack, authorname: author });
            addHitCommand('Sticker', true);
            return xcoders.sendMessage(m.chat, { sticker: result, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Sticker');
        }
    }
};