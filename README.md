# PoGo Pokedex

### A progressive web app to supplement Pokemon Go.
### [https://pogodex.withan.app](https://pogodex.withan.app)

PoGo Pokedex was created with emphasis on **high performance** and **easy access**, all while providing a pleasant user experience.

# Contributing

## Google Sheets
Exclusive moves are updated via Google sheets. 
https://docs.google.com/spreadsheets/d/1UEFmGd2JRrW1mFr8qtR1Sh2V0zeDOZ8v-ccB9hpde-A/edit?usp=sharing

## 1. Download Pokemon Go Assets:
Clone [Pokemon Go Unity Assets](https://github.com/ZeChrales/PogoAssets) repository to
```/assets``` folder. Alternatively, you may create a symbolic link directing ```/assets```
to where you saved the respository. This is important, as **content** and **images** are updated by referencing ```/assets```.

## 2. Install dependencies:

### [Node.js](https://nodejs.org/en/) ```12.1.0+```
### [Polymer CLI](https://www.npmjs.com/package/polymer-cli) ```1.9.6+```

## 3. Developing:
To update content:
```bash
$ npm run update
```

To start up a development server:
```bash
$ npm run dev
```

To build web app for deployment:
```bash
$ npm run build
```

# Related Resources
- [pwa-starter-kit](https://pwa-starter-kit.polymer-project.org/)
- [Lit-Element](https://lit-element.polymer-project.org/)
- [lit-html](https://lit-html.polymer-project.org/)
- [Redux](https://redux.js.org/)
- [hammerjs](https://hammerjs.github.io/)