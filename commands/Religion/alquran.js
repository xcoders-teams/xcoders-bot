'use strict';

export default {
    views: ['alquran < surah|ayat >'],
    command: /^(al)?quran$/i,
    description: 'Get Surah Al`Qur-an and audio',
    query: true,
    usage: '%cmd% 1|5',
    execute: async ({ xcoders, m, x, errorMessage, waitingMessage, canvas, query, host, getJson, apikeys, parseResult, styleMessage, addHitCommand }) => {
        try {
            const [surah, ayat] = query.split('|');
            const data = await getJson(`${host}/api/religion/quran?surah=${surah}&ayat=${ayat}&apikey=${apikeys}`);
            if (!data.status) return errorMessage(m.chat, getMessage(data), "Al'Qur-an");
            await waitingMessage(m.chat);
            const result = parseResult(data.result);
            const caption = styleMessage(null, result);
            const images = await canvas.create(`Al'Qur-an Surah ${surah} Ayat ${ayat}`);
            addHitCommand("Al'Qur-an", true);
            await xcoders.sendAudioFromUrl(m.chat, data.result.audio, x, { stream: true, type: 'audio' });
            return xcoders.sendMessage(m.chat, { image: images, caption: caption.trim(), contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, "Al'Qur-an");
        }
    }
}