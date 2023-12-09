const DELAY = 3;

export function checkTod(tod) {
  if ((Date.now() - tod) / 1000 > DELAY) {
    return false;
  }
  return true;
}
