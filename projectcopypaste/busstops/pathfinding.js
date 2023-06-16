// Buses = [(RouteNumber, [stop])]
const busesN = [[3, [1, 2, 3, 35, 36]], [4, [2,3,4, 41, 42, 43]], [5, [3, 5, 51, 52, 43]]]


// Plan =  [(RouteNumber, [stop])]
const timestamp = Date.now()
function cl(...xs){console.log(...(xs.map(JSON.stringify)))}
function connects(i, edges){ return edges.reduce((a, x) => origin(x)===destination(i)?a.concat([x]):a, []) }
function head(arr) { return arr[0]                    }
function tail(arr) { return arr.slice(1) 		      }
function last(arr) { return arr.slice(-1)[0]          }
function pastetwo(l, j)     { return l.concat(j)         }
function revs(arr) { return arr.slice(0).reverse()    }
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
function sameArr(xs, ys){
	if(xs.length==0&&ys.length==0){	return true  }
	if(xs.length!=ys.length)      { return false }
	if(Array.isArray(xs[0])&&Array.isArray(ys[0])){
		return sameArr(xs[0], ys[0])?sameArr(xs.slice(1), ys.slice(1)):false 
	}else{
		return xs[0]===ys[0]        ?sameArr(xs.slice(1), ys.slice(1)):false 
	}
}
function cull(i, edges)    { return edges.reduce((a, x) => !sameArr(i, x)						 ?a.concat([x]):a, []) } 
function allrouteps(rs)   { return merge(...rs.map(r => routeps(r)))      }
function mult(n, a, acc=[]){
	if(n===0){ return acc }
	return mult(n-1, a, acc.concat(Array.isArray(a)?[a]:a))
}
function routeps(r) { 
	var [name, stops] = r
	var zipped = zip(stops, stops.slice(1)) 
	var zipped2 = zipped.map(z=> [z[1],z[0]])
	var combed = [].concat(zipped,zipped2)
	return zip(mult(combed.length, name), combed);
} 
function zip(x, y, acc=[]){
	if(x.length==0||y.length==0){ return acc }
	return zip(x.slice(1), y.slice(1), acc.concat([[x[0],y[0]]]))
}	
function unzip(xs, accx=[], accy=[]){
	if(xs.length==0){ return [accx, accy] }
	return unzip(xs.slice(1), accx.concat(xs[0][0]), accy.concat(xs[0][1])) 
}

function trampoline(f){
	return (...args) =>{
		let result = f(...args)
		while(  typeof result === 'function'){
			result = result()
		}
		return result
	}
}

function plan4(...args){
	if(args.length === 3){
		var results = (trampoline(froma)(...args))
  	return results[0]
	}
	throw new Error('plan4; wrong amount of args, received: '+args.length)
}

// -----------------------------------

function firstOptions(a, edges, longests=[]){
	edges.forEach(e => {
		if(a===origin(e)){
			longests.push([e])
		}
	})
	return longests.length>0?longests:false
}

function options2(alledges, longests){
	var ret = []
	var diff = false
	var newall = alledges
	longests.forEach(l => {
		// [[int, [int, int]]]
		var chucked = false
		alledges.every(a => {
			// [int, [int, int]]
			var beenbool = !beenTo(a, l)
			var bool = destination(last(l))===origin(a)
			if(beenbool && bool){
				diff = true
				chucked = true
				newall = cull(a, newall)
				ret.push(l.concat([a]))
			}
			return true
		})
		if(!chucked){ ret.push(l) }
	})
	return diff?[newall,ret]:[false, false]
}

function froma(a, b, alledges, longests=[], i=0){ return () => {
	// int -> [[int, [int, int]]] -> [] -> bool -> [[int, [int, int]]]
	if(i===0){ 
		var aExists = firstOptions(a, alledges, longests)
		if(aExists===false){ return false }
		longests = aExists
		longests.forEach(l => {
			alledges = cull(last(l), alledges)
		})
		i++
		return froma(a, b, alledges, longests, i) 
	}
	var [newedges, moreOptions] = options2(alledges, longests) // a here is not used 
	if(moreOptions!==false){
		// do some recursion
		i++
		return froma(a, b, newedges, moreOptions, i)
	}else{
		// filter longests and return shortest thing or false
		return shortestPath(b, longests)
	}
}}

function cull(edge, edges, acc=[]){
	// [int, [int, int]] -> [[int, [int, int]]] -> [] -> [[int, [int, int]]] || []
	if(edges.length===0){
		return acc
	} 
	if(sameArr(edge, head(edges))){
		var maybetail = tail(edges)!==undefined?tail(edges):[]
		return [].concat(acc, maybetail)
	}
	return cull(edge, tail(edges), [].concat(acc, [head(edges)]))
}
function spanner(b, l){
	var ret = []
	for(var i=0; i<l.length; i++){
		if(destination(l[i])===b){
			ret.push(l[i])
			return ret
		}	
		ret.push(l[i])
	}
	return false
}

function shortestPath(b, longests){
	var ret = []
	longests.forEach(l => {
		var spaned = spanner(b, l) // list or false 
		ret.push(spaned)
	})
	ret = ret.reduce((a, x) => x===false?a:a.concat([x]), [])
	return ret.length>0 ? ret.sort((a, b) => a.length-b.length):false
}

function beenTo(edge, edges){
	// [int, [int, int]] -> [[int, [int, int]]] -> bool
	var place    = destination(edge)//edge[1][1]
	var some = head(edges)[1][0]===place
	var some2 = edges.some(b => b[1][1]===place)
	return some||some2 
} 
	
function merge(...arrs)   { return [].concat(...arrs)                     }
function origin(edge)     { return edge[1][0] }
function destination(edge){ return edge[1][1] }

console.log("----pathfinding LOADED----")

