const fs = require("fs")

const inputFile = process.argv[2]
const input = fs.readFileSync(inputFile, "utf-8")

/* Assumptions
 *  - Input is always valid, in correct format
 *  - Each report will always have at least 1 level
 *
 * Notes for self / reflection
 *  - Part one took ~55min (reading problem + approach one (using .every) 20min, .reduce approach 15min, inc/dec check functionality 15min, parsing input 5min)
 *    - On first glance, wanted to just do a reduce, but we want to break early if it changes from increasing to decreasing or vice versa
 *    - Spent some time doing it as a .every and just breaking out early but reduce is so much of what we want and I think ultimately it doesn't really matter since each individual report is never too long
 *  - Part two took
 */

const reports = partOne(input.trim())

console.log("#safe reports")
console.log(reports.filter(isSafe).length)
console.log("============")

// parses string input and returns a list of reports (list of numbers)
function partOne(input) {
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
    let isPrevIncreasing
    return report.reduce((prevLevel, nextLevel, idx) => {
        // if we have failed already, pass through
        if (prevLevel === false) {
            return false
        }

        const diff = prevLevel - nextLevel

        // check adjacent level differences
        const absoluteDiff = Math.abs(diff)
        if (absoluteDiff < 1 || absoluteDiff > 3) {
            return false
        }

        // check if we change directions from increasing to decreasing or vice versa
        const isCurrentlyIncreasing = diff < 0
        if (isPrevIncreasing != null && isPrevIncreasing != isCurrentlyIncreasing) {
            return false
        }
        isPrevIncreasing = isCurrentlyIncreasing

        // if we are at the end and no fails, report is safe
        if (idx === report.length - 1) {
            console.log("report %s is safe", report)
            return true
        } else {
            return nextLevel
        }
    })
}
