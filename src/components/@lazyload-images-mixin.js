const supportsNativeLazyImages = "loading" in HTMLImageElement.prototype;
const supportsIntersectionObserver = "IntersectionObserver" in window;

/**
 * Mixin to add in lazy loading <img> images.
 *
 * Supports native image lazy loading
 * @see https://addyosmani.com/blog/lazy-loading/
 *
 * Supports intersection observer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 *
 * @param {HTMLElement} baseLitElement - base class
 */
export const lazyloadsImages = baseLitElement =>
  class extends baseLitElement {
    connectedCallback() {
      super.connectedCallback();

      // create an intersection observer for <img> elements
      if (!supportsNativeLazyImages && supportsIntersectionObserver) {
        this._imgObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              observer.unobserve(img);
            }
          });
        });
      }
    }

    /**
     * Lazy load <img> elements.
     * Call this in the 'updated' lifecycle hook.
     */
    lazyLoadImages() {
      const images = this.renderRoot.querySelectorAll("img[loading='lazy']");
      if (this._imgObserver)
        images.forEach(image => {
          this._imgObserver.observe(image);
        });
      else
        images.forEach(image => {
          image.src = image.dataset.src;
        });
    }
  };
