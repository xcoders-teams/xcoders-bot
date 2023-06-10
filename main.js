import { spawn } from 'child_process';
import cfonts from 'cfonts';
import path from 'path';
import fs from 'fs';

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
  const pods = spawn(process.argv[0], args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  }).on('message', (data) => {
    console.log('[ xcoders ]', data);
    switch (data) {
      case 'reset':
        pods.kill();
        start.apply(this, arguments);
        break;
    }
  }).on('error', (error) => {
    if (error.code === 'ENOENT') {
      console.error(`File not found: ${args[0]}`);
      fs.watchFile(args[0], () => {
        start();
        fs.unwatchFile(args[0]);
      });
    } else {
      console.error(error);
    }
  });
}

start('./index.js');