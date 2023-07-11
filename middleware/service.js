import fs from 'fs';
import _ from 'lodash';
import moment from 'moment-timezone';

import loadedCommands from '../loadedCommands.js';
import hitCommands from '../library/hitCommand.js';
import functions from '../library/functions.js';

const style = '⭑';
const list = ['/', 'or'];
const randomSplit = _.sample(list);
const monospace = (str) => '```' + str + '```';
const interline = (str) => '_' + str + '_';

const allmenu = (m, prefix, name) => {
  let size = null;
  const listFeatures = functions.requireJson('./database/commands.json');
  const pathFolder = './session';
  if (global.sizeSession) {
    size = global.sizeSession;
  } else {
    size = (process.platform !== 'android' ? functions.folderSize(pathFolder) : fs.lstatSync(pathFolder)).size;
    global.sizeSession = size;
  }
  if (Object.keys(listFeatures).length < 1) {
    return loadedCommands(functions);
  }
  let position = '';
  let assignFeatures = _.assign(listFeatures);
  Object.keys(listFeatures).forEach((a) => {
    position += `\t\t\t</ *${a.replace(/[^a-zA-Z0-9]/g, ' ')}* >\n${interline(style + ' ' + prefix + assignFeatures[a].join('_\n_' + style + ' ' + prefix).replaceAll('<', '*<').replaceAll('>', '>*').replace(':', randomSplit))}\n\n`;
  });
  return `
  ${monospace(`Hallo ${name} ⦋ @${m.sender.split('@')[0]} ⦌`)} 👋

⬟ *Date*: ${monospace(moment().tz('Asia/Jakarta').locale('id').format('LLL'))}
⬟ *Session*: ${monospace(functions.formatSize(size))}

⬟ *Notes*:
  ${'⧾ ' + monospace('Gunakan Fitur tanpa simbol <>')}
  ${'⧾ ' + monospace('Jangan spam bot...')}

${position}
${hitCommands.popularCommand(1) ? `⬟ *3 Most Popular Features*\n\r${hitCommands.popularCommand(3, '\r \r \r', '\t\t\t').slice(0, -2)}` : ''}`;
};

const mostPopular = (obj) => {
  return hitCommands.shortedCommands(obj);
}

const countFeatures = (requireJson) => {
  const listFeatures = requireJson('./database/commands.json');
  let position = '';
  const assignFeatures = _.assign(listFeatures);

  Object.keys(listFeatures).forEach((str) => {
    position += `${str}\n${assignFeatures[str].length} Fitur\n\n`;
  });

  return position;
};

const stats = (os, speed, performance, formatDuration, formatSize) => {
  const used = process.memoryUsage();
  const cpus = os.cpus().map(cpu => {
    cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0);
    return cpu;
  });
  const cpu = cpus.reduce((last, cpu, _, { length }) => {
    last.total += cpu.total;
    last.speed += cpu.speed / length;
    last.times.user += cpu.times.user;
    last.times.nice += cpu.times.nice;
    last.times.sys += cpu.times.sys;
    last.times.idle += cpu.times.idle;
    last.times.irq += cpu.times.irq;
    return last;
  }, { speed: 0, total: 0, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } });
  let timestamp = speed();
  let latensi = speed() - timestamp;
  let perf_now = speed();
  let perf_old = performance();

  return `
Kecepatan Respon ${latensi.toFixed(4)} _Second_ \n ${perf_old - perf_now} _miliseconds_

⊳ Runtime : ${formatDuration(process.uptime())}

💻 Info Server
⊳ RAM: ${formatSize(os.totalmem() - os.freemem())} / ${formatSize(os.totalmem())}
⊳ OS Type: ${os.type()}
⊳ OS Version: ${os.version()}
⊳ Hostname: ${os.hostname()}

🔰 NodeJS Memory Usage
${Object.keys(used).map((key, _, arr) => `⊳ ${key.padEnd(Math.max(...arr.map(v => v.length)), ' ')}: ${formatSize(used[key])}`).join('\n')}
${cpus[0] ? `
🌐 Total CPU Usage 
${cpus[0].model.trim()} (${cpu.speed} MHZ)
${Object.keys(cpu.times).map(type => `⊳ ${(type).padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}

♨️ CPU Core(s) Usage (${cpus.length} Core CPU)
${cpus.map((cpu, i) => `${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `⊳ ${(type).padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}`).join('\n\n')}` : ''}
`.trim();
};

export default {
  stats,
  countFeatures,
  mostPopular,
  allmenu
};