export function $(query) {
  return document.querySelector(query);
}

export function validateInteger(val, positive = true) {
  if (val === null || val === undefined || val === '') return false;

  if (typeof val === 'string') {
    val = Number(val);
  }

  if (isNaN(val) || !Number.isInteger(val)) return false;

  if (positive && val < 0) return false;

  return true;
}

export function validateNumber(val, positive = true) {
  if (val === null || val === undefined || val === '') return false;

  if (typeof val === 'string') {
    val = Number(val);
  }

  if (isNaN(val)) return false;

  if (positive && val < 0) return false;

  return true;
}
