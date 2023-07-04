'use strict';

import formData from 'form-data';

export default {
    views: ['removebg'], // view for message in  menu
    command: /^(removebg|rmbg)$/i, //another command.
    description: 'Remove Background Images',
    usage: '%cmd% Reply Images and try again',
    media: true,
    execute: async ({ xcoders, m, x, apikeys, quoted, mimetype, getRandom, getMessage, waitingMessage, errorMessage, getBuffer, host, styleMessage, parseResult, addHitCommand }) => {
        try {
            if (!/image\//.test(mimetype)) return errorMessage(m.chat, 'Invalid mimetype, only images are allowed');
            const buffer = await quoted.download();
            const name = getRandom(mimetype.split('/')[1]);
            const FormData = new formData();
            FormData.append('image', buffer, {
                contentType: mimetype,
                filename: name
            });
            const { data } = await axios.post(`${host}/api/maker/remove-bg?apikey=${apikeys}`, FormData.getBuffer(), { headers: FormData.getHeaders() });
            if (!data.status || data.message) return errorMessage(m.chat, getMessage(data), ' Remove Background');
            await waitingMessage(m.chat);
            const images = await getBuffer(data.url);
            const result = parseResult(data);
            const caption = styleMessage('Image Background Removed', result);
            addHitCommand('Remove Background', true);
            return xcoders.sendMessage(m.chat, { image: images, caption: caption, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Remove Background');
        }
    }
};