import { GameManager, GAME_STATUS } from './modules/index.mjs'
const newGameBnt = document.getElementById('new_game_bnt')
const invokeBnt = document.getElementById('invoke_bnt')
const score = document.getElementById('score')
const best_score = document.getElementById('best')
const sider = document.getElementById('sider')
const setting = document.getElementById('setting')
const saveGame = document.getElementById('saveGame')
const github = document.getElementById('github')

const game = new GameManager('#game')

game.onGameStatus = (status) => {
    if (status === GAME_STATUS.FAIL) {
        window.alert('失败')
        game.reStart()
    }
}
game.onScoreUpdate = (score1, add, isbest, best) => {
    score.innerText = score1
    best_score.innerText = best
}
newGameBnt.onclick = () => {
    game.reStart()
}
invokeBnt.onclick = () => {
    game.invoke()
}

setting.onclick = () => {
    const content = sider.querySelector('.content')
    sider.style.visibility = 'visible'
    content.style.translate = '0'
}
sider.onclick = (e) => {
    const content = sider.querySelector('.content')
    if (!content.contains(e.target)) {
        sider.style.visibility = 'hidden'
        content.style.translate = '100%'
    }
}
saveGame.onclick = () => {
    const a = document.createElement('a')
    console.log(JSON.stringify(game.saveGame()));
    const data = new Blob([JSON.stringify(game.saveGame())],{
        type:'text/json'
    })
    a.href = window.URL.createObjectURL(data)
    a.download = 'save.json'
    a.click()
}

github.onclick = ()=>{
    const url = 'https://www.baidu.com'
    window.open(url,'_blank')
}

game.init()