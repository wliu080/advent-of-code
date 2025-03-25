const fs = require("fs")
const _ = require("lodash")

const inputFile = process.argv[2]
const input = fs.readFileSync(inputFile, "utf-8")

/* Assumptions
 *  - Input is always valid, in correct format
 *
 * Notes for self / reflection
 *  - Part one 20min tests setup, 1hr25min antinode logic, 20min filtering / parsing result
 *      - initial thoughts:
 *          - maybe just read the input as a map of coordinates, e.g, 'a': [{0,2}, {1,4}, ...] and then find the translations between every coord
 *  - Part two
 */

console.log("=== pt1 ===")
console.log(partOne(input.trim()))
console.log("===========================")
console.log("=== pt2 ===")
//console.log(partTwo(input.trim()))
console.log("========================")

function partOne(input) {
    const [map, metadata] = toMap(input)
    let masterAntinodes = []

    // calculate antinodes
    metadata.keys.forEach((key) => {
        masterAntinodes.push(...deriveAntinodes(map[key]))
    })

    // remove any that are out of bounds
    masterAntinodes = constrainBy(metadata.rowBounds, metadata.colBounds, masterAntinodes)

    return _.uniqWith(masterAntinodes, _.isEqual).length
}

function constrainBy(rowBounds, colBounds, masterAntinodes) {
    return masterAntinodes.filter((antinode) => {
        return antinode.row >= 0 && antinode.row < rowBounds && antinode.col >= 0 && antinode.col < colBounds
    })
}

function deriveAntinodes(coords) {
    let antinodes = []
    for (let i = 0; i < coords.length; i++) {
        const aRow = coords[i].row
        const aCol = coords[i].col
        for (let j = i + 1; j < coords.length; j++) {
            const bRow = coords[j].row
            const bCol = coords[j].col
            const rowDiff = bRow - aRow
            const colDiff = bCol - aCol
            antinodes.push({
                row: aRow - rowDiff,
                col: aCol - colDiff,
            })
            antinodes.push({
                row: bRow + rowDiff,
                col: bCol + colDiff,
            })
        }
    }

    //remove duplicates (when multiple nodes have overlapping antinodes) before returning
    return _.uniqWith(antinodes, _.isEqual)
}

function toMap(input) {
    const regex = /^[a-zA-Z0-9]$/g
    let map = []
    let keys = []
    let mapRows = input.split("\n")
    for (let i = 0; i < mapRows.length; i++) {
        ;[...mapRows[i]].forEach((char, idx) => {
            if (char.match(regex)) {
                if (!map[char]) {
                    // init
                    keys.push(char)
                    map[char] = []
                }
                map[char].push({ row: i, col: idx })
            }
        })
    }

    return [map, { keys: keys, rowBounds: mapRows.length, colBounds: mapRows[0].length }]
}

// Part one test cases
const TEST_FOLDER = "2024/tests/08/"

console.log("--antinode tests--")
const antinodeTestCases = [
    {
        input: [
            { row: 3, col: 3 },
            { row: 3, col: 5 },
        ],
        expected: [
            { row: 3, col: 1 }, // same line
            { row: 3, col: 7 },
        ],
    },
    {
        input: [
            { row: 0, col: 0 },
            { row: 4, col: 0 },
        ],
        expected: [
            { row: -4, col: 0 }, // antinode goes negative
            { row: 8, col: 0 },
        ],
    },
    {
        input: [
            { row: 4, col: 5 },
            { row: 2, col: 1 },
        ],
        expected: [
            { row: 0, col: -3 }, // second node is smaller
            { row: 6, col: 9 },
        ],
    },
    {
        input: [
            { row: 6, col: 2 },
            { row: 3, col: 6 },
        ],
        expected: [
            { row: 9, col: -2 }, // opp diagonals
            { row: 0, col: 10 },
        ],
    },
    {
        input: [
            { row: 2, col: 2 },
            { row: 2, col: 4 },
            { row: 5, col: 5 },
        ],
        expected: [
            { row: 2, col: 0 }, // 3 nodes
            { row: 2, col: 6 },
            { row: -1, col: -1 },
            { row: 8, col: 8 },
            { row: -1, col: 3 },
            { row: 8, col: 6 },
        ],
    },
    {
        input: [
            { row: 2, col: 2 },
            { row: 3, col: 3 },
            { row: 4, col: 4 },
        ],
        expected: [
            { row: 1, col: 1 }, // antinode falls on a node
            { row: 4, col: 4 },
            { row: 0, col: 0 },
            { row: 6, col: 6 },
            { row: 2, col: 2 },
            { row: 5, col: 5 },
        ],
    },
    {
        input: [
            { row: 1, col: 1 },
            { row: 2, col: 2 },
            { row: 3, col: 1 },
            { row: 3, col: 2 },
        ],
        expected: [
            { row: 0, col: 0 }, // antinode falls on another antinode
            { row: 3, col: 3 },
            { row: -1, col: 1 },
            { row: 5, col: 1 },
            { row: -1, col: 0 },
            { row: 5, col: 3 },
            { row: 4, col: 0 },
            { row: 1, col: 3 },
            { row: 1, col: 2 },
            { row: 4, col: 2 },
            { row: 3, col: 0 },
        ],
    },
]
antinodeTestCases.forEach(({ input, expected }, idx) => {
    const result = _.sortBy(deriveAntinodes(input), ["row", "col"])
    const sortedExpected = _.sortBy(expected, ["row", "col"])

    if (!_.isEqual(result, sortedExpected)) {
        console.log(result)
        console.log(sortedExpected)
    }

    console.assert(
        _.isEqual(result, sortedExpected),
        `Test case ${idx + 1} failed: Input ${input}. Expected ${sortedExpected}, got ${result}`
    )
    console.log(`Test case ${idx + 1}:`, _.isEqual(result, sortedExpected) ? "Passed" : "Failed")
})

console.log("--pt1 tests--")
fs.readdir(TEST_FOLDER, (err, files) => {
    if (err) {
        console.error("could not read test files")
        return
    }

    files.forEach((filename, idx) => {
        const file = fs.readFileSync(TEST_FOLDER + filename, "utf-8")
        let expected = Number(file.split("!\n")[0])
        let input = file.split("!\n")[1]

        const result = partOne(input)

        console.assert(
            result === expected,
            `Test case ${idx + 1} failed: Input ${input}. Expected ${expected}, got ${result}`
        )
        console.log(`Test case ${idx + 1}:`, result === expected ? "Passed" : "Failed")
    })
})

// console.log("--pt 2 tests--")
// const partTwoTests = [
//     {
//         input: `190: 10 19
// 3267: 81 40 27
// 83: 17 5
// 156: 15 6
// 7290: 6 8 6 15
// 161011: 16 10 13
// 192: 17 8 14
// 21037: 9 7 18 13
// 292: 11 6 16 20`,
//         expected: 11387,
//     },
// ]
// partTwoTests.forEach(({ input, expected }, index) => {
//     const result = partTwo(input)

//     console.assert(
//         result === expected,
//         `Test case ${index + 1} failed: Input ${input}. Expected ${expected}, got ${result}`
//     )
//     console.log(`Test case ${index + 1}:`, result === expected ? "Passed" : "Failed")
// })
