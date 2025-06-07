/**
 * @typedef {Object<string, any>} ExtraData 追加のアニメーション情報
 */
/**
 * @typedef {Object} AnimInfo アニメーション情報
 * @property {Number} currentAnimationTime アニメーション開始からの経過時間
 * @property {Number} currentPerformanceTime フレーム描画時点の時刻
 * @property {ExtraData} extraData 追加のアニメーション情報
 * @property {(ExtraData) => void} setExtraData 追加のアニメーション情報を設定する関数
 * @property {() => ExtraData} getExtraData 追加のアニメーション情報を取得する関数
 * @property {Number} fps 1秒間のフレーム数
 */
/**
 * @callback AnimFunc アニメーションするコールバック関数
 * @param {AnimInfo} animaInfo コールバック関数に渡すアニメーション情報
 * @returns {void}
 */

class Animation {
  /**
   * @private
   * @type {AnimFunc}
   */
  #animFunc = null;
  /**
   * @private
   * @type {ExtraData}
   */
  #extraData = {};
  /**
   * @private
   * @type {Number}
   */
  #id = null;
  /**
   * @private
   * @type {Number}
   */
  #count = 0;
  /**
   * @private
   * @type {Number}
   */
  #fps = 0;
  /**
   * @private
   * @type {Number}
   */
  #startTime = 0;
  /**
   * @private
   * @type {Number}
   */
  #startAnimationTime = 0;
  /**
   * @private
   * @type {Number}
   */
  #pauseAnimationTime = 0;
  /**
   * @private
   * @type {Number}
   */
  #currentAnimationTime = 0;
  /**
   * @private
   * @type {Number}
   */
  #correctionAnimationTime = 0;
  /**
   * @private
   * @type {Number}
   */
  #animationStopDelay = 0;
  /**
   * @private
   * @type {Boolean}
   */
  #calledStop = false;

  /**
   * コンストラクタ
   * @param {AnimFunc} animFunc コールバックで呼び出す関数
   * @param {ExtraData} extraData コールバック関数に追加で渡す任意のデータ
   */
  constructor(animFunc, extraData = {}) {
    this.#animFunc = animFunc;
    this.#extraData = extraData;
  }

  /**
   * アニメーション開始
   */
  start() {
    this.#count = 0;
    this.#startTime = 0;
    this.#fps = 0;
    this.#calledStop = false;
    this.#startAnimationTime = performance.now();
    this.#id = requestAnimationFrame(this.#update.bind(this));
  }

  /**
   * アニメーション再開
   */
  resume() {
    this.#correctionAnimationTime += performance.now() - this.#pauseAnimationTime;
    this.#calledStop = false;
    this.#id = requestAnimationFrame(this.#update.bind(this));
  }

  /**
   * アニメーションの更新
   * @private
   * @param {Number} time
   */
  #update(time) {
    this.#currentAnimationTime = time - this.#startAnimationTime - this.#correctionAnimationTime;
    this.#animFunc({
      currentAnimationTime: this.#currentAnimationTime,
      currentPerformanceTime: time,
      extraData: this.#extraData,
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

  /**
   * アニメーションの停止
   * @param {Number} delay アニメーションを何フレーム遅延して停止させるか
   */
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

  /**
   * アニメーション時間の取得
   * @returns {Number}
   */
  get animationTime() {
    return this.#currentAnimationTime;
  }

  /**
   * FPSの取得
   * @returns {number}
   */
  get FPS() {
    return this.#fps;
  }

  /**
   * 追加データの設定
   * @param {ExtraData} data 設定するデータ
   */
  setExtraData(data) {
    if (typeof data == "object" && data != null) {
      this.#extraData = { ...this.#extraData, ...data };
    } else {
      console.warn("The value was not set because the passed value was null or was not an object.");
    }
  }

  /**
   * 追加データの取得
   * @returns {ExtraData}
   */
  getExtraData() {
    return this.#extraData;
  }
}

export default Animation;
