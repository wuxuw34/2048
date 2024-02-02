import { KeyboardInputManager } from "./keyboard_input_manager.mjs";
import { GameGridManager } from "./game_grid_manager.mjs";
import { GameStorageManager } from "./game_storage_manager.mjs";
import { gameSetting } from "./game_setting.mjs";
import { changeDirection, getAvailablePosition, getMoveDirection, judgePositionEqual } from "./utils/direction.mjs";
import Tile from "./tile.mjs";

export const GAME_STATUS = {
  FAIL: Symbol('fail'),
  SUCCESS: Symbol('success'),
  PAUSE: Symbol('pause'),
  GAMING: Symbol('gaming')
}

export class GameManager {

  constructor(
    selector
  ) {
    this.setting = gameSetting
    this.selector = this.setting.getSetting('selector'); // 游戏所在元素
    this.size = this.setting.getSetting('size'); // 游戏方格列数和行数
    this.inputManager = new KeyboardInputManager();
    this.storageManager = new GameStorageManager();
    this.gridManager = new GameGridManager(selector, this.size);
    this.status = GAME_STATUS.GAMING
    this.score = 0
    this.isFail = false
    // 注册函数，当设置改变时调用
    gameSetting.registerFn((key, oldVal, newVal) => {
      if (key === 'size' && oldVal !== newVal) {
        this.reload() // 调整size需要重新加载背景方格
      }
    })
    // this.init()

  }
  saveGame() {
     this.storageManager.save('game', this.gridManager.saveGameData())
    this.storageManager.save('setting', gameSetting.saveGameSetting())
    this.storageManager.save('score', this.score)
    return {
      game:this.storageManager.load('game'),
      setting:this.storageManager.load('setting'),
      score:this.storageManager.load('score'),
    }
  }
  async loadSave(save) {

    // 先加载设置
    gameSetting.loadGameSetting(save.setting)
    // 加载分数
    this.score = save.score

    // 加载游戏数据
    this.gridManager.loadGameData(save.game)
    this.registerEvent()
    await this.loadStyleSheet(); // 加载stylesheet并等待css加载
    this.gridManager.render()

  }

  reStart() {
    this.init(true)
    this.continue()
  }

  /**
   * 主题应用
   * @param {key,vlaue} data 
   */
  themed(data) {

  }

  /**
   *  初始化整个系统
   */
  async init(force) {
    this.stack = []
    let save = this.storageManager.hasSave() // 获取存档
    this.score = 0
    this.handleScore(force ? 0 : save.score, 0)
    if (force) {
      save = null
    }
    if (save && save.game && save.score >= 0 && save.setting) {
      this.loadSave(save) // 加载存档
    } else {
      !force && await this.loadStyleSheet(); // 加载stylesheet并等待css加载
      this.gridManager.init();
      this.gridManager.addTileToGrid(2)
      this.gridManager.render()
      this.saveGame()
      !force && this.registerEvent();
    }
  }

  pushIntoStack(data) {
    const invokeCount = gameSetting.getSetting('invoke_count')
    if (this.stack.length >= invokeCount) {
      this.stack.shift() // 删除第一个元素
    }
    this.stack.push({
      data,
      score: this.score
    })
  }

  getFromStack() {
    return this.stack.length ? this.stack.pop() : null
  }

  continue() {
    this.status = GAME_STATUS.GAMING
  }

  pause() {
    this.status = GAME_STATUS.PAUSE
  }

  /**
   * 执行撤回命令，仅撤回数据
   */
  invoke() {
    const { data, score } = this.getFromStack()
    this.gridManager.loadGameData(data, true)
    this.score = score
    this.handleScore(this.score, 0)
    this.gridManager.render()
  }

  /**
   * 重新加载整个游戏
   */
  reload() {
    this.continue()
    this.gridManager.reload()
    this.gridManager.addTileToGrid(2)
    this.score = 0 // 重置分数
    this.onScoreUpdate(0)
    this.gridManager.render()((list) => {
      if (!this.judgeAvailableGridItem(list)) {
        this.judgeAvailableGridItem(list)
        setTimeout(() => {
          this.onGameStatus(GAME_STATUS.FAIL)
        }, 500)
      }
    })
  }


  /**
   * js加载样式表
   * @returns Promise
   */
  loadStyleSheet() {
    return new Promise((resolve) => {
      const styleSheet = document.createElement("link");
      styleSheet.rel = "stylesheet";
      styleSheet.href = "./modules/css/index.css";
      styleSheet.defer = true
      styleSheet.onload = (e) => {
        resolve()
      }
      document.querySelector("head").appendChild(styleSheet);
    })
  }

  handleScore(score, add) {
    let isBest = false, best = 0
    let bestScore = this.storageManager.load('best')
    if (bestScore && bestScore < score) {
      isBest = true
      this.storageManager.save('best', score)
    }
    if (!bestScore) {
      isBest = true
      this.storageManager.save('best', score)
    }
    bestScore = isBest ? score : bestScore

    this.onScoreUpdate(score, add, isBest, bestScore)
  }

  /**
   *  注册事件
   */
  registerEvent() {
    this.inputManager.register('keydown', (e) => {
      // d == 68 w = 87  a=65 s=83 arrow 顺时针37 38 39 40
      const vector = getMoveDirection(e.keyCode)
      const oldData = this.gridManager.saveGameData()

      if (this.status === GAME_STATUS.PAUSE) {
        return
      }

      if (!vector.x && !vector.y) {
        // 无需移动
      } else {
        e.preventDefault(); // 此处防止滚动条滚动
        let moved = false // 元素是否发生过移动
        this.gridManager.setAllTilesPreviousPostion() // 保存初始位置，方便移动
        const direction = changeDirection(vector) // 判断位置，转化方向
        for (let x of direction.x) {
          for (let y of direction.y) {
            const tile = this.gridManager.getTile(x, y)
            if (tile) {
              const { nextPosition, nextTile } = getAvailablePosition(this.gridManager.tiles, tile, vector)
              // const next = this.gridManager.getTile(nextPositon.x, nextPositon.y)
              if (nextTile && nextTile.value === tile.value && !nextTile.mergedTiles) {
                const merged = new Tile(nextTile.position, tile.value * 2)
                this.gridManager.addTileToTiles(merged)
                merged.mergedTiles = [tile, nextTile]
                this.gridManager.removeTile(tile)
                tile.updatePosition(nextTile.position)
                this.score += tile.value * 2
                this.handleScore(this.score, tile.value * 2)
                if (this.score === 2048) {
                  this.onGameStatus(GAME_STATUS.SUCCESS)
                }
              } else {
                this.gridManager.moveTile(tile, nextPosition)
              }
              if (!judgePositionEqual({ x, y }, nextTile && nextTile.value === tile.value ? nextTile.position : nextPosition)) {
                moved = true
              }
            }
          }
        }
        if (moved) {
          this.pushIntoStack(oldData)
          this.gridManager.addTileToGrid(1)
          if (!this.isFail) {
            this.saveGame()
            /**
             *  渲染当前数据后调用并判断,获取最新方格空余位置
             */
            this.gridManager.render()((list) => {
              if (!this.judgeAvailableGridItem(list)) {
                this.judgeAvailableGridItem(list)
                setTimeout(() => {
                  this.onGameStatus(GAME_STATUS.FAIL)
                }, 500)
              }
            })
          }
        }
        const newData = this.onGameData ? this.gridManager.saveGameData() : null
        if (this.onGameData) {
          this.onGameData(oldData, newData)
        }
      }
    })
    this.inputManager.listen() // 开始监听
  }

  /**
   * 判断是否可以继续游戏
   * @param {*} list 方格中空余位置列表
   * @returns 
   */
  judgeAvailableGridItem(list) {
    // const list = this.gridManager.getBlankGridItems() // 渲染完后才获取
    if (!list.length) {
      return this.gridManager.judgeContinueGame()
    } else {
      return true
    }
  }
}
