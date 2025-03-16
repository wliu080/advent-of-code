const fs = require("fs")

const inputFile = process.argv[2]
const input = fs.readFileSync(inputFile, "utf-8")

/* Assumptions
 *  - Input is always valid, in correct format
 *  - Update rules are always odd numbered (such that there is a 'middle' value to sum up)
 *  - assumes no cyclic dependencies for part 2
 *
 * Notes for self / reflection
 *  - Part one (30min problem solving + input parsing, 50min finishing part 1)
 *      - initial thoughts: some kind of hashmap for the ordering rules?, then just check through left to right each number at a time
 *      - need to switch back from checking pagesBefore are valid, to checking pagesAfter (which is more intuitive with the problem anyways)
 *  - Part two
 *      - 10min setting up part two, nice that could resuse quite a bit of part one
 *      - 50min solving (basically all of it was getting lost in the recursive and getting confused for no good reason)
 */

console.log("=== sum of correct middle pages ===")
console.log(sumOfValidMiddlePages(input))
console.log("===========================")
console.log("=== pt2 ===")
console.log(sumOfInvalidMiddlePages(input))
console.log("========================")

/**
 * Splits input into two sections, a map of the page ordering rules and the array of updates
 * then calculates the sum of the middle values of valid updates
 * @param input - The file to be parsed, must be in valid format
 * @returns sum - The sum of the middle values of updates that follow the ordering rules
 */
function sumOfValidMiddlePages(input) {
    const sections = input.split("\n\n")
    const pageOrderingRules = parseOrderingRules(sections[0])
    const updates = parseUpdates(sections[1])

    return updates
        .filter((update) => filterValidUpdates(update, pageOrderingRules))
        .map(mapToMiddleValue)
        .reduce((prev, curr) => prev + curr)
}

/**
 * Splits input into two sections, a map of the page ordering rules and the array of updates
 * then calculates the sum of the middle values of invalid updates (once sorted into correct order)
 * @param input - The file to be parsed, must be in valid format
 * @returns sum - The sum of the corrected middle values of updates that don't originally follow the ordering rules
 */
function sumOfInvalidMiddlePages(input) {
    const sections = input.split("\n\n")
    const pageOrderingRules = parseOrderingRules(sections[0])
    const updates = parseUpdates(sections[1])

    return updates
        .filter((update) => !filterValidUpdates(update, pageOrderingRules))
        .map((update) => reorderUpdates(update, pageOrderingRules))
        .reverse() // not required? but technically list is in the opposite order at this point
        .map(mapToMiddleValue)
        .reduce((prev, curr) => prev + curr)
}

function mapToMiddleValue(array) {
    return array[Math.floor(array.length / 2)]
}

function reorderUpdates(update, pageOrderingRules, currentOrder = []) {
    if (update.length === 1) {
        // last one
        currentOrder.push(update[0])
        return currentOrder
    }

    update.forEach((pageNum, idx) => {
        const applicableRules = pageOrderingRules.get(pageNum) ?? []
        const filteredRules = applicableRules.filter((rule) => {
            return update.includes(rule)
        })

        if (filteredRules.length === 0) {
            // no dependecies need to go after, so put it at the end
            currentOrder.push(pageNum)
            reorderUpdates(update.slice(0, idx).concat(update.slice(idx + 1)), pageOrderingRules, currentOrder)
        }
    })
    return currentOrder
}

function filterValidUpdates(update, pageOrderingRules) {
    let currentPages = []
    return update.every((pageNum) => {
        const isValid = arePagesBeforeValid(pageNum, currentPages, pageOrderingRules)
        if (isValid) {
            currentPages.push(pageNum)
        }
        return isValid
    })
}

/**
 * Reads in a list (separated by \n) of order rules in format X|Y, denoting that X must come before Y.
 * @param input String in the challenge format, where each line is an order rule split by '|'
 * @returns A map where the key are the order rule's X values, and the map values are the corresponding Y values (pages that, if present, must come after)
 */
function parseOrderingRules(input) {
    let orderingMap = new Map()
    input.split("\n").forEach((line) => {
        const lineParts = line.split("|")
        const orderKey = Number(lineParts[0])
        const orderPageAfter = Number(lineParts[1])
        if (!orderingMap.has(orderKey)) {
            orderingMap.set(orderKey, [])
        }

        orderingMap.get(orderKey).push(orderPageAfter)
    })
    return orderingMap
}

function parseUpdates(input) {
    return input.split("\n").map((updateLine) => {
        return updateLine.split(",").map(Number)
    })
}

/**
 * Checks if the given pagesBefore contain any rules that break orderingRules
 * @param {number} currentPage Current page number to be checked
 * @param {number[]} pagesBefore List of pages that have already been checked
 * @returns true if pages before do not break any rules for given page
 */
function arePagesBeforeValid(currentPage, pagesBefore, orderingRules) {
    const applicableRules = orderingRules.get(currentPage) ?? []
    return !pagesBefore.some((page) => {
        return applicableRules.includes(page)
    })
}

// Part one test cases
const testInput1 = fs.readFileSync("2024/inputs/05test1.txt", "utf-8")

const partOneTestCases = [
    { input: testInput1, expected: 143 }, // test case from challenge
]

console.log("Part one tests")
partOneTestCases.forEach(({ input, expected }, index) => {
    const result = sumOfValidMiddlePages(input)

    console.assert(
        result === expected,
        `Test case ${index + 1} failed: Input file 05test${index + 1}.txt. Expected ${expected}, got ${result}`
    )
    console.log(`Test case ${index + 1}:`, result === expected ? "Passed" : "Failed")
})

const partTWoTestCases = [
    { input: testInput1, expected: 123 }, // test case from challenge
]

console.log("Part two tests")
partTWoTestCases.forEach(({ input, expected }, index) => {
    const result = sumOfInvalidMiddlePages(input)

    console.assert(
        result === expected,
        `Test case ${index + 1} failed: Input file 05test${index + 1}.txt. Expected ${expected}, got ${result}`
    )
    console.log(`Test case ${index + 1}:`, result === expected ? "Passed" : "Failed")
})
