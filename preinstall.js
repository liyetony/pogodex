const fs = require("fs-extra")
const child = require("child_process")

console.log("Cloning Pokemon Go Unity Assets")
fs.emptyDirSync("assets")
child.execSync("git clone https://github.com/ZeChrales/PogoAssets.git assets", { stdio: 'inherit' })