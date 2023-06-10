'use strict';

export default {
  views: ['restart'], // views for menu message
  command: /^restart/i, // another command
  description: 'Only Owner cant execute command',
  owner: true,
  usage: '%cmd%',
  execute: async ({ m, replyMessage, errorMessage, response }) => {
    try {
      await replyMessage(response.success);
      setTimeout(() => {
        return process.send('reset');
      }, 2000);
    } catch (error) {
      return errorMessage(m.chat, error);
    }
  }
};