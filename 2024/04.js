const fs = require("fs")

const inputFile = process.argv[2]
const input = fs.readFileSync(inputFile, "utf-8")

/* Assumptions
 *  - Input is always valid, in correct format
 *  - Input grid is always a proper rectangle (no rows or cols with extra values)
 *
 * Notes for self / reflection
 *  - Part one
 *      - 1hr 45min, wasted some time mistakenly doing a version which can snake / change directions during a search and also getting confused between naming things x, y vs row, col (it's 'swapped' for a traditional grid)
 *      - I think splitting it into scanGrid which calls checkSurrounding before calling the recursive function made things a little more confusing for me
 *  - Part two
 *      - 50min, I tried to reuse part one code, but it went in a direction where it didn't quite make sense to do the recursive search
 */

console.log("=== pt1 Puzzle search ===")
console.log(scanGrid("XMAS", puzzleInputToGrid(input.trim())))
console.log("=========================")
console.log("== pt2 X-'MAS' search ===")
console.log(scanGridForX(puzzleInputToGrid(input.trim())))
console.log("========================")

function puzzleInputToGrid(input) {
    const lines = input.split("\n")
    return lines.map((lines) => {
        return lines.trim()
    })
}

/**
 * Looks for scanFor search string in a straight line but can be in any direction and overlap other lines
 * @param {*} grid - array of strings, assumed to be a uniform rectangle (all lines have same length)
 * @returns number of scanFor string sequences found
 */
function scanGrid(scanFor, grid) {
    let totalFound = 0

    grid.forEach((line, rowIdx) => {
        line.split("").forEach((char, colIdx) => {
            if (char === scanFor[0]) {
                // check all directions
                totalFound += checkSurrounding(scanFor, rowIdx, colIdx, grid)
            }
        })
    })
    return totalFound
}

// Starts the recursive function checkDirection for each of the cardinal directions for a given puzzle grid coord
function checkSurrounding(target, rowIdx, colIdx, grid) {
    /*  Scanning in all directions means we want, x-1, y-1, x, y-1, x+1, y-1, .. etc
     *  rowIdx => y direction, colIdx => x direction
     *  x x x
     *  x o x
     *  x x x
     */
    let totalFound = 0

    for (let rowDir = -1; rowDir <= 1; rowDir++) {
        for (let colDir = -1; colDir <= 1; colDir++) {
            // skip original 'center' position
            if (rowDir == 0 && colDir == 0) {
                continue
            }

            // search next char in target search term
            if (checkDirection(target.substring(1), rowIdx, colIdx, rowDir, colDir, grid)) {
                totalFound += 1
            }
        }
    }
    return totalFound
}

/**
 * Recursive function that keeps searching along given rowDir, colDir direction within grid bounds, stating at rowIdx, colIdx.
 * If found, the function is called again in same direction for the next character in target.
 *
 * @param {*} target The full target search string to be found, only the first char is matched per call, recursive loop will pass the target without the first character each loop
 * @param {*} rowIdx The current row of the previously matched char (this is 'y' in traditional grid)
 * @param {*} colIdx The current col of the previously matched char (this is 'x' in traditional grid)
 * @param {*} rowDir Number representing row direction, assumed to be either -1, 0, 1
 * @param {*} colDir Number representing col direction, assumed to be either -1, 0, 1
 * @param {*} grid The full puzzle grid
 * @returns True only if the full target search string has been exhausted (i.e, a match found in the given direction for the full target string)
 */
function checkDirection(target, rowIdx, colIdx, rowDir, colDir, grid) {
    const boundCols = grid[0].length - 1
    const boundRows = grid.length - 1

    const nextRowIdx = rowIdx + rowDir
    const nextColIdx = colIdx + colDir

    if (!target) {
        // exhausted the target search, which means we've found a match
        return true
    }

    if (nextRowIdx < 0 || nextRowIdx > boundRows || nextColIdx < 0 || nextColIdx > boundCols) {
        return false
    }

    if (grid[nextRowIdx][nextColIdx] == target[0]) {
        return checkDirection(target.substring(1), nextRowIdx, nextColIdx, rowDir, colDir, grid)
    }
}

/**
 * Looks for "MAS" in an X pattern from given grid, string can be 'forwards' (MAS) or 'backwards' (SAM) and can cross over other X patterns
 * @param {*} grid - array of strings, assumed to be a uniform rectangle (all lines have same length)
 * @returns number of MAS in X patterns found
 */
function scanGridForX(grid) {
    let totalFound = 0

    grid.forEach((line, rowIdx) => {
        line.split("").forEach((char, colIdx) => {
            // if we find the center 'A' we check the diagonals
            if (char === "A" && checkX(rowIdx, colIdx, grid)) {
                totalFound += 1
            }
        })
    })
    return totalFound
}

function checkX(rowIdx, colIdx, grid) {
    /*  Scanning in all diagonals means we want
     *  rowIdx => y direction, colIdx => x direction
     *  a - b
     *  - o -
     *  b - a
     * a (rowIdx-1, colIdx-1 && rowIdx+1, colIdx+1) needs to be a matching pair ('M' and 'X')
     * b (rowIdx-1, colIdx+1 && rowIdx+1, colIdx-1) needs to be a matching pair ('M' and 'X')
     */

    // check bounds
    if (isXOutOfBounds(rowIdx, colIdx, grid)) {
        return 0
    }

    // check backslash '\'
    const topLeft = grid[rowIdx - 1][colIdx - 1] || ""
    const botRight = grid[rowIdx + 1][colIdx + 1] || ""
    const backSlashSearch = ["M", "S"].every((val) => {
        return val == topLeft || val == botRight
    })
    // check forward slash '/'
    const topRight = grid[rowIdx - 1][colIdx + 1] || ""
    const botLeft = grid[rowIdx + 1][colIdx - 1] || ""
    const fowardSlashSearch = ["M", "S"].every((val) => {
        return val == topRight || val == botLeft
    })

    return backSlashSearch && fowardSlashSearch
}

function isXOutOfBounds(rowIdx, colIdx, grid) {
    // check if four corners would be out of bounds
    const boundRows = grid.length - 1
    const boundCols = grid[0].length - 1

    return rowIdx < 1 || rowIdx >= boundRows || colIdx < 1 || colIdx >= boundCols
}

// // Part one test cases
// const testCases = [
//     {
//         input: `
//             MMMSXXMASM
//             MSAMXMSMSA
//             AMXSXMAAMM
//             MSAMASMSMX
//             XMASAMXAMM
//             XXAMMXXAMA
//             SMSMSASXSS
//             SAXAMASAAA
//             MAMMMXMMMM
//             MXMXAXMASX`,
//         expected: 18,
//     },
// ]

// testCases.forEach(({ input, expected }, index) => {
//     const test = puzzleInputToGrid(input.trim())
//     const result = scanGrid("XMAS", test)

//     console.assert(
//         result === expected,
//         `Test case ${index + 1} failed: Input ${JSON.stringify(input)}. Expected ${expected}, got ${result}`
//     )
//     console.log(`Test case ${index + 1}:`, result === expected ? "Passed" : "Failed")
// })

// Part two test cases
const testCases = [
    {
        input: `
            MMMSXXMASM
            MSAMXMSMSA
            AMXSXMAAMM
            MSAMASMSMX
            XMASAMXAMM
            XXAMMXXAMA
            SMSMSASXSS
            SAXAMASAAA
            MAMMMXMMMM
            MXMXAXMASX`,
        expected: 9,
    },
    {
        input: `
            XXMXX
            XMASX
            XXSXX
        `,
        expected: 0,
    },
    {
        input: `
            MAS
            ASM
            SMA
        `,
        expected: 0,
    },
    {
        input: `
            MXM
            XAX
            SXS
        `,
        expected: 1,
    },
    {
        input: `
            MXS
            XAX
            MXS
        `,
        expected: 1,
    },
]

testCases.forEach(({ input, expected }, index) => {
    const test = puzzleInputToGrid(input.trim())
    const result = scanGridForX(test)

    console.assert(
        result === expected,
        `Test case ${index + 1} failed: Input ${JSON.stringify(input)}. Expected ${expected}, got ${result}`
    )
    console.log(`Test case ${index + 1}:`, result === expected ? "Passed" : "Failed")
})
