import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

// In React, function components are a simpler way to write components that only contain a render method and don’t have their own state.
function Square(props) {
  return (
    <button
      className="square"
      onClick={props.onClick}
      style={{ backgroundColor: props.backgroundColor }}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  // ref: https://www.telerik.com/blogs/beginners-guide-loops-in-react-jsx
  renderRow() {
    let content = [];
    for (let i = 0; i < 3; i++) {
      content.push(<div className="board-row">{this.renderSquare(3 * i)}</div>);
    }
    return content;
  }

  renderSquare(i) {
    let content = [];
    for (let j = 0 + i; j < 3 + i; j++) {
      content.push(
        <Square
          value={this.props.squares[j]}
          onClick={() => this.props.onClick(j)}
          backgroundColor={
            this.props.winningCombo && this.props.winningCombo.includes(j)
              ? "coral"
              : "transparent"
          }
        />
      );
    }
    return content;
  }

  render() {
    return <div>{this.renderRow()}</div>;
  }
}

function calculateWinner(squares) {
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
      return {
        winner: squares[a],
        combo: lines[i],
      };
    }
  }
  return null;
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          stepColumn: null,
          stepRow: null,
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      isEnded: null,
    };
  }

  handleClick(i) {
    if (this.state.isEnded) {
      alert("Game has ended.");
      return;
    }
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice(); // to create a copy of the squares array to modify instead of modifying the existing array
    if (squares[i] != null) {
      alert("This field is not empty!");
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    const afterStep = calculateWinner(squares);
    this.setState({
      // Unlike the array push() method you might be more familiar with, the concat() method doesn’t mutate the original array, so we prefer it.
      history: history.concat([
        {
          squares: squares,
          stepColumn: this.translateColumn(i),
          stepRow: this.translateRow(i),
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      isEnded: afterStep ? afterStep.combo : null,
    });
  }

  translateColumn(i) {
    switch (i) {
      case 0:
      case 3:
      case 6:
        return 1;
      case 1:
      case 4:
      case 7:
        return 2;
      case 2:
      case 5:
      case 8:
        return 3;
      default:
        alert("Unexpected step");
    }
  }

  translateRow(i) {
    switch (i) {
      case 0:
      case 1:
      case 2:
        return 1;
      case 3:
      case 4:
      case 5:
        return 2;
      case 6:
      case 7:
      case 8:
        return 3;
      default:
        alert("Unexpected step");
    }
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
    if (this.state.isEnded && step < this.state.history.length - 1) {
      this.setState({
        isEnded: null,
      });
    }
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winningStatus = calculateWinner(current.squares);
    const winner = winningStatus ? winningStatus.winner : null;

    const moves = history.map((step, move) => {
      const desc = move ? "Go to move #" + move : "Go to game start";
      const coordinate = move
        ? (move % 2 === 0 ? "O" : "X") +
          ": (" +
          step.stepColumn +
          "," +
          step.stepRow +
          ")"
        : "";
      const fontWeight = move === this.state.stepNumber ? "bold" : "normal";
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
          <span style={{ fontWeight: fontWeight }}>{coordinate}</span>
        </li>
      );
    });

    let status;
    if (history.length === 10) {
      status = "Result: Draw";
    } else if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winningCombo={winningStatus ? winningStatus.combo : null}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
