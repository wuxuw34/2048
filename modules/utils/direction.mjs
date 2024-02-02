import { gameSetting } from "../game_setting.mjs"

export function getMoveDirection(keyCode) {
    const vector = {
        x: 0,
        y: 0
    }
    switch (keyCode) {
        case 38: {
            vector.x = -1
            break
        }
        case 87: {
            vector.x = -1
            break
        }
        case 37: {
            vector.y = -1
            break
        }
        case 65: {
            vector.y = -1
            break
        }
        case 83: {
            vector.x = 1
            break
        }
        case 40: {
            vector.x = 1
            break
        }
        case 68: {
            vector.y = 1
            break
        }
        case 39: {
            vector.y = 1
            break
        }
    }
    return vector
}

function withinBounds(nextPosition) {
    const size = gameSetting.getSetting('size')

    return (nextPosition.x >= 0 && nextPosition.x < size) && (nextPosition.y >= 0 && nextPosition.y < size)
}

export function getAvailablePosition(tiles, tile, vector) {
    let nextPosition = null, next = tile.position

    do {
        nextPosition = next
        next = {
            x: next.x + vector.x,
            y: next.y + vector.y
        }
    } while (withinBounds(next) && !tiles[next.x][next.y])
    return {
        nextPosition,
        nextTile: withinBounds(next) ? tiles[next.x][next.y] : null
    }
}

export function changeDirection(vector) {
    const pos = { x: [], y: [] }
    const setting = gameSetting
    for (let i = 0; i < setting.getSetting('size'); i++) {
        pos.x.push(i)
        pos.y.push(i)
    }
    if (vector.x === 1) {
        pos.x = pos.x.reverse()
    }
    if (vector.y === 1) {
        pos.y = pos.y.reverse()
    }

    return pos
}

export function judgePositionEqual(a, b) {
    const res =  a.x === b.x && a.y === b.y
    return res
}
