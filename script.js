
const bgm = document.createElement("audio");
const dropped_snd = document.createElement("audio");
const delete_snd = document.createElement("audio");
const gameover_snd = document.createElement("audio");
bgm.src = "static/tetris-theme-korobeiniki-rearranged-arr-for-music-box-184978.mp3";
dropped_snd.src = "static/選択3.mp3"
delete_snd.src = "static/決定11.mp3"
gameover_snd.src = "static/チェレスタグリッサンド6.mp3"

board = [];

for (let y = -1; y < 21; y++) {
    board[y] = []
    for (let x = -1; x < 11; x++) {
        if (y === 20 || x >= 10 || x < 0) {
            board[y][x] = 1
        } else {
            board[y][x] = 0
        }
    }
}

//console.log(board)

const showBoard = () => {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild)
    }
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
            const v = board[y][x];
            let edgeColor, bgColor;
            if (v === 0) {
                edgeColor = '#888'
                bgColor = '#ccc'
            } else {
                edgeColor = `hsl(${(v - 1) / 7 * 360}deg, 100%, 50%)`
                bgColor = `hsl(${(v - 1) / 7 * 360}deg, 100%, 70%)`
            }
            const div = document.createElement('div')
            div.style.position = 'absolute';
            div.style.left = `${x * 32}px`;
            div.style.top = `${y * 32}px`;
            div.style.width = '32px';
            div.style.height = '32px';
            div.style.left = `${x * 32}px`;
            div.style.backgroundColor = `${bgColor}`
            div.style.border = `4px ridge ${edgeColor}`
            div.style.boxSizing = 'border-box'
            document.body.appendChild(div)
            //console.log(`${x}`)
        }
    }
}

const blockShapes = [
    [0, []],
    [2, [1, 0], [2, 0], [-1, 0]],//tetoris
    [2, [1, 0], [1, 1], [0, -1]],//key1
    [2, [1, 0], [1, -1], [0, 1]],//key2
    [4, [1, 0], [-1, 0], [-1, -1]],//L1
    [4, [1, 0], [-1, 0], [-1, 1]],//L2
    [4, [1, 0], [-1, 0], [0, 1]],//T
    [1, [1, 0], [1, 1], [0, 1]],//block
]

//要理解
const putBlock = (blockindex, x, y, rotation, remove = false, action = false) => {
    blockshape = [...blockShapes[blockindex]]
    //console.log(blockshape)
    rotateMax = blockshape.shift()
    blockshape.unshift([0, 0])
    for (let [dy, dx] of blockshape) {
        for (let r = 0; r < rotation % rotateMax; r++) {
            [dy, dx] = [dx, -dy];
        }
        if (remove) {
            board[y + dy][x + dx] = 0;
        } else {
            if (board[y + dy][x + dx]) {
                return false
            }
            if (action) {
                board[y + dy][x + dx] = blockindex;
            }
        }
    }
    if (!action) {
        putBlock(blockindex, x, y, rotation, remove, true)
    }
    return true
}

let cx = 4, cy = 4, cr = 10, ci = 2;
let gameover = false;

const move = (dx, dy, dr) => {
    putBlock(ci, cx, cy, cr, true)
    if (putBlock(ci, cx + dx, cy + dy, cr + dr)) {
        cx += dx;
        cy += dy;
        cr += dr;
        showBoard();
        return true
    } else {
        putBlock(ci, cx, cy, cr)
        return false
    }
}

const CreateNewBlock = () => {
    ClearLine()
    ci = Math.trunc(Math.random() * 7) + 1;
    //ci = 7;
    cx = 4;
    cy = 0;
    cr = 0;
    //console.log(putBlock(ci, cx, cy, cr))
    if (!putBlock(ci, cx, cy, cr)) {
        gameover = true
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 10; x++) {
                if (board[y][x]) {
                    board[y][x] = 1
                }
            }
        }
        showBoard()
    }
}

const ClearLine = () => {
    for (let y = 0; y < 20; y++) {
        let removable = true;
        for (let x = 0; x < 10; x++) {
            if (board[y][x] === 0) {
                removable = false;
                break;
            }
        }
        if (removable) {
            console.log('remove')
            for (let j = y; j > -1; j--) {
                for (let x = 0; x < 10; x++) {
                    board[j][x] = (j === -1) ? 0 : board[j - 1][x]
                }
            }
            delete_snd.play()
        }
    }
}

window.onload = () => {
    flag = 0;
    CreateNewBlock()
    setInterval(() => {
        if (gameover) {
            bgm.pause()
            if (flag === 0) {
                flag = 1;
                gameover_snd.play()
            }
            return;
        }
        if (!move(0, 1, 0)) {
            console.log('newblock')
            dropped_snd.play()
            CreateNewBlock();
        }
    }, 200)

    document.onkeydown = (e) => {
        switch (e.key) {
            case "ArrowLeft":
                move(-1, 0, 0)
                break;
            case "ArrowRight":
                move(1, 0, 0)
                break;
            case "ArrowUp":
                move(0, -1, 0)
                break;
            case "ArrowDown":
                if (!move(0, 1, 0)) {
                    CreateNewBlock();
                }
                break;
            case " ":
                bgm.play();
                move(0, 0, 1)
                break;
            default:
                break;
        }
    }
}