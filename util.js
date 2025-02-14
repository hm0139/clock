export function rotateFillText(ctx, text, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

export function stringToBoolean(str) {
  return str == "true" ? true : false;
}

export function addDate(date, addYear, addMonth, addDate) {
  const cloneDate = new Date(date.getTime());
  cloneDate.setFullYear(cloneDate.getFullYear() + addYear);
  cloneDate.setMonth(cloneDate.getMonth() + addMonth);
  cloneDate.setDate(cloneDate.getDate() + addDate);
  return cloneDate;
}
