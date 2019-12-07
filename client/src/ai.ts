import * as _ from "lodash";
import {calculateWinner} from './index'

export class AI {
    player: string;

    otherPlayer: string;

    constructor(player: string) {
        this.player = player;
        this.otherPlayer = this.player === 'X' ? 'O' : 'X';
    }

    computeMove(board: Array<string>) {
        let move: number | null = null;
        let winningMove: number | null = null;

        _.each(board, (e, i) => {
            if (board[i] == null) {
                const newBoard = board.slice();
                newBoard[i] = this.player;
                const winner = calculateWinner(newBoard);
                if (winner === this.player) {
                    winningMove = i;
                }

                newBoard[i] = this.otherPlayer;
                const winner2 = calculateWinner(newBoard);
                if (winner2 === this.otherPlayer) {
                    move = i;
                }
            }
        });

        if (winningMove != null) {
            return winningMove;
        }
        if (move !== null) {
            return move;
        }
        return _.findIndex(board, function (e) {
            return e == null
        });
    }
}
