'use client'
import { useReducer } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons'

/*
	 0 1 2 3 4 5 6
	0. . . . . . .
	1. . . . . . .
	2. . . . . . .
	3. . . . . . .
	4. . . . . . .
	5. . . . . . .

     c0c1c2c3c4c5c6
   r0. . . . . . .
   r1. . . . . . .
   r2. . . . . . .
   r3. . . . . . .
   r4. . . . . . .
   r5. . . . . . .

	cn{7}: blue column
	rn{6}: square with width of cn
		circle{1}: ["red":'r'|"yellow":'y'|"white":'w']
	

array[coli][rowi]

	options: click reset
	
	endGameState: options: can only reset

	if won||draw:
		options: click on columns (nothing happens)	
	
	win||draw flow:
		click on column
		checkWinner:
		if true setEndGameState
		else continue

*/

type GameBoard = string[][];

type GameState = {
	board: GameBoard;
	nextTurn: string;
	winner: string;
};

type WinnerObject = {
	winner: string;
	positions: number[][];
};

function setPlayer1(){ return 'r'; }

function moores():number[][]{ 
	let nums:number[][];
	nums = [
		[-1,-1], [ 0, 1], [ 1, -1],
		[-1, 0]         , [ 1,  0],
		[-1, 1], [ 0,-1], [ 1,  1]
	];
	return nums;
}

function checkPos(ci:number, ri:number, mc:number, mr:number, board:GameBoard):WinnerObject|false{
	if(board[ci]===undefined){
		return false;
	}
	let origin = board[ci][ri];
	if(origin === 'w' || origin === undefined){
		return false;
	}
	let acc = [origin];
	let coords:number[][] = [[ci, ri]];
	for(let i=1; i<4; i++){
		if(board[ci+i*mc]!==undefined){
			let [c, r]:number[] = [ci+i*mc, ri+i*mr]
			acc.push(board[c][r])
			coords.push([c, r]);
		}
	}
	if(acc.length===4){
		let myset = new Set(acc);
		if(myset.size!=1||acc[0]===undefined||acc[0]==='w'){ // problems with 'w'?
			return false;
		}else{
			return {winner: acc[0], positions: coords}; // the winning color: 'r'|'y'
		}
	}else{
		return false;
	}
	
}

function checkWinner(board:GameBoard):WinnerObject{
	let nhs:number[][] = moores();
	for(let ci:number=0; ci<=6; ci++){
		for(let ri:number=0; ri<=5; ri++){
			for(let i=0; i<nhs.length;i++){
				let [mc, mr]:number[] = nhs[i];
				let result:(WinnerObject|false) = checkPos(ci, ri, mc, mr, board); // false||{winner: , positions: }
				if(result!==false){
					return result;
				}
			}
		}
	}
	return { winner: 'none', positions: [[]] };
}

function createGameBoard():GameBoard{
	let newGameBoard:GameBoard = [];
	for(let i=0; i<=6; i++){
		let temp:string[] = [];
		newGameBoard.push(temp)
		for(let j=0;j<=5;j++){
			newGameBoard[i].push('w')
		}
	}
	return newGameBoard;
}

function createNewGameState():GameState{
	return { board: createGameBoard(), nextTurn: setPlayer1(), winner: 'none' };
}

function columnClicked(ci:number, dispatch:any):(e:any) => void{
	return function(e:any):void{
		dispatch({ action: 'makeMove', ci: ci });
	};
}

function resetGame(dispatch:any):(e:any) => void{
	return function (e:any):void{
		dispatch({action: 'resetGame'});
	};
}
	
function reducer(state:GameState, action:any):GameState{
	switch(action.action){
		case 'resetGame':
			return createNewGameState();
		case 'makeMove':
			let ci:number = action.ci;
			let nextTurn:string = state.nextTurn
			let winnerObject:WinnerObject = checkWinner(state.board);
			if(winnerObject.winner!=='none'){ // so we dont change the board
				return { board: state.board, nextTurn: nextTurn, winner: winnerObject.winner};
			}
			let situation = state.board[action.ci].map(x => x).reverse().reduce((a, x) => {
				if(a.appended){
					return {appended: true, column: a.column.concat(x)};
				}else if(x=='w'){
					return {appended: true, column: a.column.concat(nextTurn) } 
				}else{
					return {appended: false, column: a.column.concat(x)}
				}
			}, {appended:false, column:([] as string[])});
			if(situation.appended){
				state.board[action.ci] =situation.column.map(x => x).reverse();
				nextTurn = state.nextTurn=='r'?'y':'r';
			}
			// { winner: 'none'}|{ winner: 'r'|'y', positions: [(int, int)]{4}}
			winnerObject = checkWinner(state.board); 
			if(winnerObject.winner!=='none'){
				winnerObject.positions.forEach(xy =>{
					let [c, r]:number[] = xy;
					state.board[c][r] = winnerObject.winner+' blackradius';
				});
			}
			if(!state.board.flat().some(x => x=='w')){
				return { board: state.board, nextTurn: 'draw', winner: winnerObject.winner};
			}else{
				return { board: state.board, nextTurn: nextTurn, winner: winnerObject.winner};	
			}
		// case "assertMove":
			// console.log("assertting move")
			// let myci = action.ci;
			// let nextTurnPotential = state.nextTurn+'l';
			// console.log(myci, nextTurnPotential)
			// if(state.board[myci].some(x => x== 'w')){
				// let situation = state.board[myci].map(x => x).reverse().reduce((a, x) => {
					// if(a.appended){
						// return {appended: true, column: a.column.concat(x)};
					// }else if(x=='w'){
						// return {appended: true, column: a.column.concat(nextTurnPotential) } 
					// }else{
						// return {appended: false, column: a.column.concat(x)}
					// }
				// }, {appended:false, column:[]});
				// state.board[myci] = situation.column.map(x => x).reverse();
				// return state;
			// }else{
				// return state;
			// }
		// case "removeAssertMove":
			// // let resetcolumn = state[action.ci];
			// console.log('mouseleft', action.ci)
			// state[action.ci] = state.board[action.ci].map(x => {
				// if(x=='yl'||x=='rl'){
					// return 'w';
				// }else{
					// return x
				// }
			// })
			// return state; 
		default:
			throw new Error('Reducer error: invalid action passed.')
	}
	
}


// function showPotentialMove(ci, state, dispatch){
	// let column = state.board[ci];
	
	// return function (e){
		// dispatch({ action: 'assertMove', ci: ci })
	// }
// }

// function removePotentialMove(ci, state, dispatch){
	// let column = state.board[ci];
	// return function (e){
		// dispatch({action: "removeAssertMove", ci: ci})
	// }
// }

function setBoard(state:GameState, dispatch:any){
	let myRows = (ci:number) => {
		let myDivs = [0, 1, 2, 3, 4, 5].map((ri:number) =>{
			let sq:string = "r"+ri+" square "+state.board[ci][ri];
			let mykey:string = ri.toString();
			return (<div className={sq} key={mykey}>
					<div className="circle" key={mykey}></div>
				</div>
			)	
		});
		return (<>{myDivs}</>)
	};
	let arr:number[] = [0, 1, 2, 3, 4, 5, 6];
	let myColumns = arr.map((ci:number) => {
		let val:string = "c"+ci;
		return (<div className={val} key={ci.toString()} onClick={columnClicked(ci, dispatch)}>{myRows(ci)}</div>)
	});
	return (<>
		{myColumns}
	</>)
}

function setInfo(state:GameState, dispatch:any){
	let announce:string = state.winner=='none'?(state.nextTurn=="draw"?"DRAW!":"Turn:"):"WINNER!"
	if(state.winner!='none'){
		state.nextTurn = state.winner.split(' ')[0];
	}
	let turnColor:string = "turnfourinarow square "+state.nextTurn;
	return (<>
		<div className="gameannouncer">
			<div className="announcerbackground">
				<div className="nextAction">{announce} </div>
				<div className={turnColor}>
					<div className="circle"></div>
				</div>
			</div>
		</div>
		<div className="gamereset">
			<button className="resetfourinarow" onClick={resetGame(dispatch)}>
				<FontAwesomeIcon style={{color: "black"}} icon={faRotateLeft} />
			</button>
		</div>
	</>)
}

export default function Page(){
	const [state, dispatch] = useReducer(reducer, createNewGameState());
	return (<>
		<div className="grid-x grid-padding-x grid-container" id="fourinarow">
			<div className="gametitle-fourinarow">Four In A Row</div>
			<div className="gamewrapper">
				<div className="gameboard-wrapper">
					<div className="gameboard">
						{setBoard(state, dispatch)}
					</div>
				</div>
				<div className="gameinfo">
					{setInfo(state, dispatch)}
				</div>
			</div>
		</div>
	</>)
}