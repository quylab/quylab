'use client';

//import Helmet from 'react-helmet'; <Helmet><title>Quy Resume</title></Helmet>
//import React, { useEffect } from 'react';
//function setTitle(){ useEffect(() => { document.title = document.title+' | Resume'; }, []); } // {setTitle()}


export default function Page(){
	return (<>
	<div className="grid-x grid-padding-x grid-container fluid" id="resume">
		<div className="cell small-12 large-8 large-offset-2">
			<div className="heading_projects">
			{/* <div className="outerbracket"><div></div></div> */ }
				<h2>Resume</h2>
				{/* <div className="outerbracket rotate180"><div></div></div> */} 
			</div>
		</div>
		
		<div className="cell small-12 large-10 large-offset-1">
			<div className="res_title"><div>Personal Statement</div></div>
			<div className="smt">
					A highly motivated full-stack developer with an eager problem-solving mindset. I look forward to working on your software solutions and creating engaging websites.
			</div>
		</div>
		<div className="cell small-12 large-10 large-offset-1" id="skills">
			<div className="res_title"><div>Skills</div></div>
			<div className="smt">
					<ul>
						<li>Working  independently on large projects</li>
						<li>SQL Databases</li>
						<li>Cloud architectures/AWS</li>
						<li>Strong PHP, HTML/CSS skills</li>
						<li>TypeScript SPAs/React &#177; Redux</li>
						<li>Server side JavaScript (Node.js)</li>
					</ul>
			</div>
		</div>
		<div className="cell small-12 large-10 large-offset-1"><hr /></div>
		<div className="cell small-12 large-10 large-offset-1">
			<div className="res_title"><div>Experience</div></div>
			<div className="smt">
					<strong>Web Developer</strong> | <em>Maxo Telecommunications (ACN 129 852 526)</em> | 2021 &ndash; 2022
					<ul>
						<li>Working independently on client facing web applications</li>
						<li>Integrating PHP with SQL to display client data, reports and graphs</li>
						<li>Creating interfaces using frameworks such as jQuery, Chart.js and others</li>
						<li>Involving external APIs with company systems to enhance user experience</li>
					</ul>
			</div>
			<div className="smt">	
					<div className="dtable">
						<div>
							<div><strong>Work Experience</strong></div>
							<div>&nbsp;| <em>Nascordia (ACN 164 640 715)</em> | Summer 2020 </div>
						</div>
						<div>
							<div><strong>Paid Internship Program</strong></div>
							<div>&nbsp;| <em>Nascordia (ACN 164 640 715)</em> | 2020 &ndash; 2021</div>
						</div>
					</div>
					<ul>
						<li>Developed proof of concepts, and worked on core pre-production technology stack</li>
						<li>Helped in acquiring new clients</li>
						<li>Server side programming, mainly in Node.JS</li>
					</ul>
			</div>
			<div className="smt">
					<strong>Bachelor of Commerce</strong> | <em>University of Melbourne</em> | 2016 &ndash; 2018
					<ul>
						<li>Majoring in Economics and Finance</li>
						<li>Completed final year Algorithmic Trading course (Python)</li>
						<li>Treasurer Greek Student Union in 2018 (NUGAS)</li>
					</ul>
			</div>
			
			<div className="smt">
					<strong>Retail & Hospitality Jobs</strong> | <em>Schnitz, Holland Foundation, Nando's</em> | 2014 &ndash; 2019
					<br />
					<strong>1st Degree Black Belt</strong> | <em>Iwama Ryu Aikido</em> | 2014 &ndash; 2017
					<br />
					<strong>Treasurer</strong> | <em>National Union of Greek Australian Students (NUGAS)</em> | 2018 &ndash; 2019 
					<br />
					<strong>VP Technology</strong> | <em>UQ Fintech</em> | 2020 &ndash; 2021
					
					<br />
					<em><strong>Highlights include: </strong></em>
					<strong>Team Leader</strong> | <em>The Holland Foundation</em> | Dec  2016 &ndash; Jul 2017 (7 months)
					<ul>
						<li>Delegating volunteers to maintain the op shop's operations</li>
						<li>Helped organise the retail space and shop inventory</li>
						<li>Ran a promotion for the foundation's charity ball in the local neighbourhood </li>
						<li>Trained new volunteers in the running and maintenance of the store</li>
					</ul>
			</div>
			<hr />
			<div className="res_title"><div>Hobbies</div></div>
			<div className="smt hobbies">
				<div>	
					<div className="hobbylabel"><strong>Mathematics</strong></div>
					<div className="text">Diploma of Mathematics (online), one course per semester as a personal interest</div>
				</div>
				<div>
					<div className="hobbylabel"><strong>Music</strong></div>
					<div className="text">Playing bass guitar pieces both modern and classic</div>
				</div>
				<div>
					<div className="hobbylabel"><strong>Reading</strong></div>
					<div className="text">Literary fiction and general non-fiction</div>
				</div>
			</div>
			
			
			<div className="res_title"><div>Referees</div><i>Contact details available upon request.</i></div>
			{/* <div className="smt">
				<i>Further contact details available upon request.</i>
			</div> */}
			<div className="smt no-margin">
				<div className="refName"><strong>Matthew Lord</strong></div>
				<div className="refquote">
					<ul>
						<li>Lead Web Developer</li>
						<li>Maxo Telecommunications</li>
					</ul>
				</div>
			</div>
			<div className="smt no-margin">
				<div className="refName"><strong>N Chan</strong></div>
				<div className="refquote">
					<ul>
						<li>Head of Platform</li>
						<li>Nascordia</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	</>)
} 