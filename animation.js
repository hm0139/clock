class Animation {
  #animFunc = null;
  #extraData = {};
  #id = null;
  #count = 0;
  #fps = 0;
  #startTime = 0;
  #startAnimationTime = 0;
  #pauseAnimationTime = 0;
  #currentAnimationTime = 0;
  #correctionAnimationTime = 0;
  #animationStopDelay = 0;
  #calledStop = false;
  constructor(animFunc, extraData = {}) {
    this.#animFunc = animFunc;
    this.#extraData = extraData;
  }

  start() {
    this.#count = 0;
    this.#startTime = 0;
    this.#fps = 0;
    this.#calledStop = false;
    this.#startAnimationTime = performance.now();
    this.#id = requestAnimationFrame(this.#update.bind(this));
  }

  resume() {
    this.#correctionAnimationTime += performance.now() - this.#pauseAnimationTime;
    this.#calledStop = false;
    this.#id = requestAnimationFrame(this.#update.bind(this));
  }

  #update(time) {
    this.#currentAnimationTime = time - this.#startAnimationTime - this.#correctionAnimationTime;
    this.#animFunc({
      currentAnimationTime: this.#currentAnimationTime,
      currentPerformanceTime: time,
      setExtraData: this.setExtraData.bind(this),
      getExtraData: this.getExtraData.bind(this),
      fps: this.#fps,
    });
    if (time - this.#startTime >= 1000) {
      this.#startTime = time;
      this.#fps = this.#count;
      this.#count = 0;
    }
    this.#count++;
    this.#id = requestAnimationFrame(this.#update.bind(this));
    if (this.#animationStopDelay > 0) {
      this.#animationStopDelay--;
    }

    if (this.#calledStop && this.#animationStopDelay == 0) {
      cancelAnimationFrame(this.#id);
      this.#id = null;
      this.#pauseAnimationTime = performance.now();
    }
  }

  stop(delay = 0) {
    if (delay == 0) {
      cancelAnimationFrame(this.#id);
      this.#id = null;
      this.#pauseAnimationTime = performance.now();
    } else {
      this.#animationStopDelay = delay;
      this.#calledStop = true;
    }
  }

  get animationTime() {
    return this.#currentAnimationTime;
  }

  get FPS() {
    return this.#fps;
  }

  setExtraData(data) {
    if (typeof data == "object" && data != null) {
      this.#extraData = { ...this.#extraData, ...data };
    } else {
      console.warn("The value was not set because the passed value was null or was not an object.");
    }
  }

  getExtraData() {
    return this.#extraData;
  }
}

export default Animation;
