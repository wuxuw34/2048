import { gameSetting } from "./game_setting.mjs"
import Tile from "./tile.mjs"
import { repeatString } from "./utils/repeat.mjs"

export class GameGridManager {
    constructor(selector, size) {
        this.game = document.querySelector(selector)
        this.size = size
        this.tiles = []
    }

    // 调整设置时重新载入游戏
    reload() {
        this.size = gameSetting.getSetting('size') // 获取size大小
        this.init() // 初始化
    }

    /**
     * 加载游戏数据,有存档时
     * @param {*} tiles 
     * @param {*} onlyData  是否仅载入数据
     */
    loadGameData(tiles,onlyData) {
        !onlyData && this.createGameGrids()
        this.size = gameSetting.getSetting('size')
        this.#initTiles()
        this.rebuildTiles(tiles)
    }

    // 重新建立各个Tile，储存的Tile只有position和value
    rebuildTiles(tiles) {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (tiles[i][j]) {
                    tiles[i][j] = new Tile(tiles[i][j].position, tiles[i][j].value)
                }
                this.tiles[i][j] = tiles[i][j]
            }
        }
    }

    // 新游戏时初始化
    init() {
        this.createGameGrids()
        this.#initTiles()
    }

    getTile(x, y) {
        return x < this.tiles.length || y < this.tiles.length ? this.tiles[x][y] : null
    }
    // 生成grid中的元素
    createGameGrids() {
        this.game.innerHTML = null
        // debugger
        const { totalLength, size, tileLength, gap,padding } = gameSetting.getGamePanelData()
        // 初始化grids背景
        const bg = document.createElement('div')
        bg.classList.add('grid')
        bg.style.width = totalLength + 'px'
        bg.style.height = totalLength + 'px'
        bg.style.gap = gap + 'px'
        bg.style.padding = padding + 'px'
        this.game.appendChild(bg)
        this.game.classList.add('game_2048')
        bg.style.gridTemplateColumns = repeatString(size, '1fr ')
        for (let i = 0; i < size * size; i++) {
            const item = document.createElement('div')
            item.classList.add('grid-item')
            item.setAttribute('index', i)
            item.style.width = tileLength + 'px'
            item.style.height = tileLength + 'px'
            bg.append(item)
        }
        // 初始化container
        const container = document.createElement('div')
        container.classList.add('container')
        container.style.width = totalLength + padding*2 + 'px'
        container.style.height = totalLength + padding*2 + 'px'
        this.game.appendChild(container)
    }

    // 将tiles中全初始化为null
    #initTiles() {
        this.tiles.length = 0 // 清空
        for (let i = 0; i < this.size; i++) {
            const c = []
            for (let j = 0; j < this.size; j++) {
                c.push(null)
            }
            this.tiles.push(c)
        }
    }

    // 调用该函数时，返回需要保存的游戏数据
    saveGameData() {
        return this.tiles.map(tile => {
            return tile.map(t => {
                return t ? {
                    position: t.position,
                    value: t.value
                } : null
            })
        })
    }

    #createTile(postion, value) {
        return new Tile(postion, value)
    }

    #createRandomTile() {
        const blankGridItems = this.getBlankGridItems()
        if (blankGridItems.length) {
            const random = Math.floor(Math.random() * blankGridItems.length)
            const value = Math.random() < 0.7 ? 2 : 4
            const tile = this.#createTile(blankGridItems[random], value)
            this.#pushIntoTiles(tile)
        }
    }

    #pushIntoTiles(tile) {
        this.tiles[tile.position.x][tile.position.y] = tile
    }

    // 获取空余位置列表
    getBlankGridItems() {
        const c = []
        this.tilesForEach((x, y, tile) => {
            if (!tile) {
                c.push({ x, y })
            }
        })
        return c
    }

    // 当没有空余位置时，判断是否能够继续进行游戏，横向和纵向同时判断，有相等数值时继续
    judgeContinueGame() {
        const size = gameSetting.getSetting('size')
        for (let i = 0; i < this.tiles.length; i++) {
            const tiles = this.tiles[i]
            for (let j = 0; j < tiles.length - 1; j++) {
                if (tiles[j].value === tiles[j + 1].value) {
                    return true
                }
                if (this.tiles[j][i].value === this.tiles[j + 1][i].value) {
                    return true
                }
            }
        }
        return false
    }



    tilesForEach(fn) {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                fn(i, j, this.tiles[i][j])
            }
        }
    }

    addTileToGrid(count) {
        for (let i = 0; i < count; i++) {
            this.#createRandomTile()
        }
    }

    addTileToTiles(tile) {
        this.tiles[tile.position.x][tile.position.y] = tile
    }

    removeTile(tile) {
        this.tiles[tile.position.x][tile.position.y] = null
    }

    clearAllTilesInGrid() {
        this.game.querySelector('.container').innerHTML = null
    }

    moveTile(tile, position) {
        this.tiles[tile.position.x][tile.position.y] = null
        tile.updatePosition(position)
        this.tiles[position.x][position.y] = tile
    }

    setAllTilesPreviousPostion() {
        this.tilesForEach((x, y, tile) => {
            if (tile) {
                tile.setPreviousPosition()
                tile.clearMergedTile()
            }
        })
    }

    render() {
        this.clearAllTilesInGrid()
        this.tilesForEach((x, y, tile) => {
            if (tile) {
                tile.render(this.game)
            }
        })
        return (fn) => {
            fn(this.getBlankGridItems())
        }
    }


}