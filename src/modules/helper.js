/**
 * Delay processing of function until function is no longer called for a set amount of time.
 * @param {*} fn - function to execute
 * @param {*} time - wait time
 */
export function debounce(fn, time = 100) {
  let timeout;

  return function () {
    const functionCall = () => fn.apply(this, arguments);
    clearTimeout(timeout);
    timeout = setTimeout(functionCall, time);
  }
}


/**
 * Perform a deep copy of an object
 * @param {Object} obj - object to copy.
 * @returns {Object} deeply copied object
 */
export function deepCopy(obj = {}) {
  return JSON.parse(JSON.stringify(obj))
}


/**
 * Calculate percent.
 * @param {Number} val - value
 * @param {Number} max - max value
 * @returns {Number} percent
 */
export function getPercent(val, max) {
  return Math.round(Number(val) / Number(max) * 100);
}

/**
 * Native lazy loading <img> support status.
 * @see https://addyosmani.com/blog/lazy-loading/
 * @constant
 * @readonly
 * @type {Boolean}
 */
export const supportsNativeLazyImages = "loading" in HTMLImageElement.prototype

/**
 * Intersection Observer support status.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 * @constant
 * @readonly
 * @type {Boolean}
 */
export const supportsIntersectionObserver = "IntersectionObserver" in window


/**
 * Create an intersection observer that will lazy load images, as they enter the viewport.
 * @returns {IntersectionObserver} observer
 */
export function createLazyImageIntersectionObserver () {
  if (!supportsNativeLazyImages && supportsIntersectionObserver) {
    return new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          observer.unobserve(img)
        }
      })
    })
  }
}

/**
 * Apply lazy loading to <img> elements.
 */
export function lazyLoadImages (observer, images) {
  if (observer)
    images.forEach(img => observer.observe(img))
  else
    images.forEach(img => img.src = img.dataset.src)
}