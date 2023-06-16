
function zip(xs, ys, acc=[]){
	// arr -> arr -> [[key, value]]
	if(xs.length==0||ys.length==0){ return acc }
	acc.push([xs[0], ys[0]])
	return zip(xs.slice(1), ys.slice(1), acc)
}

function arrayof(elem) {
	var ret = []; var i = 0;
	while(i<elem.length){ ret = ret.concat(elem[i++])	}
	return ret
}

function diags(arr, first=false, count=0){
	count++
	if(count>2){ throw new Error('running too much') }
	if(Math.sqrt(arr.length)!==Math.floor(Math.sqrt(arr.length))){
		throw new Error('f. diags: An algorithmic error has occured.')
	}
	var sqrted = Math.sqrt(arr.length)
	var row = 0
	var ret = []
	while(row<sqrted){
		var temp   = []
		var up    = 0
		var right = 0
		while(arr[row*sqrted-(up*sqrted)+right]!==undefined){
			temp.push(arr[row*sqrted-up*sqrted+right])
			up++
			right++
		}
		if(temp.length>sqrted){ temp = temp.slice(0,-1) }
		if(Array.isArray(first)&&temp.length===sqrted){
			// nothing
		}else{
			ret.push(temp)
		}
		row++
	}
	
	var row2 = (sqrted-1)
	while(row2<arr.length){
		var temp   = []
		var up   = 0
		var left = 0
		while(arr[row2-up*sqrted-left]!==undefined){
			temp.push(arr[row2-up*sqrted-left])
			up++
			left++
		}
		if(Array.isArray(first)&&temp.length===sqrted){
			// nothing
		}else{
			ret.push(temp)
		}
		row2 = row2 + sqrted
	}
	
	if(Array.isArray(first)){
		return [].concat(first, ret)
	}else{
		return diags(arr.slice(0).reverse(), ret, count)
	}
	
}

function fromIn(i, arr){
	var di = diags(arr)
	var prelim = di.filter(d => d.includes(i))
	var ret = [].concat(prelim.map(p => {
		var mid = p.indexOf(i)
		return [p.slice(0,mid), p.slice(mid+1)]
	})).flat().filter(a => a.length>=1)
	return ret
}

function range(n){ return [...new Array(n).keys()] }

function diags2(arr){
	var width = Math.sqrt(arr.length)
	if( width !== Math.floor(width)){ throw new Error('f. range: An algorithmic error has occured.') }
	var diagNum = 2*width - 1
	var y = range(diagNum)
	var diags = y.map((x, k) => {
		return (x<width) ? (x) : (k-width)*width-1+width*2
	})
	return diags.map((c, i) => {
		var ret = []
		while( c<width**2 && c < (i+1)*width-1 ){
			ret.push(arr[c])
			c += width - 1
		}
		return ret
	})

}

function con(arr){
	var width = Math.sqrt(arr.length)
	if( width !== Math.floor(width)){ throw new Error('f. con:An algorithmic error has occured.') }
	var ret = []
	while(arr.length>0)
	{
		ret.push(arr.slice(0, width))
		arr = arr.slice(width)
	}
	return ret
}

function getrest(i, j, arr){
	var ret = []
	while(arr[i][j]!==undefined){
		ret.push(arr[i][j])
		i++
		j++
	}
	return ret
}

function forLooop(arr){
	var width = Math.sqrt(arr.length)
	if( width !== Math.floor(width)){ throw new Error('f. forLooop: An algorithmic error has occured.') }
	arr = con(arr)
	var diagNum = 2*sqrted - 1
	
	var ret = []
	range(width).map(j => ret.push(getrest(0, j, arr)))
	range(width).slice(1).forEach(i => {
		ret.push(getrest(i, 0, arr))
	})
	return ret

}