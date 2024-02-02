

const setting = {
    size: 4,
    selector: '#game',
    width: 0,
    gap: 8,
    padding: 10,
    tileLength: 94,
    revoke_count:5
}


class GameSetting {
    constructor() {
        this.events = new Set()
        for (let key of Object.keys(setting)) {
            Object.defineProperty(this, key, {
                set(v) {
                    setting[key] = v
                },
                get() {
                    return setting[key]
                }
            })
        }
    }
    updateSetting(key, value) {
        const oldVal = this[key]
        this[key] = value
        this.trigger(key, oldVal, value)
        return value
    }
    getSetting(key) {
        return this[key]
    }
    /**
     * 保存设置
     * @returns 游戏设置数据
     */
    saveGameSetting() {
        const res = {}
        for (let key of Object.keys(setting)) {
            res[key] = this[key]
        }
        return res
    }
    /**
     * 加载游戏设置数据
     * @param {*} data 游戏设置数据 
     */
    loadGameSetting(data) {
        for (let key of Object.keys(setting)) {
            this[key] = data[key]
        }
    }
    registerFn(fn) {
        this.events.add(fn)
    }
    trigger(key, val, newVal) {
        Array.from(this.events).forEach(fn => {
            fn(key, val, newVal)
        })
    }
    /**
     * 获取面板设置
     * @returns 面板边长 方块间隔 面板所包含方块的尺寸(长宽相等) 方块边长
     */
    getGamePanelData() {
        return {
            totalLength: this['size'] * this['tileLength'] + this['padding'] + (this['size'] - 1) * this['gap'] ,
            gap: this['gap'],
            size: this['size'],
            tileLength: this['tileLength'],
            padding:this['padding']
        }
    }
}

export const gameSetting = new GameSetting()