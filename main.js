import Animation from "./animation.js";
import Clock from "./clock.js";
import Cookie from "./cookie.js";
import { stringToBoolean, addDate } from "./util.js";

const STATE_USUALLY = 0; //通常
const STATE_SLOWING_DOWN = 1; //減速中
const STATE_SLOW_DOWN = 2; //減速状態
const STATE_RETURNING = 3; //復帰中

const CHANGE_SPEED_TIME_INTERVAL = 500; //速度変化の間隔(ms)
const MIN_SPEED_RATIO = 0.7; //秒に対する最低比率
const MAX_SPEED_RATIO = 6.0; //秒に対する最高比率
const STEP_RATIO = 0.02; //一度に加減する量

//時計の半径の長さに対する比
const HOUR_HANDS_LENGTH_RATIO = 0.6;
const MINUTE_HANDS_LENGTH_RATIO = 0.8;
const SECOND_HANDS_LENGTH_RATIO = 1.05;

//針の太さ
const HOUR_HANDS_THICKNESS = 6;
const MINUTE_HANDS_THICKNESS = 6;
const SECOND_HANDS_THICKNESS = 2;

//針の色
const HOUR_HANDS_COLOR = "#000000";
const MINUTE_HANDS_COLOR = "#000000";
const SECOND_HANDS_COLOR = "#ff0000";

//針を後ろへずらす針の長さに対しての比率（秒針のみ）
const SECOND_HANDS_OFFSET = 0.1;

//Cookieの有効期間(月単位)
const COOKIE_LIFESPAN_MONTH = 6;

//更新処理
function update(animInfo) {
  const { currentAnimationTime, setExtraData, getExtraData } = animInfo;
  const {
    canvas,
    ctx,
    clockStatus,
    fakeTime,
    timeRatio,
    prevFrameTime,
    startSlowDownTime,
    displayRemainingTime,
    clock,
    slowDownTime,
  } = getExtraData();

  const date = new Date();
  if (fakeTime == 0 && clockStatus == STATE_SLOWING_DOWN) {
    setExtraData({
      fakeTime: date.getTime(),
      prevTime: date.getTime(),
    });
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //通常の状態
  if (clockStatus == STATE_USUALLY) {
    clock.date = date;
    clock.calcAngleOfClockHands();
  } else {
    //時間の進みが遅い状態
    const immediatelyData = getExtraData();
    const fakeDate = new Date(immediatelyData.fakeTime);
    clock.date = fakeDate;
    clock.calcAngleOfClockHands();
    const addTime = (date.getTime() - immediatelyData.prevTime) * timeRatio;
    setExtraData({ fakeTime: immediatelyData.fakeTime + addTime });
    switch (clockStatus) {
      case STATE_SLOWING_DOWN: //減速中
        if (currentAnimationTime - prevFrameTime > CHANGE_SPEED_TIME_INTERVAL) {
          if (timeRatio <= MIN_SPEED_RATIO) {
            setExtraData({
              clockStatus: STATE_SLOW_DOWN,
              startSlowDownTime: currentAnimationTime,
            });
            displayRemainingTime.textContent = Math.floor(slowDownTime / 1000);
          } else {
            setExtraData({
              timeRatio: timeRatio - STEP_RATIO,
              prevFrameTime: currentAnimationTime,
            });
          }
        }
        break;
      case STATE_SLOW_DOWN: //減速状態
        if (currentAnimationTime - startSlowDownTime > slowDownTime) {
          setExtraData({
            clockStatus: STATE_RETURNING,
            prevFrameTime: currentAnimationTime,
          });
          displayRemainingTime.textContent = "復帰中";
        } else {
          displayRemainingTime.textContent =
            "減速残り時間 : " + Math.floor((slowDownTime - (currentAnimationTime - startSlowDownTime)) / 1000);
        }
        break;
      case STATE_RETURNING: //復帰中
        if (currentAnimationTime - prevFrameTime > CHANGE_SPEED_TIME_INTERVAL) {
          if (date.getTime() - fakeTime > 100) {
            if (timeRatio < MAX_SPEED_RATIO) {
              setExtraData({
                timeRatio: timeRatio + STEP_RATIO,
                prevFrameTime: currentAnimationTime,
              });
            }
          } else {
            setExtraData({
              clockStatus: STATE_USUALLY,
              timeRatio: 1.0,
              fakeTime: 0,
            });
            const slowDownBtn = document.getElementById("slow-down");
            const slowCancel = document.getElementById("slow-down-cancel");
            slowDownBtn.disabled = false;
            slowDownBtn.className = "ui ui-btn";
            slowCancel.disabled = true;
            slowCancel.className = "ui-disabled-btn";
            displayRemainingTime.textContent = "";
          }
        }
        break;
    }
    setExtraData({ prevTime: date.getTime() });
  }

  clock.draw(ctx);
}

//ボタン表示の切り替え
function switchButtonValue(element, sweep) {
  if (sweep) {
    element.value = "ステップ運針";
  } else {
    element.value = "スイープ運針";
  }
}

//エントリポイント
function main() {
  const canvas = document.getElementById("main");
  const ctx = canvas.getContext("2d");

  const clockHandsInfo = [
    {
      type: "H",
      lengthRatio: HOUR_HANDS_LENGTH_RATIO,
      offset: 0,
      thickness: HOUR_HANDS_THICKNESS,
      color: HOUR_HANDS_COLOR,
      position: {},
    },
    {
      type: "M",
      lengthRatio: MINUTE_HANDS_LENGTH_RATIO,
      offset: 0,
      thickness: MINUTE_HANDS_THICKNESS,
      color: MINUTE_HANDS_COLOR,
      position: {},
    },
    {
      type: "S",
      lengthRatio: SECOND_HANDS_LENGTH_RATIO,
      offset: SECOND_HANDS_OFFSET,
      thickness: SECOND_HANDS_THICKNESS,
      color: SECOND_HANDS_COLOR,
      position: {},
    },
  ];

  let cookieSweep = Cookie.get("sweep");
  if (cookieSweep == null) {
    const date = addDate(new Date(), 0, COOKIE_LIFESPAN_MONTH, 0);
    Cookie.set("sweep", false, date);
    cookieSweep = Cookie.get("sweep");
  }
  const sweep = stringToBoolean(cookieSweep) ? true : false;

  let cookieShowNumbers = Cookie.get("showNumbers");
  if (cookieShowNumbers == null) {
    const date = addDate(new Date(), 0, COOKIE_LIFESPAN_MONTH, 0);
    Cookie.set("showNumbers", true, date);
    cookieShowNumbers = Cookie.get("showNumbers");
  }
  const showNumbers = stringToBoolean(cookieShowNumbers) ? true : false;

  let cookieRoman = Cookie.get("roman");
  if (cookieRoman == null) {
    const date = addDate(new Date(), 0, COOKIE_LIFESPAN_MONTH, 0);
    Cookie.set("roman", false, date);
    cookieRoman = Cookie.get("roman");
  }
  const roman = stringToBoolean(cookieRoman) ? true : false;

  const clock = new Clock(0, 0, 0, null, clockHandsInfo, sweep, showNumbers, roman);
  const displayRemainingTime = document.getElementById("display-remaining-time");

  const animation = new Animation(update, {
    canvas: canvas,
    ctx: ctx,
    clockStatus: STATE_USUALLY,
    fakeTime: 0,
    prevTime: 0,
    timeRatio: 1.0,
    prevFrameTime: 0,
    startSlowDownTime: 0,
    displayRemainingTime: displayRemainingTime,
    clock: clock,
    slowDownTime: 0,
  });

  const resize = () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const standardWidth = canvas.width > canvas.height ? canvas.height : canvas.width;
    clock.radius = (standardWidth / 2) * 0.8;
    clock.x = canvas.width / 2;
    clock.y = canvas.height / 2;
    clock.initFontInfo(ctx);
    clock.calcClockFace();
  };
  window.addEventListener("resize", resize);
  resize();

  const switchClock = document.getElementById("switch-clock");
  switchButtonValue(switchClock, clock.sweep);
  switchClock.addEventListener("click", () => {
    clock.sweep = !clock.sweep;
    const date = addDate(new Date(), 0, COOKIE_LIFESPAN_MONTH, 0);
    Cookie.set("sweep", clock.sweep, date);
    switchButtonValue(switchClock, clock.sweep);
  });

  const showCheckbox = document.getElementById("show-numbers");
  showCheckbox.checked = clock.showNumbers;
  showCheckbox.addEventListener("click", () => {
    clock.showNumbers = !clock.showNumbers;
    const date = addDate(new Date(), 0, COOKIE_LIFESPAN_MONTH, 0);
    Cookie.set("showNumbers", clock.showNumbers, date);
  });

  const slowDownTimeList = document.getElementById("slow-down-time-list");
  const list = [
    { value: 60, text: "1分" },
    { value: 180, text: "3分" },
    { value: 300, text: "5分" },
    { value: 600, text: "10分" },
    { value: 900, text: "15分" },
    { value: 1800, text: "30分" },
    { value: 3600, text: "1時間" },
  ];
  for (const item of list) {
    const option = document.createElement("option");
    option.value = item.value * 1000;
    option.textContent = item.text;
    slowDownTimeList.appendChild(option);
  }

  const slowDownBtn = document.getElementById("slow-down");
  const slowCancel = document.getElementById("slow-down-cancel");
  slowDownBtn.addEventListener("click", () => {
    slowDownBtn.disabled = true;
    slowDownBtn.className = "ui-disabled-btn";
    slowCancel.disabled = false;
    slowCancel.className = "ui ui-btn";
    displayRemainingTime.textContent = "減速中";
    animation.setExtraData({
      clockStatus: STATE_SLOWING_DOWN,
      slowDownTime: slowDownTimeList.value,
    });
  });

  slowCancel.addEventListener("click", () => {
    slowDownBtn.disabled = false;
    slowDownBtn.className = "ui ui-btn";
    slowCancel.disabled = true;
    slowCancel.className = "ui-disabled-btn";
    displayRemainingTime.textContent = "";
    animation.setExtraData({
      clockStatus: STATE_USUALLY,
      fakeTime: 0,
      timeRatio: 1.0,
    });
  });

  const romanCheckBox = document.getElementById("roman-numbers");
  romanCheckBox.checked = clock.roman;
  romanCheckBox.addEventListener("click", () => {
    if (clock.roman) {
      clock.switchDisplayRoman(false);
    } else {
      clock.switchDisplayRoman(true);
    }
    const date = addDate(new Date(), 0, COOKIE_LIFESPAN_MONTH, 0);
    Cookie.set("roman", clock.roman, date);
  });

  animation.start();
}

window.addEventListener("DOMContentLoaded", main);
