'use strict';

import formData from 'form-data';

export default {
    views: ['badut', 'badut2', 'badut3'], // view for message in  menu
    command: /^badut(2|3)?$/i, //another command.
    description: 'Create Twibbon Badut Images',
    usage: '%cmd% Reply Images and try again',
    media: true,
    execute: async ({ command, xcoders, m, x, apikeys, quoted, mimetype, getRandom, response, waitingMessage, errorMessage, host, addHitCommand }) => {
        try {
            if (!/image\//.test(mimetype)) return errorMessage(m.chat, 'Invalid mimetype, only images are allowed');
            const buffer = await quoted.download();
            const name = getRandom(mimetype.split('/')[1]);
            const FormData = new formData();
            FormData.append('image', buffer, {
                contentType: mimetype,
                filename: name
            });
            const { data } = await axios.post(`${host}/api/maker/${command}?apikey=${apikeys}`, FormData.getBuffer(), { headers: FormData.getHeaders() });
            await waitingMessage(m.chat);
            const result = Buffer.from(data);
            addHitCommand('Twibbon Maker', true);
            return xcoders.sendMessage(m.chat, { image: result, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Twibbon Maker');
        }
    }
};