/**
 * テキストを指定された角度で描画
 * @param {CanvasRenderingContext2D} ctx 描画コンテキスト
 * @param {String} text 描画するテキスト
 * @param {Number} x テキストのX座標
 * @param {Number} y テキストのY座標
 * @param {Number} angle テキストの角度（ラジアン）
 */
export function rotateFillText(ctx, text, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

/**
 * 文字列の"true"と"false"をBoolean型に変換
 * @param {String} str 変換する文字列
 * @returns {Boolean} 変換結果
 */
export function stringToBoolean(str) {
  return str == "true" ? true : false;
}

/**
 * 日付の加算
 * @param {Date} date 加算する日付
 * @param {Number} addYear 加算する年
 * @param {Number} addMonth 加算する月
 * @param {Number} addDate 加算する日
 * @returns {Date} 加算された日付
 */
export function addDate(date, addYear, addMonth, addDate) {
  const cloneDate = new Date(date.getTime());
  cloneDate.setFullYear(cloneDate.getFullYear() + addYear);
  cloneDate.setMonth(cloneDate.getMonth() + addMonth);
  cloneDate.setDate(cloneDate.getDate() + addDate);
  return cloneDate;
}
