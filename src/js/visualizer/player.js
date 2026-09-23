// Step player shared by every visualization. It knows nothing about any
// algorithm: it holds a precomputed list of steps and reports the current one.

const BASE_DELAY_MS = 900;

export class Player {
  /**
   * @param {(state: {step: object, index: number, total: number,
   *   playing: boolean}) => void} onChange Called whenever anything changes.
   */
  constructor(onChange) {
    this.onChange = onChange;
    this.steps = [];
    this.index = 0;
    this.speed = 1;
    this.timer = null;
  }

  get playing() {
    return this.timer !== null;
  }

  get atEnd() {
    return this.index >= this.steps.length - 1;
  }

  load(steps) {
    this.stop();
    this.steps = steps;
    this.index = 0;
    this.emit();
  }

  play() {
    if (this.playing) return;
    if (this.atEnd) this.index = 0;
    this.schedule();
    this.emit();
  }

  pause() {
    this.stop();
    this.emit();
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }

  seek(index) {
    this.stop();
    this.index = Math.max(0, Math.min(index, this.steps.length - 1));
    this.emit();
  }

  forward() {
    this.seek(this.index + 1);
  }

  back() {
    this.seek(this.index - 1);
  }

  reset() {
    this.seek(0);
  }

  setSpeed(speed) {
    this.speed = speed;
    // Restart the pending tick so the new speed applies immediately.
    if (this.playing) {
      this.stop();
      this.schedule();
    }
  }

  schedule() {
    this.timer = setTimeout(() => {
      this.index += 1;
      if (this.atEnd) this.timer = null;
      else this.schedule();
      this.emit();
    }, BASE_DELAY_MS / this.speed);
  }

  stop() {
    clearTimeout(this.timer);
    this.timer = null;
  }

  emit() {
    this.onChange({
      step: this.steps[this.index],
      index: this.index,
      total: this.steps.length,
      playing: this.playing,
    });
  }
}
