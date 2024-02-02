
/**
 * 
 * @param {*} count  循环次数
 * @param {*} str 重复的字符串
 * @returns 
 */
export function repeatString(count, str) {
    let res = ''
    for (let i = 0; i < count; i++) {
        res += str
    }
    return res
}