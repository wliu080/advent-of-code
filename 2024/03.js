const fs = require("fs")

const inputFile = process.argv[2]
const input = fs.readFileSync(inputFile, "utf-8")

/* Assumptions
 *  - Input is always valid, in correct format
 *
 * Notes for self / reflection
 *  - Part one
 *      - 20min reading problem + test cases, seems like standard regex stuff which I will need to refresh / remember
 *      - 25min regex / solving part one, found out about ?? (nullish coalescing operator) which was handy
 *      - there's probably a better way to extract the values with capture groups like MatchALl maybe but haven't played with it
 *  - Part two
 *      - 30min reading + solving, not much different to part one. I'm sure a trickier but shorter solution would be some super complicated regex maybe
 */

console.log("=== sum of mul commands ===")
console.log(executeMulCommands(input))
console.log("===========================")
console.log("=== pt2 conditionals ===")
console.log(executeCommandsWithConditionals(extractCommands(input)))
console.log("========================")

function executeMulCommands(input) {
    const regex = /mul\(\d+,\d+\)/g
    return (input.match(regex) ?? []).map(calculateMul).reduce((acc, curr) => acc + curr, 0)
}

function extractCommands(input) {
    const regex = /mul\(\d+,\d+\)|don't\(\)|do\(\)/g
    return input.match(regex) ?? []
}

function executeCommandsWithConditionals(commands) {
    let ignore = false
    let total = 0
    commands.forEach((command) => {
        if (command === "don't()") {
            ignore = true
        } else if (command === "do()") {
            ignore = false
        } else {
            // assuming no other types of commands

            if (!ignore) {
                total += calculateMul(command)
            }
        }
    })
    return total
}

function calculateMul(command) {
    const regex = /\d+/g
    const mulValues = command.match(regex)
    return mulValues[0] * mulValues[1]
}

// // Part one test cases
// const partOneTestCases = [
//     { memory: "xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))", expected: 161 }, // sample from challenge
//     { memory: "mul(3,9)", expected: 27 }, // simple no errors case
//     { memory: "mul( 2,4)", expected: 0 }, // no spaces allowed within mul
//     { memory: "mul(4*mul(1,8))", expected: 8 }, // ignore malformed mul
//     { memory: "mul(1,mul(5,4))", expected: 20 }, // ignore mul that wraps other mul (assumption)
//     { memory: "mul(6,9!", expected: 0 },
// ]

// partOneTestCases.forEach(({ memory, expected }, index) => {
//     const total = executeMulCommands(memory)

//     console.assert(
//         total === expected,
//         `Test case ${index + 1} failed: Input ${JSON.stringify(memory)}. Expected ${expected}, got ${total}`
//     )
//     console.log(`Test case ${index + 1}:`, total === expected ? "Passed" : "Failed")
// })

// Part one test cases
const partTwoTestCases = [
    { memory: "xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))", expected: 48 }, // sample from challenge
    { memory: "mul(3,9)don't()mul(1,4)", expected: 27 }, // simple disable
    { memory: "do()mul(7,2)", expected: 14 }, // should be fine with starting do() also
    { memory: "don't()mul(1,3)", expected: 0 }, // disabled from start
    { memory: "don't()don't()do()msdfsfmul(4,5)", expected: 20 }, // only most recent do/don't applies
    { memory: "don'tdon't()domsdfsfmul(4,5)", expected: 0 }, // only obey do/don't commands with ()
]

partTwoTestCases.forEach(({ memory, expected }, index) => {
    const commands = extractCommands(memory)
    const total = executeCommandsWithConditionals(commands)

    console.assert(
        total === expected,
        `Test case ${index + 1} failed: Input ${JSON.stringify(memory)}. Expected ${expected}, got ${total}`
    )
    console.log(`Test case ${index + 1}:`, total === expected ? "Passed" : "Failed")
})
