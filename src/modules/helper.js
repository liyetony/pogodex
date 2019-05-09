/**
 * Delay processing of function until function is no longer called for a set amount of time.
 * @param {*} fn - function to execute
 * @param {*} time - wait time
 */
export function debounce(fn, time = 100) {
  let timeout;

  return function() {
    const functionCall = () => fn.apply(this, arguments);
    clearTimeout(timeout);
    timeout = setTimeout(functionCall, time);
  };
}

/**
 * Perform a deep copy of an object
 * @param {Object} obj - object to copy.
 * @returns {Object} deeply copied object
 */
export function deepCopy(obj = {}) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Calculate percent.
 * @param {Number} val - value
 * @param {Number} max - max value
 * @returns {Number} percent
 */
export function getPercent(val, max) {
  return Math.round((Number(val) / Number(max)) * 100);
}
