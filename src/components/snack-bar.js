import { LitElement, css, html } from "lit-element";
import { fontStyles, shadowStyles } from "./@styles";

class Snackbar extends LitElement {
  static get properties() {
    return {
      show: { type: Boolean, reflect: true }
    };
  }

  render() {
    return html`
      <div class="snackbar fbd2 z4">
        <slot></slot>
      </div>
    `;
  }

  static get styles() {
    return [
      fontStyles,
      shadowStyles,
      css`
        :host {
          position: fixed;
          left: calc(var(--left) + 8px);
          right: 8px;
          bottom: calc(8px + var(--bottom));
          display: flex;
          justify-content: center;
          will-change: transform;
          transform: translate(0, calc(100% + 8px + var(--bottom)));
          transition: transform 0.2s var(--standard-easing);
          pointer-events: none;
          touch-action: none;
        }

        :host([show]) {
          transform: translate(0, 0);
        }

        .snackbar {
          min-height: 48px;
          min-width: 256px;
          padding: 6px 16px;
          display: flex;
          align-items: center;
          background: #000000dd;
          color: var(--dark-fg1-color);
          border-radius: 4px;
        }
      `
    ];
  }
}

window.customElements.define("snack-bar", Snackbar);
