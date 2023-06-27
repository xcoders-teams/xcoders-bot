'use strict';

export default {
    views: ['asmaulhusna'],
    command: /^asmaul(|husna)$/i,
    description: 'Get a list of Asmaul Husna',
    usage: '',
    execute: async ({ xcoders, m, x, errorMessage, waitingMessage, host, getJson, apikeys, styleMessage, canvas, addHitCommand }) => {
        try {
            const data = await getJson(`${host}/api/religion/asmaul-husna?apikey=${apikeys}`);
            if (!data.status) return errorMessage(m.chat, getMessage(data), 'Asmal Husna');
            await waitingMessage(m.chat);
            let string = '';
            for (var i = 0; i < data.result.result.length; i++) {
                string += `• Number ID: ${data.result.result[i].number}\n`;
                string += `• Latin: ${data.result.result[i].latin}\n`;
                string += `• Arab: ${data.result.result[i].arab}\n`;
                string += `• Translate ID: ${data.result.result[i].translate_id}\n`;
                string += `• Translate EN: ${data.result.result[i].translate_en}\n`;
                string += '\n\n';
            }
            const caption = styleMessage(null, string.trim());
            const images = await canvas.create('Asmaul Husna');
            addHitCommand('Asmaul Husna', true);
            return xcoders.sendMessage(m.chat, { image: images, caption: caption.trim(), contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Asmaul Husna');
        }
    }
}