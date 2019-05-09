import { LitElement, html, css } from "lit-element";
import { lazyloadsImages } from "./@lazyload-images-mixin";
import { fontStyles } from "./@styles";
import { ROUTE } from "../modules/session";
class AppError extends lazyloadsImages(LitElement) {
  render() {
    return html`
      <div class="img">
        <img
          loading="lazy"
          title="Confused Psyduck"
          alt="Confused Psyduck"
          data-src="${ROUTE.IMAGES.POKEMON}/0054.png"
        />
        <span class="q1 fh6">?</span>
        <span class="q2 fh6">?</span>
        <span class="q3 fh4">?</span>
      </div>
      <h1 class="fh5">Psyduck?</h1>
      <p class="fbd1">We can't seem to find the page you're looking for.</p>
    `;
  }

  updated() {
    this.lazyLoadImages();
  }

  static get styles() {
    return [
      fontStyles,
      css`
        :host {
          display: grid;
          grid-template: 256px auto auto / 1fr;
          grid-gap: 16px;
          justify-items: center;
          margin: 0 16px;
          margin-bottom: var(--bottom);
        }

        .img {
          position: relative;
          color: var(--fgl);
        }

        .q1 {
          position: absolute;
          top: 128px;
          left: 48px;
        }

        .q2 {
          position: absolute;
          top: 64px;
          left: 80px;
        }

        .q3 {
          position: absolute;
          top: 72px;
          right: 64px;
        }

        h1 {
          text-transform: none !important;
          color: var(--fgh);
          margin: 0;
        }

        p {
          color: var(--fgl);
          margin: 0;
        }
      `
    ];
  }
}

window.customElements.define("app-error", AppError);
