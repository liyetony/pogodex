# PoGo Pokedex

[![Build Status](https://travis-ci.com/liyetony/pogodex.svg?branch=master)](https://travis-ci.com/liyetony/pogodex)

### A <abbr title="progressive web app">PWA</abbr> to supplement Pokemon Go.
### [https://pogodex.withan.app](https://pogodex.withan.app)

## Overview
On its own, **Pokemon Go** is already a battery draining mobile game. Looking up pokemon details on non-optimized websites only *intensifies* battery costs.
**PoGo Pokedex** intends to do better by being **performant**, all while providing a pleasant user experience.



## Content Sources
- Pokemon Go **images** and **game data** are pulled from
  [PoGo Unity Assets](https://github.com/ZeChrales/PogoAssets) repository.
- List of **exclusive moves** is maintained in a
  [Google Sheets document](https://docs.google.com/spreadsheets/d/1UEFmGd2JRrW1mFr8qtR1Sh2V0zeDOZ8v-ccB9hpde-A/edit?usp=sharing).



## Installation
1. Ensure [Node.js](https://nodejs.org/en/) is at least version ```12.1.0``` to 
   [support experimental modules](https://medium.com/@nodejs/announcing-a-new-experimental-modules-1be8d2d6c2ff).
2. Install [Polymer CLI](https://www.npmjs.com/package/polymer-cli) to develop and build PWA.
3. Clone repository and install package dependencies:
   ```sh
   $ npm install
   ```



## Development
Command                | Description
---------------------- | -----------
```$ npm run update``` | updates web app content and assets
```$ npm start```      | starts development server for web app
```$ npm test```       | run all tests
```$ npm test:update```| run ```mocha``` tests for content update process
```$ npm build```      | build pwa using ```polymer CLI```
```$ npm preinstall``` | clear ```/assets``` directory and clone unity assets repositorvy