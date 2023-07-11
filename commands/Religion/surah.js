'use strict';

export default {
    views: ['surah < number >'],
    command: /^surah$/i,
    description: 'Get Surah Al`Qur-an from number surah',
    query: true,
    usage: '%cmd% 1',
    execute: async ({ xcoders, m, x, errorMessage, waitingMessage, canvas, query, host, getJson, apikeys, styleMessage, addHitCommand }) => {
        try {
            const data = await getJson(`${host}/api/religion/surah?number=${query}&apikey=${apikeys}`);
            if (!data.status) return errorMessage(m.chat, getMessage(data), "Al'Qur-an Surah");
            await waitingMessage(m.chat);
            const headers = `• Surah Name: ${data.result.name}\n• All Ayat: ${data.result.all_ayat}\n• Surah Number: ${data.result.surah_number}\n• Type Surah: ${data.result.type}\n\n`;
            let string = '';
            for (var i = 0; i < data.result.verses.length; i++) {
                string += `• Number ID: ${data.result.verses[i].number}\n`;
                string += `• Arab: ${data.result.verses[i].text}\n`;
                string += `• Translate ID: ${data.result.verses[i].translation_id}\n`;
                string += `• Translate EN: ${data.result.verses[i].translation_en}`;
                string += '\n\n';
            }
            const caption = styleMessage(null, headers + string.trim());
            const images = await canvas.create(`Al'Qur-an Surah Number ${query}`);
            addHitCommand("Al'Qur-an Surah", true);
            await xcoders.sendAudioFromUrl(m.chat, data.result.audio, x, { stream: false, type: 'audio' });
            return xcoders.sendMessage(m.chat, { image: images, caption: caption.trim(), contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, "Al'Qur-an Surah");
        }
    }
}