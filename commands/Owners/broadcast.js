'use strict';

export default {
  views: ['bcmember'], // views for menu message
  command: /^(bcmember|bcgc)/i, // another command
  description: 'Only Owner cant execute command',
  owner: true,
  query: true,
  onlyGroup: true,
  usage: '%cmd% pesan',
  execute: async ({ getParticipants, metadataGroups, mimetype, quoted, xcoders, m, replyMessage, styleMessage, errorMessage, query, delay }) => {
    try {
      if (/image|video/.test(mimetype)) {
        for (let i = 0; i < getParticipants.length; i++) {
          await delay(4000);
          await xcoders.sendMessage(getParticipants[i].id, { [quoted.mtype.slice(0, -7)]: await quoted.download(), caption: styleMessage(`Broadcast All Member ${metadataGroups.subject}`, query), contextInfo: { forwardingScore: 9999999, isForwarded: true } });
        }
        return replyMessage(`Broadcasted to *${getParticipants.length} Users*`);
      } else {
        for (let i = 0; i < getParticipants.length; i++) {
          await delay(4000);
          await xcoders.sendMessage(getParticipants[i].id, { text: styleMessage(`Broadcast All Member ${metadataGroups.subject}`, query), contextInfo: { forwardingScore: 9999999, isForwarded: true } });
        }
        return replyMessage(`Broadcasted to *${getParticipants.length} Users*`);
      }
    } catch (error) {
      return errorMessage(m.chat, error);
    }
  }
};