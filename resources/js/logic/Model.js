import { secondsBetweenUnixMs } from '../utils/date-utils.js';
import Neu from '../utils/Neu.js';
import { $, validateInteger, validateNumber } from '../utils/utils.js';
import View from '../View.js';
import { signalChangedMode } from './app-signals.js';
import { signalAppStepped } from './app-signals.js';
import AppTimer from './AppTimer.js';
import { AppWidth, BreakMaxSeconds, Modes, PomMaxSeconds } from './enums.js';

class Model {
  init() {
    this.secondsPom = PomMaxSeconds;
    this.secondsBreak = 0;
    this.secondsPomTotal = 0;
    this.secondsBreakTotal = 0;
    this.playing = false;
    this.mode = Modes.POM;
    // helps the Totals view determine where to go back
    this.prevMode;
    this.pomProgressBarWidth = 0;
    this.breakProgressBarWidth = 0;
    this.totalsPomProgressBarWidth = AppWidth / 2;
    this.totalsBreakProgressBarWidth = AppWidth / 2;
    // helps determine which element to reset or adjust time
    this.lastHoveredTargetId = '';

    signalAppStepped.add(this.#step);
  }

  #step = (e) => {
    const secondsSinceLastStep = e.detail;

    switch (this.mode) {
      case Modes.POM:
        this.secondsPom -= secondsSinceLastStep;
        this.secondsPomTotal += secondsSinceLastStep;
        this.updateProgressBar();
        break;

      case Modes.BREAK:
        this.secondsBreak += secondsSinceLastStep;
        this.secondsBreakTotal += secondsSinceLastStep;
        this.updateProgressBar();
        break;
    }

    View.render();
  };

  togglePlay() {
    if (this.mode === Modes.TOTALS) {
      return;
    }

    if (this.playing) {
      this.playing = false;
      AppTimer.pause();

      $('#app').classList.add('paused');
    } else {
      this.playing = true;
      AppTimer.play();

      $('#app').classList.remove('paused');
    }
  }

  toggleMode() {
    switch (this.mode) {
      case Modes.POM:
        this.mode = Modes.BREAK;

        if (this.secondsPom < 1) {
          this.secondsPom = PomMaxSeconds;
        }

        this.prevMode = Modes.POM;
        break;

      case Modes.BREAK:
        this.mode = Modes.POM;

        this.secondsBreak = 0;

        this.prevMode = Modes.BREAK;
        break;

      case Modes.TOTALS:
        this.exitTotalsMode();
        return;
    }

    signalChangedMode.dispatch();

    this.updateProgressBar();
    View.updateModeVisibility();
  }

  exitTotalsMode() {
    if (this.prevMode) {
      this.mode = this.prevMode;
    } else {
      this.mode = Modes.POM;
    }

    if (!this.playing) {
      this.togglePlay();
    }

    View.updateModeVisibility();
  }

  /**
   * Sets up the state for the Totals view.
   */
  finish() {
    if (this.mode === Modes.TOTALS) {
      this.exitTotalsMode();

      signalChangedMode.dispatch();
      return;
    }

    if (this.playing) {
      this.togglePlay();
    }

    this.prevMode = this.mode;
    this.mode = Modes.TOTALS;

    signalChangedMode.dispatch();

    this.updateProgressBar();

    View.updateModeVisibility();
  }

  /**
   * Each clock can be manually adjusted using the mousewheel.
   */
  adjustClock(clockId, secondsDelta) {
    // figure out which clock to adjust, based on the hovered clock and the current mode
    const isClockLeft = clockId === 'clock-left';
    const isClockRight = clockId === 'clock-right';
    const isPom = this.mode === Modes.POM;
    const isBreak = this.mode === Modes.BREAK;

    const adjustsPom = isClockLeft && isPom;
    const adjustsPomTotal = isClockRight && isPom;
    const adjustsBreak = isClockLeft && isBreak;
    const adjustsBreakTotal = isClockRight && isBreak;

    switch (true) {
      case adjustsPom:
        this.secondsPom += secondsDelta;
        break;

      case adjustsPomTotal:
        this.secondsPomTotal += secondsDelta;
        break;

      case adjustsBreak:
        this.secondsBreak += secondsDelta;
        break;

      case adjustsBreakTotal:
        this.secondsBreakTotal += secondsDelta;
        break;

      default:
        return;
    }

    this.updateProgressBar();
    View.render();
  }

  /**
   * Calculates the size of each progress bar.
   * It checks the maximum value of a bar vs its current value and gets a percentage of the app's width.
   */
  updateProgressBar() {
    let percentage;

    switch (this.mode) {
      case Modes.POM:
        percentage = ((PomMaxSeconds - this.secondsPom) * 100) / PomMaxSeconds;
        if (percentage > 100) percentage = 100;
        if (percentage < 0) percentage = 0;
        this.pomProgressBarWidth = AppWidth * (percentage / 100);
        break;

      case Modes.BREAK:
        percentage = (this.secondsBreak * 100) / BreakMaxSeconds;
        if (percentage > 100) percentage = 100;
        if (percentage < 0) percentage = 0;
        this.breakProgressBarWidth = AppWidth * (percentage / 100);
        break;

      /**
       * Here we use the primary bar for the total productivity, and the secondary bar
       * for the total breaks.
       */
      case Modes.TOTALS:
        const totalPomPlusBreak = this.secondsPomTotal + this.secondsBreakTotal;

        percentage = (this.secondsPomTotal * 100) / totalPomPlusBreak;
        if (isNaN(percentage)) percentage = 0;
        this.totalsPomProgressBarWidth = AppWidth * (percentage / 100);

        percentage = (this.secondsBreakTotal * 100) / totalPomPlusBreak;
        if (isNaN(percentage)) percentage = 0;
        this.totalsBreakProgressBarWidth = AppWidth * (percentage / 100);

        if (
          this.totalsPomProgressBarWidth === 0 &&
          this.totalsBreakProgressBarWidth === 0
        ) {
          this.totalsPomProgressBarWidth = AppWidth / 2;
          this.totalsBreakProgressBarWidth = AppWidth / 2;
        }
        break;
    }
  }

  reset() {
    const targetId = this.lastHoveredTargetId;

    // figure out which clock to reset, based on the hovered clock and the current mode
    const isClockLeft = targetId === 'clock-left';
    const isClockRight = targetId === 'clock-right';
    const isPom = this.mode === Modes.POM;
    const isBreak = this.mode === Modes.BREAK;

    const resetsPom = isClockLeft && isPom;
    const resetsPomTotal = isClockRight && isPom;
    const resetsBreak = isClockLeft && isBreak;
    const resetsBreakTotal = isClockRight && isBreak;

    switch (true) {
      case resetsPom:
        this.secondsPom = PomMaxSeconds;
        break;

      case resetsPomTotal:
        this.secondsPomTotal = 0;
        break;

      case resetsBreak:
        this.secondsBreak = 0;
        break;

      case resetsBreakTotal:
        this.secondsBreakTotal = 0;
        break;
    }

    // if R is pressed in the Totals view, reset everything
    if (this.mode === Modes.TOTALS) {
      this.secondsPom = PomMaxSeconds;
      this.secondsPomTotal = 0;
      this.secondsBreak = 0;
      this.secondsBreakTotal = 0;

      this.prevMode = Modes.POM;

      this.updateProgressBar(Modes.TOTALS);
    }

    View.render();
  }

  async saveState(toLocalStorage = false) {
    const state = {
      secondsPom: this.secondsPom,
      secondsPomTotal: this.secondsPomTotal,
      secondsBreak: this.secondsBreak,
      secondsBreakTotal: this.secondsBreakTotal,
      mode: this.mode,
      playing: this.playing,
      pomProgressBarWidth: Math.round(this.pomProgressBarWidth),
      breakProgressBarWidth: Math.round(this.breakProgressBarWidth),
      totalsPomProgressBarWidth: Math.round(this.totalsPomProgressBarWidth),
      totalsBreakProgressBarWidth: Math.round(this.totalsBreakProgressBarWidth),
    };

    /**
     * We only save to localStorage when the device is put to sleep, as Neutralino
     * is irreversibly disconnected from the local server, so it won't allow us to save
     * to Neutralino.storage
     */
    if (toLocalStorage) {
      localStorage.setItem('state', JSON.stringify(state));
      localStorage.setItem('sleeping', 'true');

      /**
       * if the app is stepping/playing when the device is put to sleep, we'll later need to add the
       * total time slept to the total seconds of the current mode
       */
      if (this.playing) {
        localStorage.setItem('disconnectedAt', Date.now());
      }

      return;
    }

    await Neu.saveKey('state', state);
  }

  /**
   * This should be called only after View has initialized, as it calls View.render.
   * When View initializes, it stores the references of the view objects.
   */
  async loadState() {
    /**
     * when the computer sleeps, we lose connection to the server, so we save
     * the state to localStorage, reload the window, and load the state.
     * We know if that's the case if sleeping is true.
     */
    const sleeping = localStorage.getItem('sleeping') === 'true';
    let stateStr;
    // the number of seconds the computer slept
    let sleepOffset = 0;

    if (sleeping) {
      stateStr = localStorage.getItem('state');

      const disconnectedAt = localStorage.getItem('disconnectedAt');
      if (validateInteger(disconnectedAt)) {
        sleepOffset = secondsBetweenUnixMs(Number(disconnectedAt), Date.now());
      }

      localStorage.removeItem('sleeping');
      localStorage.removeItem('state');
      localStorage.removeItem('disconnectedAt');
    } else {
      stateStr = await Neu.loadKey('state');
    }

    if (!stateStr) {
      return;
    }

    let state;

    try {
      state = JSON.parse(stateStr);
    } catch (err) {
      console.error('failed to load state. err:', err);
      return;
    }

    // if these keys are in 'state', and they're valid, use them
    const keys = [
      'secondsPom',
      'secondsPomTotal',
      'secondsBreak',
      'secondsBreakTotal',
      'pomProgressBarWidth',
      'breakProgressBarWidth',
      'totalsPomProgressBarWidth',
      'totalsBreakProgressBarWidth',
    ];

    keys.forEach((key) => {
      if (validateNumber(state[key])) {
        this[key] = Number(state[key]);
      }
    });

    const isModeValid = [Modes.BREAK, Modes.POM, Modes.TOTALS].includes(
      state.mode
    );

    if (isModeValid) {
      this.mode = state.mode;

      if (this.mode === Modes.POM) {
        if (state.playing) {
          this.secondsPom -= sleepOffset;
        }

        this.secondsPomTotal += sleepOffset;
      } else if (this.mode === Modes.BREAK) {
        if (state.playing) {
          this.secondsBreak += sleepOffset;
        }

        this.secondsBreakTotal += sleepOffset;
      }
    }

    if (state.playing && !this.playing) {
      this.togglePlay();
    }

    if (state.mode === Modes.TOTALS) {
      this.prevMode = Modes.POM;
      /**
       * dont call this.finish() from here, as the mode is already TOTALS,
       * so it will switch to POM
       */
    }

    this.updateProgressBar();
    View.updateModeVisibility();
  }
}

export default new Model();
