import { LitElement, html, css } from "lit-element";
import { fontStyles } from "./@styles";
import { dropdownIcon } from "./@icons";

class ZOrder extends LitElement {
  static get properties() {
    return {
      label: { type: String },
      disabled: { type: Boolean },
      order: { type: Number, reflect: true }
    };
  }

  createRenderRoot() {
    return this.attachShadow({ mode: "open", delegatesFocus: true });
  }

  render() {
    const { label, order = 0, disabled } = this;

    const fireChangeEvent = e => {
      const next = order * -1 || 1;
      this.order = next;
      this.dispatchEvent(
        new CustomEvent("change", { detail: next, composed: true })
      );
    };

    return html`
      <div class="label">
        <i class="asc" ?hidden="${order != 1}">${dropdownIcon}</i>
        <span class="fbd2">${label}</span>
        <i class="dsc" ?hidden="${order != -1}">${dropdownIcon}</i>
      </div>
      <button
        aria-label="${label}"
        ?disabled="${disabled}"
        @click="${fireChangeEvent}"
      ></button>
    `;
  }

  static get styles() {
    return [
      fontStyles,
      css`
        :host {
          height: 56px;
          position: relative;
          display: inline-flex;
          flex-direction: column;
          outline: none;
          padding: 0 8px;
        }

        .label {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        i {
          display: flex;
          margin: 0 8px;
          color: inherit;
        }

        i.asc {
          transform: rotate(180deg);
        }

        .icon {
          height: 18px;
          width: 18px;
          fill: currentColor;
        }

        i[hidden] {
          opacity: 0;
        }

        button {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          opacity: 0;
        }

        @media (hover: hover) {
          :host(:hover) {
            background: var(--bgr-h);
          }
        }

        :host(:focus) {
          background: var(--bgr-f);
        }

        :host([disabled]) {
          color: var(--fgd);
          background: var(--bgd);
        }

        :host([disabled]) i {
          opacity: 0;
        }
      `
    ];
  }
}

window.customElements.define("z-order", ZOrder);
