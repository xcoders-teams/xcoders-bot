'use strict';

export default {
    views: ['delete'], // view for message in  menu
    command: /^del(|ete)$/i, //another command.
    description: 'Delete a message',
    usage: '%cmd% reply Messages',
    execute: async ({ replyMessage, m, errorMessage, response }) => {
        if (!m.quoted) return errorMessage(m.chat, 'Reply message for delete message');
        return m.quoted.delete().then(() => replyMessage(response.success)).catch((error) => errorMessage(m.chat, error));
    }
}