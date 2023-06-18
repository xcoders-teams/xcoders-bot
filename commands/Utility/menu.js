'use strict';

import helpers from '../../middleware/service.js';

export default {
  views: ['menu'], // views for menu message
  command: /^menu|help/i, // command another.
  description: 'Utility for display all features',
  query: false,
  usage: '',
  execute: ({ xcoders, x, m, prefix, host, senderName }) => {
    return xcoders.requestPaymentMenu(m.chat, helpers.allmenu(m, prefix, senderName, host), { quoted: x, sender: m.sender });
  }
};