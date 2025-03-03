const fs = require("fs")

const inputFile = process.argv[2]
const input = fs.readFileSync(inputFile, "utf-8")

/* Assumptions
 *  - Input is always valid, in correct format
 *  - Each report will always have at least 1 level
 *
 * Notes for self / reflection
 *  - Part one took ~55min (reading problem + approach one (using .every) 20min, .reduce approach 15min, inc/dec check functionality 15min, parsing input 5min)
 *      - On first glance, wanted to just do a reduce, but we want to break early if it changes from increasing to decreasing or vice versa
 *      - Spent some time doing it as a .every and just breaking out early but reduce is so much of what we want and I think ultimately it doesn't really matter since each individual report is never too long
 *      - In hindsight I think .every is probably the way to go, as I won't have to pass a failed case through and it's trivial to access prev given the index and array
 *  - Part two
 *      - Initial thoughts: since you can only tolerate one bad level, if you just remove the value the first time it would fail, would that be sufficient?
 *      - might need to do some test cases here to see, will also need to look up how to do simple tests when everything I've done has been testing frameworks in fully fledged systems
 *      - observations from test cases:
 *          - there is never a gap/diff failure that can be saved by a removal which is also not a asc -> desc -> asc / desc -> asc -> desc type sequence
 *          - it seems like there are cases where only removing the 'prev' or 'next' would make the chain work
 *              - e.g, 1, 3, 2, 4, 5 => detects failure when at 3, 2 (prev inc -> curr dec), if you remove 'prevLevel' or 'nextLevel' at this point it would still work
 *              - e.g, 1, 3, 2, 6, 7 => detects failure when at 3, 2 but if you remove 'prevLevel', would then fail due to diff between 2, 6, so must remove 'nextLevel'
 *              - e.g, 9, 7, 8, 4, 3 => detects failure when at 7, 8 but if you remove 'nextLevel', would then fail due to diff between 8, 4 so must remove 'prevLevel'
 *              - e.g, 3, 1, 2, 3, 4 => detects failure when at 1, 2 but only passes if you remove 3, which is 'prevprev?' when at failure detection
 *          - when failure detected ('prev', 'next') then lookahead (edit - lookahead got too confusing, easier to just run it again without one of the elements and see if they now pass)
 *      -
 *    - time taken: so far 20min on test cases, 30min refactor to .every and problem solving, 15min for loop, 20min for the case where 'prevprev' actually needs to be removed
 */

const reports = parseReports(input.trim())

console.log("====== #safe reports =======")
console.log(reports.filter(isSafe).length)
console.log("============================")

console.log("#safe reports with tolerance")
console.log(reports.filter(isSafeWithTolerance, 0).length)
console.log("============================")

// parses string input and returns a list of reports (list of numbers)
function parseReports(input) {
    const lines = input.split("\n")
    return lines.map((line) => {
        const reportLine = line.split(" ")
        return reportLine.map((level) => {
            return Number(level)
        })
    })
}

/**
 * Checks a report for safety based on the following:
 * - levels must all be either increasing or decreasing
 * - the difference between adjacent levels can't be less than 1 (i.e, the same number) or more than 3
 *
 * @param {Array<number>} report
 * @returns {boolean} True if the report is considered safe
 */
function isSafe(report) {
    function isValidDiff(diff) {
        const absoluteDiff = Math.abs(diff)
        return absoluteDiff >= 1 && absoluteDiff <= 3
    }

    function isDirectionChanged(diff, isPrevIncreasing) {
        const isCurrentlyIncreasing = diff < 0
        return isPrevIncreasing != null && isPrevIncreasing != isCurrentlyIncreasing
    }

    let isPrevIncreasing = null
    return report.every((nextLevel, idx, array) => {
        if (idx === 0) return true

        const prevLevel = array[idx - 1]
        const diff = prevLevel - nextLevel

        // check adjacent level differences
        if (!isValidDiff(diff)) {
            return false
        }

        // check if we change directions from increasing to decreasing or vice versa
        if (isDirectionChanged(diff, isPrevIncreasing)) {
            return false
        }

        isPrevIncreasing = diff < 0
        return true
    })
}

/**
 * Checks a report for safety with tolerance based on the following:
 * - levels must all be either increasing or decreasing
 * - the difference between adjacent levels can't be less than 1 (i.e, the same number) or more than 3
 * - a single 'bad' level can be safely ignored, if the report still passes, the report is considered safe
 *
 * @param {Array<number>} report
 * @returns {boolean} True if the report is considered safe
 */
function isSafeWithTolerance(report, failures) {
    function isValidDiff(diff) {
        const absoluteDiff = Math.abs(diff)
        return absoluteDiff >= 1 && absoluteDiff <= 3
    }

    function isDirectionChanged(diff, isPrevIncreasing) {
        const isCurrentlyIncreasing = diff < 0
        return isPrevIncreasing != null && isPrevIncreasing != isCurrentlyIncreasing
    }

    let isPrevIncreasing = null
    for (let i = 1; i < report.length; i++) {
        const prevLevel = report[i - 1]
        const nextLevel = report[i]
        const diff = prevLevel - nextLevel

        if (!isValidDiff(diff) || isDirectionChanged(diff, isPrevIncreasing)) {
            failures++
            if (failures > 1) {
                return false
            }

            // Try removing prevLevel and check validity
            const reportWithoutPrev = report.slice(0, i - 1).concat(report.slice(i))
            if (isSafeWithTolerance(reportWithoutPrev, failures)) {
                return true
            }

            // Try removing nextLevel and check validity
            const reportWithoutNext = report.slice(0, i).concat(report.slice(i + 1))
            if (isSafeWithTolerance(reportWithoutNext, failures)) {
                return true
            }

            // Try the 'rare'? case of removing i-2
            if (report[i - 2]) {
                const reportWithoutPrevPrev = report.slice(0, i - 2).concat(report.slice(i - 1))
                if (isSafeWithTolerance(reportWithoutPrevPrev, failures)) {
                    return true
                }
            }

            return false
        }

        // Update direction tracking
        isPrevIncreasing = diff < 0
    }
    return true
}

// Part two test cases
const partTwoTestCases = [
    { report: [7, 6, 4, 2, 1], expected: true }, // safe without removing
    { report: [1, 2, 7, 8, 9], expected: false }, // fail gap, ascending even with removing
    { report: [9, 7, 6, 2, 1], expected: false }, // fail gap, descending even with removing
    { report: [1, 3, 2, 4, 5], expected: true }, // safe by removing 3 or 2, asc -> desc -> asc
    { report: [8, 6, 4, 4, 1], expected: true }, // safe by removing any 4, desc -> same -> desc
    { report: [1, 3, 6, 7, 9], expected: true }, // safe without removing
    { report: [1, 3, 2, 6, 7], expected: true }, // safe only by removing 2 (the 'next' when at 3,2)
    { report: [9, 7, 8, 4, 3], expected: true }, // safe only by removing 7 (the 'prev' when at 7,8)
    { report: [1, 3, 2, 6, 10], expected: false }, // fails direction & gap
    { report: [3, 1, 2, 3, 4], expected: true }, // safe only by removing 3 (the previous of 'prev')
]

partTwoTestCases.forEach(({ report, expected }, index) => {
    const result = isSafeWithTolerance(report, 0)
    console.assert(
        result === expected,
        `Test case ${index + 1} failed: Input ${JSON.stringify(report)}. Expected ${expected}, got ${result}`
    )
    console.log(`Test case ${index + 1}:`, result === expected ? "Passed" : "Failed")
})
