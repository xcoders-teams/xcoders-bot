'use strict';

import formData from 'form-data';

export default {
    views: ['quotes < text|wm >'], // view for message in  menu
    command: /^q(ou|uo)tes$/i, //another command.
    description: 'Create Quotes Images',
    usage: '%cmd% Reply Images and try again',
    media: true,
    query: true,
    text: true,
    execute: async ({ xcoders, m, x, apikeys, query, quoted, response, mimetype, getRandom, waitingMessage, errorMessage, host, addHitCommand }) => {
        try {
            if (!/image\//.test(mimetype)) return errorMessage(m.chat, 'Invalid mimetype, only images are allowed');
            const [text, text2] = query.split('|');
            const buffer = await quoted.download();
            const name = getRandom('png');
            const FormData = new formData();
            FormData.append('image', buffer, {
                contentType: mimetype,
                filename: name
            });
            const { data } = await axios.post(`${host}/api/maker/quotes?text=${text}&wm=${text2 || 'Reserved - xcoders teams'}&apikey=${apikeys}`, FormData.getBuffer(), { headers: FormData.getHeaders() });
            const result = Buffer.from(data);
            await waitingMessage(m.chat);
            addHitCommand('Quotes Maker', true);
            return xcoders.sendMessage(m.chat, { image: result, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Quotes Maker');
        }
    }
};