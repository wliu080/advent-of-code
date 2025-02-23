const fs = require("fs")

const inputFile = process.argv[2]
const input = fs.readFileSync(inputFile, "utf-8")

/* Assumptions
 *  - Lists will always come in matched pairs and in the same format
 *  - The locationIDs are always integers (assume no bad inputs)
 *
 * Nb:
 *  - Part one took 35mins (~25min for parsing, 5min for puzzle logic, 5min tidy up)
 *  - Part two took 10mins
 */

// Parse input into two sorted locationID arrays (lowest to highest)
const [locationListA, locationListB] = parseInput(input.trim())

// Calculate diff for each
console.log("sum of diffs")
console.log(sumDiff(locationListA, locationListB))
console.log("============")

// Calculate similarity score
console.log("similarity score ID x numOccurrences")
console.log(similarityScore(locationListA, locationListB))
console.log("============")

function parseInput(input) {
    let listA = []
    let listB = []

    const lines = input.split("\n")
    lines.forEach((value) => {
        const parsedLine = value.split("   ")
        listA.push(Number(parsedLine[0]))
        listB.push(Number(parsedLine[1]))
    })

    return [listA.sort(), listB.sort()]
}

function sumDiff(listA, listB) {
    return listA
        .map((num, idx) => {
            return Math.abs(num - listB[idx])
        })
        .reduce((prev, next) => {
            return prev + next
        })
}

function similarityScore(listA, listB) {
    // ID * number of occurrences in other list
    return listA
        .map((locA) => {
            return (
                locA *
                listB.filter((locB) => {
                    return locA === locB
                }).length
            )
        })
        .reduce((prev, next) => {
            return prev + next
        })
}
