
const socket  =io();
const chess = new Chess()
const boardElement = document.querySelector(".chessboard")

let draggedPiece = null
let sourceSquare = null
let playerRole = null

const renderBoard= () => {
    const board = chess.board()
    boardElement.innerHTML="";
    board.forEach((row, rowindex) =>{
        row.forEach((square , squareindex)=>{
            const squaresElement= document.createElement("div");
            squaresElement.classList.add("square", 
                (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
            )
            squaresElement.dataset.row = rowindex
            squaresElement.dataset.col = squareindex

            if(square){
                const pieceElement = document.createElement("div")
                pieceElement.classList.add(
                    "piece",
                    square.color ==="w" ? "white" : "black"
                )
                pieceElement.innerText=getPieceUnicode(square) 
                pieceElement.draggable=playerRole === square.color

                pieceElement.addEventListener("dragstart", (e) => {
                    if(pieceElement.draggable){
                        draggedPiece=pieceElement
                        sourceSquare={row: rowindex, col: squareindex}
                        e.dataTransfer.setData("text/plain", "")//neccesity
                    }
                })

                pieceElement.addEventListener("dragend", (e) =>{
                    draggedPiece=null
                    sourceSquare=null
                })

                squaresElement.appendChild(pieceElement) //attached pieceElement to squaresElement
            }

            squaresElement.addEventListener("dragover", function(e){
                e.preventDefault()
            })

            squaresElement.addEventListener("drop", function(e) {
                e.preventDefault()
                if(draggedPiece){
                    const targetSource ={
                        row: parseInt(squaresElement.dataset.row),
                        col: parseInt(squaresElement.dataset.col)
                    }

                    handleMove(sourceSquare, targetSource)
                    
                }
            })  
            boardElement.appendChild(squaresElement)    
        })
        
    })

    
}


const handleMove= (source, target) => {
    const move ={
        from:`${String.fromCharCode(97+source.col)}${8 - source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8 - target.row}`,
        promotion: 'q'
    }

    socket.emit("move", move)
}
  

const getPieceUnicode= (piece) => {
    const unicodePieces = {
    k: { w: '\u2654', b: '\u265A' },
    q: { w: '\u2655', b: '\u265B' },
    r: { w: '\u2656', b: '\u265C' },
    b: { w: '\u2657', b: '\u265D' },
    n: { w: '\u2658', b: '\u265E' },
    p: { w: '\u2659', b: '\u265F' },

    };

    return unicodePieces[piece.type]?.[piece.color] || "";


}

socket.on("playerRole", function(role){
    playerRole =role
    renderBoard()
})

socket.on("spectatorRole", function(){
    playerRole=null
    renderBoard()
})

socket.on("boardState", function(fen){
    chess.load(fen)
    renderBoard()
})

socket.on("move", function(move){
    chess.move(move)
    renderBoard()
})


renderBoard()