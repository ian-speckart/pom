import { signalZoomBlocked } from './logic/app-signals.js';
import { AppHeight, AppWidth, Modes } from './logic/enums.js';
import Model from './logic/Model.js';
import { prettifySeconds } from './utils/date-utils.js';
import { $ } from './utils/utils.js';

class View {
  constructor() {}

  init() {
    this.clockLeft = $('#clock-left');
    this.clockRight = $('#clock-right');
    this.progressBarPrimary = $('#progress-bar-primary');
    this.progressBarSecondary = $('#progress-bar-secondary');
    this.updateModeVisibility();
    this.render();

    signalZoomBlocked.add(onZoomBlocked);

    Neutralino.window.setDraggableRegion('app', {
      alwaysCapture: true,
      dragMinDistance: 1,
    });
  }

  render() {
    switch (Model.mode) {
      case Modes.POM:
        const pomText = prettifySeconds(Model.secondsPom);
        const pomTotalText = prettifySeconds(Model.secondsPomTotal);

        this.clockLeft.innerText = pomText;
        this.clockRight.innerText = pomTotalText;

        this.progressBarPrimary.style.width = Model.pomProgressBarWidth + 'px';
        break;

      case Modes.BREAK:
        let breakText = prettifySeconds(Model.secondsBreak);
        let breakTotalText = prettifySeconds(Model.secondsBreakTotal);

        this.clockLeft.innerText = breakText;
        this.clockRight.innerText = breakTotalText;

        this.progressBarPrimary.style.width =
          Model.breakProgressBarWidth + 'px';
        break;

      case Modes.TOTALS:
        const pomTotalText2 = prettifySeconds(Model.secondsPomTotal);
        const breakTotalText2 = prettifySeconds(Model.secondsBreakTotal);
        this.clockLeft.innerText = pomTotalText2;
        this.clockRight.innerText = breakTotalText2;

        this.progressBarPrimary.style.width =
          Model.totalsPomProgressBarWidth + 'px';
        this.progressBarSecondary.style.width =
          Model.totalsBreakProgressBarWidth + 'px';
        break;
    }
  }

  updateModeVisibility() {
    const classes = ['pom', 'break', 'totals'];

    classes.forEach((className) => {
      this.clockLeft.classList.remove(className);
      this.clockRight.classList.remove(className);
      this.progressBarPrimary.classList.remove(className);
      this.progressBarSecondary.classList.remove(className);
    });

    switch (Model.mode) {
      case Modes.POM:
        this.clockLeft.classList.add('pom');
        this.clockRight.classList.add('pom');
        this.progressBarPrimary.classList.add('pom');
        this.progressBarSecondary.classList.add('pom');
        this.progressBarSecondary.style.width = '100%';
        break;

      case Modes.BREAK:
        this.clockLeft.classList.add('break');
        this.clockRight.classList.add('break');
        this.progressBarPrimary.classList.add('break');
        this.progressBarSecondary.classList.add('break');
        this.progressBarSecondary.style.width = '100%';
        break;

      case Modes.TOTALS:
        this.clockLeft.classList.add('pom');
        this.clockRight.classList.add('break');
        this.clockLeft.classList.add('totals');
        this.clockRight.classList.add('totals');
        this.progressBarPrimary.classList.add('pom');
        this.progressBarSecondary.classList.add('break');
        this.progressBarSecondary.classList.add('totals');
        break;
    }

    this.render();
  }

  resetWindow() {
    Neutralino.window.setSize({
      width: AppWidth,
      height: AppHeight,
    });

    Neutralino.window.move(0, 0);
  }
}

function onZoomBlocked() {
  Neutralino.window.setSize({
    width: AppWidth,
    height: AppHeight,
  });

  fixProgressBars();
}

function fixProgressBars() {
  const progressBars = document.querySelectorAll('.progress-bar');

  progressBars.forEach((progressBar) => {
    progressBar.style.bottom = '0px';
  });
}

export default new View();
