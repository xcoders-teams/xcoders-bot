'use strict';

import helpers from '../../middleware/service.js';

export default {
  views: ['allfitur'], // views for menu message
  command: /^(count|)allfitur$/i, // another command
  description: 'Utility for display count all features',
  query: false,
  usage: '',
  execute: ({ replyMessage, requireJson }) => {
    return replyMessage(helpers.countFeatures(requireJson));
  }
};