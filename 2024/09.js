const fs = require("fs")
const _ = require("lodash")

const inputFile = process.argv[2]
const input = fs.readFileSync(inputFile, "utf-8")

/* Assumptions
 *  - Input is always valid, in correct format
 *
 * Notes for self / reflection
 *  - Part one 15min setup + checksum; 24min tests + filesystem condense/compression; 45min finish rest, 20min fix forgetting to account for ID>9
 *      - thoughts
 *          - this one seems quite process heavy, should definitely break it down and test the steps
 *          - checksum step: if the diskmap string is very long there'll be too much free space and it'll be inefficient for just a regular .map
 *          - condensing step: i wonder if it'll hinder me in part 2 to just combine the checksum with condensing and do it all at the same time without actually 'condensing' the filesystem
 *          - oops forgot to account for IDs > 9
 *  - Part two 35min basic flow, 30min tests + logic for the condensing, ~1hr debugging, reorganizing tests, refactoring to make things a bit easier to debug
 *      - thoughts
 *          - i think it'll be easier if we read it in as a different format, don't think i can reuse both the reading and the scanning, though portions of the logic is prob the same, which will save time
 *
 *  - Reflections
 *      - should've really put in some time to think of a better way to structure, I think it would've made the operations easier and maybe not wasted effort going from pt1 to 2
 *      - should've put in the time and broken up the functions more right from the start to make things easier to test in isolation, it was trickier than expected
 *      - coming from Java, still need to get used to being more functional in the approach - would be easier to test and isolate if all the filesystem operations returned the new filesystem (but maybe that doesn't really feel like it makes a lot of sense either)
 */

const FREE_SPACE = "."

console.log("=== pt1 ===")
console.log(partOne(input.trim()))
console.log("===========================")
console.log("=== pt2 ===")
console.log(partTwo(input.trim()))
console.log("===========================")

function partOne(input) {
    // convert diskmap to disk space
    const filesystem = readDiskmapString(input)
    // // fill up empty spaces from the back of the disk space
    // condenseFilesystem(filesystem)

    // // calculate checksum
    // const checksum = checksum(filesystem)

    return scanFilesystem(filesystem)
}

function partTwo(input) {
    const filesystem = readDiskmapToBlocks(input)
    const condensed = compactByFile(filesystem)
    let stringFormat = []
    condensed.forEach((fileBlock) => {
        stringFormat.push(...Array(fileBlock.size).fill(fileBlock.fid))
    })
    return checksum(stringFormat)
}

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

function readDiskmapToBlocks(input) {
    let filesystem = []
    // string alternates between size of block and size of free space
    for (let i = 0; i < input.length; i++) {
        const blockSize = Number(input[i])
        const blockId = i % 2 === 0 ? String(i / 2) : FREE_SPACE
        filesystem.push({ fid: blockId, size: Number(blockSize) })
    }
    return filesystem
}

function compactByFile(filesystem, debug = false) {
    debug && console.log("starting compact", filesystem)
    const filesToCheck = filesystem.filter((file) => file.fid !== FREE_SPACE)

    for (let i = filesToCheck.length - 1; i >= 0; i--) {
        const currentFile = filesToCheck[i]

        const idInFS = filesystem.findIndex((file) => {
            return file.fid === currentFile.fid
        })

        let targetIdx = filesystem.findIndex((file) => {
            return file.fid === FREE_SPACE && file.size >= currentFile.size
        })

        if (targetIdx === -1 || targetIdx >= idInFS) {
            continue
        }

        filesystem = moveFile(filesystem, idInFS, targetIdx)
    }

    debug && console.log("fully done", filesystem)
    return filesystem
}

/**
 * assumes block at freeSpaceIdx is a free space and that file size is less or equal to the free space
 * @param {[]} filesystem
 * @param {number} fileIdx
 * @param {number} freeSpaceIdx
 */
function moveFile(filesystem, fileIdx, freeSpaceIdx, debug = false) {
    debug && console.log("\t\tattempting to move from idx[%s] to idx[%s]", fileIdx, freeSpaceIdx, filesystem)

    const file = filesystem[fileIdx]
    const freeSpaceBlock = filesystem[freeSpaceIdx]
    const remainingSpace = freeSpaceBlock.size - file.size

    console.assert(
        remainingSpace >= 0,
        `cannot move file[${fileIdx}] ${file} to space[${freeSpaceIdx}] ${freeSpaceBlock}`
    )
    console.assert(
        freeSpaceBlock.fid === FREE_SPACE,
        `cannot move file[${fileIdx}] ${file} to another file[${freeSpaceIdx}] ${freeSpaceBlock}`
    )

    let originalFileIdx = fileIdx
    if (remainingSpace === 0) {
        filesystem.splice(freeSpaceIdx, 1, file) // replace with delete
    } else {
        filesystem.splice(freeSpaceIdx, 0, file)
        filesystem[freeSpaceIdx + 1].size = remainingSpace
        originalFileIdx = fileIdx + 1
    }
    filesystem.splice(originalFileIdx, 1, { fid: FREE_SPACE, size: Number(file.size) })

    let consolidated = consolidateAt(filesystem, originalFileIdx)
    debug && console.log("\t\t consolidated", consolidated)
    return consolidated
}

function consolidateAt(filesystem, targetIdx) {
    const targetFile = filesystem[targetIdx]
    console.assert(targetFile.fid === FREE_SPACE, "target must be free space to be consolidated")

    let consolidated = { fid: FREE_SPACE, size: targetFile.size }
    let deletionTargets = []

    const left = filesystem[targetIdx - 1]
    const right = filesystem[targetIdx + 1]

    if (left && left.fid === FREE_SPACE) {
        consolidated.size += left.size
        deletionTargets.push(targetIdx - 1)
    }

    if (right && right.fid === FREE_SPACE) {
        consolidated.size += right.size
        deletionTargets.push(targetIdx + 1)
    }

    filesystem[targetIdx] = consolidated
    return filesystem.filter((file, idx) => {
        return !deletionTargets.includes(idx)
    })
}

function checksum(filesystem) {
    let sum = 0
    for (let i = 0; i < filesystem.length; i++) {
        const fileBlock = filesystem[i]
        if (fileBlock === FREE_SPACE) {
            continue
        }
        sum += Number(fileBlock) * i
    }
    return sum
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
function partOneTests() {
    console.log("####################")
    console.log("--- Part 1 Tests ---")
    console.log("####################")
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
}
partOneTests()

function partTwoTests() {
    console.log("####################")
    console.log("--- Part 2 Tests ---")
    console.log("####################")

    moveFileTests()
    compactByFileTests()
    checksumTests()

    console.log("--pt2 e2e test--")
    const result2 = partTwo("2333133121414131402")
    console.assert(result2 === 2858, `Pt2 e2e failed, expected ${2858}, got ${result2}`)
    console.log(`Pt2 e2e:`, result2 === 2858 ? "Passed" : "Failed")
}
partTwoTests()

function moveFileTests() {
    console.log("--moveFile test--")
    const moveFileTestCases = [
        {
            fs: [
                { fid: "0", size: 2 }, // simple swap
                { fid: ".", size: 2 },
                { fid: "1", size: 2 },
            ],
            fileIdx: 2,
            targetIdx: 1,
            expected: [
                { fid: "0", size: 2 },
                { fid: "1", size: 2 },
                { fid: ".", size: 2 },
            ],
        },
        {
            fs: [
                { fid: "0", size: 2 }, // swap with space remaining
                { fid: ".", size: 3 },
                { fid: "1", size: 2 },
                { fid: "2", size: 2 },
            ],
            fileIdx: 3,
            targetIdx: 1,
            expected: [
                { fid: "0", size: 2 },
                { fid: "2", size: 2 },
                { fid: ".", size: 1 },
                { fid: "1", size: 2 },
                { fid: ".", size: 2 },
            ],
        },
        {
            fs: [
                { fid: ".", size: 2 }, // swap requiring consolidation of free space below
                { fid: "1", size: 2 },
                { fid: "2", size: 2 },
                { fid: ".", size: 3 },
            ],
            fileIdx: 2,
            targetIdx: 0,
            expected: [
                { fid: "2", size: 2 },
                { fid: "1", size: 2 },
                { fid: ".", size: 5 },
            ],
        },
        {
            fs: [
                { fid: ".", size: 4 }, // swap requiring consolidation of free space above
                { fid: "1", size: 2 },
                { fid: ".", size: 2 },
                { fid: "2", size: 3 },
            ],
            fileIdx: 3,
            targetIdx: 0,
            expected: [
                { fid: "2", size: 3 },
                { fid: ".", size: 1 },
                { fid: "1", size: 2 },
                { fid: ".", size: 5 },
            ],
        },
        {
            fs: [
                { fid: ".", size: 4 }, // swap requiring consolidation of free space above & below
                { fid: "1", size: 2 },
                { fid: ".", size: 2 },
                { fid: "2", size: 3 },
                { fid: ".", size: 1 },
            ],
            fileIdx: 3,
            targetIdx: 0,
            expected: [
                { fid: "2", size: 3 },
                { fid: ".", size: 1 },
                { fid: "1", size: 2 },
                { fid: ".", size: 6 },
            ],
        },
    ]
    moveFileTestCases.forEach(({ fs, fileIdx, targetIdx, expected }, idx) => {
        const fsCopy = JSON.stringify(fs)
        let debug = false
        // if (idx === 2) {
        //     debug = true
        // }

        let result = moveFile(fs, fileIdx, targetIdx, debug)

        console.assert(
            _.isEqual(result, expected),
            `Test case ${
                idx + 1
            } failed: Input ${fsCopy}, fileIdx: ${fileIdx}, target: ${targetIdx} . Expected ${JSON.stringify(
                expected
            )}, got ${JSON.stringify(result)}`
        )
        console.log(`Test case ${idx + 1}:`, _.isEqual(result, expected) ? "Passed" : "Failed")
    })
}

function compactByFileTests() {
    console.log("--compactByFile test--")
    const compactTestCases = [
        {
            input: [
                { fid: "0", size: 2 }, // simple swap
                { fid: ".", size: 3 },
                { fid: "1", size: 2 },
            ],
            expected: [
                { fid: "0", size: 2 },
                { fid: "1", size: 2 },
                { fid: ".", size: 3 },
            ],
        },
        {
            input: [
                { fid: "0", size: 2 }, // if no possible space before last block (non-free space), stop / do nothing
                { fid: "1", size: 3 },
                { fid: ".", size: 2 },
            ],
            expected: [
                { fid: "0", size: 2 },
                { fid: "1", size: 3 },
                { fid: ".", size: 2 },
            ],
        },
        {
            input: [
                { fid: "0", size: 2 },
                { fid: ".", size: 2 },
                { fid: "1", size: 2 },
                { fid: "2", size: 2 },
                { fid: "3", size: 3 },
            ],
            expected: [
                { fid: "0", size: 2 }, // only fit in if space available
                { fid: "2", size: 2 },
                { fid: "1", size: 2 },
                { fid: ".", size: 2 },
                { fid: "3", size: 3 },
            ],
        },
        {
            input: [
                { fid: "0", size: 2 },
                { fid: ".", size: 4 },
                { fid: "1", size: 2 },
                { fid: "2", size: 2 },
                { fid: "3", size: 5 },
            ],
            expected: [
                { fid: "0", size: 2 }, // fit in multiple if possible
                { fid: "2", size: 2 },
                { fid: "1", size: 2 },
                { fid: ".", size: 4 },
                { fid: "3", size: 5 },
            ],
        },
        {
            input: [
                { fid: ".", size: 2 },
                { fid: "1", size: 1 },
                { fid: ".", size: 3 },
                { fid: "2", size: 2 },
                { fid: "3", size: 3 },
                { fid: "4", size: 4 },
            ],
            expected: [
                { fid: "2", size: 2 }, // only put in spaces where it fits
                { fid: "1", size: 1 },
                { fid: "3", size: 3 },
                { fid: ".", size: 5 },
                { fid: "4", size: 4 },
            ],
        },
        {
            input: [
                { fid: "0", size: 2 },
                { fid: ".", size: 3 },
                { fid: "1", size: 3 },
                { fid: ".", size: 3 },
                { fid: "2", size: 1 },
                { fid: ".", size: 3 },
                { fid: "3", size: 3 },
                { fid: ".", size: 1 },
                { fid: "4", size: 2 },
                { fid: ".", size: 1 },
                { fid: "5", size: 4 },
                { fid: ".", size: 1 },
                { fid: "6", size: 4 },
                { fid: ".", size: 1 },
                { fid: "7", size: 3 },
                { fid: ".", size: 1 },
                { fid: "8", size: 4 },
                { fid: "9", size: 2 },
            ],
            expected: [
                { fid: "0", size: 2 }, // test from challenge
                { fid: "9", size: 2 },
                { fid: "2", size: 1 },
                { fid: "1", size: 3 },
                { fid: "7", size: 3 },
                { fid: ".", size: 1 },
                { fid: "4", size: 2 },
                { fid: ".", size: 1 },
                { fid: "3", size: 3 },
                { fid: ".", size: 4 },
                { fid: "5", size: 4 },
                { fid: ".", size: 1 },
                { fid: "6", size: 4 },
                { fid: ".", size: 5 },
                { fid: "8", size: 4 },
                { fid: ".", size: 2 },
            ],
        },
    ]
    compactTestCases.forEach(({ input, expected }, idx) => {
        const fsCopy = JSON.parse(JSON.stringify(input))
        let debug = false
        // if (idx === 5) {
        //     debug = true
        // }

        const result = compactByFile(input, debug)

        console.assert(
            _.isEqual(result, expected),
            "Test case %s failed: Input %O. Expected %O, got %O",
            idx + 1,
            fsCopy,
            expected,
            result
        )
        console.log(`Test case ${idx + 1}:`, _.isEqual(result, expected) ? "Passed" : "Failed")
    })
}

function checksumTests() {
    console.log("--checksum tests--")
    const checksumTestCases = [
        { input: "9231", expected: 11 }, // simple
        { input: "02.39.2", expected: 59 }, // simple with free spaces
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
}
