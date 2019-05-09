import { LitElement, html, css } from "lit-element";
import { shadowStyles } from "./@styles";

class ZSwitch extends LitElement {
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
      <slot></slot>
      <div class="switch">
        <div class="track"></div>
        <div class="ring focus"></div>
        <div class="knob z1"></div>
      </div>
      <input
        type="checkbox"
        aria-label="${label}"
        .checked="${checked}"
        ?disabled="${disabled}"
        @change="${toggleChecked}"
      />
    `;
  }

  static get styles() {
    return [
      shadowStyles,
      css`
        :host {
          position: relative;
          display: flex;
          align-items: center;
          outline: none;
          box-sizing: border-box;
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
        .switch {
          position: relative;
          width: 40px;
          height: 40px;
          pointer-events: none;
          touch-action: none;
          box-sizing: border-box;
        }
        .track {
          position: absolute;
          top: 12px;
          left: 2px;
          width: 36px;
          height: 16px;
          background: var(--fgd);
          border-radius: 8px;
          overflow: hidden;
        }
        .track:before {
          content: "";
          display: block;
          width: 36px;
          height: 16px;
          background: var(--bga-f);
          will-change: transform;
          transition: transform 0.1s var(--standard-easing);
          transform: translate(-100%, 0);
        }

        .knob {
          z-index: 1;
          position: relative;
          top: 10px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--bg0);
          will-change: transform;
          transition: transform 0.1s var(--standard-easing);
        }

        .ring {
          position: absolute;
          width: 40px;
          height: 40px;
          top: 0px;
          left: -10px;
          background: var(--bgr-f);
          border-radius: 50%;
          opacity: 0;
          will-change: transform;
          transition: transform 0.1s var(--standard-easing);
        }

        :host(:focus) .ring {
          opacity: 1;
        }

        :host([checked]) .track {
          background: none;
        }

        :host([checked]) .track:before {
          transform: translate(0);
        }

        :host([checked]) .ring {
          background: var(--bga-f);
          transform: translate(20px, 0);
        }

        :host([checked]) .knob {
          transform: translate(20px, 0);
          background: var(--bgp);
        }

        :host([disabled]) .track {
          background: var(--disabled-color);
        }

        ::slotted(*) {
          padding-right: 8px;
          margin-right: auto;
        }
      `
    ];
  }
}

window.customElements.define("z-switch", ZSwitch);
