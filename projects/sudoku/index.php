<!DOCTYPE html>
<html lang="en-us">
	<head>
		<meta charset="utf-8">
		<title>Quy Sudoku Solver</title>
		<style>
			html, body{
				margin:0;
			}
			h1{
				text-align: center;
				margin-top: 20px;
			}
			#app{
				position: relative;
				width: 265px;
				height: 284px;
				left: calc(50% - 133px);
			}
			#btns{
				text-align: center;
			}
			#wrapper {
				position: relative;
				width: 292px;
				left: calc(50% - 146px);
				top: calc(50% - 146px);
			}
			#wrapper .row {
				clear: both;
				float:left;
			}
			#wrapper .row .cell {
				height:25px;
				width:30px;
				float: left;
				border: 1px solid grey;
				background: beige;
				text-align: center;
				font-size: 20;
				font-weight: 700;
				padding-top: 5px;
			}
			.cell.ans{
				color: gray;
			}
			.cell.err{
				color: red;
			}
			#wrapper .row .cell:nth-child(3n+1),
			#wrapper .row .cell:nth-child(3n+1) {
				border-left: 2px solid black;
			}

			#wrapper .row .cell:nth-child(9) {
				border-right: 2px solid black;
			}

			#wrapper .row:nth-child(3n+1) {
				border-top: 2px solid black;
			}

			#wrapper .row:nth-child(9) {
				border-bottom: 2px solid black;
			}
			#clear, #solve{ cursor: inherit; }
			
		</style>
		<script>
		function cl(...xs){ console.log(...xs) }
		function nineByNine(rows){
			return rows.map(r => arrayof(r.children).map(c => c.innerText.length===0?'.':c.innerText))
		}
		const arrayof = (a) => [...Array(a.length).keys()].map((b , i) => a[i])
		
		function genpuzzle(str){
			// str -> [[ints|false]]
			var as = str.split(',')
			as = as.map(a => a.split(''))
			return as.map((a) => a.map((b) => b==='_'?[]:(b==='.'?false:Number(b))))
		}
		
		function sendPuzzle(e){
			document.body.style.cursor = 'wait'
			var rows = document.getElementsByClassName("row")
			var input = nineByNine(arrayof(rows)).map(r => r.join('')).join(',')
			try{
				fetch('/sudoku/sudokuapi.php'
				, {
					method: 'POST'
				, body: JSON.stringify(input)
				}).then((res) => res.json()).then(data => setPuzzle(input, data))
			} catch (err){
				console.log(err)
				console.log('Error submitting puzzle: ' , JSON.stringify(arg), 'error: ', JSON.stringify(err))
			}
		}
		
		function setPuzzle(input, res){
			document.body.style.cursor = 'default'
			resetCells()
			input = genpuzzle(input)
			if(res===false){
				arrayof(document.getElementsByClassName('cell')).forEach(c => c.classList.add('err') )
			}else{
				var docwrap = arrayof(document.getElementById('wrapper').children)
				docwrap.forEach((r, i) => {
					// rows
					arrayof(r.children).forEach((c, j) =>{
						c.innerText = res[i][j]
						c.contentEditable = "false"
						if(input[i][j]!==res[i][j]){
							c.classList.add('ans')
						}
					})
				})
			}
		}
		function div(){ return document.createElement('div') }
		function row(){
			var myrow = div()
			myrow.classList.add('row')
			return myrow
		}
		function cell(n, classes){
			var mycell = div()
			classes.forEach(c => mycell.classList.add(c))
			mycell.innerText = n
			mycell.contentEditable = "true"
			return mycell	
		}
		function wrapper(){
			var mywrapper = div()
			mywrapper.id = 'wrapper'
			return mywrapper
		}
		function resetCells(clearcells=false){
				arrayof(document.getElementsByClassName('cell')).forEach(c => {
					if(clearcells){ c.innerText = '' }
					c.classList.remove('ans')
					c.classList.remove('err')
					c.contentEditable = "true"
				})
		}
		
		document.addEventListener('DOMContentLoaded', _ => {
			document.getElementById('clear').addEventListener('click', _ => resetCells(true))
			var mainwrapper = wrapper()
			var defaultpuzz = genpuzzle("53...9...,.62......,4..1.5..2,...4..1.7,.7.....8.,2.8..3...,1..5.7..3,......89.,...9...54")
			Array.from(Array(9).keys()).map(i => {
				var myrow = row()
				Array.from(Array(9).keys()).map(j => {
					var num = defaultpuzz[i][j]
					myrow.appendChild(cell(num===false?'':num, ['cell']))
				})
				mainwrapper.appendChild(myrow)
			})
			document.getElementById('app').insertBefore(mainwrapper, document.getElementById('btns'))
			document.getElementById("solve").addEventListener("click", sendPuzzle)
		})
			
		</script>
	</head>
	<body>
		<h1>Quy Sudoku</h1>
		
		<div id="app">
			<div id="btns">
				<button id="solve">Solve</button>
				<button id="clear">Clear Puzzle</button>	
			</div>
		</div>
		
	</body>
</html>
