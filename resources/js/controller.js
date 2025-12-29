import { signalQuitRequested } from "./logic/app-signals.js";
import { toggleAlwaysOnTop } from "./logic/misc-logic.js";
import Model from "./logic/Model.js";
import { toggleTheme } from "./logic/theme-mgr.js";
import Neu from "./utils/Neu.js";

document.addEventListener("keydown", async function (e) {
  let pressedKey;

  if (typeof e.key === "string") {
    pressedKey = e.key.toUpperCase();
  }

  if (!pressedKey) {
    console.error("bad pressedKey");
    return;
  }

  // SHIFT + R is handled better on keydown
  if (pressedKey === "R") {
    Model.reset(e.shiftKey);
  }
});

document.addEventListener("keyup", async function (e) {
  let pressedKey;

  if (typeof e.key === "string") {
    pressedKey = e.key.toUpperCase();
  }

  if (!pressedKey) {
    console.error("bad pressedKey");
    return;
  }

  switch (pressedKey) {
    case " ":
    case "S":
      Model.toggleMode();
      break;

    case "A":
      toggleAlwaysOnTop();
      break;

    case "D":
      Neu.openAppDirectory();
      break;

    case "F":
      Model.finish();
      break;

    case "M":
      Neutralino.window.minimize();
      break;

    case "G":
    case "P":
      Model.togglePlay();
      break;

    case "Q":
      signalQuitRequested.dispatch();
      break;

    case "T":
      toggleTheme();
      break;
  }
});

document.addEventListener("mousewheel", function (e) {
  const direction = e.deltaY < 0 ? 1 : -1;

  // no key modifier adjusts one minute
  let seconds = 60;

  switch (true) {
    case e.altKey:
      // ignore it, as I use this hotkey for the VoluMouse app
      return;

    case e.ctrlKey && e.shiftKey:
      seconds = 1;
      break;

    case e.ctrlKey:
      // one hour
      seconds = 60 * 60;
      break;

    case e.shiftKey:
      // 10 minutes
      seconds = 10 * 60;
      break;
  }

  seconds *= direction;

  Model.adjustClock(e.target.id, seconds);
});

document.addEventListener("mouseover", function (e) {
  Model.lastHoveredTargetId = e.target.id;
});

document.addEventListener("dblclick", function (event) {
  Model.toggleMode();
});
