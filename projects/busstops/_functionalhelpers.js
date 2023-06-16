function any(xs, p){
	// [x] -> (f -> x) -> bool
	if(any.length == 0) {return false}
	if(p(xs[0])) {return true }
	return any(xs.slice(1), p)	
}
function cl(...args) { console.log(...args) }		
function jstr(obj){ return JSON.stringify(obj) }

function docgetId(id){ return document.getElementById(id) }
function docgetClass(name) { return document.getElementsByClassName(name) }
function deleteHTMLid(name){if(docgetId(name)!=null){docgetId(name).remove()}}

function take(n, xs){ return xs.slice(0, n) }
function lastfirst(arr){ return [].concat(arr.slice(-1)[0],arr.slice(0,-1)) }
function firstlast(xs){ return [].concat(xs.slice(1), xs.slice(0,1)) }


function pastetwo(l, j)     { return l.concat(j)         }
function span(fP, arr, acc=[[],[]]){
	// (a -> bool) -> [x] -> [[a], [b]]
	if(arr.length==0) { return acc }
	if(fP(head(arr))) { 
		acc[0] = pastetwo(acc[0], head(arr))
		return span(fP, tail(arr), acc)			
	}
	acc[1] = pastetwo(acc[1], arr)
	return acc
}

function parrot(n, a, acc=[]){
	if(n===0){ return acc }
	console.log(n, a, acc)
	return parrot(n-1, a, acc.concat(Array.isArray(a)?[a]:a))
}

function getStyleProp(elem, property){ return getComputedStyle(elem).getPropertyValue(property) }

function arrayof(elem) {
	var ret = []; var i = 0;
	while(i<elem.length){ ret = ret.concat(elem[i++])	}
	return ret
}
function zip(xs, ys, acc=[]){
	// arr -> arr -> [[key, value]]
	if(xs.length==0||ys.length==0){ return acc }
	acc.push([xs[0], ys[0]])
	return zip(xs.slice(1), ys.slice(1), acc)
}
function sortby(f, xs){ return  zip(xs.map(f), xs).sort((a,b) => a[0]-b[0])[0][1] }
function tally(arr, obj={}){
	if(arr.length==0){ return obj }
	if(typeof obj[arr[0]]=='undefined'){
		obj[arr[0]] = 1
	}else{
		obj[arr[0]]++
	}
	return tally(arr.slice(1), obj)
}
function 		ID(x){ return x						  }

function revs(arr) { return arr.slice(0).reverse()    }
function iseven(n) { return n%2===0          		  }

function init(arr) { return arr.slice(0, -1)          }
function head(arr) { return arr[0]                    }
function tail(arr) { return arr.slice(1) 		      }
function add(x, y) { return x + y					  }
function empty(xs){ return xs===undefined?0:xs.length==0 }

function zipwith(f, xs, ys, acc=[]){
	if(xs.length==0||ys.length==0){ return acc }
	return zipwith(f, tail(xs), tail(ys), acc.concat(f(head(xs), head(ys))))
}

function range(i, j, acc=[]){
	if(i==j){ return acc }
	return range(i+1, j, acc.concat(i))
}

function createElem(tag, id='', cls=[]){
	var elem = document.createElement(tag)
	elem.id = id
	elem.classList.add(...cls)
	return elem
}

/* function apply(...fs){
	return function(...args) {
		var first = true
		var res; 
		while(fs.length>0){
			if(first){ res = last(fs)(...args) ; first = false
			}else{     res = last(fs)(   res) }
			fs = init(fs)
		}
		return res
	}
} */