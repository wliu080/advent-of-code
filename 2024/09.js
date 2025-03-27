const fs = require("fs")
const _ = require("lodash")

const inputFile = process.argv[2]
const input = fs.readFileSync(inputFile, "utf-8")

/* Assumptions
 *  - Input is always valid, in correct format
 *
 * Notes for self / reflection
 *  - Part one 15min setup + checksum; 24min tests + filesystem condense/compression; 45min finish rest, 20min fix forgetting to account for ID>9
 *      - initial thoughts
 *          - this one seems quite process heavy, should definitely break it down and test the steps
 *          - checksum step: if the diskmap string is very long there'll be too much free space and it'll be inefficient for just a regular .map
 *          - condensing step: i wonder if it'll hinder me in part 2 to just combine the checksum with condensing and do it all at the same time without actually 'condensing' the filesystem
 *  - Part two
 */

const FREE_SPACE = "."

console.log("=== pt1 ===")
console.log(partOne(input.trim()))
console.log("===========================")
console.log("=== pt2 ===")
//console.log(partTwo(input.trim()))
console.log("========================")

function partOne(input) {
    // convert diskmap to disk space
    const filesystem = readDiskmapString(input)
    // // fill up empty spaces from the back of the disk space
    // condenseFilesystem(filesystem)

    // // calculate checksum
    // const checksum = checksum(filesystem)

    return scanFilesystem(filesystem)
}

function partTwo(input) {}

function readDiskmapString(input) {
    let filesystem = []
    // string alternates between size of block and size of free space
    for (let i = 0; i < input.length; i++) {
        const blockSize = Number(input[i])
        const blockId = i % 2 === 0 ? String(i / 2) : FREE_SPACE
        filesystem.push(...Array(blockSize).fill(blockId))
    }
    return filesystem
}

function checksum(filesystem) {
    let sum = 0
    for (let i = 0; i < filesystem.length; i++) {
        const fileBlock = filesystem[i]
        if (fileBlock === FREE_SPACE) {
            break
        }
        sum += Number(fileBlock) * i
    }
    return sum
}

function condenseFilesystem(filesystem) {
    for (let i = 0; i < filesystem.length; i++) {
        const fileBlock = filesystem[i]
        if (fileBlock === FREE_SPACE) {
            // pull from the back
        }
    }
}

function scanFilesystem(filesystem, debug = false) {
    const fs = filesystem
    let checksum = 0
    let rearPointer = fs.length - 1
    for (let i = 0; i <= rearPointer; i++) {
        const fileBlock = fs[i]
        if (fileBlock === FREE_SPACE) {
            rearPointer = pointNextBlock(rearPointer, fs, i)
            if (rearPointer !== -1) {
                // -1 => finished
                fs[i] = fs[rearPointer]
                checksum += Number(fs[i]) * i
                fs[rearPointer] = FREE_SPACE
                rearPointer -= 1
            }
        } else {
            checksum += Number(fileBlock) * i
        }
    }

    return checksum
}

function pointNextBlock(rearPointer, filesystem, i) {
    while (filesystem[rearPointer] === FREE_SPACE && rearPointer > i) {
        rearPointer -= 1
    }
    if (i >= rearPointer) {
        // no blocks left to check
        return -1
    }
    return rearPointer
}

// Part one test cases
console.log("--checksum tests--")
const checksumTestCases = [
    { input: "9231", expected: 11 }, // simple
    { input: "02.39.2", expected: 2 }, // we assume fs has already been condensed prior to checksum, so should stop when reaching free space
    { input: "0099811188827773336446555566..............", expected: 1928 }, // test from challenge
]
checksumTestCases.forEach(({ input, expected }, idx) => {
    const result = checksum(input)

    console.assert(
        result === expected,
        `Test case ${idx + 1} failed: Input ${input}. Expected ${expected}, got ${result}`
    )
    console.log(`Test case ${idx + 1}:`, result === expected ? "Passed" : "Failed")
})

console.log("--scan tests--")
const scanTestCases = [
    { input: "00..11.222".split(""), expected: 31 }, // simple
    { input: "01112334".split(""), expected: 75 }, // no free space
    { input: "0112233.....".split(""), expected: 50 }, // free space all at the back
    { input: "01122......33".split(""), expected: 50 }, // more free space than blocks to fill
    { input: ".....12233".split(""), expected: 17 },
    { input: "00...111...2...333.44.5555.6666.777.888899".split(""), expected: 1928 }, // test from challenge
]
scanTestCases.forEach(({ input, expected }, idx) => {
    let debug = false
    // if (idx == 4) {
    //     debug = true
    // }

    const result = scanFilesystem(input, debug)

    console.assert(
        result === expected,
        `Test case ${idx + 1} failed: Input ${input}. Expected ${expected}, got ${result}`
    )
    console.log(`Test case ${idx + 1}:`, result === expected ? "Passed" : "Failed")
})

console.log("--read diskmap tests--")
const readDiskmapTests = [
    { input: "12345", expected: "0..111....22222".split("") }, // simple test from challenge
    {
        input: "111111111111111111112",
        expected: [
            "0",
            ".",
            "1",
            ".",
            "2",
            ".",
            "3",
            ".",
            "4",
            ".",
            "5",
            ".",
            "6",
            ".",
            "7",
            ".",
            "8",
            ".",
            "9",
            ".",
            "10",
            "10",
        ],
    }, // id would be greater than 9
]
readDiskmapTests.forEach(({ input, expected }, idx) => {
    let debug = false
    // if (idx == 4) {
    //     debug = true
    // }

    const result = readDiskmapString(input, debug)

    console.assert(
        _.isEqual(result, expected),
        `Test case ${idx + 1} failed: Input ${input}. Expected ${expected}, got ${result}`
    )
    console.log(`Test case ${idx + 1}:`, _.isEqual(result, expected) ? "Passed" : "Failed")
})

console.log("--pt1 test--")
const result = partOne("2333133121414131402")
console.assert(result === 1928, `Pt1 e2e failed, expected ${1928}, got ${result}`)
console.log(`Pt1 e2e:`, result === 1928 ? "Passed" : "Failed")

// fs.readdir(PT1_TEST_FOLDER, (err, files) => {
//     console.log("--pt1 tests--")
//     if (err) {
//         console.error("could not read test files")
//         return
//     }

//     files.forEach((filename, idx) => {
//         const file = fs.readFileSync(PT1_TEST_FOLDER + filename, "utf-8")
//         let expected = Number(file.split("!\n")[0])
//         let input = file.split("!\n")[1]

//         const result = partOne(input)

//         console.assert(
//             result === expected,
//             `Test case ${idx + 1} failed: Input ${input}. Expected ${expected}, got ${result}`
//         )
//         console.log(`Test case ${idx + 1}:`, result === expected ? "Passed" : "Failed")
//     })
// })

// fs.readdir(PT2_TEST_FOLDER, (err, files) => {
//     console.log("--pt2 tests--")
//     if (err) {
//         console.error("could not read test files")
//         return
//     }

//     files.forEach((filename, idx) => {
//         const file = fs.readFileSync(PT2_TEST_FOLDER + filename, "utf-8")
//         let expected = Number(file.split("!\n")[0])
//         let input = file.split("!\n")[1]

//         const result = partTwo(input)

//         console.assert(
//             result === expected,
//             `Test case ${idx + 1} failed: Input ${input}. Expected ${expected}, got ${result}`
//         )
//         console.log(`Test case ${idx + 1}:`, result === expected ? "Passed" : "Failed")
//     })
// })
