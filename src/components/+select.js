import { LitElement, html, css } from "lit-element";
import { fontStyles } from "./@styles";

class ZSelect extends LitElement {
  static get properties() {
    return {
      label: { type: String },
      options: { type: Array },
      value: { type: String },
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
    const { label, options = [], value = "", required, disabled } = this;

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

    const optionTemplate = (option, index) =>
      html`
        <option value="${index}">${option}</option>
      `;

    return html`
      <select
        id="select"
        class="ffr fnw fbd1"
        aria-label="${label}"
        .value="${value}"
        ?disabled="${disabled}"
        @change="${fireChangeEvent}"
      >
        <option> </option>
        ${options.map(optionTemplate)}
      </select>
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
          outline: none;
          display: flex;
          flex-flow: column;
          background: var(--bg0);
          color: var(--fgh);
          overflow: hidden;
        }

        .label {
          position: absolute;
          top: 10px;
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

        select {
          box-sizing: border-box;
          width: 100%;
          height: 40px;
          padding: 0 4px;
          margin-top: 8px;
          border: 1px solid var(--bgb);
          outline: none;
          background: inherit;
          color: inherit;
        }

        select:focus {
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

        select[disabled] {
          background: var(--bgd);
          border-color: transparent;
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

window.customElements.define("z-select", ZSelect);
