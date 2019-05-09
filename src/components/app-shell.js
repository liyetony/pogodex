import { connect } from "pwa-helpers/connect-mixin";
import { installRouter } from "pwa-helpers/router";
import { updateMetadata } from "pwa-helpers/metadata";
import { LitElement, css, html } from "lit-element";
import { store } from "../redux/store";
import { isContentReady } from "../redux/selectors/content";
import { getTheme } from "../redux/selectors/settings";
import {
  getPage,
  getMetadata,
  getSnackbar,
  getPokemonId
} from "../redux/selectors/session";
import { isSearching } from "../redux/selectors/session.search";
import { updateRoute } from "../redux/actions/session";
import { ROUTE } from "../modules/session";
import { fontStyles } from "./@styles";
import { loadMainContent, loadPokemonContent } from "../redux/actions/content";
import {
  filterTextIcon,
  appraisalIcon,
  pokedexIcon,
  settingsIcon
} from "./@icons";
import "./snack-bar";

function manageRoute(location) {
  // redirect root path to pokedex
  if (location.pathname === ROUTE.HOME) replacePage(ROUTE.POKEDEX);

  window.scrollTo(0, 0);
  store.dispatch(updateRoute(location));
}

function replacePage(route) {
  const origin = window.location.origin;
  window.history.replaceState("", "", `${origin}${route}`);
  manageRoute(window.location);
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
      snackbar: { type: Object }
    };
  }

  stateChanged(state) {
    this.loading = isContentReady(state);
    this.theme = getTheme(state);
    this.page = getPage(state);
    this.pid = getPokemonId(state);
    this.searching = isSearching(state);
    this.metadata = getMetadata(state);
    this.snackbar = getSnackbar(state);
  }

  firstUpdated() {
    store.dispatch(loadMainContent());
    store.dispatch(loadPokemonContent());
    installRouter(manageRoute);
    this.addEventListener("unset:pokemon", e =>
      replacePage(this.page || ROUTE.POKEDEX)
    );
    this.addEventListener("set:pokemon", e =>
      replacePage(`${this.page || ROUTE.POKEDEX}#${e.detail}`)
    );
  }

  updated(change) {
    updateMetadata(this.metadata);
  }

  render() {
    const { pid, searching, page, snackbar } = this;

    const show = key => !searching && key === page;

    return html`
      <div id="background"></div>

      <snack-bar ?show="${snackbar.show}">${snackbar.msg}</snack-bar>

      ${this.navTemplate}

      <app-error class="view" ?show="${show(ROUTE.ERROR)}"></app-error>
      <app-settings class="view" ?show="${show(ROUTE.SETTINGS)}"></app-settings>
      <app-search class="view" ?show="${searching}"></app-search>
      <pokemon-list
        class="view"
        ?show="${!pid && show(ROUTE.POKEDEX)}"
      ></pokemon-list>
      <pokemon-entry
        class="view"
        ?show="${pid && show(ROUTE.POKEDEX)}"
      ></pokemon-entry>
      <pokemon-appraisal
        class="view"
        ?show="${show(ROUTE.APPRAISAL)}"
      ></pokemon-appraisal>
      <pokemon-cpfilter
        class="view"
        ?show="${show(ROUTE.CP_FILTER)}"
      ></pokemon-cpfilter>
    `;
  }

  get navTemplate() {
    const { page, pid } = this;
    const hash = pid ? `#${pid}` : "";

    return html`
      <nav class="nav">
        <a
          class="link fst"
          href="${ROUTE.POKEDEX}${hash}"
          ?active="${page === ROUTE.POKEDEX}"
        >
          ${pokedexIcon}
          <span>Pokedex</span>
        </a>
        <a
          class="link fst"
          href="${ROUTE.APPRAISAL}${hash}"
          ?active="${page === ROUTE.APPRAISAL}"
        >
          ${appraisalIcon}
          <span>Appraisal</span>
        </a>
        <a
          class="link fst"
          href="${ROUTE.CP_FILTER}${hash}"
          ?active="${page === ROUTE.CP_FILTER}"
        >
          ${filterTextIcon}
          <span>CP Filter</span>
        </a>
        <a
          class="link fst"
          href="${ROUTE.SETTINGS}"
          ?active="${page === ROUTE.SETTINGS}"
        >
          ${settingsIcon}
          <span>Settings</span>
        </a>
      </nav>
    `;
  }

  static get styles() {
    return [
      fontStyles,
      css`
        :host {
          display: grid;
          grid-template-columns: 1fr [mid] minmax(min-content, 1280px) 1fr;
          grid-auto-rows: min-content;

          --left: 0px;
          --bottom: 64px;

          --standard-easing: cubic-bezier(0.4, 0, 0.2, 1);
          --decelerate-easing: cubic-bezier(0, 0, 0.2, 1);
          --accelerate-easing: cubic-bezier(0.4, 0, 1, 1);

          --fgp: rgb(0, 105, 120);
          --fge: rgb(176, 0, 32);
          --fgd: rgba(0, 0, 0, 0.38);
          --fgh: rgba(0, 0, 0, 0.87);
          --fgl: rgba(0, 0, 0, 0.6);
          --fgh: rgba(0, 0, 0, 0.87);
          --fghp: rgba(255, 255, 255, 0.87);
          --fghe: rgba(255, 255, 255, 0.87);

          --bgb: rgba(0, 0, 0, 0.14);
          --bgp: rgb(0, 105, 120);
          --bge: rgb(176, 0, 32);
          --bgd: rgba(0, 0, 0, 0.12);
          --bg0: rgb(255, 255, 255);
          --bg1: rgb(255, 255, 255);
          --bg4: rgb(255, 255, 255);
          --bg6: rgb(255, 255, 255);
          --bg8: rgb(255, 255, 255);

          --bgr-h: rgba(0, 0, 0, 0.04);
          --bgr-f: rgba(0, 0, 0, 0.12);
          --bga-h: rgba(0, 105, 120, 0.12);
          --bga-f: rgba(0, 105, 120, 0.24);
          --bgp-h: rgb(20, 117, 131);
          --bgp-f: rgb(61, 141, 152);
        }

        :host([theme="dark"]) {
          --fgp: rgb(128, 222, 234);
          --fge: rgb(207, 102, 121);
          --fgd: rgba(255, 255, 255, 0.38);
          --fgh: rgba(255, 255, 255, 0.87);
          --fgl: rgba(255, 255, 255, 0.6);
          --fghp: rgba(0, 0, 0, 0.87);
          --fghe: rgba(0, 0, 0, 0.87);

          --bgb: rgba(255, 255, 255, 0.14);
          --bgp: rgb(77, 208, 225);
          --bge: rgb(207, 102, 121);
          --bgd: rgba(255, 255, 255, 0.12);
          --bg0: rgb(18, 18, 18);
          --bg1: rgb(29, 29, 29);
          --bg4: rgb(39, 39, 39);
          --bg6: rgb(44, 44, 44);
          --bg8: rgb(45, 45, 45);

          --bgr-h: rgba(255, 255, 255, 0.04);
          --bgr-f: rgba(255, 255, 255, 0.12);
          --bga-h: rgba(128, 222, 234, 0.12);
          --bga-f: rgba(128, 222, 234, 0.24);
          --bgp-h: rgb(122, 220, 233);
          --bgp-f: rgb(166, 232, 240);
        }

        #background {
          z-index: -1;
          position: fixed;
          left: -25vw;
          top: -25vh;
          width: 150vw;
          height: 150vh;
          background: var(--bg0);
        }

        snack-bar {
          z-index: 1;
        }

        .nav {
          z-index: 5;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: grid;
          grid-template: var(--bottom) / repeat(auto-fit, minmax(80px, 1fr));
          background: var(--bg4);
          color: var(--fgl);
          box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2),
            0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12);
        }
        .link {
          display: flex;
          flex-flow: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: inherit;
          padding: 0 12px;
          outline: none;
          fill: currentColor;
        }

        .link[active] {
          color: var(--fgp);
        }

        .link:focus {
          background: var(--bgr-f);
        }

        .link[active]:focus {
          background: var(--bga-f);
        }

        .link > .icon {
          margin: 2px;
        }

        .view {
          grid-column: mid;
        }

        .view:not([show]) {
          display: none;
        }

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
          .link {
            padding: 0;
          }
        }
      `
    ];
  }
}

window.customElements.define("app-shell", AppShell);
