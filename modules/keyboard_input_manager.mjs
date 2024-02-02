
export class KeyboardInputManager {
    constructor() {
        this.events = new Map()
    }
    register(name, fn) {
        if (!this.events.has(name)) {
            this.events.set(name, [])
        }
        this.events.set(name, [...this.events.get(name), fn])
    }
    #on(name) {
        window.addEventListener(name, (e) => {
            this.events.get(name).map((fn) => {
                fn(e)
            })
        })
    }
    listen() {
        for (let name of this.events.keys()) {
            this.#on(name)
        }
    }
}