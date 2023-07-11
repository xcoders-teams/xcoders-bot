'use strict';

import fs from "fs";
import path from "path";
import { fileTypeFromBuffer } from "file-type";
import { execSync } from "child_process";

export default {
    views: ['backup'], // views for menu message
    command: /^backup/i, // another command
    description: 'Only Owner can execute command',
    owner: true,
    usage: '%cmd%',
    execute: async ({ xcoders, m, x, replyMessage, waitingMessage, errorMessage, zipFolder }) => {
        try {
            await waitingMessage(m.chat);
            const pathBackup = path.join(process.cwd(), 'backup');
            const pathZip = path.join(process.cwd(), 'temp', 'backup_file.zip');
            const pathStore = path.join(process.cwd(), 'database', 'baileys_store.json');
            if (!fs.existsSync(pathBackup)) {
                fs.mkdirSync(pathBackup);
            }
            if (fs.existsSync(pathStore)) await fs.promises.unlink(pathStore);
            const script = fs.readdirSync('.');
            for await (let files of script) {
                if (files === 'node_modules') continue;
                if (files === 'backup') continue;
                execSync(`cp -r "${path.join(process.cwd(), files)}" "${pathBackup}"`);
            }
            zipFolder(pathBackup, pathZip, async function (error, message) {
                if (error) {
                    console.error(error);
                    return errorMessage(m.chat, error);
                }
                const result = await fs.promises.readFile(pathZip);
                const type = await fileTypeFromBuffer(result);
                await fs.promises.unlink(pathZip);
                execSync(`rm -r "${pathBackup}"`);
                await replyMessage('*Successfully backed up files...*', 'success');
                return xcoders.sendMessage(m.chat, { document: result, caption: message, fileName: `backup.${type.ext}`, mimetype: type.mime, jpegThumbnail: global.icon, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
            });
        } catch (error) {
            return errorMessage(m.chat, error);
        }
    }
};