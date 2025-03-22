const fs = require("fs")

const inputFile = process.argv[2]
const input = fs.readFileSync(inputFile, "utf-8")

/* Assumptions
 *  - Input is always valid, in correct format
 *  - pt2: map initially has no infinite loops
 *
 * Notes for self / reflection
 *  - Part one 10min thinking about problem + countObj func | 1hr on step-by-step simulation | 2hr debugging it (when it was already working correctly, oops)
 *      - initial thoughts: just simulate it? should try make it so i can reuse function that checks if guard is still on board with counting X
 *      - already spent 1hr on step by step but getting the wrong answer, need to debug problem
 *      - edit: keep getting back the same answer despite trying other solutions / rewriting sections, turns out i must've pasted the answer incorrectly the first time because the same number i am getting back each time *is* correct after all
 *  - Part two 40min test cases, 2hr for logic / recursive function
 *      - intial thoughts: in theory I guess once a guard hits a turn you need to somehow find a rectangle of obstacles?
 *          > but I guess that is hard to determine one when the obstacle should be on the 2nd 'turn' of the rectangle and even harder on the first
 *          > having every possible surrounding square be checked each step would probably take forever
 *          > will prob need to change up how im doing testing for this one since it seems pretty complex, but can refactor it after
 *          > just realised a loop is not necessarily a rectangle, could be more complicated loops
 *          > checking a loop while traversing is just a matter of checking if we have already visited a spot in the same facing direction
 *          > i definitely need more practice on recursive functions... also unfortunately i need to rerun the whole map traversal from the beginning for each obstacle placement attempt
 *              > test 11.txt 'X' marks a spot where if you are just placing obstacles as you go and checking from then on, a loop could be created, but if you ran from the beginning you would no longer be able to reach it, because the obstacle blocks it
 *              > this is for cases with crossing paths / partial back tracking but im not sure how to eliminate it without checking from the beginning
 */

const GUARD_CHARS = ["^", ">", "v", "<"]
const OBSTACLE = "#"
const NEW_OBSTACLE = "!"
const OUT_OF_BOUNDS = "OOB"

console.log("=== sum of correct middle pages ===")
console.log(partOneRewrite(input.trim()))
console.log("===========================")
console.log("=== pt2 ===")
console.log(partTwo(input.trim()))
console.log("========================")

function partOneRewrite(input) {
    // direction: 0 = ^, 1 = >, 2 = v, 3 = <
    //    next -> r-1,c; r,c+1; r+1,c; r,c-1
    const nextStep = [
        [-1, 0],
        [0, 1],
        [1, 0],
        [0, -1],
    ]

    const map = toMap(input)
    let visited = new Set()

    let [row, col, dir] = findStart(map)
    do {
        visited.add(`${row}, ${col}`)
        let nextRow = row + nextStep[dir][0]
        let nextCol = col + nextStep[dir][1]
        if (checkSpace(map, nextRow, nextCol) === OBSTACLE) {
            dir = (dir + 1) % 4
        } else {
            row = nextRow
            col = nextCol
        }
    } while (checkSpace(map, row, col) !== OUT_OF_BOUNDS)

    return visited.size
}

function findStart(map) {
    let start = []
    map.some((row, rowIdx) => {
        return row.some((char, colIdx) => {
            if (GUARD_CHARS.includes(char)) {
                start = [rowIdx, colIdx, GUARD_CHARS.indexOf(char)]
                return true
            }
        })
    })
    return start
}

function printMap(map) {
    map.forEach((row) => {
        console.log(row.join(""))
    })
}

function toMap(input) {
    return input.split("\n").map((row) => {
        // convert to array
        return [...row]
    })
}

function checkSpace(map, frontRow, frontCol) {
    const rowBounds = map.length - 1
    const colBounds = map[0].length - 1

    // if out of bounds guard will 'leave'
    if (frontRow < 0 || frontRow > rowBounds || frontCol < 0 || frontCol > colBounds) {
        return OUT_OF_BOUNDS
    } else {
        return map[frontRow][frontCol]
    }
}

function partTwo(input, testIdx) {
    const map = toMap(input)

    const [startRow, startCol] = findStart(map) // starting point cannot be an obstacle location

    let loopCausingObstacles = traverseMap(testIdx, map, { row: startRow, col: startCol })
    return loopCausingObstacles.size
}

function traverseMap(testIdx, map, start, obstacle) {
    // direction: 0 = ^, 1 = >, 2 = v, 3 = <
    //    next -> r-1,c; r,c+1; r+1,c; r,c-1
    const nextStep = [
        [-1, 0],
        [0, 1],
        [1, 0],
        [0, -1],
    ]

    let visited = new Set()
    let loopCausingObstacles = new Set()
    let [row, col, dir] = findStart(map)

    do {
        if (visited.has(`${row}, ${col}, ${dir}`)) {
            loopCausingObstacles.add(`${obstacle.row}, ${obstacle.col}`)
            return loopCausingObstacles
        }

        visited.add(`${row}, ${col}, ${dir}`)
        let nextRow = row + nextStep[dir][0]
        let nextCol = col + nextStep[dir][1]
        if ([OBSTACLE, NEW_OBSTACLE].includes(checkSpace(map, nextRow, nextCol))) {
            dir = (dir + 1) % 4
        } else {
            // can't have an obstacle be placed on starting position
            if (
                !obstacle &&
                (nextRow !== start.row || nextCol !== start.col) &&
                checkSpace(map, nextRow, nextCol) !== OUT_OF_BOUNDS
            ) {
                let testMap = JSON.parse(JSON.stringify(map))
                testMap[nextRow][nextCol] = NEW_OBSTACLE

                loopCausingObstacles = loopCausingObstacles.union(
                    traverseMap(testIdx, testMap, start, { row: nextRow, col: nextCol })
                )
            }

            row = nextRow
            col = nextCol
        }
    } while (checkSpace(map, row, col) !== OUT_OF_BOUNDS)
    return loopCausingObstacles
}

// Part one test cases
const testInput1 = fs.readFileSync("2024/tests/06/1.txt", "utf-8")

const partOneTestCases = [
    { input: testInput1, expected: 41 }, // test case from challenge
]

console.log("--Part one tests--")
partOneTestCases.forEach(({ input, expected }, index) => {
    const result = partOneRewrite(input)

    console.assert(
        result === expected,
        `Test case ${index + 1} failed: Input file tests/06/${index + 1}.txt. Expected ${expected}, got ${result}`
    )
    console.log(`Test case ${index + 1}:`, result === expected ? "Passed" : "Failed")
})

// Part two test cases
const test2Input1 = fs.readFileSync("2024/tests/06/1.txt", "utf-8")
const test2Input2 = fs.readFileSync("2024/tests/06/2.txt", "utf-8")
const test2Input3 = fs.readFileSync("2024/tests/06/3.txt", "utf-8")
const test2Input4 = fs.readFileSync("2024/tests/06/4.txt", "utf-8")
const test2Input5 = fs.readFileSync("2024/tests/06/5.txt", "utf-8")
const test2Input6 = fs.readFileSync("2024/tests/06/6.txt", "utf-8")
const test2Input7 = fs.readFileSync("2024/tests/06/7.txt", "utf-8")
const test2Input8 = fs.readFileSync("2024/tests/06/8.txt", "utf-8")
const test2Input9 = fs.readFileSync("2024/tests/06/9.txt", "utf-8")
const test2Input10 = fs.readFileSync("2024/tests/06/10.txt", "utf-8")
const test2Input11 = fs.readFileSync("2024/tests/06/11.txt", "utf-8")
const test2Input12 = fs.readFileSync("2024/tests/06/12.txt", "utf-8")

const partTwoTestCases = [
    { input: test2Input1, expected: 6 }, // test case from challenge
    { input: test2Input2, expected: 1 }, // simple loop when obstacle is first placement
    { input: test2Input3, expected: 1 }, // simple loop when obstacle is second placement
    { input: test2Input4, expected: 1 }, // simple loop when obstacle is third placement
    { input: test2Input5, expected: 1 }, // simple loop when obstacle is last placement
    { input: test2Input6, expected: 0 }, // loop only if obstacle could be placed on starting
    { input: test2Input7, expected: 1 }, // loop which traps the guard
    { input: test2Input8, expected: 2 }, // nested loop
    { input: test2Input9, expected: 2 }, // loop is just going up and down
    { input: test2Input10, expected: 2 }, // loop is not a simple rectangle
    { input: test2Input11, expected: 2 }, // 1 loop that looks like two possible configurations if placed later during guard movements
    { input: test2Input12, expected: 0 }, // no loops that block off the starting path (i.e obstacle placed mid way that causes a loop but can no longer be accessed)
]

console.log("--Part two tests--")
partTwoTestCases.forEach(({ input, expected }, idx) => {
    const result = partTwo(input, idx)

    console.assert(result === expected, `Test case ${idx + 1} failed: Expected ${expected}, got ${result}`)
    console.log(`Test case ${idx + 1}:`, result === expected ? "Passed" : "Failed")
})
