'use client';

import chess from '../img/proj_chess.jpg'
import busstops from '../img/proj_busstops.jpg'
import sudoku from '../img/proj_sudoku.jpg'
import fourinarow from '../img/proj_fourinarow.jpg'

export default function Projects(){
	return (<>
	<div className="grid-x grid-padding-x grid-container" id="projects">
		<div className="cell small-12 large-8 large-offset-2">
			<div className="heading_projects">
				<div className="outerbracket"><div></div></div>
				<h2>My Projects</h2>
				<div className="outerbracket rotate180"><div></div></div>
				{/* <div className="githubbanner mobilehide"><a href="https://github.com/quy-world" target="_blank">github.com/quy-world</a> </div> */}
			</div>
			{/* <div>
				<div className="githubbanner mobileshow"><a href="https://github.com/quy-world" target="_blank">github.com/quy-world</a> </div>
			</div> */}
		</div>
		
		<div className="cell small-12 projtitle">Four In A Row</div>
		<div className="cell medium-6 recol" >
		<a href="/projects/fourinarow.html" target="_blank">
			<img src={fourinarow.src} alt="fourinarow" className="proj_fourinarow"/>
			<div className="viewmore">View Project!</div>	
		</a> 
		
		</div>
		<div className="cell medium-6 large-5 fourinarowinfo">
			
			<div className="projinfo"> 
				A fully functional multi-player online Four In A Row game, made in ReactJS with TypeScript. Wins, draws and mobile-view support in under 1k lines.
			</div>
			<div className="stack"><span>Stack:</span><ul>
				<li>React with TypeScript events and functions</li>
				<li>HTML/CSS styling</li>
				<li>Cross-checking valid moves using array data structures</li>
			</ul></div>
			<div className="stackicons">
				<div className="iconreact"></div>
				<div className="iconts"></div>
				<div className="iconcss"></div>
			</div>
		</div>

		{ /* <div className="cell small-12 projtitle">Chess</div>
			<div className="cell medium-6 recol" >
			<a href="/chess/index.html" target="_blank">
				<img src={chess.src} alt="chess" className="proj_chess"/>
				<div className="viewmore">View Project!</div>	
			</a> 
			
			</div>
			<div className="cell medium-6 large-5 chessinfo">
				
				<div className="projinfo"> 
					A fully functional multi-player online chess game, made in vanilla JS. Implemented are special moves such as en passant and castling in under 1k lines.
				</div>
				<div className="stack"><span>Stack:</span><ul>
					<li>JS events and functions</li>
					<li>HTML/CSS styling</li>
					<li>Cross-checking valid moves using array data structures</li>
				</ul></div>
				<div className="stackicons">
					<div className="iconjs"></div>
					<div className="iconcss"></div>
				</div>
			</div> */}
		
		
		<div className="cell small-12 projtitle">Bus Stops</div>
		<div className="cell medium-6 large-5">
			<div className="projinfo"> 
				<strong>A bus network simulation engine.</strong> Performed in JavaScript, Custom CSS sprites and manipulation. Each passenger implements agent-based reasoning and calculates their preferred route to their destination from their understanding of the current bus network.
				
				Engine supports multiple clients through a deterministic store-and-replay model in a write-only database.
			</div>
			<div className="stack"><span>Stack:</span><ul>
				<li>JS (object oriented)</li>
				<li>Fully CSS-based graphics</li>
				<li>Resource Optimisation / Pathfinding</li>
				<li>Normalised database schema, supporting append-only stores</li>
			</ul></div>
			<div className="stackicons">
				<div className="iconjs"></div>
				<div className="iconcss"></div>
				<div className="iconphp"></div>
				<div className="iconsql"></div>
			</div>
		</div>
		
		<div className="cell medium-6 recol" >
		<a href="/busstops/index.php" target="_blank">
				<img src={busstops.src} alt="busstops" className="proj_chess" />
				<div className="viewmore">View Project!</div>
		</a>
		</div>

		{/* <div className=" smallproj cell medium-4 small-12 smaller medium-offset-4 large-offset-4"> */}
		<div className=" smallproj cell medium-4 small-12 smaller">
			<h2>Sudoku</h2>
			<a className="smallproj" href="/sudoku/index.php" target="_blank">
				<img src={sudoku.src} />
				<div className="viewmore small">View Project!</div>
			</a>
			<div className="stackicons">
				<div className="iconphp"></div>
				<div className="iconjs"></div>
			</div>
		</div>

		<div className=" smallproj cell medium-4 small-12 smaller">
			<h2>Chess</h2>
			<a className="smallproj" href="/chess/index.html" target="_blank">
				<img src={chess.src} />
				<div className="viewmore small">View Project!</div>
			</a>
			<div className="stackicons">
				<div className="iconjs"></div>
				<div className="iconcss"></div>
			</div>
		</div>

	</div>
	
	</>)
	
}