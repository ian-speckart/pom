import { signalQuitRequested } from './logic/app-signals.js';
import View from './View.js';

function setTray() {
  // Tray menu is only available in window mode
  if (NL_MODE != 'window') {
    console.warn('INFO: Tray menu is only available in the window mode.');
    return;
  }

  // Define tray menu items
  let tray = {
    icon: '/resources/icons/trayIcon.png',
    menuItems: [
      { id: 'RESET_WINDOW', text: 'Reset window' },
      { id: 'VERSION', text: 'Get version' },
      { id: 'SEP', text: '-' },
      { id: 'QUIT', text: 'Quit' },
    ],
  };

  // Set the tray menu
  Neutralino.os.setTray(tray);
}

async function onTrayMenuItemClicked(event) {
  switch (event.detail.id) {
    case 'RESET_WINDOW':
      View.resetWindow();
      break;

    case 'VERSION':
      const config = await Neutralino.app.getConfig();

      // Display version information
      Neutralino.os.showMessageBox(
        'Version information',
        `App: v${config.version} | Neutralinojs server: v${NL_VERSION} | Neutralinojs client: v${NL_CVERSION}`
      );
      break;
    case 'QUIT':
      signalQuitRequested.dispatch();
      break;
  }
}

Neutralino.events.on('trayMenuItemClicked', onTrayMenuItemClicked);

// Conditional initialization: Set up system tray if not running on macOS
if (NL_OS != 'Darwin') {
  // TODO: Fix https://github.com/neutralinojs/neutralinojs/issues/615
  setTray();
}
