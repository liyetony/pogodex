# PoGo Pokedex

A progressive web app to supplement Pokemon Go.

### [https://pogodex.withan.app](https://pogodex.withan.app)

## About
PoGo Pokedex is a lightweight web application for inspecting or evaluating pokemon without the need to download a native mobile application or visiting slower websites.

Web app content is generated from two sources:
- [Pokemon Go Unity Assets](https://github.com/ZeChrales/PogoAssets)
- [Pokemon Go Content Spreadsheet](https://docs.google.com/spreadsheets/d/1UEFmGd2JRrW1mFr8qtR1Sh2V0zeDOZ8v-ccB9hpde-A/edit?usp=sharing)

Content is stored as the following JSON files:
- ```/data/content.main.json``` - pokemon details
- ```/data/content.pokemon.json``` - supplementary pokedex entry info


## Installation

1 - Install [Polymer-CLI](https://www.npmjs.com/package/polymer-cli)
```bash
$ npm install -g polymer-cli
```

2 - Clone repository and install dependencies: 

```bash
$ npm install
```

3 - Clone [Pokemon Go Unity Assets](https://github.com/ZeChrales/PogoAssets) to ```/assets``` directory. You can also instead create a symbolic link of the same name to the cloned repository.

4 - Update content by running:

```bash
$ npm run update
```

- Add ```save``` argument to append content to ```/data/versions``` directory.
- Add ```data``` argument to **not** copy pokemon images to ```/images/pokemon```. Use this argument to avoid unecessary pokemon image rewrites.


## Developing

Start up development server:
```bash
$ npm run dev
```

Build web app for deployment by running:
```bash
$ npm run build
```

## Resources
- [pwa-starter-kit](https://pwa-starter-kit.polymer-project.org/)
- [Lit-Element](https://lit-element.polymer-project.org/)
- [lit-html](https://lit-html.polymer-project.org/)
- [Redux](https://redux.js.org/)
- [hammerjs](https://hammerjs.github.io/)