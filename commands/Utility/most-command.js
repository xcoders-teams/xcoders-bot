'use strict';

import helpers from '../../middleware/service.js';

export default {
  views: ['mostcmd'], // views for menu message
  command: /^most(cmd|command)$/i, // command another.
  description: 'Utility for display Most Popular Features',
  query: false,
  usage: '',
  execute: ({ replyMessage }) => {
    return replyMessage(helpers.mostPopular(global.hitCommand));
  }
};