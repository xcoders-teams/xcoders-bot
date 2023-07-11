'use strict';

import formData from 'form-data';

export default {
    views: ['smeme < text|text >'], // view for message in  menu
    command: /^smeme$/i, //another command.
    description: 'Create Sticker Meme Generate',
    usage: '%cmd% Reply Images and try again',
    media: true,
    query: true,
    text: true,
    execute: async ({ xcoders, m, x, apikeys, query, quoted, mimetype, getRandom, waitingMessage, errorMessage, host, addHitCommand, createSticker }) => {
        try {
            if (!/image\//.test(mimetype)) return errorMessage(m.chat, 'Invalid mimetype, only images are allowed');
            const [text2, text] = query.split('|');
            const buffer = await quoted.download();
            const name = getRandom(mimetype.split('/')[1]);
            const FormData = new formData();
            FormData.append('image', buffer, {
                contentType: mimetype,
                filename: name
            });
            const { data } = await axios.post(`${host}/api/maker/meme?text=${text || ''}&text2=${text2 || ''}&apikey=${apikeys}`, FormData.getBuffer(), { headers: FormData.getHeaders() });
            const result = Buffer.from(data);
            const resultSticker = await createSticker(result, {});
            await waitingMessage(m.chat);
            addHitCommand('MEME Maker', true);
            return xcoders.sendMessage(m.chat, { sticker: resultSticker, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'MEME Maker');
        }
    }
};