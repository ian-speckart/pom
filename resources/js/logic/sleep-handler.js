import Model from './Model.js';

Neutralino.events.on('serverOffline', onServerDisconnected);

/**
 * When the computer sleeps, Neutralino loses connection to the local server.
 * The only solution for now is to reload the app on wake up.
 * https://github.com/neutralinojs/neutralinojs/issues/1021
 *
 * This is called right before the computer sleeps.
 */
function onServerDisconnected() {
  // save to localStorage as Neutralino.storage is not accessible now
  Model.saveState(true);

  reloadWindowOnWakeUp();
}

/**
 * If we reload too soon, the computer might still be in the process of going to
 * sleep, and we get errors for each of the imports in main.js, then the app
 * crashes silently.
 * So we just wait until it looks like the computer woke up.
 * We save a timestamp every 100ms. If more than 2 seconds went by since the last
 * timestamp, we assume the computer has been asleep and just woke up.
 */
function reloadWindowOnWakeUp() {
  let lastTime = Date.now();

  const intervalId = setInterval(() => {
    const currentTime = Date.now();

    // Check if more than 2 seconds went by since the last interval
    if (currentTime - lastTime > 2000) {
      console.warn('System woke up from sleep after:', currentTime - lastTime);

      // stop monitoring
      clearInterval(intervalId);

      reloadWindow();
      return;
    }

    // Update lastTime for the next check
    lastTime = currentTime;
  }, 100);
}

/**
 * We delay because even using the wakeup monitor, some imports in
 * Model.js might fail.
 */
function reloadWindow() {
  setTimeout(() => {
    window.location.reload();

    // minimum value. less than this and it might fail
  }, 6000);
}
