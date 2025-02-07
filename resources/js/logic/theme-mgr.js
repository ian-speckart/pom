import Neu from '../utils/Neu.js';
import { $ } from '../utils/utils.js';

export async function loadTheme() {
  const savedValue = await Neu.loadKey('theme');

  if (savedValue === 'light') {
    $('html').classList.add('light-theme');
  }
}

export async function toggleTheme() {
  const isThemeLight = $('html').classList.contains('light-theme');

  if (isThemeLight) {
    $('html').classList.remove('light-theme');
    Neu.saveKey('theme', 'dark');
  } else {
    $('html').classList.add('light-theme');
    Neu.saveKey('theme', 'light');
  }
}
