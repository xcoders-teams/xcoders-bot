'use strict';

import fs from 'fs';
import path from 'path';
import { getDevice } from '@whiskeysockets/baileys';
import { promisify } from 'util';
import { exec as childExec } from 'child_process';
import { fileTypeFromBuffer } from 'file-type';

const exec = promisify(childExec);

export default {
    views: ['bass', 'blown', 'deep', 'earrape', 'fast', 'fat', 'nightcore', 'reverse', 'robot', 'slow', 'smooth', 'tupai'], // view for message in  menu
    command: /^(bass|blown|deep|earrape|fast|fat|nightcore|reverse|robot|slow|smooth|tupai)$/i, //another command.
    description: 'Exchance Effect Audio Player',
    usage: '%cmd% and Reply Audio Message',
    media: true,
    execute: async ({ xcoders, m, x, command, quoted, mimetype, getRandom, waitingMessage, errorMessage, addHitCommand }) => {
        try {
            if (!/audio\//i.test(mimetype)) return errorMessage(m.chat, 'Reply audio and try again');
            let type = null;
            if (/bass/.test(command)) type = '-af equalizer=f=54:width_type=o:width=2:g=20';
            if (/blown/.test(command)) type = '-af acrusher=.1:1:64:0:log';
            if (/deep/.test(command)) type = '-af atempo=4/4,asetrate=44500*2/3';
            if (/earrape/.test(command)) type = '-af volume=12';
            if (/fast/.test(command)) type = '-filter:a "atempo=1.63,asetrate=44100"';
            if (/fat/.test(command)) type = '-filter:a "atempo=1.6,asetrate=22100"';
            if (/nightcore/.test(command)) type = '-filter:a atempo=1.06,asetrate=44100*1.25';
            if (/reverse/.test(command)) type = '-filter_complex "areverse"';
            if (/robot/.test(command)) type = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"';
            if (/slow/.test(command)) type = '-filter:a "atempo=0.7,asetrate=44100"';
            if (/smooth/.test(command)) type = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"';
            if (/tupai/.test(command)) type = '-filter:a "atempo=0.5,asetrate=65100"';
            const buffer = await quoted.download();
            const { ext } = await fileTypeFromBuffer(buffer);
            const inputFile = path.join(process.cwd(), 'temp', getRandom(ext));
            const outputFile = path.join(process.cwd(), 'temp', getRandom('.mp3'));
            await fs.promises.writeFile(inputFile, buffer);
            const result = await new Promise((resolve, reject) => exec(`ffmpeg -i ${inputFile} ${type} ${outputFile}`, async (error) => {
                await fs.promises.unlink(inputFile);
                if (error) return reject(error);
                const result = fs.existsSync(outputFile) ? await fs.promises.readFile(outputFile) : null;
                if (!result) return reject('Failed Convert Audio Output');
                await fs.promises.unlink(outputFile);
                resolve(result);
            }));
            const device = getDevice(x.id);
            const mime = device === 'web' ? 'audio/mp4' : 'audio/mpeg';
            await waitingMessage(m.chat);
            addHitCommand('Audio Exchance', true);
            return xcoders.sendMessage(m.chat, { audio: result, mimetype: mime, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Audio Exchance');
        }
    }
};