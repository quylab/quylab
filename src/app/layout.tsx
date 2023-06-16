import './globals.css'
//import { Inter } from 'next/font/google'
import React, {Component} from 'react';

//import './foundation.css'
import './style.css'

import {Nav, Footer} from './navandfooter.tsx'

//const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Quy Lab',
  description: 'Created in Next.JS by Quy Fatouros',
}

interface Props {
  children: React.ReactNode;
}

// SERVER COMPONENT
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
	type Pages = {
		//resume: string;
		//projects: string;
		//contact: string;
		[key: string]: any;
	};
	let MY_TITLE_O:Pages = {
		"resume": "Resume",
		"projects": "Projects",
		"contact": "Contact"
	};

	let index = (children as any)?.props?.childProp?.segment;
	let MY_TITLE;
	MY_TITLE = MY_TITLE_O[index];
	if(typeof MY_TITLE === "undefined"){
		MY_TITLE = "Quy Lab";
	}
	// else if (typeof index==='string' && (["resume", "projects", "contact"]).indexOf(index)>=-1){
		// MY_TITLE = MY_TITLE_O[index];
	// }
	//let interClassName = {inter.className};
  return (
    <html lang="en">
	  <head><title>{MY_TITLE}</title>
	  </head>
      <body className="">
		<Nav />
		<main>
			{children}
			<Footer />
		</main>
		</body>
    </html>
  )
}
