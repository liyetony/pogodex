import Listr from "listr"
import { initContext } from "./data/curator/context.js"
import { loadStrings } from "./data/curator/strings.js"
import { updatePokemonImages } from "./data/curator/images.js"
import { updateKeymap, buildContent } from "./data/curator/content.js"
import { exportData } from "./data/curator/export.js"

// create and execute series of tasks to complete update
const tasks = new Listr([
  { task: loadStrings,              title: "load strings" },
  { task: updatePokemonImages,      title: "update pokemon images" },
  { task: updateKeymap,             title: "update gamemaster keymap" },
  { task: buildContent,             title: "build data from gamemaster file" },
  { task: exportData,               title: "export data" }
])
tasks.run(initContext()).catch(err => console.error())