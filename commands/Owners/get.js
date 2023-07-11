'use strict';

import util from 'util';
import axios from 'axios';

export default {
  views: ['get'], // views for menu message
  command: /^(get)/i, // another command
  description: 'Only Owner cant execute command',
  owner: true,
  query: true,
  url: true,
  usage: '%cmd% url api',
  execute: async ({ m, replyMessage, invalidUrlMessage, errorMessage, query, regex }) => {
    try {
      if (!regex.url(query)) return invalidUrlMessage(m.chat);
      const { data } = await axios.get(query);
      if (typeof data === 'object') {
        const parse = JSON.stringify(data, null, 2);
        const utils = util.format(parse);
        return replyMessage(utils);
      } else {
        const utils = util.format(data);
        return replyMessage(utils);
      }
    } catch (error) {
      return errorMessage(m.chat, error);
    }
  }
};