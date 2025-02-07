import Signal from '../utils/Signal.js';

export const signalConfigLoaded = new Signal('signalConfigLoaded');
export const signalAppStepped = new Signal('signalAppStepped');
export const signalZoomBlocked = new Signal('signalZoomBlocked');
export const signalChangedMode = new Signal('signalChangedMode');
export const signalQuitRequested = new Signal('signalQuitRequested');
