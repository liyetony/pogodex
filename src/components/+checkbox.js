import { LitElement, html, css } from "lit-element";
import { checkboxIcon, checkboxActiveIcon } from "./@icons";
import { shadowStyles, fontStyles } from "./@styles";

class ZCheckbox extends LitElement {
  static get properties() {
    return {
      label: { type: String },
      checked: { type: Boolean, reflect: true },
      disabled: { type: Boolean, reflect: true }
    };
  }

  createRenderRoot() {
    return this.attachShadow({ mode: "open", delegatesFocus: true });
  }

  render() {
    const { label, checked, disabled } = this;

    const toggleChecked = e => {
      const isChecked = e.currentTarget.checked;
      this.checked = isChecked;
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: isChecked,
          composed: true
        })
      );
    };

    return html`
      <i class="checkbox">
        ${checked ? checkboxActiveIcon : checkboxIcon}
      </i>
      <div class="fbd2">${label}</div>
      <input
        type="checkbox"
        aria-label="${label}"
        .checked="${checked}"
        ?disabled="${disabled}"
        @change="${toggleChecked}"
      />
      </i>
    `;
  }

  static get styles() {
    return [
      fontStyles,
      shadowStyles,
      css`
        :host {
          position: relative;
          min-height: 40px;
          display: flex;
          align-items: center;
          outline: none;
          box-sizing: border-box;
          color: var(--fgh);
        }

        .checkbox {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          transition: background 0.1s var(--standard-easing);
        }

        .icon {
          fill: var(--fgl);
          padding: 8px;
        }

        input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          opacity: 0;
        }

        :host(:focus) .checkbox {
          background: var(--bgr-f);
        }

        :host([checked]) .icon {
          fill: var(--fgp);
        }

        :host([checked]:focus) .checkbox {
          background: var(--bga-f);
        }

        :host([disabled]) {
          color: var(--fgd);
        }

        :host([disabled]) .icon {
          fill: var(--fgd);
        }

        :host([disabled]) ::slotted(*) {
          color: var(--fgd);
        }
      `
    ];
  }
}

window.customElements.define("z-checkbox", ZCheckbox);
