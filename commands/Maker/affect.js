'use strict';

import formData from 'form-data';

export default {
    views: ['affect'], // view for message in  menu
    command: /^affect$/i, //another command.
    description: 'Create Affect Images',
    usage: '%cmd% Reply Images and try again',
    media: true,
    execute: async ({ xcoders, m, x, apikeys, quoted, mimetype, getRandom, response, waitingMessage, errorMessage, host, addHitCommand }) => {
        try {
            if (!/image\//.test(mimetype)) return errorMessage(m.chat, 'Invalid mimetype, only images are allowed');
            const buffer = await quoted.download();
            const name = getRandom(mimetype.split('/')[1]);
            const FormData = new formData();
            FormData.append('image', buffer, {
                contentType: mimetype,
                filename: name
            });
            const { data } = await axios.post(`${host}/api/maker/affect?apikey=${apikeys}`, FormData.getBuffer(), { headers: FormData.getHeaders() });
            const result = Buffer.from(data);
            await waitingMessage(m.chat);
            addHitCommand('Affect Maker', true);
            return xcoders.sendMessage(m.chat, { image: result, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Affect Maker');
        }
    }
};