import fs from "fs-extra"
import { expect } from "chai"
import { initContext, defaultPaths } from "../../data/curator/context.js"
import { loadStrings } from "../../data/curator/strings.js"
import { updatePokemonImages } from "../../data/curator/images.js"
import { updateKeymap, calcGeneration, getFormName, buildContent } from "../../data/curator/content.js"
import { pokemonImageFlag } from "../../data/curator/flags.js"
import { exportData } from "../../data/curator/export.js"

const paths = {
  logDir: "test/fs/logs",
  dataDir: "test/fs/data",
  textSrc: "assets/static_assets/txt/merged #6.txt",
  pokemonImageSrcDir: "assets/pokemon_icons",
  pokemonImageOutDir: "test/fs/pokemonImages",
  gamemasterSrc: "assets/gamemaster/gamemaster.json",
  exclusiveMovesUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSq5HHNNYBD8ZJ5M2n-ebscY0j1LmV356tRLmRzAG3oXUr_IRg_hO4dOji6Eu8hZfuzzklh_kO7tDD_/pub?gid=0&single=true&output=csv"

}

describe("update pokemon content", function() {
  this.timeout(5000)
  const context = initContext(paths)

  before(() => fs.emptyDirSync("test/fs"))

  describe("setup context", () => {
    it("should load default paths given no arguments", () => {
      const context = initContext()
      expect(context.paths).to.equal(defaultPaths)
    })

    it("should have 'paths' property", () => {
      expect(context).have.property("paths")
    })

    it("should have 'keymap' property", () => {
      expect(context).have.property("keymap")
    })

    it("should have 'strings' property", () => {
      expect(context).have.property("strings")
    })

    it("should have 'pokemonImageFlags' property", () => {
      expect(context).have.property("pokemonImageFlags")
    })

    it("should have 'content' property", () => {
      expect(context).have.property('content')
    })

    it("should have 'pokemonContent' property", () => {
      expect(context).have.property('pokemonContent')
    })

    it("should have 'ignoredTemplates' property", () => {
      expect(context).have.property('ignoredTemplates')
    })
  })

  describe("load in game text", () => {
    let totalStrings
    before("loadStrings(context)", done => {
      loadStrings(context)
        .then(total => totalStrings = total)
        .catch(err => done(err))
        .finally(done)
    })

    it("should throw an error given malformed context", () => {
      expect(loadStrings).to.throw("Invalid context provided")
    })

    it("should update context.strings", () => {
      expect(totalStrings).to.be.above(0)
      expect(context.strings).to.be.an('object').that.is.not.empty
    })
  })

  describe("update pokemon images", () => {
    before("clear pokemon image output directory", () => {
      fs.emptyDirSync(paths.pokemonImageOutDir)
    })
    
    let totalCopied
    before("updatePokemonImages(context)", done => {
      updatePokemonImages(context)
        .then(tasks => totalCopied = tasks.reduce((sum, copy) => sum + copy, 0))
        .catch(err => done(err))
        .finally(done)
    })

    it("should throw an error given malformed context", () => {
      expect(updatePokemonImages).to.throw("Invalid context provided")
    })

    it("should initially copy all images to empty output directory", () => {
      const hasOutputDir = fs.existsSync(paths.pokemonImageOutDir)
      const sourceCount = fs.readdirSync(paths.pokemonImageSrcDir).length
      const outputCount = fs.readdirSync(paths.pokemonImageOutDir).length

      expect(hasOutputDir).to.be.ok
      expect(totalCopied).to.equal(sourceCount)
      expect(outputCount).to.equal(sourceCount)
    })

    it("should update context.pokemonImageFlags", () => {
      expect(context.pokemonImageFlags).to.be.an('object').that.is.not.empty
    })

    it("should not copy any images with no difference between source and output", done => {
      updatePokemonImages(context)
        .then(tasks => {
          const totalCopied = tasks.reduce((sum, copy) => sum + copy, 0)
          expect(totalCopied).to.equal(0)
        })
        .catch(err => done(err))
        .finally(done)
    })

    it("should copy altered images to output directory", done => {
      const context = initContext({
        ...paths,
        pokemonImageSrcDir: "test/integration/alteredPokemonImages"
      })
      updatePokemonImages(context)
        .then(tasks => {
          const totalCopied = tasks.reduce((sum, copy) => sum + copy, 0)
          expect(totalCopied).to.equal(4)
        })
        .catch(err => done(err))
        .finally(done)
    })

    after("empty pokemon output directory", () => {
      fs.emptyDirSync(paths.pokemonImageOutDir)
    })
  })

  describe("update gamemaster keymap", () => {
    before(() => updateKeymap(context))

    it("should throw an error given malformed context", () => {
      expect(updateKeymap).to.throw("Invalid context provided")
    })

    it("should update context.keymap.types", () => {
      expect(context.keymap.types).to.be.an('object').that.is.not.empty
    })

    it("should update context.keymap.weather", () => {
      expect(context.keymap.weather).to.be.an('object').that.is.not.empty
    })

    it("should update context.keymap.moves", () => {
      expect(context.keymap.moves).to.be.an('object').that.is.not.empty
    })

    it("should update context.keymap.pokemon", () => {
      expect(context.keymap.pokemon).to.be.an('object').that.is.not.empty
    })
  })

  describe("build content", () => {
    before("buildContent(context)", () => buildContent(context))
    let pokemonList
    before("list pokemon", () => {
      pokemonList = Object.keys(context.content.pokemon)
        .filter(key => !context.content.pokemon[key].extend)
        .map(key => {
          const {base, ...pokemon} = {
            ...context.content.pokemon[key],
            ...context.pokemonContent[key]
          }
          const fallback = {
            ...context.content.pokemon[base] || {},
            ...context.pokemonContent[base] || {}
          }

          let info = { ...fallback, ...pokemon }
          
          if (!info.img && fallback.img)
            info.img = fallback.img | pokemonImageFlag.base
          
          return info
        })

    })
    
    it("should throw an error given malformed context", () => {
      expect(buildContent).to.throw("Invalid context provided")
    })

    it("should update context.content.combat", () => {
      const prop = context.content.combat
      expect(prop.attackBuffMultiplier).to.be.an("array").that.is.not.empty
      expect(prop.defenseBuffMultiplier).to.be.an("array").that.is.not.empty
      expect(prop.attackMultiplierFromWeather).to.be.a("number").that.is.not.null
    })

    it("should update context.content.upgrade", () => {
      const prop = context.content.upgrade
      expect(prop.cpMultipliers).to.be.an("array").that.is.not.empty
      expect(prop.candyCosts).to.be.an("array").that.is.not.empty
      expect(prop.stardustCosts).to.be.an("array").that.is.not.empty
      expect(prop.stardustCostLuckyScalar).to.be.a("number").that.is.not.null
    })

    it("should update context.content.encounters", () => {
      const prop = context.content.encounters
      expect(prop.every(enc => "lvs" in enc)).to.be.true
      expect(prop.some(enc => "weatherLvBons" in enc || "weatherMinIV" in enc)).to.be.true
    })

    it("should update context.content.weather", () => {
      const prop = context.content.weather
      expect(prop.every(wc => "types" in wc)).to.be.true
    })

    it("should update context.content.types", () => {
      const prop = context.content.types
      expect(prop.every(t => "weather" in t)).to.be.true
      expect(prop.every(t => t.scalar instanceof Array)).to.be.true
    })

    it("should populate context.content.moves", () => {
      const moves = Object.values(context.content.moves)
      moves.forEach(move => {
        expect(move.name).to.be.a("string").that.is.not.null
        expect(move.type).to.be.a("number").that.is.not.null
        expect(move.gym).to.be.an("array").that.is.lengthOf(2)
        expect(move.battle).to.be.an("array").that.is.lengthOf(2)
        expect(move.time).to.be.an("array").that.is.lengthOf(3)
        if (move.buffs)
          expect(move.buffs).to.be.an("array").that.is.lengthOf(2)
      })
    })

    it("should populate context.content.pokemon", () => {
      pokemonList.forEach(pokemon => {
        expect(pokemon.name).to.be.a("string").that.is.not.null
        expect(pokemon.fam).to.be.a("string").that.is.not.null
        expect(pokemon.gen).to.be.a("number")
        expect(pokemon.rarity).to.satisfy(val => val === undefined || typeof val === "number")
        expect(pokemon.img).to.satisfy(val => val === undefined || typeof val === "number")
        expect(pokemon.types.length).to.be.within(1, 2)
        expect(pokemon.moves).to.be.an("array")
        expect(pokemon.stats).to.be.an("array").that.is.lengthOf(3)
      })
    })

    it("should populate context.pokemonContent", () => {
      pokemonList.forEach(pokemon => {
        expect(pokemon.category).to.be.a("string").that.is.not.null
        expect(pokemon.desc).to.be.a("string").that.is.not.null
        expect(pokemon.gender).to.be.an("array").that.is.lengthOf(3),
          expect(pokemon.weight).to.be.a("number")
        expect(pokemon.height).to.be.a("number")
        expect(pokemon.dist).to.be.a("number")
      })
    })

    describe("calculate pokemon region (generation)", () => {
      const regions = context.content.regions
      const calcGen = pid => calcGeneration(regions, pid)

      it("should map invalid arguments or unclassified pokemon to unknown gen 0", () => {
        const unclassifiedEntry = String(regions[regions.length - 1].last + 1).padStart(4, 0)
        expect(calcGen()).to.equal(0)
        expect(calcGen("0")).to.equal(0)
        expect(calcGen("00")).to.equal(0)
        expect(calcGen("000")).to.equal(0)
        expect(calcGen("0000")).to.equal(0)
        expect(calcGen("00000")).to.equal(0)
        expect(calcGen("000000")).to.equal(0)
        expect(calcGen("x")).to.equal(0)
        expect(calcGen("xx")).to.equal(0)
        expect(calcGen("xxx")).to.equal(0)
        expect(calcGen("xxxx")).to.equal(0)
        expect(calcGen("xxxxx")).to.equal(0)
        expect(calcGen("xxxxxx")).to.equal(0)
        expect(calcGen(unclassifiedEntry)).to.equal(0)
      })

      regions.forEach((region, index) => {
        const getId = num => String(num).padStart(4, 0)
        it(`should map ${region.name} region pokemon to gen ${index}`, () => {
          expect(calcGen(getId(region.first))).to.equal(index)
          expect(calcGen(getId(region.last))).to.equal(index)
        })
      })

      it("should map 1st gen alolan variant pokemon to gen 7", () => {
        const alolans = Object.keys(context.content.pokemon)
          .filter(key => key.slice(4, 6) === "61")
        expect(alolans).satisfies(list => list.every(pid => calcGen(pid) === 7))
      })
    })

    describe("calculate alternate pokemon form name", () => {
      let forms
      
      before(() => forms = Object.keys(context.keymap.pokemon)
        .filter(key => typeof context.keymap.pokemon[key] === "number"))

      it("should properly name multi word forms", () => {
        const pokemon = forms.map(getFormName)
        expect(pokemon.every(p => !p.includes("_"))).to.be.true
      })

      it("should properly name unown forms", () => {
        const pokemon = forms.filter(key => key.startsWith("UNOWN")).map(getFormName)
        expect(pokemon.every(p => !p.includes("_"))).to.be.true
        expect(pokemon).to.include.members(["Unown ?", "Unown !"])
      })

      it("should properly name alolan variants", () => {
        const pokemon = forms
          .filter(key => context.keymap.pokemon[key] === 61)
          .map(getFormName)
        expect(pokemon.every(p => p.includes("Alolan"))).to.be.true
      })
    })
  })

  describe("export data", () => {
    before("clear log and data output directory", () => {
      fs.emptyDirSync(paths.logDir)
      fs.emptyDirSync(paths.dataDir)
    })

    let timestamp
    before("exportData(context)", done => {
      exportData(context)
        .then(_timestamp => timestamp = _timestamp)
        .catch(err => done(err))
        .finally(done)
    })

    it("should throw an error given malformed context", () => {
      expect(exportData).to.throw("Invalid context provided")
    })

    it("should ensure output directories exist", () => {
      expect(fs.existsSync(paths.logDir)).to.be.true
      expect(fs.existsSync(paths.dataDir)).to.be.true
    })

    it("should create log files", () => {
      expect(fs.existsSync(`${paths.logDir}/strings.json`)).to.be.true
      expect(fs.existsSync(`${paths.logDir}/keymap.json`)).to.be.true
      expect(fs.existsSync(`${paths.logDir}/pokemonImageFlags.json`)).to.be.true
      expect(fs.existsSync(`${paths.logDir}/ignoredTemplates.json`)).to.be.true

    })

    it("should generate csv files containing pokemon and move keys", () => {
      expect(fs.existsSync(`${paths.dataDir}/keys/pokemon.csv`)).to.be.true
      expect(fs.existsSync(`${paths.dataDir}/keys/moves.csv`)).to.be.true
    })

    it("should generate content json files", () => {
      expect(fs.existsSync(`${paths.dataDir}/content.json`)).to.be.true
      expect(fs.existsSync(`${paths.dataDir}/content.pokemon.json`)).to.be.true
    })

    it("should add a copy of content json files to history directory", () => {
      expect(fs.existsSync(`${paths.dataDir}/history/${timestamp}.content.json`)).to.be.true
      expect(fs.existsSync(`${paths.dataDir}/history/${timestamp}.content.pokemon.json`)).to.be.true
    })

    it("should not change content json files upon no changes from update", done => {
      exportData(context).then(newTimestamp => {
        const content = fs.readJSONSync(`${paths.dataDir}/content.json`)
        expect(content.timestamp).to.equal(timestamp)
      })
      .catch(err => done(err))
      .finally(done)
    })

    it("should not update history directory upon no changes from update", done => {
      exportData(context).then(newTimestamp => {
        const historyDir = fs.readdirSync(`${paths.dataDir}/history`)
        expect(historyDir).satisfies(list => !list.some(file => file.startsWith(newTimestamp)))
      })
      .catch(err => done(err))
      .finally(done)
    })
  })

  // remove temporary file output directory for testing
  after(() => fs.removeSync("test/fs"))
})