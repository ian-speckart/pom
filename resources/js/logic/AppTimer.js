import { signalAppStepped } from './app-signals.js';

/**
 * Step the app using an interval, but provides the ellapsed time since
 * the last step, to make the timer precise.
 */
class AppTimer {
  constructor() {
    this._intervalId = null;
    this._lastSteppedAt = null;
  }

  play() {
    if (!this._intervalId) {
      this._lastSteppedAt = Date.now();
      this._intervalId = setInterval(this._step, 1000);
    }
  }

  pause() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  _step = () => {
    const now = Date.now();

    if (this._lastSteppedAt) {
      // Calculate the time elapsed since the last step
      const elapsedSeconds = (now - this._lastSteppedAt) / 1000;

      signalAppStepped.dispatch(elapsedSeconds);
    }

    this._lastSteppedAt = now;
  };
}

export default new AppTimer();
