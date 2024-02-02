
export class GameStorageManager {
    constructor() {
        this.storage = window.localStorage
    }
    save(id, data) {
        return this.storage.setItem(id, JSON.stringify(data))
    }
    load(id) {
        
        return JSON.parse(this.storage.getItem(id))
    }
    clearAll(){
        this.storage.clear()
    }
    /**
     * 判断是否有存档
     * @returns 存档数据
     */
    hasSave() {
        return {
            game: this.load('game'),
            score: this.load('score'),
            setting: this.load('setting')
        }
    }
}