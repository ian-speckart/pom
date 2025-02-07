/**
 * Here we monitor whether the alert should be flashed, then handle the flashing of each mode.
 * The alert simply sets the border color of the app, on and off.
 */
import { $ } from '../utils/utils.js';
import { signalAppStepped, signalChangedMode } from './app-signals.js';
import { BreakMaxSeconds, Modes } from './enums.js';
import Model from './Model.js';

signalAppStepped.add(onAppStepped);
signalChangedMode.add(onChangedMode);

const colorBlue = '--color-blue';
const colorOrange = '--color-orange';
let currentColor;
let flashing = false;
let isBorderHighlighted = false;
let intervalId = -1;

function onAppStepped() {
  switch (Model.mode) {
    case Modes.TOTALS:
      if (flashing) {
        stopFlashing();
      }
      return;

    case Modes.POM:
      checkPom();
      return;

    case Modes.BREAK:
      checkBreak();
      return;
  }
}

function onChangedMode() {
  if (flashing) {
    stopFlashing();
  }

  switch (Model.mode) {
    case Modes.TOTALS:
      return;

    case Modes.POM:
      currentColor = colorBlue;
      return;

    case Modes.BREAK:
      currentColor = colorOrange;
      return;
  }
}

function checkPom() {
  if (Model.secondsPom < 1) {
    if (!flashing) {
      currentColor = colorBlue;
      startFlashing();
    }
  } else {
    if (flashing) {
      stopFlashing();
    }
  }
}

function checkBreak() {
  if (Model.secondsBreak > BreakMaxSeconds) {
    if (!flashing) {
      currentColor = colorOrange;
      startFlashing();
    }
  } else {
    if (flashing) {
      stopFlashing();
    }
  }
}

function startFlashing() {
  clearInterval(intervalId);

  intervalId = setInterval(updateBorder, 500);

  flashing = true;
}

function stopFlashing() {
  clearInterval(intervalId);
  intervalId = -1;

  flashing = false;

  updateBorder();
}

function updateBorder() {
  const app = $('#app');

  if (!flashing) {
    app.style.border = '1px solid var(--border-color)';
    isBorderHighlighted = false;
    return;
  }

  if (isBorderHighlighted) {
    app.style.border = `1px solid var(--border-color)`;
    isBorderHighlighted = false;
  } else {
    app.style.border = `1px solid var(${currentColor})`;
    isBorderHighlighted = true;
  }
}
