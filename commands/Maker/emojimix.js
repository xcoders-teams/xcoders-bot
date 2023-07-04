'use strict';

export default {
    views: ['emojimix < 🥱😢 >', 'smojimix < 🥱😢 >'], // view for message in  menu
    command: /^s?(emojimix|mix)$/i, //another command.
    description: 'Create Emoji Mix',
    usage: '%cmd% 🥱😢',
    query: true,
    execute: async ({ command, xcoders, m, x, apikeys, emojiRegex, createSticker, query, waitingMessage, errorMessage, host, getJson, addHitCommand }) => {
        try {
            const regex = emojiRegex();
            const matchedEmoji = [...query.matchAll(regex)];
            if (matchedEmoji.length > 2 || matchedEmoji.length < 2) return errorMessage(m.chat, `Emoji tidak boleh lebih dari ${matchedEmoji.length}`);
            const emoji = matchedEmoji.map(match => match[0]);
            const data = await getJson(`${host}/api/maker/emoji-mix?emoji=${emoji[0]}&emoji2=${emoji[1]}&result_type=json&apikey=${apikeys}`);
            const buffer = Buffer.from(data);
            const result = command.startsWith('s') ? await createSticker(buffer) : buffer;
            const type = command.startsWith('s') ? 'sticker' : 'image';
            await waitingMessage(m.chat);
            addHitCommand('Emoji Mix', true);
            return xcoders.sendMessage(m.chat, { [type]: result, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Emoji Mix');
        }
    }
};