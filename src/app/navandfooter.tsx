'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlask } from '@fortawesome/free-solid-svg-icons'
import {UIEvent} from 'react';


if(typeof window !== 'undefined'){
	window.addEventListener('resize', toggleMenu(true));	
}

function QuyLabLogo(){
	return (<>Quy <span className="mobilehide">Lab</span> <FontAwesomeIcon style={{height: "20px"}} icon={faFlask} /></>)
}

function MenuItems(){
	return (<>
		<li><a href="/">Home</a></li>
		<li><a href="/resume">Resume</a></li>
		<li><a href="/projects">Projects</a></li>
		{/* <li><a href="/blog">Blog</a></li> */ }
		<li><a href="/projects/planogram">PLANOGRAM</a></li>
		<li><a href="/contact">Contact</a></li>
	</>)
}

function toggleMenu(resize:boolean){
	if(typeof resize !== 'boolean'){
		throw new Error("*Event Parameter Error: failed to pass valid parameter to event.")
	}
	return function(){
		let topBarRight = document.getElementsByClassName("top-bar-right")[0];
		if(!resize && topBarRight.classList.contains("open")){
			topBarRight.classList.replace("open", "close");
		}else{
			topBarRight.classList.replace("close", "open");
		}
	}
	
}

function MyTopBar(){
	return(<div className="top-bar noselect" id="menu">
			<div className="top-bar-left mobile"><ul className="menu">
				<li className="menu-text"><QuyLabLogo></QuyLabLogo></li>
			</ul></div>
			<div className="top-bar-right open">
				<ul className="menu mobile">
					<MenuItems/>
				</ul>
				<div className="burgerMenu noselect" onClick={toggleMenu(false)}>
					<div className="burgerlines">
						<div className="burgerline"></div>
						<div className="burgerline"></div>
						<div className="burgerline"></div>
					</div>
					<div className="closelines">
					</div>
				</div>
				<div className="showmenulist">
					<ul className="menu mobile">
						<MenuItems/>
					</ul>
				</div>
			</div>
		</div>
	)
}


export function Nav(){
	return (<nav>
		<MyTopBar />
	</nav>)
}

export function Footer(){
	return (<footer>
		<div className="grid-x grid-padding-x footer" >
			<div className="cell small-12 ">
			 &#169; Quy Fatouros 2023
			</div>
		</div>
	</footer>)
}
