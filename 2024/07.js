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
 *  - Part two 7min complete all with simple brute force method
 *      - initial thoughts:
 *          - I knew it! concat shouldn't be too hard to add, but performance might be pretty bad
 *          - went from 221783 calls to 8695715
 */

console.log("=== pt1 ===")
console.log(partOne(input.trim()))
console.log("===========================")
console.log("=== pt2 ===")
console.log(partTwo(input.trim()))
console.log("========================")

function partOne(input) {
    const calibrationEquations = readEquations(input)
    let successfulEquations = []
    let opsAttempted = 0

    calibrationEquations.forEach((eq) => {
        for (let i = 0; i < Math.pow(2, eq.arguments.length - 1); i++) {
            if (execOperation(eq.target, eq.arguments, generateOperands(eq.arguments.length - 1, i))) {
                // console.log(
                //     "successful: [%s]= %s, %s",
                //     eq.target,
                //     eq.arguments,
                //     generateOperands(eq.arguments.length - 1, i)
                // )
                successfulEquations.push(Number(eq.target))
                break
            }
            opsAttempted += 1
        }
    })

    console.log("finished after [%s] operations", opsAttempted)
    return successfulEquations.reduce((prev, next) => prev + next)
}

function partTwo(input) {
    const calibrationEquations = readEquations(input)
    let successfulEquations = []
    let opsAttempted = 0
    let base = 3

    calibrationEquations.forEach((eq) => {
        for (let i = 0; i < Math.pow(base, eq.arguments.length - 1); i++) {
            if (execOperation(eq.target, eq.arguments, generateOperands(eq.arguments.length - 1, i, base))) {
                // console.log(
                //     "successful: [%s]= %s, %s",
                //     eq.target,
                //     eq.arguments,
                //     generateOperands(eq.arguments.length - 1, i)
                // )
                successfulEquations.push(Number(eq.target))
                break
            }
            opsAttempted += 1
        }
    })

    console.log("finished after [%s] operations", opsAttempted)
    return successfulEquations.reduce((prev, next) => prev + next)
}

function generateOperands(desiredLength, index, base = 2) {
    const binaryString = index.toString(base).padStart(desiredLength, "0")
    return Array.from(binaryString).map((bit) => {
        switch (bit) {
            case "0":
                return add
            case "1":
                return mult
            case "2":
                return concat
            default:
                return add
        }
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

function concat(a, b) {
    return Number(String(a) + String(b))
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

console.log("--pt 2 tests--")
const partTwoTests = [
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
        expected: 11387,
    },
]
partTwoTests.forEach(({ input, expected }, index) => {
    const result = partTwo(input)

    console.assert(
        result === expected,
        `Test case ${index + 1} failed: Input ${input}. Expected ${expected}, got ${result}`
    )
    console.log(`Test case ${index + 1}:`, result === expected ? "Passed" : "Failed")
})
