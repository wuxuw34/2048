
const colors = [
    '#eee4da',
    '#ede0c8',
    '#f2b179',
    '#f59563',
    '#f67c5f',
    '#f65e3b',
    '#edcf72',
    '#edcc61',
    '#edc850',
    '#edc53f',
    '#edc22e',
    '#3c3a32',
]

const textColor = [
    null,
    null,
    '#f9f6f2',
    '#f9f6f2',
    '#f9f6f2',
    '#f9f6f2',
    '#f9f6f2',
    '#f9f6f2',
    '#f9f6f2',
    '#f9f6f2',
    '#f9f6f2',
    '#f9f6f2',
]

export function getColor(value) {
    const index = Math.log2(value, 0.5)-1
    return [
        colors[index],
        textColor[index]
    ]
}