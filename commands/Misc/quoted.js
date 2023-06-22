'use strict';

export default {
    views: ['quoted'], // view for message in  menu
    command: /^q(|uoted)$/i, //another command.
    description: 'Forward a message from your reply to',
    usage: '%cmd% reply to a message that contains a quote',
    execute: async ({ xcoders, m, errorMessage }) => {
        try {
            const quotedMessage = await xcoders.serializeMessages(m.getQuotedObj());
            if (!quotedMessage.quoted) {
                return errorMessage(m.chat, 'Reply to a message that contains a quote');
            }
            return quotedMessage.quoted.copyAndForward(m.chat, true);
        } catch (error) {
            return errorMessage(m.chat, 'Reply to a message that contains a quote');
        }
    }
}