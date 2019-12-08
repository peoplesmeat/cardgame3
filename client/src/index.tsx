import React from 'react';
import ReactDOM from 'react-dom';
import {AI} from './ai'
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import io from 'socket.io-client';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';


type SquareProps = {
    value: string
    onClick: () => void
}

/* class Square extends React.Component<SquareProps, {}> {
    render() {
        return (
            <button className="square" onClick={() => { this.props.onClick() }}>
               {this.props.value}
            </button>
        );
    }
} */

function Square(props: SquareProps) {
    return (
        <button className="square" onClick={() => {
            props.onClick()
        }}>
            {props.value}
        </button>
    );
}

type BoardState = {
    squares: Array<string>
    onClick: (i: number) => void
}

class Board extends React.Component<BoardState, {}> {
    renderSquare(i: number) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

type GameState = {
    player: string | null
    game: string | null
    history: Array<{ squares: Array<string> }>
    xIsNext: boolean
    stepNumber: number
}


class Game extends React.Component<{player: string, game: string, socket: any}, GameState> {


    constructor(props: {player: string, game: string, socket: any}) {
        super(props);
        this.state = {
            player: props.player,
            game: props.game,
            history: [{
                squares: Array(9).fill(null),
            }],
            stepNumber: 0,
            xIsNext: true,
        };

        props.socket.on('move', (data: any) => {
            console.log("move", data);
            this.move(data.number);
        });
    }

    componentDidMount() {
        fetch("/api/board").then(res => res.json())
            .then((result) => {
                console.log(result);
                /*this.setState({
                    history: [{
                        squares: result,
                    }],
                    stepNumber: 0,
                    xIsNext: true,
                })*/
            });


    }

    handleClick(i: number) {

        console.log(this.state);
        if (this.state.xIsNext && this.state.player == 'X') {
        } else if (!this.state.xIsNext && this.state.player == 'O') {
        } else {
            return;
        }

        this.props.socket.emit('move', {game: this.state.game, number: i});

        this.move(i);
    }

    move(i: number) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';

        console.log(this.state.xIsNext);


        this.setState({
            history: history.concat([{
                squares: squares,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        }, () => {
            /*if (!this.state.xIsNext) {
                let oMove = new AI('O').computeMove(squares);
                this.handleClick(oMove);
                console.log("Would Move to ", oMove);
            }*/
        });
    }

    jumpTo(step: number) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);


        const moves = history.map((step, move) => {
            const desc = move ?
                "Goto Move #" + move :
                "Goto Game Start";
            return (

                    <Button key={move} onClick={() => {
                        this.jumpTo(move)
                    }} size="sm">{desc}</Button>

            )
        })

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i: number) => this.handleClick(i)}
                    />

                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>{this.state.stepNumber}</div>
                    <div>Player: {this.state.player}</div>
                    <div>Game: {this.state.game}</div>
                    <ButtonGroup vertical>{moves}</ButtonGroup>
                </div>
            </div>
        );
    }
}

export function calculateWinner(squares: Array<string>) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}

class App extends React.Component<{}, any> {
    constructor(props: {}) {
        super(props);
        this.state = {connected: false};
    }

    componentDidMount(): void {
        this.connect()
    }

    connect(): void {
        let socket: SocketIOClient.Socket | null = null;
        socket = io.connect(`http://${window.location.hostname}:4000`);
        socket.on('news', (data: any) => {
            console.log("Connected: ", data);

            if (data.message == "joined") {
                this.setState({
                    connected: true,
                    currentGame: {game: data.game, player: data.player, socket: socket}
                });
            }
        });

        socket.on('disconnected', (data: any) => {
            console.log("other guys disconnected");
            this.setState({connected: false});
            if (socket !== null)
                socket.disconnect();
            this.connect();
        })
    }

    render() {
        if (!this.state.connected) {
            return (
                <div>Waiting for Another Player ... </div>
            );
        } else {
            return <Game
                player={this.state.currentGame.player}
                game={this.state.currentGame.game}
                socket={this.state.currentGame.socket}
            ></Game>
        }

    }
}

// ========================================

ReactDOM.render(
    <Container className="p-3"><App/></Container>,
    document.getElementById('root')
);
