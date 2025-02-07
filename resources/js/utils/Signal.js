/**
 * Uses CustomEvents to provide AS3 styled signals.
 */
export default class Signal {
  #id = -1;
  #listeners = new Set(); // Track listeners for cleanup and performance

  constructor(id) {
    if (!id) throw new Error('Signal requires an ID');
    this.#id = id;
  }

  add(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }

    // Track listener for cleanup
    this.#listeners.add(listener);
    window.addEventListener(this.#id, listener);
  }

  remove(listener) {
    window.removeEventListener(this.#id, listener);
    this.#listeners.delete(listener);
  }

  dispatch(payload) {
    const event = new CustomEvent(this.#id, {
      detail: payload,
    });

    window.dispatchEvent(event);
  }

  reset() {
    this.#listeners.forEach((listener) => {
      window.removeEventListener(this.#id, listener);
    });
    this.#listeners.clear();
  }

  hasListeners() {
    return this.#listeners.size > 0;
  }
}
