import { signalQuitRequested } from './logic/app-signals.js';
import Model from './logic/Model.js';
import './tray-handler.js';
import View from './View.js';
import './controller.js';
import './utils/wheel-zoom-blocker.js';
import { loadTheme } from './logic/theme-mgr.js';
import './logic/alert-handler.js';
import './logic/sleep-handler.js';
import { initAlwaysOnTopDefaultValue } from './logic/misc-logic.js';

function init() {
  Neutralino.init();

  Neutralino.events.on('ready', onNeutralinoReady);
  Neutralino.events.on('windowClose', onQuitRequested);
}

async function onNeutralinoReady() {
  Model.init();
  View.init();

  // call this only after View initialized
  Model.loadState();

  // load customization config (not in use for now)
  // const data = await Neu.readAppDirFile(`app-config.json`);
  // signalConfigLoaded.dispatch(data);

  initAlwaysOnTopDefaultValue();
  loadTheme();

  signalQuitRequested.add(onQuitRequested);
}

async function onQuitRequested() {
  await Model.saveState();

  Neutralino.app.exit();
}

init();
