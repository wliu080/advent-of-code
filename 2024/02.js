const fs = require("fs")

const inputFile = process.argv[2]
const input = fs.readFileSync(inputFile, "utf-8")

/* Assumptions
 *  - Input is always valid, in correct format
 *  - Each report will always have at least 1 level
 *
 * Notes for self / reflection
 *  - Part one took (so far: reading problem + approach one (using .every) 20min, .reduce approach 15min)
 *    - On first glance, wanted to just do a reduce, but we want to break early if it changes from increasing to decreasing or vice versa
 *    - Spent some time doing it as a .every and just breaking out early but reduce is so much of what we want and I think ultimately it doesn't really matter since each individual report is never too long
 *  - Part two took
 */

//const reports = partOne(input.trim())
const reports = isSafe([1, 2, 7, 8, 9])

// Calculate diff for each
console.log("#safe reports")
console.log(reports)
console.log("============")

function partOne(input) {}

function isSafe(report) {
    // must be all be increasing or decreasing (can't stay the same level)
    // adjacent levels can't be too different (1-3)

    let isPrevIncreasing
    return report.reduce((prevLevel, nextLevel, idx) => {
        console.log("checking prev[%d] next[%d] idx[%d]", prevLevel, nextLevel, idx)

        // if we have failed already, pass through
        if (prevLevel === false) {
            return false
        }

        // check if we change directions from increasing to decreasing or vice versa

        // check adjacent level differences
        let diff = Math.abs(prevLevel - nextLevel)
        if (diff < 1 || diff > 3) {
            return false
        }

        // if we are at the end and no fails, report is safe
        if (idx === report.length - 1) {
            return true
        } else {
            return nextLevel
        }
    })
}
