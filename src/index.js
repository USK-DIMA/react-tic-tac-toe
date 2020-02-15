import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Player {
    constructor(symbol, name) {
        this.symbol = symbol;
        this.name = name;
    }
}

class State {
    board;
    winner;
    gameOver;
    currentPlayerIndex;

    constructor(board, winner, gameOver, currentPlayerIndex) {
        this.board = board;
        this.winner = winner;
        this.gameOver = gameOver;
        this.currentPlayerIndex = currentPlayerIndex;
    }

}

class HistoryState {
    state;
    previousStep;

    constructor(state, previousStep) {
        this.state = state;
        this.previousStep = previousStep;
    }
}

class Game extends React.Component {

    symbols = ['X', 'O', 'Z', 'I'];
    playersCount = 2;
    boardSize = 3;
    players = [];

    constructor(props) {
        super(props);
        if (this.playersCount > this.symbols.length) {
            this.playersCount = this.symbols.length
        }
        this.players = Array(this.playersCount);
        for (let i = 0; i < this.playersCount; i++) {
            this.players[i] = new Player(this.symbols[i], this.symbols[i]);
        }
        let initialState = new State(new Array(this.boardSize * this.boardSize).fill(null), null, false, 0);
        this.state = {
            currentState: initialState,
            history: [new HistoryState(initialState, "Start game")]
        };
    }

    render() {
        return (
            <div>
                <div className="status">{this.getStatusMessage()}</div>
                <div className="game">
                    <div className="game-board">
                        <Board board={this.state.currentState.board} onClick={(i) => {
                            this.clickHandler(i)
                        }}/>
                    </div>
                    <div className="game-info">
                        <div>History</div>
                        <ol>{this.renderHistory()}</ol>
                    </div>
                </div>
            </div>
        );
    }

    renderHistory() {
        return this.state.history.map((s, i) => {
            return (
                <li key={i}>
                    <button onClick={() => this.goToState(i)}> {s.previousStep}</button>
                </li>)
        })
    }

    clickHandler(arrayIndex) {
        if (this.state.currentState.gameOver || this.state.currentState.board[arrayIndex] != null) {
            return;
        }
        let ts = this.state.currentState.board.slice();
        let currentStepPlayer = this.players[this.state.currentState.currentPlayerIndex];
        ts[arrayIndex] = currentStepPlayer;
        let winner = this.calculateWinner(ts);
        let gameOver = winner != null || this.boardIsFull(ts);
        let newState = new State(ts, winner, gameOver, (this.state.currentState.currentPlayerIndex + 1) % this.players.length);
        let historyMessage = `Player ${currentStepPlayer.name} set '${currentStepPlayer.symbol}' to [${arrayIndex % this.boardSize + 1} ${Math.floor(arrayIndex / this.boardSize) + 1}]`;

        this.setState({
            currentState: newState,
            history: this.state.history.concat(new HistoryState(newState, historyMessage))
        })
    }

    boardIsFull(board) {
        for (let i = 0; i < board.length; i++) {
            if (board[i] == null) {
                return false;
            }
        }
        return true;
    }

    calculateWinner(squares) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (getSymbol(squares[a]) && getSymbol(squares[a]) === getSymbol(squares[b]) && getSymbol(squares[a]) === getSymbol(squares[c])) {
                return squares[a];
            }
        }
        return null;
    }

    getStatusMessage() {
        if (this.state.currentState.gameOver) {
            var res = "Game over";
            if (this.state.currentState.winner != null) {
                res += ` Player '${this.state.currentState.winner.name}' is winner`
            }
            return res;
        }
        return `Next player: ${this.players[this.state.currentState.currentPlayerIndex].name}`
    }

    goToState(index) {
        let historyState = this.state.history[index];
        if (historyState === undefined) {
            return;
        }
        this.setState({
            currentState: historyState.state,
            history: this.state.history.slice(0, index+1)
        })
    }
}

class Board extends React.Component {

    render() {
        return (
            <div>
                {this.renderBoard()}
            </div>
        );
    }

    renderBoard() {
        let boardSize = Math.sqrt(this.props.board.length);
        const res = [];
        for (let rowIndex = 0; rowIndex < boardSize; rowIndex++) {
            let boardRow = this.props.board.slice(rowIndex * boardSize, rowIndex * boardSize + boardSize);
            res[rowIndex] = (
                <div className="board-row" key={rowIndex}>
                    {
                        boardRow.map((v, index) => {
                            return (<Square
                                key={index}
                                value={getSymbol(v)}
                                index={rowIndex * boardSize + index}
                                onClick={(i) => {
                                    this.props.onClick(i)
                                }}
                            />)
                        })
                    }
                </div>
            );
        }
        return res;
    }
}

class Square extends React.Component {
    render() {
        return (
            <button className="square" onClick={() => {
                this.props.onClick(this.props.index)
            }}>
                {this.props.value}
            </button>
        );
    }
}

function getSymbol(player) {
    if (player == null) {
        return null;
    }
    return player.symbol;
}

// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);
