// prettier-ignore
const input1 =
"012345\n" +
"123456\n" +
"234567\n" +
"345678\n" +
"416789\n" +
"567891\n"
const test1 = {
    description: "simple single trailhead test",
    expected: 227,
    input: input1,
}

// prettier-ignore
const input2 =
"89010123\n" +
"78121874\n" +
"87430965\n" +
"96549874\n" +
"45678903\n" +
"32019012\n" +
"01329801\n" +
"10456732\n"
const test2 = {
    description: "multi trailhead test",
    expected: 81,
    input: input2,
}

export function pt2E2ETestCases() {
    return [test1, test2]
}
