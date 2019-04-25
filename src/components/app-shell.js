import { connect } from "pwa-helpers/connect-mixin"
import { installRouter } from "pwa-helpers/router"
import { updateMetadata } from "pwa-helpers/metadata"
import { LitElement, css, html } from "lit-element"
import { store } from "../redux/store"
import { isContentReady } from "../redux/selectors/content"
import { getTheme } from "../redux/selectors/settings"
import { getPage, getMetadata, getSnackbar, getPokemonId } from "../redux/selectors/session"
import { isSearching } from "../redux/selectors/session.search"
import { updateRoute } from "../redux/actions/session"
import { ROUTE } from "../redux/modules/session"
import { fontStyles } from "./~styles"
import { loadMainContent, loadPokemonContent } from "../redux/actions/content"
import { filterTextIcon, appraisalIcon, pokedexIcon, settingsIcon, iconStyle } from "./~icons"
import "./snack-bar"

function manageRoute(location) {
  // redirect root path to pokedex
  if (location.pathname === ROUTE.HOME)
    replacePage(ROUTE.POKEDEX)

  window.scrollTo(0, 0)
  store.dispatch(updateRoute(location))
}

function replacePage(route) {
  const origin = window.location.origin
  window.history.replaceState("", "", `${origin}${route}`)
  manageRoute(window.location)
}

class AppShell extends connect(store)(LitElement) {
  static get properties() {
    return {
      loading: { type: Boolean },
      theme: { type: String, reflect: true },
      searching: { type: Boolean },
      page: { type: String },
      pid: { type: String },
      metadata: { type: Object },
      snackbar: { type: Object },
    }
  }

  stateChanged(state) {
    this.loading = isContentReady(state)
    this.theme = getTheme(state)
    this.page = getPage(state)
    this.pid = getPokemonId(state)
    this.searching = isSearching(state)
    this.metadata = getMetadata(state)
    this.snackbar = getSnackbar(state)
  }

  firstUpdated() {
    store.dispatch(loadMainContent())
    store.dispatch(loadPokemonContent())
    installRouter(manageRoute)
    this.addEventListener("unset:pokemon",
      e => replacePage(this.page || ROUTE.POKEDEX))
    this.addEventListener("set:pokemon", 
      e => replacePage(`${this.page || ROUTE.POKEDEX}#${e.detail}`))
  }

  updated(change) {
    updateMetadata(this.metadata)
  }

  render() {
    const { pid, searching, page, snackbar } = this

    const show = key => !searching && key === page

    return html`
      <div id="background"></div>

      <snack-bar ?show="${snackbar.show}">${snackbar.msg}</snack-bar>
      
      ${this.navTemplate}

      <app-error class="view" ?show="${show(ROUTE.ERROR)}"></app-error>
      <app-settings class="view" ?show="${show(ROUTE.SETTINGS)}"></app-settings>
      <app-search class="view" ?show="${searching}"></app-search>
      <pokemon-list class="view" ?show="${!pid && show(ROUTE.POKEDEX)}"></pokemon-list>
      <pokemon-entry class="view" ?show="${pid && show(ROUTE.POKEDEX)}"></pokemon-entry>
      <pokemon-appraisal class="view" ?show="${show(ROUTE.APPRAISAL)}"></pokemon-appraisal>
      <pokemon-cpfilter class="view" ?show="${show(ROUTE.CP_FILTER)}"></pokemon-cpfilter>
    `
  }

  get navTemplate() {
    const { page, pid } = this
    const hash = pid ? `#${pid}` : ""


    return html`
      <nav class="nav">
        <a class="nav-link fst"
          href="${ROUTE.POKEDEX}${hash}"
          ?active="${page === ROUTE.POKEDEX}">
          ${pokedexIcon}
          <span>Pokedex</span>
        </a>
        <a class="nav-link fst"
          href="${ROUTE.APPRAISAL}${hash}"
          ?active="${page === ROUTE.APPRAISAL}">
          ${appraisalIcon}
          <span>Appraisal</span>
        </a>
        <a class="nav-link fst"
          href="${ROUTE.CP_FILTER}${hash}"
          ?active="${page === ROUTE.CP_FILTER}">
          ${filterTextIcon}
          <span>CP Filter</span>
        </a>
        <a class="nav-link fst"
          href="${ROUTE.SETTINGS}"
          ?active="${page === ROUTE.SETTINGS}">
          ${settingsIcon}
          <span>Settings</span>
        </a>
      </nav>
    `
  }

  static get styles() {
    return [
      iconStyle,
      fontStyles,
      css`
        :host {
          --bg1-color: var(--bg1-color-light);
          --bg2-color: var(--bg2-color-light);
          --fg1-color: var(--fg1-color-on-light);
          --fg2-color: var(--fg2-color-on-light);
          --fg3-color: var(--fg3-color-on-light);
          --primary-color: var(--primary-color-on-light);
          --border-color: var(--border-color-on-light);
          --border3-color: var(--border3-color-on-light);
          --focus-color: var(--focus-color-on-light);
          --left: 0px;
          --bottom: 64px;

          display: grid;
          grid-template-columns: 1fr [mid] minmax(min-content, 1280px) 1fr;
          grid-auto-rows: min-content;
        }

        :host([theme="dark"]) {
          --bg1-color: var(--bg1-color-dark);
          --bg2-color: var(--bg2-color-dark);
          --fg1-color: var(--fg1-color-on-dark);
          --fg2-color: var(--fg2-color-on-dark);
          --fg3-color: var(--fg3-color-on-dark);
          --primary-color: var(--primary-color-on-dark);
          --border-color: var(--border-color-on-dark);
          --border3-color: var(--border3-color-on-dark);
          --focus-color: var(--focus-color-on-dark);
        }

        #background {
          z-index: -1;
          position: fixed;
          left: -25vw; top: -25vh;
          width: 150vw; height: 150vh;
          background: var(--bg1-color);
        }

        snack-bar { z-index: 1 }

        .nav {
          z-index: 5;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          display: grid;
          grid-template: var(--bottom) / repeat(auto-fit, minmax(80px, 1fr));
          background: var(--bg2-color);
          color: var(--fg2-color);
          box-shadow:
            0 2px 4px -1px rgba(0,0,0,.2),
            0 4px 5px 0 rgba(0,0,0,.14),
            0 1px 10px 0 rgba(0,0,0,.12)
        }
        .nav-link {
          display: flex;
          flex-flow: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: inherit;
          padding: 0 12px;
          outline: none;
        }
        .nav-link:focus { background: var(--focus-color) }
        .nav-link[active] { color: var(--primary-color) }
        .nav-link > .icon { margin: 2px }

        .view { grid-column: mid }
        .view:not([show]) { display: none }

        @media (min-width: 640px) {
          :host {
            --left: 96px;
            --bottom: 0px;
            padding-left: var(--left);
          }
          .nav {
            top: 16px;
            right: auto;
            bottom: auto;
            grid-template: repeat(4, 64px) / 80px;
            grid-gap: 4px;
            background: none;
            box-shadow: none;
            
          }
          .nav-link {
            padding: 0;
            border-top-right-radius: 12px;
            border-bottom-right-radius: 12px;
          }
        }
      `
    ]
  }
}

window.customElements.define("app-shell", AppShell)