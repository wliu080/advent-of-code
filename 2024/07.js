const fs = require("fs")

const inputFile = process.argv[2]
const input = fs.readFileSync(inputFile, "utf-8")

/* Assumptions
 *  - Input is always valid, in correct format
 *
 * Notes for self / reflection
 *  - Part one 15min thinking through problem, 15min tests, 50min solving problem 1
 *      - initial thoughts:
 *          - i wonder if this will run into performance issues in pt2, so far just + / *, 2^(N-1) but will become 3^ or 4^
 *          - no immediate obvious improvements over just trying out combinations immediately come to mind, so should just do that first
 *          - perhaps jumping to mults more if numbers are low? but arguments aren't necessarily sorted either
 *
 *  - Part two
 *
 */

console.log("=== pt1 ===")
console.log(partOne(input.trim()))
console.log("===========================")
console.log("=== pt2 ===")
//console.log(partTwo(input.trim()))
console.log("========================")

function partOne(input) {
    const calibrationEquations = readEquations(input)
    let successfulEquations = []
    let opsAttempted = 0

    calibrationEquations.forEach((eq) => {
        for (let i = 0; i < Math.pow(2, eq.arguments.length - 1); i++) {
            if (execOperation(eq.target, eq.arguments, generateOperands(eq.arguments.length - 1, i))) {
                console.log(
                    "successful: [%s]= %s, %s",
                    eq.target,
                    eq.arguments,
                    generateOperands(eq.arguments.length - 1, i)
                )
                successfulEquations.push(Number(eq.target))
                break
            }
            opsAttempted += 1
        }
    })

    console.log("finished after [%s] operations", opsAttempted)
    return successfulEquations.reduce((prev, next) => prev + next)
}

function generateOperands(desiredLength, index) {
    // if we have more operations in part2 can change the base from base2, but maybe this way of doing it is a bit too clever for its own good?
    const binaryString = index.toString(2).padStart(desiredLength, "0")
    return Array.from(binaryString).map((bit) => {
        return bit === "0" ? add : mult
    })
}

function readEquations(input) {
    return input.split("\n").map((line) => {
        let partials = line.split(": ")
        return {
            target: Number(partials[0]),
            arguments: partials[1].split(" ").map(Number),
        }
    })
}

function execOperation(target, arguments, operandFunctions) {
    console.assert(
        arguments.length === operandFunctions.length + 1,
        `Mismatch between number of arguments(${arguments.length}) and operandFunctions(${operandFunctions.length})`
    )

    const result = arguments.reduce((prev, next, idx) => {
        return operandFunctions[idx - 1](prev, next)
    })
    return Number(target) === result
}

function add(a, b) {
    return Number(a) + Number(b)
}

function mult(a, b) {
    return Number(a) * Number(b)
}

// Part one test cases

const execOperationsTests = [
    { input: { target: 5, arguments: [3, 2], opFuncs: [add] }, expected: true }, // basic add - pass
    { input: { target: 100000, arguments: [8, 130], opFuncs: [add] }, expected: false }, // basic add - fail
    { input: { target: 20, arguments: [2, 10], opFuncs: [mult] }, expected: true }, // basic mult - pass
    { input: { target: 0, arguments: [6, 8], opFuncs: [mult] }, expected: false }, // basic mult - fail
    { input: { target: 23, arguments: [2, 4, 6, 9], opFuncs: [mult, add, add] }, expected: true }, // multi op
]

console.log("--Exec op tests--")
execOperationsTests.forEach(({ input, expected }, index) => {
    const result = execOperation(input.target, input.arguments, input.opFuncs)

    console.assert(
        result === expected,
        `Test case ${index + 1} failed: Input ${input}. Expected ${expected}, got ${result}`
    )
    console.log(`Test case ${index + 1}:`, result === expected ? "Passed" : "Failed")
})

console.log("--pt 1 tests--")
const partOneTests = [
    {
        input: `190: 10 19
3267: 81 40 27
83: 17 5
156: 15 6
7290: 6 8 6 15
161011: 16 10 13
192: 17 8 14
21037: 9 7 18 13
292: 11 6 16 20`,
        expected: 3749,
    },
]
partOneTests.forEach(({ input, expected }, index) => {
    const result = partOne(input)

    console.assert(
        result === expected,
        `Test case ${index + 1} failed: Input ${input}. Expected ${expected}, got ${result}`
    )
    console.log(`Test case ${index + 1}:`, result === expected ? "Passed" : "Failed")
})

// // Part two test cases
// const test2Input1 = fs.readFileSync("2024/tests/06/1.txt", "utf-8")
// const test2Input2 = fs.readFileSync("2024/tests/06/2.txt", "utf-8")
// const test2Input3 = fs.readFileSync("2024/tests/06/3.txt", "utf-8")
// const test2Input4 = fs.readFileSync("2024/tests/06/4.txt", "utf-8")
// const test2Input5 = fs.readFileSync("2024/tests/06/5.txt", "utf-8")
// const test2Input6 = fs.readFileSync("2024/tests/06/6.txt", "utf-8")
// const test2Input7 = fs.readFileSync("2024/tests/06/7.txt", "utf-8")
// const test2Input8 = fs.readFileSync("2024/tests/06/8.txt", "utf-8")
// const test2Input9 = fs.readFileSync("2024/tests/06/9.txt", "utf-8")
// const test2Input10 = fs.readFileSync("2024/tests/06/10.txt", "utf-8")
// const test2Input11 = fs.readFileSync("2024/tests/06/11.txt", "utf-8")
// const test2Input12 = fs.readFileSync("2024/tests/06/12.txt", "utf-8")

// const partTwoTestCases = [
//     { input: test2Input1, expected: 6 }, // test case from challenge
//     { input: test2Input2, expected: 1 }, // simple loop when obstacle is first placement
//     { input: test2Input3, expected: 1 }, // simple loop when obstacle is second placement
//     { input: test2Input4, expected: 1 }, // simple loop when obstacle is third placement
//     { input: test2Input5, expected: 1 }, // simple loop when obstacle is last placement
//     { input: test2Input6, expected: 0 }, // loop only if obstacle could be placed on starting
//     { input: test2Input7, expected: 1 }, // loop which traps the guard
//     { input: test2Input8, expected: 2 }, // nested loop
//     { input: test2Input9, expected: 2 }, // loop is just going up and down
//     { input: test2Input10, expected: 2 }, // loop is not a simple rectangle
//     { input: test2Input11, expected: 2 }, // 1 loop that looks like two possible configurations if placed later during guard movements
//     { input: test2Input12, expected: 0 }, // no loops that block off the starting path (i.e obstacle placed mid way that causes a loop but can no longer be accessed)
// ]

// console.log("--Part two tests--")
// partTwoTestCases.forEach(({ input, expected }, idx) => {
//     const result = partTwo(input, idx)

//     console.assert(result === expected, `Test case ${idx + 1} failed: Expected ${expected}, got ${result}`)
//     console.log(`Test case ${idx + 1}:`, result === expected ? "Passed" : "Failed")
// })
