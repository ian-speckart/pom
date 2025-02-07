import Neu from '../utils/Neu.js';

const alwaysOnTopKey = 'alwaysOnTop';

/**
 * Loads whether the window should be always on top.
 * If the value wasnt saved, we get the default value from
 * the app's config, and save that, so we can toggle it later.
 * The reason we do it this way is that there's no way to query
 * Neutralino for the current state of alwaysOnTop, so we read
 * the saved value and toggle that.
 */
export async function initAlwaysOnTopDefaultValue() {
  const config = await Neu.getAppConfig();
  const defaultValue = config.modes.window.alwaysOnTop;

  const savedValue = await Neu.loadKey(alwaysOnTopKey);

  if (savedValue === null) {
    Neu.saveKey(alwaysOnTopKey, defaultValue);
  } else if (savedValue === 'true') {
    Neutralino.window.setAlwaysOnTop(true);
  } else if (savedValue === 'false') {
    Neutralino.window.setAlwaysOnTop(false);
  }
}

export async function toggleAlwaysOnTop() {
  let currentValue = await Neu.loadKey(alwaysOnTopKey);

  // if there's a saved value
  if (currentValue !== null) {
    // convert string to boolean, then toggle it
    currentValue = currentValue === 'true';
    const newValue = !currentValue;

    await Neutralino.window.setAlwaysOnTop(newValue);

    Neu.saveKey(alwaysOnTopKey, String(newValue));
    return;
  }

  // if there was no saved value, assume the current state is defaultValue
  const config = await Neu.getAppConfig();
  const defaultValue = config.modes.window.alwaysOnTop;

  // now toggle the value and apply it
  const newValue = !defaultValue;
  await Neutralino.window.setAlwaysOnTop(newValue);

  Neu.saveKey(alwaysOnTopKey, String(newValue));
}
