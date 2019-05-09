import { LitElement, css, html } from "lit-element";

class ZButton extends LitElement {
  static get properties() {
    return {
      label: { type: String },
      toggle: { type: Boolean, reflect: true },
      icon: { type: Boolean, reflect: true },
      active: { type: Boolean, reflect: true },
      disabled: { type: Boolean, reflect: true }
    };
  }

  createRenderRoot() {
    return this.attachShadow({ mode: "open", delegatesFocus: true });
  }

  render() {
    const toggleActive = e => {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: Boolean(this.active),
          composed: true
        })
      );
    };

    return html`
      <slot></slot>
      <button
        aria-label="${this.label}"
        ?active="${this.active}"
        ?disabled="${this.disabled}"
        @click="${toggleActive}"
      ></button>
    `;
  }

  static get styles() {
    return css`
      :host {
        position: relative;
        box-sizing: border-box;
        min-width: 40px;
        min-height: 40px;
        padding: 0 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        outline: none;
        background: none;
        color: var(--fgl);
        transition: all 0.15s var(--standard-easing);
      }

      button {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
      }

      ::slotted(svg) {
        fill: currentColor;
      }

      :host([icon]) {
        min-width: 40px;
        min-height: 40px;
        border-radius: 20px;
      }

      :host([fill]) {
        background: var(--bgp);
        color: var(--fghp);
      }

      :host([active]) {
        color: var(--fgp);
      }

      @media (hover: hover) {
        :host(:hover) {
          background: var(--bgr-h);
        }

        :host([fill]:hover) {
          background: var(--bgp-h);
        }

        :host([active]:hover) {
          background: var(--bga-h);
        }
      }

      :host(:focus) {
        background: var(--bgr-f);
      }

      :host([fill]:focus) {
        background: var(--bgp-f);
      }

      :host([active]:focus) {
        background: var(--bga-f);
      }

      :host([disabled]) {
        background: var(--bgd);
        color: var(--fgd);
        pointer-events: none;
        touch-action: none;
        user-select: none;
      }

      :host([icon][disabled]) {
        background: none;
      }

      :host([hidden]) {
        display: none;
      }
    `;
  }
}

window.customElements.define("z-button", ZButton);
