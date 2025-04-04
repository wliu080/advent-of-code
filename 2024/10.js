const fs = require("fs")
const traverseTrailTestCases = require("./tests/10/traverseTrailTests.json")
const pt2TraverseTrailTestCases = require("./tests/10/rateTrailTests.json")
const { pt1E2ETestCases } = require("./tests/10/partOneE2ETests")
const { pt2E2ETestCases } = require("./tests/10/partTwoE2ETests")

const inputFile = process.argv[2]
const input = fs.readFileSync(inputFile, "utf-8")

/* Assumptions
 *  - Input is always valid, in correct format
 *
 * Notes for self / reflection
 *  - Part one 1hr test case update + traversal function, 40min traversal function
 *      - thoughts
 *          - do we need to worry about cyclic loops?
 *          - I think can do a recursive function here but it'll get real slow in a big map with lots of branching paths
 *          - had to debug for a bit there, need to be stricter in type handling
 *  - Part two
 *      - thoughts
 *          - i guess instead of a Set of trailends, we keep a Set of paths?
 *
 *  - Reflections
 *      - in hindsight i definitely could've just done pt1 & pt2 all in one method
 *      - never thought of destructuring for optional objects in a function param (found it in an example when trying to figure out something else)
 *
 */

const TRAILHEAD = 0
const TRAILEND = 9

console.log("=== pt1 ===")
console.log(partOne(input.trim()))
console.log("===========================")
console.log("=== pt2 ===")
console.log(partTwo(input.trim()))
console.log("===========================")

function partOne(input) {
    const map = toMap(input)
    let totalScore = 0
    map.forEach((row, rowIdx) => {
        row.forEach((location, colIdx) => {
            if (Number(location) === TRAILHEAD) {
                let trailscore = traverseTrail(map, { row: rowIdx, col: colIdx }, new Set()).size
                totalScore += trailscore
            }
        })
    })

    return totalScore
}

function partTwo(input) {
    const map = toMap(input)
    let totalRating = 0
    map.forEach((row, rowIdx) => {
        row.forEach((location, colIdx) => {
            if (Number(location) === TRAILHEAD) {
                let rating = rateTrail(map, { row: rowIdx, col: colIdx }, new Set(), "").size
                totalRating += rating
            }
        })
    })

    return totalRating
}

function toMap(input) {
    return input.split("\n").map((row) => {
        // convert to array
        return [...row]
    })
}

function traverseTrail(map, start, reached, { debug = false, branch = 0 } = {}) {
    debug && console.log("\t[%s] traversing, start %O, reachedENDS %O", branch, start, reached)
    let formattedMap = map.reduce((prev, next) => {
        return String(prev) + "\n\t " + String(next)
    })
    debug && console.log("\t[%s]\n", formattedMap)

    // stop if:
    // - at trail end
    // - no surrounding paths are +1
    const currentSpot = Number(map[start.row][start.col])
    if (currentSpot === TRAILEND) {
        debug && console.log("\t[%s] branch ended at trailend", branch)
        reached.add(`${start.row}, ${start.col}`)
        return reached
    }

    // check branches (possible optimisation if you know the direction and don't check the previous position)
    const directions = [
        { id: "UP", row: start.row - 1, col: start.col },
        { id: "RIGHT", row: start.row, col: start.col + 1 },
        { id: "DOWN", row: start.row + 1, col: start.col },
        { id: "LEFT", row: start.row, col: start.col - 1 },
    ]
    directions.forEach((dir) => {
        if (Number(map[dir.row]?.[dir.col]) === Number(currentSpot) + 1) {
            debug &&
                console.log(
                    "\t[%s] traversing %s (%s === %s)",
                    branch,
                    dir.id,
                    map[dir.row][dir.col],
                    Number(currentSpot) + 1
                )
            branch += 1
            reached.union(traverseTrail(map, dir, reached, { branch: branch, debug: debug }))
        }
    })

    return reached
}

function rateTrail(map, start, exploredPaths, currentPath, { debug = false, branch = 0 } = {}) {
    debug &&
        console.log(
            "\t[%s] rateTraversing, start %O, exploredPaths %O, currentPath %s",
            branch,
            start,
            exploredPaths,
            currentPath
        )
    let formattedMap = map.reduce((prev, next) => {
        return String(prev) + "\n\t " + String(next)
    })
    debug && console.log("\t[%s]\n", formattedMap)

    // stop if:
    // - at trail end
    // - no surrounding paths are +1
    const currentSpot = Number(map[start.row][start.col])
    if (currentSpot === TRAILEND) {
        debug && console.log("\t[%s] branch ended at trailend", branch)
        // a fully explored path looks like: [(x1,y1),(x2,y2),...]
        exploredPaths.add(currentPath + `(${start.row},${start.col})]`)
        return exploredPaths
    }

    // check branches (possible optimisation if you know the direction and don't check the previous position)
    const directions = [
        { id: "UP", row: start.row - 1, col: start.col },
        { id: "RIGHT", row: start.row, col: start.col + 1 },
        { id: "DOWN", row: start.row + 1, col: start.col },
        { id: "LEFT", row: start.row, col: start.col - 1 },
    ]
    directions.forEach((dir) => {
        if (Number(map[dir.row]?.[dir.col]) === Number(currentSpot) + 1) {
            debug &&
                console.log(
                    "\t[%s] rateTraversing %s (%s === %s)",
                    branch,
                    dir.id,
                    map[dir.row][dir.col],
                    Number(currentSpot) + 1
                )
            branch += 1
            currentPath =
                Number(currentSpot) === 0
                    ? `[(${start.row},${start.col}),`
                    : currentPath + `(${start.row},${start.col}),`
            exploredPaths.union(rateTrail(map, dir, exploredPaths, currentPath, { debug: debug, branch: branch }))
        }
    })

    return exploredPaths
}

function partOneTests() {
    console.log("####################")
    console.log("--- Part 1 Tests ---")
    console.log("####################")
    traverseTrailTests()
    pt1E2ETests()

    function pt1E2ETests() {
        console.log("--pt1 e2e tests--")

        pt1E2ETestCases().forEach((test, idx) => {
            const { description, expected, input } = test
            const result = partOne(input)

            if (result === expected) {
                console.log("Test case %s passed: %s", idx + 1, description)
            } else {
                console.log(
                    "Test case %s FAILED: %s\nmap %s. Expected %s, got %s",
                    idx + 1,
                    description,
                    input,
                    expected,
                    result
                )
            }
        })
    }

    function traverseTrailTests() {
        console.log("--traverse trail tests--")
        traverseTrailTestCases.forEach((test, idx) => {
            let debug = false

            const { description, expected, startPoint, reached, map } = test
            let reachedTrailends = new Set(reached)
            const resultantTrailends = traverseTrail(map, startPoint, reachedTrailends, {
                branch: 0,
                debug: debug,
            })
            const result = resultantTrailends.size
            if (result === expected) {
                console.log("Test case %s passed: %s", idx + 1, description)
            } else {
                console.log(
                    "Test case %s FAILED: %s\nmap %O, startPoint %O, initiallyReached %O. Expected %s, got %s",
                    idx + 1,
                    description,
                    map,
                    startPoint,
                    reachedTrailends,
                    expected,
                    result
                )
            }
        })
    }
}
partOneTests()

function partTwoTests() {
    console.log("####################")
    console.log("--- Part 2 Tests ---")
    console.log("####################")

    rateTrailTests()
    pt2E2ETest()

    function pt2E2ETest() {
        console.log("--pt2 e2e tests--")

        pt2E2ETestCases().forEach((test, idx) => {
            const { description, expected, input } = test
            const result = partTwo(input)

            if (result === expected) {
                console.log("Test case %s passed: %s", idx + 1, description)
            } else {
                console.log(
                    "Test case %s FAILED: %s\nmap %s. Expected %s, got %s",
                    idx + 1,
                    description,
                    input,
                    expected,
                    result
                )
            }
        })
    }

    function rateTrailTests() {
        console.log("--pt2 rate trail tests--")
        pt2TraverseTrailTestCases.forEach((test, idx) => {
            let debug = false
            // if (idx === 1) {
            //     debug = true
            // }

            const { description, expected, startPoint, trails, map } = test
            let exploredPaths = new Set(trails)
            const paths = rateTrail(map, startPoint, exploredPaths, "", {
                branch: 0,
                debug: debug,
            })
            const result = paths.size
            if (result === expected) {
                console.log("Test case %s passed: %s", idx + 1, description)
            } else {
                console.log(
                    "Test case %s FAILED: %s\nmap %O, startPoint %O. Expected %s, got %s",
                    idx + 1,
                    description,
                    map,
                    startPoint,
                    expected,
                    result
                )
            }
        })
    }
}
partTwoTests()
