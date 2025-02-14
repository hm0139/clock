import { rotateFillText } from "./util.js";

class Clock {
  /*
  clockHands{
    type: string,
    lengthRatio: number,
    offset: number,
    thickness: number,
    color: string,
    position: {
      tipX: number,
      tipY: number,
      behindX: number,
      behindY: number
    }
  }
  */
  static romanNumbers = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  #radius = 0;
  constructor(x, y, radius, date, clockHands, sweep, showNumbers = true, roman = false) {
    this.x = x;
    this.y = y;
    this.#radius = radius;
    this.date = date;
    this.clockHands = clockHands;
    this.sweep = sweep;
    this.scales = [];
    this.numbers = [];
    this.showNumbers = showNumbers;
    this.roman = roman;
    this.fontSize = this.#radius * 0.1;
  }

  set radius(radius) {
    this.#radius = radius;
    this.fontSize = this.#radius * 0.1;
  }

  //通常の数字とローマ数字の切り替え
  switchDisplayRoman(roman) {
    this.roman = roman;
    if (this.roman) {
      for (const [index, romanNumber] of Clock.romanNumbers.entries()) {
        this.numbers[index].text = romanNumber;
      }
    } else {
      for (let i = 0; i < 12; i++) {
        this.numbers[i].text = i + 1;
      }
    }
  }

  //フォントの初期化
  initFontInfo(ctx) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const bodyFontFamily = getComputedStyle(document.body).fontFamily;
    ctx.font = `${this.fontSize}px ${bodyFontFamily}`;
  }

  //時計の文字盤のメモリや文字の位置の計算
  calcClockFace() {
    const scaleLength1 = this.#radius - this.#radius * 0.9;
    const scaleLength2 = this.#radius - this.#radius * 0.95;
    const scaleOffset = this.#radius - this.#radius * 0.98;
    const numberPosition = this.#radius * 0.8;
    this.scales = [];
    this.numbers = [];

    for (let i = 0; i < 60; i++) {
      const rad = ((360 / 60) * i * Math.PI) / 180;
      const scaleLength = i % 5 == 0 ? scaleLength1 : scaleLength2;
      const sx1 = Math.cos(rad) * (this.#radius - scaleOffset) + this.x;
      const sy1 = Math.sin(rad) * (this.#radius - scaleOffset) + this.y;
      const sx2 = Math.cos(rad) * (this.#radius - scaleLength - scaleOffset) + this.x;
      const sy2 = Math.sin(rad) * (this.#radius - scaleLength - scaleOffset) + this.y;
      this.scales.push({ sx1: sx1, sy1: sy1, sx2: sx2, sy2: sy2 });
      if (i % 5 == 0) {
        const numRad = rad - Math.PI / 3;
        const tx = Math.cos(numRad) * numberPosition + this.x;
        const ty = Math.sin(numRad) * numberPosition + this.y;
        const index = Math.floor(i / 5);
        const text = this.roman ? Clock.romanNumbers[index] : index + 1;
        this.numbers.push({ text: text, x: tx, y: ty, angle: numRad + Math.PI / 2 });
      }
    }
  }

  //時計の針の角度計算
  calcAngleOfClockHands() {
    for (let [index, hands] of this.clockHands.entries()) {
      let angleWidth = 0;
      let correction = 0;
      let value;
      let correctionValue = 0;
      switch (hands.type) {
        case "H":
          angleWidth = 360 / 12;
          correction = angleWidth / 60;
          value = this.date.getHours();
          correctionValue = this.date.getMinutes();
          break;
        case "M":
          angleWidth = 360 / 60;
          value = this.date.getMinutes();
          if (this.sweep) {
            correction = angleWidth / 60;
            correctionValue = this.date.getSeconds();
          }
          break;
        case "S":
          angleWidth = 360 / 60;
          value = this.date.getSeconds();
          if (this.sweep) {
            correction = angleWidth / 1000;
            correctionValue = this.date.getMilliseconds();
          }
          break;
      }
      const length = this.#radius * hands.lengthRatio;
      const needleLength = length * (1 - hands.offset);
      const remainingLength = length * hands.offset;
      const rad = ((value * angleWidth + correctionValue * correction - 90) * Math.PI) / 180;
      const tipX = Math.cos(rad) * needleLength + this.x;
      const tipY = Math.sin(rad) * needleLength + this.y;
      const behindX = Math.cos(rad + Math.PI) * remainingLength + this.x;
      const behindY = Math.sin(rad + Math.PI) * remainingLength + this.y;

      this.clockHands[index].position = { tipX: tipX, tipY: tipY, behindX: behindX, behindY: behindY };
    }
  }

  //時計の描画
  draw(ctx) {
    //時計の枠部分の描画
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.#radius, 0, Math.PI * 2);
    ctx.stroke();

    //時計の文字盤の描画
    ctx.lineWidth = 1;
    for (const scale of this.scales) {
      ctx.beginPath();
      ctx.moveTo(scale.sx1, scale.sy1);
      ctx.lineTo(scale.sx2, scale.sy2);
      ctx.stroke();
    }
    if (this.showNumbers) {
      ctx.fillStyle = "#000000";
      if (!this.roman) {
        for (const number of this.numbers) {
          ctx.fillText(number.text, number.x, number.y);
        }
      } else {
        for (const number of this.numbers) {
          rotateFillText(ctx, number.text, number.x, number.y, number.angle);
        }
      }
    }

    //時計の針の描画
    for (const hands of this.clockHands) {
      ctx.lineWidth = hands.thickness;
      ctx.strokeStyle = hands.color;
      const position = hands.position;
      ctx.beginPath();
      ctx.moveTo(position.behindX, position.behindY);
      ctx.lineTo(position.tipX, position.tipY);
      ctx.stroke();
    }

    //時計の中心部の描画
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.#radius * 0.02, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
  }
}

export default Clock;
