'use strict';

import os from 'os';
import speed from 'performance-now';

import helpers from '../../middleware/service.js';

export default {
  views: ['statistic'], // views for menu message
  command: /^stat(s|(ic|is(tic|))|)$/i, // command another.
  description: 'Utility for display statistic',
  query: false,
  usage: '',
  execute: ({ replyMessage,formatDuration, formatSize }) => {
    return replyMessage(helpers.stats(os, speed, speed, formatDuration, formatSize));
  }
};