'use strict';

import axios from 'axios';
import formData from 'form-data';

export default {
  views: ['sticker'], // view for message in  menu
  command: /^(s|sti(c|)ker)$/i, //another command.
  description: 'Create Sticker from quoted messsge or url',
  usage: '%cmd% quoted or url',
  media: true,
  execute: async ({ xcoders, m, x, apikeys, query, quoted, mimetype, regex, replyMessage, errorMessage, host }, {}, { addHitCommand }) => {
    try {
      const FormData = new formData();
      const getQuery = query.split('|');
      const buffer = await quoted.download();
      FormData.append('input', Buffer.from(buffer), {
        filename: 'xcoders.png',
        contentType: 'image/png'
      });
      FormData.append('packname', getQuery[0] || packname);
      FormData.append('author', getQuery[1] || authorname);
      const { data } = await axios.post(`${host}/api/convert/sticker?apikey=${apikeys}`, FormData, {
        maxContentLength: Infinity,
        headers: {
        ...FormData.getHeaders() 
        }
      });
      const result = Buffer.from(data.result);
      addHitCommand('Sticker', true);
      return xcoders.sendMessage(m.chat, { sticker: result }, { quoted: x });
    } catch (error) {
      return errorMessage(m.chat, error, 'Sticker');
    }
  }
};