'use strict';

export default {
  views: ['sticker'], // view for message in  menu
  command: /^(s|sti(c|)ker)$/i, //another command.
  description: 'Create Sticker from quoted messsge',
  usage: '%cmd% quoted or url',
  media: true,
  execute: async ({ xcoders, m, x, query, quoted, mimetype, errorMessage, stickerVideo, stickerImage, addHitCommand }) => {
    try {
      const [pack, author] = query.split('|');
      const buffer = await quoted.download();
      if (/webp/i.test(mimetype)) return errorMessage(m.chat, 'Type not supported');
      const result = /image/.test(mimetype) ? await stickerImage(buffer, { packname: pack, authorname: author }) : /video/.test(mimetype) ? await stickerVideo(buffer) : null;
      if (!result) return errorMessage(m.chat, 'Error converting this media...', 'Sticker');
      addHitCommand('Sticker', true);
      return xcoders.sendMessage(m.chat, { sticker: result, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
    } catch (error) {
      return errorMessage(m.chat, error, 'Sticker');
    }
  }
};