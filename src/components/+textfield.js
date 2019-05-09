import { LitElement, html, css } from "lit-element";
import { fontStyles } from "./@styles";

class ZTextfield extends LitElement {
  static get properties() {
    return {
      label: { type: String },
      value: { type: String },
      type: { type: String, reflect: true },
      min: { type: Number, reflect: true },
      max: { type: Number, reflect: true },
      required: { type: Boolean, reflect: true },
      active: { type: Boolean, reflect: true },
      disabled: { type: Boolean, reflect: true }
    };
  }

  createRenderRoot() {
    return this.attachShadow({ mode: "open", delegatesFocus: true });
  }

  updated(change) {
    // element is active with non empty values
    if (change.has("value"))
      this.active = Boolean(this.value) && this.value != "";
  }

  render() {
    const {
      label,
      value = "",
      type = "text",
      min,
      max,
      required,
      disabled
    } = this;

    const hint = required ? "required" : "";

    const fireChangeEvent = e => {
      const value = e.currentTarget.value;
      this.value = value;
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: value,
          composed: true
        })
      );
    };

    return html`
      <input
        id="input"
        class="ffr fnw fbd1"
        aria-label="${label}"
        .type="${type}"
        .value="${value}"
        .min="${min}"
        .max="${max}"
        ?disabled="${disabled}"
        @input="${fireChangeEvent}"
      />
      <label class="label fnw fbd2" for="input">${label}</label>
      <div class="hint fc">${hint}</div>
    `;
  }

  static get styles() {
    return [
      fontStyles,
      css`
        :host {
          position: relative;
          display: inline-block;
          outline: none;
          background: var(--bg0);
          color: var(--fgh);
          overflow: hidden;
        }

        .label {
          position: absolute;
          top: 8px;
          left: 0;
          display: flex;
          align-items: center;
          height: 20px;
          padding: 0 4px;
          margin: 8px 4px;
          background: inherit;
          will-change: transform;
          transform-origin: top left;
          transition: transform 0.2s var(--standard-easing);
          pointer-events: none;
          touch-action: none;
        }

        .hint {
          height: 16px;
          color: var(--fgl);
          text-transform: none;
        }

        input {
          box-sizing: border-box;
          width: 100%;
          height: 40px;
          padding: 0 8px;
          margin-top: 8px;
          border: 1px solid var(--bgb);
          outline: none;
          background: inherit;
          color: inherit;
        }

        input:focus {
          border-color: var(--fgp);
        }

        :host(:focus) .label {
          color: var(--fgp);
        }

        :host(:focus) .label,
        :host([active]) .label {
          transform: translate(2px, calc(-50% - 8px)) scale(0.9);
        }

        :host([disabled]) {
          pointer-events: none;
          touch-events: none;
          color: var(--fgd);
        }

        input[disabled] {
          border-color: transparent;
          background: var(--bgd);
        }

        :host([disabled]) .label {
          background: none;
        }

        :host([disabled]) .hint {
          opacity: 0;
        }
      `
    ];
  }
}

window.customElements.define("z-textfield", ZTextfield);
