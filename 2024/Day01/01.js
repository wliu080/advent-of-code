const fs = require("fs")

const inputFile = process.argv[2]
const input = fs.readFileSync(inputFile, "utf-8")

console.log(input)
