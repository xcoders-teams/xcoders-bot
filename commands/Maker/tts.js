import streamReadable from '../../middleware/streamReadable.js';

export default {
    views: ['tts <lang|text>'], // views for menu message
    command: /^tts$/i, // another command
    description: 'Create Text To Speech',
    usage: '%cmd% id|xcoders',
    query: true,
    execute: async ({ xcoders, m, x, apikeys, query, waitingMessage, errorMessage, host, getBuffer, getRandom, addHitCommand }) => {
        try {
            const mime = Baileys.getDevice(x.id) === 'ios' ? 'audio/mpeg' : 'audio/mp4';
            const [language, text] = query.split('|');
            const data = await getBuffer(`${host}/api/maker/tts?text=${encodeURIComponent(text)}&language=${encodeURIComponent(language)}&apikey=${apikeys}`);
            await waitingMessage(m.chat);
            addHitCommand('Text To Speech', true);
            const files = new streamReadable({
                frequency: 10,
                chunkSize: 2048
            });
            files.path = getRandom('mp3');
            files.put(data);
            files.stop();
            const chunks = [];
            for await (const cache of files) {
                chunks.push(cache);
            }
            const buffer = Buffer.concat(chunks);
            return xcoders.sendMessage(m.chat, { audio: buffer, mimetype: mime, ptt: true, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Text To Speech');
        }
    }
};