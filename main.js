import { setupMaster, fork } from 'cluster';
import { createInterface } from 'readline';
import cfonts from 'cfonts';
import yargs from 'yargs';
import path from 'path';
import fs from 'fs';

const readline = createInterface(process.stdin, process.stdout);

function start(connect) {
  console.clear();
  cfonts.say('xcoders bot', {
    font: 'block',
    align: 'center',
    gradient: ['#12c2e9', '#c471ed'],
    background: 'transparent',
    letterSpacing: 1,
    transitionGradient: true
  });
  cfonts.say('Powered By FarhanXCode7', {
    font: 'console',
    align: 'center',
    gradient: ['#DCE35B', '#45B649'],
    transitionGradient: true
  });
  const args = [path.join(connect), ...process.argv.slice(2)];
  setupMaster({
    exec: args[0],
    args: args.slice(1)
  });
  const pods = fork();
  pods.on('message', (data) => {
    console.log('[ xcoders ]', data);
    switch (data) {
      case 'reset':
        pods.kill();
        start.apply(this, arguments);
        break;
    }
  });
  pods.on('exit', (error, code) => {
    console.error(`File not found: ${error}`);
    if (code !== 1) start(connect);
    fs.watchFile(args[0], () => {
      fs.unwatchFile(args[0]);
      start(connect);
    });
  });
  const options = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
  if (!options.test) {
    if (!readline.listenerCount()) readline.on('line', (line) => {
      pods.emit('message', line.trim());
    });
  }
}

start('./index.js');