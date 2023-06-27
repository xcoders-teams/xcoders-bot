'use strict';

import webpmux from 'node-webpmux';

export default {
    views: ['extract'], // view for message in  menu
    command: /^(extract|getwm|)$/i, //another command.
    description: 'Extract Watermark From sticker pack',
    usage: '%cmd%',
    media: true,
    execute: async ({ replyMessage, m, mimetype, downloadContentMediaMessage, parseResult, errorMessage, addHitCommand }) => {
        try {
            if (!/webp/i.test(mimetype)) return errorMessage(m.chat, 'Reply Sticker and try again');
            const image = new webpmux.Image();
            const download = await downloadContentMediaMessage(m.quoted);
            await image.load(download);
            const exifSticker = image.exif?.toString('utf-8') || '{}';
            const result = exifSticker.substring(exifSticker.indexOf('{'), exifSticker.lastIndexOf('}') + 1) || '{}';
            const parse = JSON.parse(result);
            const response = parseResult(parse);
            addHitCommand('Extract Sticker', true);
            return replyMessage(response);
        } catch (error) {
            return errorMessage(m.chat, error, 'Extract Sticker');
        }
    }
};