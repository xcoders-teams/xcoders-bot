'use strict';

import formData from 'form-data';

export default {
    views: ['rip'], // view for message in  menu
    command: /^rip$/i, //another command.
    description: 'Create Fun RIP Images',
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
            const { data } = await axios.post(`${host}/api/maker/rip?apikey=${apikeys}`, FormData.getBuffer(), {
                headers: {
                    ...FormData.getHeaders()
                }
            });
            await waitingMessage(m.chat);
            const images = Buffer.from(data);
            addHitCommand('RIP Maker', true);
            return xcoders.sendMessage(m.chat, { image: images, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'RIP Maker');
        }
    }
};