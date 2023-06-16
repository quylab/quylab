var epochtime;
var usercaninteract = false;

function shuffle(lst,acc=[]){
	if(lst.length===0){ return acc }
	var elem = lst[Math.floor(Math.random()*lst.length)]
	acc.push(elem)
	lst = removeFirst(lst, elem)
	return shuffle(lst, acc)
}
function removeFirst(lst, elem, accum=[]){
	if(lst.length===0){ return null }
	if(lst[0]==elem) { return accum.concat(lst.slice(1))}
	return removeFirst(lst.slice(1), elem, accum.concat(lst[0]))
}
function sameArr(xs, ys){
	try{
		if(xs.length===0&&ys.length===0){	return true  }
	}catch(e){
		throw new Error('sameArr: xs or ys are undefined')
	}
	if(xs.length!=ys.length)      { return false }
	if(Array.isArray(xs[0])&&Array.isArray(ys[0])){
		return sameArr(xs[0], ys[0])?sameArr(xs.slice(1), ys.slice(1)):false 
	}else{
		return xs[0]===ys[0]        ?sameArr(xs.slice(1), ys.slice(1)):false 
	}
}

function jsElem(tag, classes=[], id=false){
	// str -> [classnames] -> id -> jsHTMLThingo
	var elem = document.createElement(tag)
	classes.forEach(c=>{elem.classList.add(c)})
	if(id!==false){ elem.id=id } return elem
}

function randint(i,j){
	// i -> j -> range:[(int)i, (int)j)
	function tryAgain(num=null){
		if(num!==null&&num<=j&&num>=i) { return num }
		return tryAgain(Math.random()*(j)+1)
	}
	return Math.floor(tryAgain())
}

// BUSES:
function makebus(stops, accepts, loop=true, dbit=true){ 
	var sids  = stops.map(s => s.id)	
	var szip  = zip(sids, tail(sids))
	var fullpath = szip.flatMap(e => {
		return plan4(e[0], e[1], rgoin())
	})
	var ruut = [].concat([head(fullpath)[1][0], head(fullpath)[1][1]], tail(fullpath).map(b=>b[1][1]))
	ruut = ruut.map(r => state[1][r])
	var newbus = Object.create(bus_)
	newbus.id = bus_.id++
	newbus.stopsAt = accepts
	newbus.path = {}
	newbus.path.prevs = []
	newbus.path.progress = head(ruut)
	newbus.path.nexts = tail(ruut)
	newbus.path.loop = loop
	state[0].push(newbus)
	globalMon -= 100
	// qDB::
	if(newbus.id===null){ throw new Error('null added to db') }
	if(dbit){
		try{
			moddb({
					modid: 0
				,	epoch: epochtime
				, id   : newbus.id
				, route: newbus.stopsAt.map((a, i) => [i, a])+''
			})
			}catch(e){
				console.log('dbError: ', e)
			}
	}
	return newbus
}
var bus_ = Object.create(null)
bus_.htmlref = null
bus_.id = 0
bus_.retired = false
bus_.pause = false
bus_stopsAt = []
function showBusInfo(e){
	var thingo = (n) => n?e.target.classList.contains("fa-bus"):false
	thingo = thingo(true)
	var tgt = e.target.classList.contains('inbus')||thingo?e.target.parentNode:e.target
	arrayof(document.getElementsByTagName('button')).forEach(b => {
		if(b.id=='pausebtn'||b.id=='duplicate'){b.remove()}
	})
	var busid=tgt.getAttribute("busid")
	stopinfo2(state[0][busid], [tgt])
	clickedId = Number(busid)
	clickedState = 0
}

function duplicate(busid){
	var route = deriveRoute2(state[0][busid].path)
	var bus = makebus(route, state[0][busid].stopsAt, state[0][busid].loop) // bbb
	bus.firstOutput()
	clearInfo()
}
function deletebus(id, fromdb=false){
	var b = state[0][id]
	b.retired = true
	var g = getComputedStyle(b.htmlref)
	var [x, y] = [init(g.left), init(g.top)].map(a => Number(a))
	b.htmlref.remove()
	globalMon += 50
	clearInfo()
	if(fromdb){ return; }
	moddb({
			modid: 5
		, id    				: id
		, epoch 				: epochtime
	})
}
function pausebus(busid, fromdb=false){
	var waspaused = state[0][busid].pause ?? false
	state[0][busid].pause = !waspaused
	try{ 
		docgetId('pausebtn').textContent = !waspaused?'Resume Bus':'Stop Bus'
		docgetId('pausebtn').style.backgroundColor = pausebool?'lightyellow':'lightgreen'
	}catch(e){} 
	if(fromdb){ return; }
	moddb({
			modid: 6
		, id    				: busid
		, epoch 				: epochtime
		, pausedresumed : waspaused?1:0
	})
}

function highlightstops(bus) {
	var stopcoords = [...new Set(bus.passengers.map(p=>p.end.toString()))].map(i=>i.split(','))
										.map(i=>[Number(i[0]), Number(i[1])])
	deriveRoute3(bus).filter(s => s.isStop).map(s => s.id).forEach(id => {
		var elem = document.querySelectorAll("[stopid='"+id+"']")
		elem.item(0).style.background = 'red'
	})
	function stopsearch(coords, stops, stopids=[]){
		if(coords.length==0) { return stopids }
		var mystop = stops.filter(s => s.location[0]==coords[0][0]&&s.location[1]==coords[0][1])[0]
		return stopsearch(coords.slice(1), stops, stopids.concat(mystop.id))
	}

	var ids = stopsearch(stopcoords, state[1])
	
	ids.forEach(id => {
		var elem = document.querySelectorAll("[stopid='"+id+"']")
		elem.item(0).style.background = 'pink'
	})
}

function deriveRoute2(path){
	return ([].concat(
			   typeof path.prevs.slice(-1)[0]=='undefined'?[]:path.prevs.slice(-1)[0]
			,  typeof path.progress == 'number'? []: path.progress
			,  path.nexts
			,  path.prevs.slice(0,-1)))
}
function businfo(id){
	var ps = tally(psByDest(state[0][id].passengers))
	arrayof(document.getElementsByTagName('textarea')).map(x => x.remove())
	var info = jsElem('textarea', [], 'businfo')
	info.setAttribute("busid", id)
	info.textContent = formatPs(state[0][id])
	document.body.appendChild(info)
}
function newbusqry(e){
	changeMode('bus')
	infobox('Selected stops will highlight yellow: ', btns=['Cancel', 'Add bus'])
	docgetId('Cancel').addEventListener('click', e => changeMode('clear'))
	docgetId('Addbus').addEventListener('click', addNewBus)
}
function addNewBus(e){
	if(temproute.length<=1){
		changeMode('clear')
		infobox('Error: Must choose at least 2 bus stops.', ['Close'])
		docgetId('Close').addEventListener('click', e => changeMode('clear'))
	}else{
		var newbus = makebus(temproute, temproute.map(t => t.id), true) // bbb
		newbus.firstOutput()
		changeMode('clear')
	}
}

bus_.firstOutput = function(){
	var bus = jsElem('div', ['bus2'])
  try{
	var leftCSS   = this.path.progress.location[0]+'%';
	var bottomCSS = this.path.progress.location[1]+'%';
	}catch{}
	bus.style.left   = leftCSS
	bus.style.bottom = bottomCSS
	bus.style.color = "white"
	var myspan =jsElem("span") 
	bus.appendChild(myspan)
	bus.addEventListener('click', e => { clearInfo(); busclickinfo=true; return showBusInfo(e)} )
	docgetId("map").appendChild(bus)
	this.htmlref = bus
	bus.setAttribute("busid", this.id)
}
bus_.nextOutput = function(){
	var [leftCSS, bottomCSS] = this.leftbottomOutput()
	var s = this.htmlref
	s.style.left   = leftCSS  +"%"
	s.style.bottom = bottomCSS+"%"
}
bus_.psoutput = function() {
	var buselem = this.htmlref 
	cleardisplays(buselem.getElementsByClassName('inbus'))
	this.passengers.forEach(p=>{
		var newp = document.createElement('div')
		newp.classList.add('passenger')
		newp.classList.add('inbus')
		newp.style.background = p.typespecs.color
		this.htmlref.appendChild(newp)	
		newp.style.height = scale*intOfPx(getComputedStyle(newp).height) + 'px'
		newp.style.width 	= scale*intOfPx(getComputedStyle(newp).width) + 'px'
	})
	var [[x1, y1], [x2, y2]] = [ this.path.progress.location
														 , this.path.nexts[0].location
														 ]
	var myang = 90-m(x1,y1,x2,y2)
	this.htmlref.style.transform = ['rotate(', busangle(x1,y1,x2,y2), 'rad)'].join('')
}
function busangle(x1,y1,x2,y2){
  // returns the angle the bus should face
  //   (in CSS, facing left is 0, right is 180deg)
  var dx = x2-x1
	var dy = y2-y1
  var r = deg => deg/180*Math.PI
	if(dx==0) { 
		if(dy>0) { return r(90) }
		if(dy<0) { return r(270) }
		return null
	}
  var mat = Math.atan(Math.abs(dy/dx))
	if(dx>0 && dy>=0) { return r(180)-mat}
	if(dx>0 && dy<0) { return r(180)+mat}
	if(dx<0 && dy<0) { return r(360)-mat }
	if(dx<0 && dy>=0) { return mat }
}

bus_.leftbottomOutput = function(){
	if(typeof this.path.progress != 'number'){
		var coord = this.path.progress
		return coord.location
	}
	var prev = this.path.prevs.slice(-1)[0].location
	var next = this.path.nexts[0].location
	var perc = this.path.progress/100
	var [[x1, y1], [x2, y2]] = [prev, next]
	return [(x2-x1)*perc+x1, (y2-y1)*perc+y1]
}
bus_.capacity   = 15
bus_.route      = function(){ // list of stops
	return [].concat(this.path.prev,this.atStop()?this.path.progress:[],this.path.nexts)
}
bus_.fromto = function(){
	if(this.path.nexts.length==0) { return false }
	var from = ( this.atStop() ? this.path.progress
                               : this.path.prevs.slice(-1)[0])
	var to   =                   this.path.nexts[0]
	return [from, to]
}
bus_.passengers = [] //list of refrences to passengers
bus_.numpassengers = function(){
	return this.passengers.length
}
bus_.distance = function(){
	if(typeof this.fromto()=="boolean"){ return false }
	var [[x1, y1], [x2, y2]] = this.fromto().map(s => s.location)
	return pythag(x2-x1, y2-y1)
}
bus_.remaining = function(){
	if(this.atStop()){ return 0 }
	return this.distance() - this.path.progress/100*this.distance()
}
bus_.location = false // coord
bus_.nextstop = false
bus_.speed = 10
bus_.money = 0
bus_.expenditure = 0
bus_.tally = 0
bus_.getnextstop = function(){
	return this.path.nexts[0]
}

bus_.path = {}
bus_.atStop = function(){ 
	return ( (typeof this.path.progress != 'number')?
		      true : false ) 
}
bus_.progress = function(){
	if(typeof this.path.progress == 'number'){ return this.path.progress }
	return false
}
bus_.cost = function(){ var mc=0.01;this.money-=mc; globalMon-=mc; this.expenditure+=mc }
bus_.drive = function(){
	this.cost()
	if(this.atStop()){
		this.path.prevs.push(this.path.progress)
		this.psoutput()
		this.path.progress = 0
	}
	this.path.progress += this.speed/this.distance()*(1000/30)/2
	this.path.progress  = Math.min(100, this.path.progress)
	if(this.path.progress == 100){
		this.path.progress = this.path.nexts[0]
		this.path.nexts    = this.path.nexts.slice(1)
	}
}
bus_.tick = function(){
	if(this.retired){ return; }
	this.drive()
	if(this.atStop()){
		if(this.canStop(this.path.progress)) { this.unloadpassengers() }
		this.resetRoute()
		// LOAD PASSENGERS AND DEAL WITH STOP
		// TO GET STOP     // method
		this.psoutput() 
		if(!this.canStop(this.path.progress)) { return; }
		this.path.progress.busarrives(this)
	}
}
bus_.resetRoute = function(){
	if(this.path.nexts.length==0){
		this.path.nexts = revs(this.path.prevs)
		this.path.prevs = []
	}
}
bus_.canStop = function(s){
	// check if bus can stop, dropoff/loadpassengers
	return this.stopsAt.some(id => id==s.id)
}
bus_.unloadpassengers = function(){
		if(this.atStop()){
			var abeen = this.passengers.map(p=>p.been)
			beengoing(this)
			var bbeen = this.passengers.map(p=>p.been)
			this.passengers.forEach(p => {
				if(sameArr(this.path.progress.location,p.end)){
					// REACH END: 
					p.been = p.been.concat(p.going)
					p.going = []
					p.reacheddestination = true
					this.money += 4
					globalMon +=  4
					this.tally += 1
					this.passengers = this.passengers.filter(pe => pe.id!=p.id)
					return; 
				}
				if(last(p.been)===undefined){ return; } 
				if(sameArr(this.path.progress.location, stopbyname(last(p.been)[1][1]).location)){
					// REACH INTERMEDIATE STOP:
					this.path.progress.passengers = this.path.progress.passengers.concat(p)
					this.money += 4
					globalMon +=  4
					this.tally += 1
					this.passengers = this.passengers.filter(pe => pe.id!=p.id)
				}
			})
		}
}

bus_.loadpassenger = function(keen){
	if(this.passengers.length==this.capacity){ return false }
	this.passengers = [].concat(this.passengers, keen)
	return true
}

function deriveRoute(path){
	return ([].concat(
		   path.prevs
		,  (typeof path.progress=='number')?
		   []:path.progress
		,  path.nexts))
}

function lineStyle(stop1, stop2, ss=true, mycol='black'){
	// {,location:[num,num],} -> {,location:[num,num],} -> str
		try{
			var [x1, y1] = Array.isArray(stop1)?stop1:stop1.location
			var [x2, y2] = Array.isArray(stop2)?stop2:stop2.location
		}catch{}

	function edgeCases(x1,y1,x2,y2){
		// int -> int -> int -> int -> str|false
		if(x1==x2&&y1==y2){ return '0deg' }
		if(x1==x2){ // vertical
			return ((y1<y2)?'270deg':'90deg')
		}
		return (y1==y2)?((x1<x2)?'0deg':'180deg'):false
	}

	function edgeCases(x1,y1,x2,y2){
		// int -> int -> int -> int -> str|false
		if(x1==x2 && y1==y2){ return '0deg' }
		if(x1==x2){ return ((y1<y2) ? '270deg': '90deg') } //vertical
		if(y1==y2){ return ((x1<x2) ?   '0deg':'180deg') } //horizontal
		return false
	}
	function quadrant(x1,y1,x2,y2){
		// x1->y1->x2->y2 -> [right::bool, top::bool]
		return [x1<x2, y1<y2]
	}
	function opposite(y1,y2) { return Math.abs(y2-y1) }
	function thetaStr(righttop,x1,y1,x2,y2){
		// [right::bool,top::bool] -> str
		var O = opposite(y1,y2)
		var H = pythag(x2-x1,y2-y1)
		var theta = Math.asin((O/H))*180/Math.PI
		var [right, top] = righttop
		      if( right==true  && top==true  ){ return '-'+(theta)+'deg'// return 1
		}else{if( right==true  && top==false ){ return     (theta)+'deg'// return 2
		}else{if( right==false && top==false ){ return (180-theta)+'deg'// return 3
		}else{if( right==false && top==true  ){ return (180+theta)+'deg'// return 4
		}}}}
	}
	var righttop = quadrant(x1,y1,x2,y2)
	var [x_, y_] = [x1, y1]
	var theta = thetaStr(righttop,x1,y1,x2,y2)
  var angle = (x1 == x2 || y1 == y2) ? edgeCases(x1,y1,x2,y2) : theta
	var line  = jsElem('div', ['routeline'])
	line.style.transform = 'rotate('+angle+')'
	docgetId('map').appendChild(line)
	line.style.left      = 'calc('+x_+'% + '+'5px)'
	line.style.bottom    = 'calc('+y_+'% + '+'5px)'
	var d = intOfPx(getComputedStyle(docgetId('map')).width)/100
	line.style.width     = scale*pythag(x2-x1,y2-y1)*d+'px'
	line.style.background= mycol
}
// STOPS:
var scale = 1
var node_ = Object.create(null)
node_.id  = 0
node_.location = false 
node_.isStop = false
var stops_ = Object.create(node_)
stops_.htmlref = null
var clickedStops;

function peas(){
	// null -> false|0|1
	function peasExist(){ return docgetClass('pea').length!=0     }
	if(peasExist())     { 
		return docgetId('duplicate')!=null?0:1  
	} 
	return false
}
function formatPs(obj){
	// obj -> pretty str
	str = [obj.name, ' (', obj.location, ') ', infoPs(obj.passengers)] 
	return str.reduce((a, x) => a+x, '')
}
function infoPs(ps){
	// arr -> pretty str
	return ps.reduce((a,x) => {
		var [id, g, b] = [x.id, x.going, x.been]
		return a+['PID: ', id, '. G: ', g, '. B: ', b,'. \n\n'].reduce((a,x)=>a+x,'')		
	}, '')
}
function formatPs2(obj){
	// obj -> pretty str
	str = [obj.name, ' (', obj.location, ') ', infoPs2(obj.passengers)] 
	return str.reduce((a, x) => a+x, '')
}

function infoPs2(ps){ 
	//
	jstr('gh', ps);
	return ps.map(x => cPs([x.id, x.going, x.been])) 
}
function cPs(info){ 
	// [pid, p.going, p.been] -> html divs
	var [id, g, b] = info
	var elem  = jsElem('div' , ['pea' ])
	var elem2 = jsElem('div' , ['pea2'])
	var span  = jsElem('span'          )
	elem.appendChild(span)
	elem.appendChild(elem2)

	elem.setAttribute("pid", id)
	elem2.setAttribute("pid", id)
	span.setAttribute("pid", id)

	//span.style.marginLeft = '10%'
	span.classList.add('numstyle')

	span.innerText = id
	
	elem2.appendChild(journeyTable(id, g, b))
	

	elem.addEventListener('mouseover' , pslines  )
	//elem2.addEventListener('mouseover' , pslines  )
	elem.addEventListener('mouseleave', nopslines)
	//elem2.addEventListener('mouseleave', nopslines)

	return elem
}
function journeyTable(id, going, been){
	var table = document.createElement('table')
	table.setAttribute('pid', id)
	var tr = () => document.createElement('tr')
	var th = () => document.createElement('th')
	var td = () => document.createElement('td');
	var giveid = (elem) => { elem.setAttribute('pid', id); return elem }
	var Secnd2 =  () => { return ['From', 'To'].map(x => {
		var n = giveid(th())
		n.innerText = x
		return n
	})}
	var through = (bg, isbeen) => {
		var btr = giveid(tr())
		var bth = giveid(th())
		var bid = isbeen?'Took (id)':'Taking (id)'
		bth.innerText = bid
		btr.appendChild(bth)
		Secnd2().forEach(t => {
			btr.appendChild(t)
		})
		table.appendChild(btr)
		bg.forEach(b => {
			var n = giveid(tr())
			var [id, [from, to]] = b
			var [x, y, z] = [giveid(td()), giveid(td()), giveid(td())]
			x.innerText = id
			y.innerText = from
			z.innerText = to
			n.appendChild(x)
			n.appendChild(y)
			n.appendChild(z)
			table.appendChild(n)
		})
	}
	if(been.length>0) { through(been, true) }
	if(going.length>0){ through(going, false) }
	return table
}
function qwe(from, to, busob){
	var dw = [].concat(busob.path.prevs, busob.path.progress, busob.path.nexts)
	dw = dw.filter(d => (typeof d !== 'number'))
	var func = (x) => dw.findIndex(r => r.id===x)
	var [i, j] =  [func(from), func(to)] 
	if(j>=i){
		var ret = [].concat(dw.slice(i,j+1))
	}else{
		var ret =	dw.slice(j, i+1).reverse()//.reduce((a, x) => {
	}
	return ret.flat()
}
function lob(x){ return (...xs) => cl(x, ...xs) }
function pslines(e){
  // Draws on map where a passenger is and has been
	var tgt = e.target
	var myp = state[2][tgt.getAttribute('pid')]
	var func = (pq) => Array.isArray(pq)?pq.map(b => { 
		return qwe(b[1][0], b[1][1], state[0][b[0]]).map(e => e.location)
	}):[]
	var egg1 = func(myp.been)
	//if(egg1.length===0){ return; }
	var beenlines = [myp.start, myp.walkstrat.stopxy[1], ...egg1.map(w => w.slice(0)).flat()]
		beenlines = zip(init(beenlines), tail(beenlines))
	var egg2 = func(myp.going)
	//if(egg2.length===0){ return; }
	var goinglines = [...egg2.map(w => w.slice(0)).flat()]
		goinglines = zip(init(goinglines), tail(goinglines))
	beenlines.forEach( pair => lineStyle(pair[0], pair[1], false, 'red'))
	goinglines.forEach(pair => lineStyle(pair[0], pair[1], false, 'lightblue'))
}
function nopslines(e){ 
	arrayof(document.getElementsByClassName('routeline'))
		.forEach(i=> {if(i.style.background!='black'){i.remove()}})
}

function stopbyname(stopname){ return state[1].filter(s=>s.id===stopname)[0] ?? [] }

var sumPs = (ps) => Object.values(ps).reduce((acc,x)=> acc+x, 0)
var tupllify = (obj) => zip(Object.keys(obj), Object.values(obj))

function stopinfo(stopobj){ // not working on ticks
	arrayof(document.getElementsByTagName('textarea')).map(x => x.remove())
	var body = document.body
	var info = jsElem('textarea', [], 'stopinfo')
	info.setAttribute("stopid", stopobj.id)
	info.textContent = formatPs(stopobj)
	body.appendChild(info)
}
function stopinfo2(stopobj, bus=false){
	arrayof(document.getElementsByTagName('textarea')).map(x => x.remove())
	var inside = ( !Array.isArray(bus)
							 	 	 ?['Passengers at stop', stopobj.id, 'are:']
							 		 :['Passengers on bus', stopobj.id, 'are:']
							)
	var infbx = infobox(inside.join(' '), ['Cancel'])
	docgetId('Cancel').addEventListener('click', e => { stopclickinfo=false; clearInfo(e)})
	infoPs2(stopobj.passengers).forEach(s => infbx.appendChild(s))
	cl('	infbx:', infbx.outerHTML)
	if(Array.isArray(bus)){
		//duplicate bus:
		var body = infbx.getElementsByTagName('div').item(0)
		var cancelbtn = body.children.item(0)
		var tgt = bus[0]
		var busid = Number(tgt.getAttribute('busid'))
		var duo = jsElem('button', ['btns'], 'duplicate')
		duo.textContent = 'Duplicate Bus'
		duo.style.backgroundColor = 'lightblue'
		body.insertBefore(duo, cancelbtn)
		docgetId('duplicate').addEventListener('click', e=> duplicate(busid) )
		//pause button:
		var pause = jsElem('button', ['btns'], 'pausebtn')
		var pausebool = state[0][tgt.getAttribute("busid")].pause
		pause.textContent = pausebool?'Resume Bus':'Stop Bus'
		pause.style.backgroundColor = pausebool?'lightyellow':'lightgreen'
		body.insertBefore(pause, duo)
		docgetId('pausebtn').addEventListener('click', e=> pausebus(busid) )
		highlightstops(state[0][busid])
		// delete button:
		var deletebtn = jsElem('button', ['btns'], 'deletebtn')
		deletebtn.textContent = 'Delete Bus'
		deletebtn.style.backgroundColor = 'salmon'
		body.insertBefore(deletebtn, cancelbtn)
		docgetId('deletebtn').addEventListener('click', e => deletebus(busid) )
	}
	return infbx	
}
function newstopqry(e){
	changeMode('stop')
	neuestop=true
	infobox('Please click on a node: ', ['Cancel', 'Addstop'], true)
	docgetId('Cancel').addEventListener('click', e => { neuestop=false; changeMode('clear')})
	/// ----------------
	docgetId('Addstop').addEventListener('click', e=>{
		addNewStop(tempstop)
	})
}

function addNewStop(tempstop){
	if(!neuestop) { neuestop=false; changeMode('clear'); return; }
	if(neuestop){
		var t = atNode(tempstop, roadmode.xys)
		var mynode = nodeByCoords([t[0], t[1]])
		if(mynode!==false && !mynode.isStop){
			genstop(mynode.id, docgetId('stopname').value)
			state[1][mynode.id].output()
			neuestop = false
		}
		neuestop = false
		changeMode('clear')
	}
}
function nodeByCoords(coords){
	if(coords===false){ return false }
	var [menx, meny] = coords
	return state[1].reduce((a, x) => {
		if(a!==false){ return a }
		var [g, j] = x.location
		if(pythag(menx-g, meny-j)<10){ return x }
		return false
	}, false)
}

function stopClick(e){
	var action = neuebus?'busstops':'info'
	if("stop2l,stop2r,dot,numstyle".split(',').some(x => e.target.classList.contains(x))){
		var tgt = e.target.parentElement
	}else{
		var tgt = e.target
	}
	var stopid = Number(tgt.getAttribute("stopid"))
	var q = state[1][stopid]
	if(action=='info'){ clearInfo(); stopclickinfo=true; stopinfo2(q) }
	if(action=='busstops'){
		cl('DDDD')
		var stopid = Number(tgt.getAttribute("stopid"))
		//If stop already exists, remove it (i.e. click to select/to deselect)
		if(temproute.map(x => x.id).includes(stopid)){
			temproute=temproute.filter(x=>x.id!=stopid)
			state[1][stopid].htmlref.style.background = 'white'
		}else{
			temproute.push(state[1][stopid])
			state[1][stopid].htmlref.style.background = 'yellow'
		}
	}
	clickedId = Number(stopid)
	clickedState = 1
}

function notunique(...xs){ /* duplicatesP */ return Object.values(tally(xs)).some(x => x[0] > 1); }

function listPs(entity){ return tally(psByDest(entity.passengers)) }
function psByDest(ps){
	if(typeof ps == 'undefined'){return}
	var coords=[]; var i=0;
	while(coords.length<ps.length){ coords.push(ps[i++].end) }
	return coords
}

stops_.output = function(){
	var stop = jsElem('div', ['stop2'])
	var pos = (q, w) => 'calc('+q+'%' + ' - '+w+'px)'
	var leftCSS   = pos(this.location[0], Math.sqrt(25))
	var bottomCSS = pos(this.location[1], Math.sqrt(25));
	stop.style.left   = leftCSS
	stop.style.bottom = bottomCSS
	stop.setAttribute("stopid", this.id)
	stop.addEventListener('click', stopClick)
	docgetId("map").appendChild(stop)

	stop.style.height = Number(getComputedStyle(stop).height.slice(0,-2))*scale+'px'
	stop.style.width = Number(getComputedStyle(stop).width.slice(0,-2))*scale+'px'
	this.htmlref = stop
}

stops_.setdisplay = function(){
	var chils = arrayof(this.htmlref.children)
	var ev = chils.map((a, i) => [i, a.classList.contains('numstyle')]).filter(a => a[1]).flat()
	if(ev.length>0){
		chils[ev[0]].remove()	
	}
	var span = document.createElement('span')
	span.classList.add('numstyle')
	span.innerText = Number(this.passengers.length)
	this.htmlref.appendChild(span)
	this.htmlref.style.overflow ='visible'
	petals(this.htmlref, petalcoords(this.passengers.length))	
}

stops_.name = 'Unnamed Stop'
stops_.passengers = [] 
stops_.acceptsRoutes = []

function genstop(nodeid, name=null, dbit=true){
	var n = state[1][nodeid]
	var bs = Object.create(stops_)
	bs.id = n.id
	bs.location = n.location
	bs.name = name ?? ''
	bs.isStop = true
	state[1][nodeid] = bs
	// update stop for buses
	state[0].forEach(b => {
		if(typeof b.path.progress!=='number'){
			if(b.path.progress.id===nodeid){
				b.path.progress = bs
			}
		}
		b.path.prevs.forEach((a, i) => {
			if(a.id===nodeid){
				b.path.prevs[i] = bs
			}
		})
		b.path.nexts.forEach((a, i) => {
			if(a.id===nodeid){
				b.path.nexts[i] = bs
			}
		})
	})
	// qDB:: qqq
	if(dbit){
		moddb({
				modid: 3
			, id   : bs.id
			, epoch: epochtime
			, name : bs.name 
		})
	}
	return bs
}

function beengoing(b){
	b.passengers.forEach(p => {
		var next = p.going[0][1][1]
		if(typeof b.path.progress=='object' && next==b.path.progress.id){
			p.been = [].concat(p.been, [p.going[0]])
			p.going = p.going.slice(1) ?? []
			return;
		}
	})
}	

stops_.busarrives = function(b){
	// obj -> null
	beengoing(b)
	if(b.path.nexts.length==0){ throw new Error('busarrives: b.path', jstr(b.path)) }
	var endCoords = upcomingCoords(b.path.nexts)
	try{
		var keens     = want_to_board(this.passengers, endCoords, b)
	} catch(e) {
		//console.log(e);
		errors = e;
	}
	if(empty(keens)) { return; } // no one keen
	findboarders(this, keens, b)
	b.psoutput() 
}

function findboarders(t, keens, b){
	if(keens===undefined||keens.length==0) { return; }
	var notfull = b.loadpassenger(keens[0])
	if(notfull){
		//delete passenger
		t.deletepassenger([keens[0]])
		return findboarders(t, keens.slice(1), b)
	}
}

stops_.deletepassenger = function(keens){
	if(keens.length<=0) { return }
	this.passengers = deleteasc(this.passengers, keens[0])
	return this.deletepassenger(keens.slice(1))
}

function deleteasc(asc, k, etc=[]){
	// [(a, b)]#n -> a -> [(a, b)]#(n-1)
	if(asc.length==0) { return etc }
	if(asc[0] == k)   { return deleteasc([], k, etc.concat(asc.slice(1))) }
	return deleteasc(asc.slice(1), k, etc.concat(asc[0]))
}

function want_to_board(ps, upcomingXYs, b, keens=[]){
	// [ps] -> [endCoords] -> [ps]
	// ps = [<passenger>]
	// endCoords = [Int, Int]
	if(ps.length==0){
	 	if(keens.length==0) { return [] }
		return keens 
	}
	if(ps[0].going===false){ return want_to_board(ps.slice(1), upcomingXYs, b, keens) }
	var c = getstopbyid(ps[0].going[0][1][1]).location 
	if(!Array.isArray(c)){ throw new Error('C broke, is: '+c) }
	var allowableStops = candropandpick(b).map(aS => aS.location)
	var mybool = allowableStops.some(i => {
		return (
				sameArr(i, c) 
				&& ((
					sameArr(ps[0].walkstrat.current, b.path.progress.location)
					||sameArr(getstopbyid(last(ps[0].been)[1][1]).location, b.path.progress.location)
				))
		)
	})
	return want_to_board(ps.slice(1), upcomingXYs, b, mybool?keens.concat(ps[0]):keens)
}

function candropandpick(b){ return deriveRoute3(b).filter(s => b.canStop(s))	}

function upcomingCoords(nexts, a=[]){
	if(nexts.length==0) { return a }
	a.push(nexts[0].location)
	return upcomingCoords(nexts.slice(1), a)
}

// PASSENGERS:
var passenger_ = Object.create(null)
passenger_.start = false
passenger_.end = false
passenger_.expected = 100
passenger_.movingepoch
passenger_.been  = []
passenger_.going = []
passenger_.id = 0
passenger_.reachedstop = false
passenger_.reacheddestination = false
passenger_.typespecs = {}
passenger_.walkstrat = {}
passenger_.getMood = function(){
	var x; 
	if(!this.reacheddestination){ 
		this.movingepoch = epochtime 
		x = epochtime
	}else{
		x = this.movingepoch
	}
	if(x < this.spawntic+this.expected     ){ return 3 }
	if(x < (this.spawntic+this.expected)*1.5){ return 2 }
	return 1 
}
passenger_.closestStop = function(stops){
	var idcoords = stops.map(s => [s.id, s.location])
	var [x1, y1] = this.start
	var distances = idcoords.map(idc => {
		var [x2, y2] = idc[1]
		return pythag(x2-x1, y2-y1)
	})
	var [d, [id, [x2, y2]] ] = zip(distances, idcoords).sort((a,b) => a[0]-b[0])[0]
	return {
		   stopxy: [id, [x2, y2]]
		,gradient: m(x1, y1, x2, y2)
		,   angle: Math.atan(m(x1, y1, x2, y2))*180/Math.PI
		, current: this.start	
		,distance: d 
	}
} 

passenger_.walk = function(){
		if(this.reachedstop){ return }
		var speed = this.typespecs.walkspeed
		var [x1, y1]= this.walkstrat.current
		var [stopid,[x2, y2]] = this.walkstrat.stopxy
		var m = this.walkstrat.gradient

		var newcoords = nextstep(speed,m,x1,y1,x2,y2)
		this.walkstrat.current = newcoords
		var	[x1_, y1_] = this.walkstrat.current
		this.walkstrat.distance = pythag(x2-x1_, y2-y1_)
		if(this.walkstrat.distance<4&&state[1][stopid].isStop){
			this.reachedstop = true
			this.walkstrat.current = this.walkstrat.stopxy[1]
			if(!(this.walkstrat.stopxy[1][0]==this.end[0]&&this.walkstrat.stopxy[1][1]==this.end[1])){
				state[1][stopid].passengers = state[1][stopid].passengers.concat([this])
			}else{
				this.reacheddestination = true
				this.been = [] // set both empty cause they didnt take buses
				this.going = []
			}
		}
}
passenger_.trygoing = function(){
	if(this.going!==false){ return; }
	var a = stopid(this.walkstrat.stopxy[1], state[1])
	var z = stopid(this.end, state[1])
	if(a===z){ this.reacheddestination = true; return; } 
	var rs = state[0].map(b=> [b.id, deriveStopsAt(b).map(p=>stopid(p.location, state[1])) ])
	const xconx = x => x.concat(x)
	rs = rs.map(x => ((x[1].length<=3)? [x[0], xconx(x[1])] : x))
	this.going =  goin(a, z, rs) ?? false
	if(this.going===false){ return;	}
}
passenger_.setdisplay = function() {
	if(this.reachedstop) { return; }
	var elem = document.createElement('div')
	elem.classList.add('passenger')
	elem.setAttribute('pid', this.id)
	var [a, b] = this.walkstrat.current.map(i=> i+"%")
	elem.style.left = a 
	elem.style.bottom = b
	elem.style.background = this.typespecs.color
	docgetId('map').append(elem)
	elem.style.height = intOfPx(getComputedStyle(elem).height)*scale + 'px'
	elem.style.width = intOfPx(getComputedStyle(elem).width)*scale + 'px'
	// set shape:
	var ts = [ptypes.adult, ptypes.concession.children, 
						ptypes.concession.student, ptypes.concession.elderly, ptypes.concession.wheelchair]
	var subtypes = (x, y) => ts.slice(x, y).map(a=>a.color).some(c => c===this.typespecs.color)
	if(subtypes(1, 3)){
		elem.style.borderRadius = 50 + '%'
	}else{if(subtypes(2, ts.length)){
		elem.style.borderBottom = 2 + 'px'
		elem.style.background = 'transparent'
		elem.style.borderBottom = scale*2 + 'px solid ' + this.typespecs.color
		elem.style.width = 0
		elem.style.borderLeft = scale+'px solid transparent'
		elem.style.borderRight = scale+'px solid transparent'
	}}
}
var ptypes = {
							 			adult: {fare:   1, walkspeed: 1, color: 'blue'}
						 , 			concession: {
						 					  children: {fare: 0.5, walkspeed: 0.9, color: 'green'}
										  , student: {fare: 0.5, walkspeed: 1.5, color: 'purple'}
										  , elderly: {fare: 0.9, walkspeed: 0.7, color: 'yellow'}
										  , wheelchair: {fare: 0.9, walkspeed: 0.5, color: 'orange'}
										}
						}
var enumtypes = { "blue": 0, "green": 1, "purple": 2, "yellow": 3, "orange": 4 }
var pspawn;
function pspawnf(a, c, s, e, w){ 
	// float -> float -> float -> float -> float -> undefined
	[c, s, e, w].map(p=>p*(1-a))
	if([a].concat([c, s, e, w].map(p=>p*(1-a))).reduce((x,a)=>x+a, 0)!=1){ 
		throw new Error('passenger spawns dont sum to 1') 
	}
	pspawn = { adult: a }
	pspawn.concession = {
											children: (1-pspawn.adult)*c
										, student: (1-pspawn.adult)*s
										, elderly: (1-pspawn.adult)*e
										, wheelchair: (1-pspawn.adult)*w
										}
}
function squashadd(arr, first=true){
	if(first) { return squashadd([arr], false) }	
	if(head(head(arr))===undefined) { return tail(arr) }
	if(arr[1]===undefined) { 
		return squashadd([].concat([tail(head(arr))], head(head(arr))), false) 
	}
	return squashadd([].concat([tail(head(arr))], tail(arr), head(head(arr))+last(arr)), false)
}
function genptype(pspawn){
	// list of probs -> undefined
	// for setting typespecs
	var myprobs = squashadd([pspawn.adult, ...Object.values(pspawn.concession)])
	var keys = Object.keys(ptypes.concession)
	var names = ['adult', ...keys]
	var zipped2chain = zip(names, myprobs)
	var randint = Math.random()
	var almostfinale = head(zipped2chain.filter(x=>randint<x[1]))
	return head(almostfinale)==='adult'?ptypes[head(almostfinale)]:ptypes['concession'][head(almostfinale)]
}
function genpassengers(n, stops, bowl=true){
	if(!Array.isArray(stops)){ throw new Error("genpassengers: stops variable is not an array"); }	
	if(!bowl||stops.length===0) { return }
	// genenrates passengers randomly on map
	// int -> undefined
	if(n<=0) { return; } 
	// --- 
	var p = Object.create(passenger_)	
	p.id = passenger_.id++
	p.typespecs = genptype(pspawn)
	
	p.start = [randint(0,100), randint(0,100)]
	var possibleEnds = stops.filter(a => a.isStop)
	var endid = Math.floor(Math.random()*possibleEnds.length)
	p.end = possibleEnds[endid].location
	// WALK:	
	p.walkstrat = p.closestStop(stops)
	p.spawntic  = epochtime
	p.movingepoch = epochtime
	// OPTIMAL ROUTE:	
	var a = stopid(p.walkstrat.stopxy[1], stops)
	var z = stopid(p.end, stops)
	var rs = state[0].map(b=> [b.id, b.stopsAt])
  var g = goin(a, z, rs) 
	p.going =  g ?? false
	if(p.going===undefined){ throw new Error('p.going is UNDEFINED') }
	// ---
	state[2].push(p)
	
	// qDB:::
	moddb({
			modid: 2
		, id   : p.id
		,	epoch: epochtime
		, startx: p.start[0]
		, starty: p.start[1]
		, endx  : p.end[0]
		, endy  : p.end[1]
		, type : enumtypes[p.typespecs.color] 
	})
	return genpassengers(n-1, stops)
}

function deriveRoute3(bus){
	var prevs = bus.path.prevs
	var nexts = bus.path.nexts
	var curr  = typeof bus.path.progress=='number'?[]:(bus.path.progress ?? []) 
	var first = (prevs.length==0?(Array.isArray(curr)?nexts[0]:curr):prevs[0])
	if(prevs===undefined||prevs===null){ throw new Error('prevs undefined') }
	if(nexts===undefined||nexts===null){ throw new Error('nexts undefined') }
	if(curr===undefined||curr===null){ throw new Error('curr undefined') }
	if(first===undefined||first===null){ throw new Error('first undefined') }
	return [].concat(prevs,curr,nexts,(bus.path.loop?first:[])) 
}
function deriveStopsAt(bus){
	return deriveRoute3(bus).filter(s => bus.stopsAt.some(x => s.id===x))
}
function stopid(xy, stops){
	// [x,y] -> state[1] -> int
	while(stops.length>0){
		if(stops[0]===undefined){ throw new Error('stopid: A stop is undefined: '+jstr(stops[0])) }
		if(sameArr(stops[0].location, xy))
			{ return stops[0].id }
		stops=stops.slice(1)
	}
}

function goin(a, z, rs){ return plan4(a, z, allrouteps(rs)) }
function rgoin(){ return roadmode.xys.map(n=>[[false, [getNodeIdByCoords(n[0]), getNodeIdByCoords(n[1])]], [false, [getNodeIdByCoords(n[1]), getNodeIdByCoords(n[0])]]]).flat() }

function getNodeIdByCoords(coords){ 
	var a = state[1].filter(a=> {
		return sameArr(coords, a.location)
	})[0].id 
	return a ?? false 
}
function busgoin(a, z){ return plan4(a, z, rgoin()) 					 }

function outputMoods(ps){
	deleteHTMLid('moods')
	var d = jsElem('div', [], 'moods')
	var [h,s,a] = tallyMoods(ps)
	d.setAttribute("angry", a)
	d.setAttribute("sad", s)
	d.setAttribute("happy", h)
	var total = a + s + h
	var tb = () => document.createElement('table')
	var tr = () => document.createElement('tr')
	var td = () => document.createElement('td') 
	var row1 = tr()
	var moods = [ang, sad, hap, tot] = [td(), td(), td(), td()]
	var ordered = [a, s, h, (a+s+h)];
	['Angry:', 'Sad:', 'Happy:', 'Total:'].forEach((m, i) => {
		var temp = td()
		temp.innerText = ordered[i]
		moods[i].innerText = m
		row1.appendChild(moods[i])
		row1.appendChild(temp)
	})
	var mytable = tb()
	mytable.appendChild(row1)
	d.appendChild(mytable)
	docgetId('cmdctr').appendChild(d)
}

function tallyMoods(ps){ 
	var u = tally(ps.map(p => p.getMood()));
	[3,2,1].forEach(n => { if(u[n]===undefined){ u[n] = 0; } })
	return [u[3], u[2], u[1]]
}
var era = []
async function moddb(params={}){
	console.log('params', jstr(params))
	try{
		var req = await fetch('busstops-api.php'
		, {
			method: 'POST'
		, body: JSON.stringify(params)
		})
		era = era.concat(req)
		if(req.statusText!=="Ok!"){ 
			//clearInterval(myTime)
			throw new Error('REQUEST FAILED: ' + req)
		}
	} catch (err){
		console.log('DB ERROR: ...', Object.entries(err))
		console.log('PARAMS: ' , jstr(params), 'error: ', jstr(err))
	}
}
function createWorld(){
	console.log('world created')
	setDBmutables();
	if(nodesDB===undefined){ 
		epochtime = undefined
	}else{
		epochtime = 0
		userActions('hide')
	}
	var [busses, stops, passengers] = [[], [], []]
	pspawnf(0.5, 0.3, 0.5, 0.15, 0.05)
	var state = [busses, stops, passengers]
	return state 
}

function pythag(a, b){ return Math.sqrt(a**2+b**2)  }
function m(x1, y1, x2, y2){ return (y2-y1)/(x2-x1)  }
function nextstep(delta, m, x1, y1, x2, y2){

  var dx = (x2-x1)
  var dy = (y2-y1)
	var diag = (dx**2 + dy**2)**(1/2)

  var ratioalong = delta/diag
  return [x1+ratioalong * dx, y1+ratioalong*dy]
	var   d = pythag(x2-x1, y2-y1)
	if(m>0){
		if(x2>x1){ return [x1+delta*Math.cos(rad), y1+delta*Math.sin(rad)] }
				 else{ return [x1-delta*Math.cos(rad), y1-delta*Math.sin(rad)] }
	}else{
		if(y2>y1){ return [x1-delta*Math.cos(rad), y1+delta*Math.sin(rad)] }
				 else{ return [x1+delta*Math.cos(rad), y1-delta*Math.sin(rad)] }
	}
}
function cleardisplays(htmlcol) { arrayof(htmlcol).forEach(e => e.remove()) }
var ff = false;
function fastfwd(n){
	if(n==0) { ff=false; return; }
	ff= true;
	evolveWorld(null)
	return fastfwd(n-1)
}
function addDBstuff(){
	cl('adding db stuff')
	const isEpoch = a => Number(a['epoch'])===epochtime
	var busarr=[];
	if(busesDB!==undefined) [busarr, busesDB] = span(isEpoch, busesDB) 
	// --------
	var nodesarr=[];
	if(nodesDB!==undefined) [nodesarr, nodesDB] = span(isEpoch, nodesDB)
	var roadsarr=[];
  if(roadsDB!==undefined) [roadsarr, roadsDB] = span(isEpoch, roadsDB)
	var routesarr=[];
	if(routesDB!==undefined) [routesarr, routesDB] = span(isEpoch, routesDB)
	var stoparr=[];
	if(stopsDB!==undefined) [stoparr, stopsDB] = span(isEpoch, stopsDB)	
	var pgersarr=[];
	if(pgersDB!==undefined) [pgersarr, pgersDB] = span(isEpoch, pgersDB)
	var deletsarr=[];
	if(deletDB!==undefined) [deletsarr, deletDB] = span(isEpoch, deletDB)
	var pausearr=[];
	if(pauseDB!==undefined) [pausearr, pauseDB] = span(isEpoch, pauseDB)
	var ton = (x) => Number(x)
	nodesarr.forEach(n => state[1].push(dbnode(n, stoparr)))
	roadsarr.forEach(r => {
		var [na, nb] = [ton(r[1]), ton(r[2])]	
		roadmode.xys.push([state[1][ton(r[1])].location, state[1][ton(r[2])].location])
	})	
	stoparr.forEach(s=> { dbstop(s) })
	busarr.forEach(b => {
		var route = routesDB.filter(a=> Number(a['busid'])===Number(b['id'])
			).sort((a, b) => Number(a['posid'])-Number(a['posid'])
			).map(c => Number(c['stopid']))
		dbbus(b, route)
	})	
	pgersarr.forEach(p=> { state[2].push(dbpger(p)) })
	deletsarr.forEach(d => deletebus(Number(d['busid']), true))
	pausearr.forEach(p => pausebus(Number(p['busid']), true))
}
function getstopbyid(id){ return state[1][state[1].findIndex(a => a.id===id)] }
function dbbus(b, r){
	var newbus = makebus(r.map(s => state[1][s]), r, true, false)
	newbus.firstOutput()
	return newbus
}
function dbstop(s){
	var stop = genstop(s['nodeid'], s['name'], false)
	state[1][Number(s['nodeid'])] = stop
	stop.output()
	return stop
}
function dbnode(n, stops){
	var mynode = gennode([Number(n['x']), Number(n['y'])])
	return mynode
}
function dbpger(pger){
	var p = Object.create(passenger_)	
	p.id = Number(pger['id'])
  passenger_.id++
	var pts = { 0:'adult', 1: 'children', 2: 'student', 3: 'elderly', 4: 'wheelchair'}
	var thispts = pts[Number(pger['type'])]
	p.typespecs = thispts==='adult' ? ptypes[thispts] : ptypes['concession'][thispts]
	p.start = [Number(pger['startx']), Number(pger['starty'])]
	p.end = [Number(pger['endx']), Number(pger['endy'])] 
	p.spawntic = epochtime
	p.movingepoch = epochtime
	var stops = state[1].filter(x => x.isStop)
	// WALK:	
	p.walkstrat = p.closestStop(stops)
	// OPTIMAL ROUTE:	
	var a = stopid(p.walkstrat.stopxy[1], stops)
	var z = stopid(p.end, state[1])
	var rs = state[0].map(b=> [b.id, deriveRoute3(b).map(p=>stopid(p.location, stops)) ]) // dr3
  var g = goin(a, z, rs)
	p.going =  g ?? false
	p.setdisplay()
	return p;
}

function evolveWorld(e){ // nextEpoch
	if(epochtime===undefined){ return; }
	//if(epochtime<=Number(dbEpoch)&&Number(dbEpoch)!==0||demoDB){
	if(epochtime<=Number(dbEpoch)||demoDB){
		addDBstuff();
		if(Number(dbEpoch)-epochtime===0 && demoDB){ /* display a msg*/ clearInterval(myTime); return; }
		epochtime++
		document.body.style.cursor = 'wait'
  	const t = a => lineStyle(a[0], a[1], false)
		changeMode('clear', {clearLines:true, stillinfo: true})
		if(epochtime<=Number(dbEpoch)){ document.body.style.cursor = 'wait' }
		roadmode.xys.forEach(r => t(r))
		if(Number(dbEpoch)-epochtime===0){ 
			clearInterval(myTime); 
			myTime = window.setInterval(()=>{evolveWorld()}, 100) 
			document.body.style.cursor = 'default'
		}
	}else{
		if(dbEpoch===epochtime){ clearInterval(myTime) }
		userActions('unhide') 
		epochtime++
		moddb({modid: 'epoch'})
	}
	var swit = (a) => {
		a[0] = a[0].split('/')
		return [[a[0][1], a[0][0], ...a[0].slice(2)].join('/'), ...a.slice(1)]
	}
	docgetId('epoch').innerText 
		= swit((new Date(dateNow.getTime()+epochtime*1000)).toLocaleString().split(',')).join(' | ');
	var [busses, nodes, passengers] = state
	var stops = nodes.reduce((a,x) => x.isStop?a.concat(x):a, [])
	// Spawn passengers at nodes: 
	var mybowl = docgetId('genp').getAttribute('gen')==='true'
	if(!ff&&epochtime>=Number(dbEpoch)) { genpassengers(randint(1,2), stops, mybowl) }
	cleardisplays(arrayof(docgetClass('passenger')).filter(p=>!p.classList.contains('inbus')))
	passengers.forEach(p => {
		p.setdisplay()
		p.walk()
		p.trygoing()
	})
	stops.forEach(stop => stop.setdisplay() )
	if(busses.length<1){ return }
	busses.forEach(bus => {
		if(bus.pause){ return }
		// NEXT TICK:
		bus.tick()
		// LIVE OUTPUT CURRENT POSITION:
		bus.nextOutput()
	})
	outputMoods(passengers)
	var mypeas = peas()
	if(stopclickinfo||busclickinfo){
		clearInfo({stillinfo: true})
		var tgt = document.querySelector('[busid="'+clickedId+'"]')
		stopinfo2(state[clickedState][clickedId], clickedState===1?false:[tgt])
	}else{
		clickedId = null
		clickedState = null
	}
	//return;
	var a = docgetId('moods').getAttribute("angry")
	var s = docgetId('moods').getAttribute("sad")
	var h = docgetId('moods').getAttribute("happy")
	var num =100*(Number(a)+Number(s))/Number(h)
	moodsbar = progressBar2(docgetId('moods'), '20px', '100px', 'orange', 'green')
	moodsbar(num, 'moodsbar')

	// money:
	var mymon = Number(Number(state[0].reduce((a, x) => a+x.money, 0)).toFixed(2))
	docgetId('myMoney').innerText = 'My Money: $' + globalMon.toFixed(2)
}
function resetpeas() { cleardisplays(docgetClass('pea')) }
var log=[]
var moodsbar;
function progressBar2(parent, outheight, outwidth, barcol, bkgcol){
	var outdiv = jsElem("div"); outdiv.style.background = bkgcol;
	var  indiv = jsElem("div");  indiv.style.background = barcol;
	outdiv.id = 'moodsbar'
	outdiv.style.height = outheight
	outdiv.style.width  = outwidth
 	indiv.style.height = "100%"
	indiv.style.width  =  "50%"
	outdiv.appendChild(indiv)
	parent.appendChild(outdiv)
	return function(pc, htmlid){
		pc = Math.max(0, Math.min(pc, 100))
		indiv.style.width = pc+"%"
		outdiv.id = htmlid
	}
}

function coordsToPerc(x, y){ 
	var [h, w] = [
			Number(getComputedStyle(docgetId('map')).height.slice(0, -2))
		, Number(getComputedStyle(docgetId('map')).width.slice(0, -2))
	]
	return [x/(w/100), (w-y)/(h/100)]
}
function tackOnNode(ex, ey, nps){
	if(nps.length===0||last(nps).length===2){ return [].concat(nps, [[[ex, ey]]]) }
	return [].concat(init(nps), [[last(nps)[0], [ex, ey]]])
}
function mapClick(e){
	var mapwidth = Number(getComputedStyle(docgetId('map')).width.slice(0,-2))
	var mapleft = (window.innerWidth - mapwidth)/2
	if(neuestop){
		// add temp stop
		var tempostopo = docgetId('tempstop')
		if(tempostopo !==null){ tempostopo.remove() }
		var [x, y] = coordsToPerc(e.clientX - mapleft, e.clientY) 
		tempstop = [x, y]
		var t = atNode(tempstop, roadmode.xys)
		var mynode = nodeByCoords(t) 
		if(mynode!==false && !mynode.isStop){
			var d = document.createElement('div')
			d.id = 'tempstop'
			var [setx, sety] = mynode.location
			var pos = (q, w) => 'calc('+q+'%' + ' - '+w+'px)'
			d.style.left = pos(setx, Math.sqrt(25))
			d.style.bottom  = pos(sety, Math.sqrt(25))
			docgetId('map').appendChild(d)
			return;
		}
		changeMode('clear')
		return;
	}
	if(roadmode.inmode){
		var a = coordsToPerc(e.clientX - mapleft - roadmode.offX, e.clientY + roadmode.offY)
		var u = roadmode.xys 
		var appendnode = false
		if(u.length===0){ 
			roadmode.xys = [[a]] 
			appendnode = true
		}else{ 
			if(u.length===1&&u[0].length===1){
				roadmode.xys = [[last(u[0]), a]]
				appendnode = true
			}else{
				if(last(u).length===1){
					roadmode.xys = [].concat(init(u), [[last(u)[0], a]])
					appendnode = true
				}else{
					var o = u.map(i => [i[0], a])
					var b = checkExtending(o)
					if(b===false){ 
						roadmode.xys = [].concat(u,  [[last(u)[1], a]])
						appendnode = true
					}else{
						roadmode.xys = [].concat(u,  [[b]])
					}
				}
			}
		}
		if(appendnode){
			var newnode = gennode([a[0], a[1]])
			state[1].push(newnode)
			// moddb::: 
			moddb({
				 modid : 1
				,id	   : newnode.id 
				,epoch : epochtime
				,x   	 : newnode.location[0]
				,y		 : newnode.location[1]
			})
			// moddb::: 
			if(last(roadmode.xys).length<2){ return; }
			moddb({
				 modid  : 4
				,epoch  : epochtime
				,node_a : getNodeIdByCoords(last(roadmode.xys)[0])
				,node_b : getNodeIdByCoords(last(roadmode.xys)[1])
			})
		}
	}
	
	if(e.target.id!='map'){ return }
	clicked = true
	clearInfo({clearLines: false})
}
function gennode(loc){
	var [x, y] = loc
	var n = Object.create(node_)
	n.id = node_.id++
	n.location = [x, y]
	return n
}
function clearInfo(e={}){
	e.stillinfo = e.stillinfo ?? undefined
	arrayof(document.body.children).map(c => {
		if(!(c.id==='map' || c.id==='cmdctr'||c.id==='movebtns'||c.id==='greatermap'||c.id==='moodsbar')){ c.remove() }
	})
	arrayof(docgetClass('popup')).forEach(p => p.remove())
	temproute = []
	state[1].forEach(s => {
		if(s.htmlref!==undefined){ s.htmlref.style.background = 'white' }
	})
	tempstop = []
	var eval = docgetId('tempstop') ?? false
	if(eval!==false){ eval.remove() }
	if(e.clearLines){
		var routelines = arrayof(document.getElementsByClassName('routeline'))
		routelines.map(r => r.remove() )
	}
	if(e.stillinfo===undefined){
		neuebus=false
		stopclickinfo=false
		busclickinfo=false
	}
}
function hideallexceptmap(){
	if(!usercaninteract){
		arrayof(document.body.children).forEach(a=> {if(a.id!=='map'){a.setAttribute('hidden', 'hidden')}})
	}else{
		arrayof(document.body.children).forEach(a=> a.setAttribute('hidden', ''))
	}
}

function checkExtending(xs){
	if(xs.length===0){ return false; throw new Error('checkExtending: '+'___'+xs) }
	var g =  xs.sort((a,b) => pythag(a[0][1]-a[1][1],a[0][0]-a[1][0])-pythag(b[0][1]-b[1][1],b[0][0]-b[1][0]))[0]
	return pythag(g[0][1]-g[1][1],g[0][0]-g[1][0])<10?g[0]:false
}
function atNode(temp, ss=roadmode.xys){  // ooo
	ss = [].concat([head(head(ss))], [last(head(ss))], tail(ss).map(a=>a[1]))
	var t =  ss.reduce((a,x,i) => {
		if(pythag(x[0]-temp[0], x[1]-temp[1]) < 10){ return a.concat([x]) 
		}else{ 																  		 return a             }
	}, [])
	return t.length===0?false:t[0]
}
var state;
var clicked;
var interval = 300;
var myTime;
var errors;
var neuebus;
var temproute = [];
var neuestop;
var tempstop;
var stopclickinfo;
var busclickinfo;
var clickedId;
var clickedState;
var globalMon = 0;
var dateNow = new Date()
var roadmode = {
	inmode: false
,	xys   : []
, offX  : 4.9
, offY  : 7.2
}
	
function setState(coords, stopids, stoppings){
	coords.forEach(c => {
		var node = gennode(c)	
		state[1].push(node)
	})
	roadmode.xys = zip(coords, tail(coords))
	stopids.forEach(id => {
		var stop = genstop(id)
		stop.output()
	})
	stoppings.forEach(stopsAt => {
		var bus = makebus(stopsAt.map(s => state[1][s]), stopsAt)
		bus.firstOutput()
	})
}

function EXPORT(){
	var f = (x) => x.filter(s => s.isStop).map(s => s.id)
	var roadus = [roadmode.xys[0][0], ...roadmode.xys.map(r => r[1])]
	var stops  = f(state[1])
	var buss   = state[0].map(b => {
		return init(f(deriveRoute3(b)))
	})
	return [roadus, stops, buss]
}
function intOfPx(val){ return Number(val.slice(0, -2)) }
function changeSize(pos, map){
	var by = (pos?1:-1)*5
	var hw = intOfPx(getComputedStyle(map).height)
	var sqr = Math.sqrt(hw)
	map.style.height = hw + by + 'px'
	map.style.width  = hw + by + 'px'
	var prop = by/hw
	scale = scale*(1+prop)
	function applyChange(widthheight){ return (elem) => {
		var inthing = docgetClass(elem)
		var thing = arrayof(inthing)
		thing.forEach(c => {
			var width = intOfPx(getComputedStyle(c).width)
			c.style.width = width*(1+prop) + 'px'
			if(widthheight){
				var height = intOfPx(getComputedStyle(c).height)
				c.style.height = height*(1+prop) + 'px'
			}
		})	
	}}
	"stop2,bus2,passenger,inbus".split(',').forEach(applyChange(true))
	applyChange(false)('routeline')
}
function changeMode(n, setting=undefined){
	clearInfo(setting)
	if(n==='stop'){
		neuestop = true
		document.body.style.cursor = 'pointer'
		neuebus = roadmode.inmode = false
	}
	if(n==='bus'){
		neuebus = true
		document.body.style.cursor = 'pointer'
		neuestop = roadmode.inmode = false
	}
	if(n==='roadmode'){
		roadmode.inmode = true
		document.body.style.cursor = 'crosshair'
		neuestop = neuebus = false
	}
	if(n==='clear'){ 
		document.body.style.cursor = 'default'
		neuestop = neuebus = roadmode.inmode = false 
	}
}

document.addEventListener('DOMContentLoaded', e => {
	moodsbar = progressBar2(docgetId('moods'), '20px', '100px', 'orange', 'green')
	state = createWorld() 
	myTime = window.setInterval(()=>{evolveWorld()}, 50)
	clicked = false
	docgetId('genp').addEventListener('click', e => {
		var ans = e.target.getAttribute('gen')==='true'?'false':'true'
		e.target.setAttribute('gen', ans)
		e.target.style.backgroundColor = ans==='true'?'green':'red'
	})

	docgetId('roadmode').addEventListener('click', e => {
		if(roadmode.inmode){ 
			changeMode('clear')
		}else{
			changeMode('roadmode')
		}
	})
  const t = a => a.map(a=> lineStyle(a[0], a[1], false))
	docgetId('map').addEventListener('mousemove', roadlines)
	window.addEventListener('resize', e => { clearInfo({clearLines: true});t(roadmode.xys)})
	function roadlines(e){
		if(neuestop||neuebus){ return; }
		var mode = roadmode.inmode?'In roadmode: ':'Not roadmode: '
		if(!roadmode.inmode||roadmode.xys.length===0){ return; }
		clearInfo({clearLines: true})
		var rm = roadmode.xys
		var tgt = e.target
		var mapwidth = Number(getComputedStyle(docgetId('map')).width.slice(0,-2))
		var mapleft = (window.innerWidth - mapwidth)/2
		var v = coordsToPerc(e.clientX - mapleft - roadmode.offX, e.clientY + roadmode.offY )
		if(rm.length===1&&rm[0].length===1){ 
			var a = [[head(roadmode.xys)[0], v]]
		}else{
			if(last(rm).length===1){
				var a = [].concat(init(roadmode.xys), [[last(roadmode.xys)[0], v]])
			}else{
				var a = [].concat(roadmode.xys, [[last(roadmode.xys)[1], v]])
			}
		}
		var lines = t(a)
	}
	docgetId('map').addEventListener('mouseleave', e => { 
		if(neuestop||neuebus||roadmode.xys.length===0||stopclickinfo||busclickinfo){ return; }
		roadmode.xys = last(roadmode.xys).length===1?init(roadmode.xys):roadmode.xys
		var g = roadmode.xys
		clearInfo({clearLines: true, stillinfo: true})
		var lines = t(g)
	})
	
	docgetId('clear').addEventListener('click', e => changeMode('clear'))
	docgetId('map'  ).addEventListener('click', mapClick )
	docgetId('stop' ).addEventListener('click', _=>clearInterval(myTime))
	docgetId('fast' ).addEventListener('click', _=> {
		if(epochtime===undefined){ epochtime = 0 }
		clearInterval(myTime)
		myTime = window.setInterval(()=>{evolveWorld()}, 100)
	})
	docgetId('slow' ).addEventListener('click', _=> {
		clearInterval(myTime)
		myTime = window.setInterval(()=>{evolveWorld()}, 150)
	})
	docgetId('newbus' ).addEventListener('click', newbusqry			   )
	docgetId('newstop').addEventListener('click', newstopqry					   )
	const resetDB = get => _ => {
		moddb({modid:'clear'})
		document.body.style.cursor = 'wait'
		var url = window.location.href.split('/').slice(0,-1).join('/')
		setTimeout(_ => { window.location = [url, '/index.php', get].join('')}, 500)
	}	
	docgetId('cleardb').addEventListener('click', resetDB(''))
	docgetId('demo').addEventListener('click', resetDB('?demo'))
})

function userActions(a='unhide'){
	var f = a==='hide'?(b => {docgetId(b).style.display='none';}):(b => {docgetId(b).style.display='initial';});
	'clear,newbus,newstop,movebtns,genp,roadmode'.split(',').map(f);
}

function infobox(info, btns, userinput=false){
	var msg    = jsElem('div', ['popup'])
	var myform = jsElem('div', []) 
	var span = document.createElement('span')
	span.innerText = info
	msg.appendChild(span)
	btns.slice(0).reverse().forEach(b=> {
		var  button = jsElem('button',[],b.split(' ').join(''))
		button.textContent = b.slice(0,6)==='Cancel'?(b==='Cancel'?b:'Close'):b
		button.textContent = b==='Addstop'?'Add Stop':button.textContent
		myform.appendChild(button)
	})
	if(userinput){
		var usertxt = jsElem('input',[], 'stopname')
		usertxt.required = true
		usertxt.placeholder = 'Enter Stop Name:'
		msg.appendChild(usertxt)
	}
	msg.appendChild(myform)
	docgetId('cmdctr').appendChild(msg)
	return msg
}

//---------------------------

function OA(local_, r){
	var O = Math.sin(local_*Math.PI/180)*r;
	var A = Math.sqrt(r**2 - O**2);
	return [O, A];
}

function SoD(deg, OA_) {
	if((deg>0&&deg<90)||(deg>180&&deg<270)){
		return demand(OA_);
	}
	return supply(OA_);
}
function supply(OA_){return OA_;}
function demand(OA_){return OA_.slice(0).reverse();}


function isBound(deg){ return [90, 180, 270].some(p=>p==deg); }
function boundOffset(deg){
	switch (deg) {
		case 90: { return [50, 0]; }
		case 180: { return [0, 50]; }
		case 270: { return [-50, 0]; }
	}
}

function local(deg){ return (deg%90); }

function degs(n){
	if(n==0){ return [];}
	var interval = 360/n;
	var degs_ = [];
	for(var i=0;i<n;i++){
		degs_.push(i*interval);
	}
	return degs_;
}

function quadrant2(deg){
	if(deg>0&&deg<90){ return [1, -1]; }
	if(deg>90&&deg<180){ return [1, 1]; }
	if(deg>180&&deg<270){ return [-1, 1]; }
	if(deg>270&&deg<360){ return [-1, -1]; }
	return null;
}	

function offset(deg){
	if(deg==0||deg==360){ return [0, -50] }
	// returns offset from 50,50
	var quadrant = quadrant2(deg);
	var local_ = local(deg);
	if(isBound(deg)){
		return boundOffset(deg);
	}
	var OA_ = OA(local_, 50);
	var SoD_ = SoD(deg, OA_);
	return [
		SoD_[0]*quadrant[0],
		SoD_[1]*quadrant[1]
	];
}

function offsets(n){
	if(n==0||n==360){ return [[0,-50]]; }
	var offsets_ = []; // for 0 and 360
	var degs_ = degs(n);
	degs_.forEach(deg => {
		offsets_.push(offset(deg));
	})
	return offsets_;
}
function divOffsets(offsets_){
	var XYorigin = 49; 
	var divOffsets_ = [];
	// [left, top]
	offsets_.forEach(offset_ => {
		var x = offset_[0] + XYorigin;
		var y = offset_[1] + XYorigin;
		divOffsets_.push([x, y]);
	})
	return divOffsets_;
}
function petalcoords(n){ return divOffsets(offsets(n)) }
function petals(pElem, coords){
	arrayof(pElem.children).forEach(c => c.classList.contains('dot')?c.remove():null )
	coords.forEach(offset_ => {
		var x = offset_[0];
		var y = offset_[1];
		var elem = document.createElement('div')
		elem.classList.add('dot')
		elem.style.left = x+'%'
		elem.style.top  = y+'%'
		pElem.appendChild(elem)
	})
}
function propstowho(me) {
	arrayof(me.htmlref.children).forEach(c => {
		c.classList.contains('stop2l')||c.classList.contains('stop2r')?c.remove():null 
	})
	var pElem = me.htmlref	
	var stop2l = document.createElement('div')
	stop2l.classList.add('stop2l')
	var stop2r = document.createElement('div')
	stop2r.classList.add('stop2r')
	var total      =  state[1][me.id].passengers.length
	var adultcount =  state[1][me.id].passengers.filter(p => p.typespecs==ptypes.adult).length
	stop2l.style.width = 100*(adultcount/total)+'%'
	stop2r.style.width = 100*(1-adultcount/total)+'%'

	pElem.appendChild(stop2l)
	pElem.appendChild(stop2r)
}
