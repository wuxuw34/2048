import { gameSetting } from "./game_setting.mjs"
import { getColor } from "./utils/color.mjs"

class Tile {
    constructor(position, value) {
        this.position = position,
            this.value = value
        this.previousPosition = null
        this.mergedTiles = null
    }

    clearMergedTile() {
        this.mergedTiles = null
    }

    // 设置元素移动前的位置
    setPreviousPosition() {
        this.previousPosition = this.position
    }
    // 设置元素的当前位置
    updatePosition(position) {
        this.position = position
    }

    /**
     * 渲染当前方块
     * @param {} game 
     */
    render(game) {
         
        const grid = game.querySelector('.grid')
        const container = game.querySelector('.container')
        const tile = document.createElement('div')
        tile.innerText = this.value
        const classes = ['tile']
        const size = gameSetting.getSetting('size')
        const g = grid.children.item((this.position.x * size) + this.position.y)
        const { top: g_top, left: g_left } = grid.getBoundingClientRect()
        const tileLength = gameSetting.getSetting('tileLength')
        if (this.previousPosition) {
            // debugger
            const preTilegrid = grid.children.item((this.previousPosition.x * size) + this.previousPosition.y)
            tile.className = [...classes].join(' ')
            const { top, left } = preTilegrid.getBoundingClientRect()
            const { top: top1, left: left1 } = g.getBoundingClientRect()
            tile.style.top = `${top1 - g_top}px`
            tile.style.left = `${left1 - g_left}px`
            tile.style.transform = `translate(${left - left1}px,${top - top1}px)`
            window.requestAnimationFrame(() => {
                tile.style.transform = `translate(0,0)`
            })
        } else if (this.mergedTiles) {
            tile.className = [...classes, 'tile-merged'].join(' ')
            const preTilegrid = grid.children.item((this.position.x * size) + this.position.y)
            const { top, left } = preTilegrid.getBoundingClientRect()
            tile.style.top = top - g_top + 'px'
            tile.style.left = left - g_left + 'px'
            this.mergedTiles.forEach(tile => {
                this.render.apply(tile, [game])
            })
        } else {
            const preTilegrid = grid.children.item((this.position.x * size) + this.position.y)
            const { top, left } = preTilegrid.getBoundingClientRect()
            tile.className = [...classes, 'tile-new'].join(' ')
            tile.style.top = top - g_top + 'px'
            tile.style.left = left - g_left + 'px'

        }
        const color = getColor(this.value)
        tile.style.backgroundColor = color[0]
        tile.style.color = color[1]
        tile.style.width = tileLength + 'px'
        tile.style.height = tileLength + 'px'
        container.appendChild(tile)
    }


}

export default Tile