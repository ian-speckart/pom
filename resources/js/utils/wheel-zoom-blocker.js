/**
 * Prevents the app from adjusting the zoom level when ctrl + mousewheel is used.
 * e.preventDefault doesnt work, so we just undo the zoom after it's applied.
 */

import { signalZoomBlocked } from '../logic/app-signals.js';

let zoomTimeout = -1;

document.addEventListener(
  'mousewheel',
  function (e) {
    if (!e.ctrlKey) {
      return;
    }

    e.preventDefault(); // Still helpful in some cases?

    // Clear any existing timeout to prevent multiple resets
    clearTimeout(zoomTimeout);

    zoomTimeout = setTimeout(() => {
      document.body.style.transform = 'scale(1)';
      document.body.style.transformOrigin = '0 0'; // Optional: Keep top-left as origin

      document.body.style.zoom = 1;

      // Important for some browsers/situations: Force reflow
      document.body.offsetHeight;

      signalZoomBlocked.dispatch();
    }, 100);
  },
  // Crucial: passive must be false
  { passive: false }
);
