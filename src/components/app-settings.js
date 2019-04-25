import { connect } from "pwa-helpers/connect-mixin"
import { LitElement, css, html } from "lit-element"
import { store } from "../redux/store"
import { getTimestamp } from "../redux/selectors/content"
import { getTheme } from "../redux/selectors/settings"
import { THEME } from "../redux/modules/settings"
import { setTheme } from "../redux/actions/settings"
import { dataIcon, darkThemeIcon, openNewIcon, gitHubIcon } from "./~icons"
import { fontStyles } from "./~styles"
import "./ui-toggle"
import "./ui-button"

class AppSettings extends connect(store)(LitElement) {
  static get properties() {
    return {
      timestamp: { type: Number },
      theme: { type: String }
    }
  }

  stateChanged(state) {
    this.timestamp = getTimestamp(state),
    this.theme = getTheme(state)
  }

  render() {
    const { timestamp, theme } = this
    
    return html`
      <h1 class="heading fh5">Settings</h1>

      <ui-toggle
        class="setting"
        ?checked="${theme == THEME.DARK}"
        @click="${e => store.dispatch(setTheme(theme === THEME.LIGHT?THEME.DARK:THEME.LIGHT))}">
        <div class="item">
          ${darkThemeIcon}
          <div class="ft">Dark Mode</div>
        </div>
      </ui-toggle>

      <div class="setting item">
        ${dataIcon}
        <div>
          <div class="ft">Last content update</div>
          <div class="fbd2">${timestamp}</div>
        </div>
      </div>

      <a class="setting item"
        target="_blank"
        href="https://github.com/liyetony/pogodex">
        ${gitHubIcon}
        <div class="ft">About</div>
        ${openNewIcon}
      </a>
    `
  }

  static get styles() {
    return [
      fontStyles,
      css`
        .heading { margin: 24px 16px; color: var(--fg1-color); }


        .setting { box-sizing: border-box; padding: 8px 0 }
        ui-toggle.setting { padding-right: 8px }
        .setting:not(:last-child) { border-bottom: 1px solid var(--border-color) }
        .setting:focus { background: var(--focus-color) }

        .item {
          min-height: 56px;
          display: grid;
          grid-template-columns: 56px 1fr 56px;
          align-items: center;
          outline: none;
          text-decoration: none;
          color: var(--fg1-color);
        }
        .item > .icon {
          margin: 16px;
          fill: var(--fg2-color);
          justify-items: center;
        }
        .item > .fbd2 { color: var(--fg2-color) }
      `
    ]
  }
}

window.customElements.define("app-settings", AppSettings)