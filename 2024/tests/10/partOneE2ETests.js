// prettier-ignore
const input1 =
    "1190719\n" +
    "1111198\n" +
    "1112117\n" +
    "6543456\n" +
    "7651987\n" +
    "8761111\n" +
    "9871111"
const test1 = {
    description: "simple single trailhead test",
    expected: 4,
    input: input1,
}

// prettier-ignore
const input2 =
    "1031911\n" +
    "2411811\n" +
    "3111711\n" +
    "4567654\n" +
    "1118113\n" +
    "1119142\n" +
    "1111401\n"
const test2 = {
    description: "double trailhead test",
    expected: 3,
    input: input2,
}

// prettier-ignore
const input3 =
    "89010123\n" +
    "78121874\n" +
    "87430965\n" +
    "96549874\n" +
    "45678903\n" +
    "32019012\n" +
    "01329801\n" +
    "10456732\n"
const test3 = {
    description: "double trailhead test",
    expected: 36,
    input: input3,
}

export function pt1E2ETestCases() {
    return [test1, test2, test3]
}
