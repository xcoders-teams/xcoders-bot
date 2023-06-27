'use strict';

import { getDevice } from '@whiskeysockets/baileys';

export default {
    views: ['tomp3'], // view for message in  menu
    command: /^to(mp3|audio)$/i, //another command.
    description: 'Convert Video To MP3',
    usage: '%cmd% and Reply video Message',
    media: true,
    execute: async ({ xcoders, m, x, quoted, mimetype, convertToMp3, waitingMessage, errorMessage, addHitCommand }) => {
        try {
            const buffer = await quoted.download();
            if (!/video/i.test(mimetype)) return errorMessage(m.chat, 'Reply Video and try again');
            const result = await convertToMp3(buffer);
            await waitingMessage(m.chat);
            addHitCommand('Audio Convert', true);
            const device = getDevice(x.id);
            const mime = device === 'web' ? 'audio/mp4' : 'audio/mpeg';
            return xcoders.sendMessage(m.chat, { audio: result, mimetype: mime, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Audio Convert');
        }
    }
};