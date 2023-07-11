import './configs/global.js';
import functions from './library/functions.js';

import fs from 'fs';
import path from 'path';

async function loadCommands() {
  const commandsPath = './commands';
  const plugins = fs.readdirSync(commandsPath);
  for (const plugin of plugins) {
    if (!/\.js$/g.test(plugin)) {
      const commandFiles = fs.readdirSync(path.join(commandsPath, plugin)).filter(file => file.endsWith('.js'));
      for (const filename of commandFiles) {
        const pathFiles = path.join(commandsPath, plugin, filename);
        try {
          const command = (await import(`./${pathFiles}`)).default;
          const allCommand = functions.requireJson('./database/allCommands.json');
          if (command) {
            global.headersCommands.push({ category: plugin, command: command.views });
            if (allCommand.length < 1) {
              global.allCommands.push(command.views[0].split(' ')[0]);
            } else {
              global.allCommands.push(...allCommand, command.views[0].split(' ')[0]);
            }
            global.allCommands = [...new Set(global.allCommands)];
            global.plugins[`${plugin}-${filename}`] = command;
          }
        } catch (error) {
          console.error(`Error loading command file ${pathFiles}: ${error.message}`);
          functions.reloadModule(pathFiles);
        }
      }
    }
  }
}


function updateCommandsFile() {
  const headers = global.headersCommands;
  const objects = headers.reduce((objects, items) => {
    if (objects[items.category]) {
      objects[items.category].command.push(...items.command);
    } else {
      objects[items.category] = { ...items };
    }
    return objects;
  }, {});
  Object.keys(objects).forEach(category => {
    global.Commands[category] = [...new Set(objects[category].command)].sort();
  });
  const keysCommander = Object.keys(global.commander);
  const keysCommands = Object.keys(global.Commands);
  if (keysCommander.length === 0 && keysCommands.length !== 0) {
    fs.writeFileSync('./database/commands.json', JSON.stringify(global.Commands, null, 2));
    logger.success('Successfully loaded plugins');
  } else if (keysCommands.length === keysCommander.length) {
    keysCommander.forEach(key => {
      if (global.commander[key].length !== global.Commands[key].length) {
        fs.writeFileSync('./database/commands.json', JSON.stringify(global.Commands, null, 2));
        logger.success('Successfully added plugins');
      }
    });
  } else if (keysCommands.length !== (keysCommander.length || keysCommander.length === 0)) {
    fs.writeFileSync('./database/commands.json', JSON.stringify(global.Commands, null, 2));
    logger.success('Successfully updated plugins');
  }
}

export default async function index(functions) {
  await loadCommands(functions);
  updateCommandsFile();
}
