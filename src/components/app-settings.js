import { connect } from "pwa-helpers/connect-mixin";
import { LitElement, css, html } from "lit-element";
import { store } from "../redux/store";
import { getTimestamp } from "../redux/selectors/content";
import { getTheme } from "../redux/selectors/settings";
import { THEME } from "../modules/settings";
import { setTheme } from "../redux/actions/settings";
import { dataIcon, darkThemeIcon, openNewIcon, gitHubIcon } from "./@icons";
import { fontStyles } from "./@styles";
import "./+switch";

class AppSettings extends connect(store)(LitElement) {
  static get properties() {
    return {
      timestamp: { type: Number },
      theme: { type: String }
    };
  }

  stateChanged(state) {
    (this.timestamp = getTimestamp(state)), (this.theme = getTheme(state));
  }

  render() {
    const { timestamp, theme } = this;

    const toggleTheme = () =>
      store.dispatch(
        setTheme(theme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT)
      );

    return html`
      <h1 class="fh5">Settings</h1>

      <z-switch
        class="setting"
        ?checked="${theme == THEME.DARK}"
        @change="${toggleTheme}"
      >
        <div class="item">
          ${darkThemeIcon}
          <div class="ft">Dark Mode</div>
        </div>
      </z-switch>

      <div class="setting item">
        ${dataIcon}
        <div>
          <div class="ft">Last content update</div>
          <div class="fbd2">${timestamp}</div>
        </div>
      </div>

      <a
        class="setting item"
        target="_blank"
        href="https://github.com/liyetony/pogodex"
      >
        ${gitHubIcon}
        <div class="ft">About</div>
        ${openNewIcon}
      </a>
    `;
  }

  static get styles() {
    return [
      fontStyles,
      css`
        :host {
          padding-bottom: calc(64px + var(--bottom));
          color: var(--fgh);
        }

        h1 {
          margin: 32px 16px 16px 16px;
        }

        .setting {
          border-bottom: 1px solid var(--bgb);
          padding-left: 8px;
          padding-right: 16px;
        }

        a.setting {
          color: inherit;
          text-decoration: none;
          outline: none;
        }

        a.setting:focus {
          background: var(--bgr-f);
        }

        .icon {
          flex: 0 0 auto;
          fill: var(--fgl);
        }

        .item {
          min-height: 64px;
          padding-top: 8px;
          padding-bottom: 8px;
          display: flex;
          align-items: center;
          box-sizing: border-box;
        }

        .item .icon:first-child {
          padding: 8px;
          margin-right: 8px;
        }

        .item :nth-child(2) {
          margin-right: auto;
        }
      `
    ];
  }
}

window.customElements.define("app-settings", AppSettings);
