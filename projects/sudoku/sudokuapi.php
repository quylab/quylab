<?php 

$json = trim(file_get_contents('php://input'));
$data = json_decode($json, true);

ini_set("memory_limit", "-1");
set_time_limit(0); // to perform recursion

function genpuzzle($str){
	// str -> [[ints|false]]
	$as = explode(',', $str);
	$as = array_map(function($a){ return str_split($a, 1); }, $as);
	return array_map(function($r){ return array_map(function($c){ return ($c==='.'?false:intval($c)); }, $r); }, $as);
}
function varjson($a){ echo(json_encode($a).'<br>'); }

function getColumn($arr, $x){
	// [[a]] -> Int -> [a]
	return array_map(function($y)use($x){ return $y[$x]; }, $arr);
}

function getRow($arr, $y){
	// [[a]] -> Int -> [a]
	return $arr[$y];
}

function getBlock($arr, $num){
	// [[a]] -> Int -> [a]
	if(!is_array($arr)){ throw new Error('getBlock: arr is not an array'); }
	$ri = floor($num/3)*3;
	$ci = $num%3;
	return array_reduce(array_slice($arr, $ri, 3), function($a, $c)use($ri, $ci){ 		return array_merge($a, array_slice($c, $ci*3, 3)); }, []);
}

function locateBlock($x, $y){
	// int -> int -> [int, int]
	$blocknum = floor($x/3) + floor($y/3)*3;
	$blockpos = $x%3			   + ($y%3)*3;
	return [$blocknum, $blockpos];
}

function remove($flatnine, $i){ 
	return array_merge(array_slice($flatnine, 0, $i), array_slice($flatnine, $i+1, count($flatnine))); 
}

function getNeighbours($arr, $x, $y){
	// arr -> int -> in -> [ ([int]|int) ]
	$c = getColumn($arr, $x);
	$r = getRow($arr, $y);
	[$bnum, $bpos] = locateBlock($x, $y);
	$b = getBlock($arr, $bnum);
	$ret = array_merge(remove($b, $bpos), remove($c, $y), remove($r, $x));
	return $ret;
}
function array_some($f, $arr){
	foreach ($arr as $val) {
		if($f($val)){
			return true;
		}
	}
	return false;
}

function invert($flatnine){
	// [0-8] -> [0-8]
	$flatnine = array_filter($flatnine, function($n){ return !is_array($n); });
	$ret = array_values(array_filter(range(1,9), function($n)use($flatnine){ return !array_some(function($x)use($n){ return $x===$n;}, $flatnine); }));
	return $ret;
}

function eliminate($arr){ return initialisePuzzle(purge($arr)); }
function purge($arr){
	// arr -> [arr, bool]
	return array_map(function($r){ return array_map(function($c){ return is_array($c)?false:$c;}, $r);}, $arr);
}

function initialisePuzzle($arr){
	// [[a]{9}]{9} -> (a -> b) -> [[b]{9}]{9}
	for($i=0; $i<count($arr); $i++){
		for($j=0; $j<count($arr[$i]); $j++){
			if($arr[$i][$j]===false){
				$x = getNeighbours($arr, $j, $i);
				$arr[$i][$j] = invert($x);
			}
		}
	}
	return $arr;
}
function initpuz($i){
	return [
			genpuzzle(".........,.........,.........,.........,.........,.........,.........,.........,.........")
		, genpuzzle(".........,.1.......,.........,.........,.........,.........,.........,.........,.........")
	][$i];
}
function initialisePuzzle_test(){
	varjson('b'.niceStr(initialisePuzzle(initpuz(1))));
	throw new Error('initpuztest');
}

function nicestr($arr){ 
	varjson('[');
	foreach($arr as $a){
		varjson($a);
	}	
	varjson(']');
}

function finishedSolving($arr){
	// arr -> bool
	for($i=0; $i<count($arr); $i++){
		for($j=0; $j<count($arr[$i]); $j++){
			if(is_array($arr[$i][$j])){ return false; }
		}
	}
	return true;
}

function discardSolution($arr){
	// arr -> arrfasle
	for($i=0; $i<count($arr); $i++){
		for($j=0; $j<count($arr[$i]); $j++){
			if(is_array($arr[$i][$j])){ 
				if(count($arr[$i][$j])===0){ return false; }
				$arr[$i][$j] = array_slice($arr[$i][$j], 1, count($arr[$i][$j]));
				return $arr;
			}
		}
	}
	return $arr;
}

function guessFirst($arr){
	// arr -> arr
	for($i=0; $i<count($arr); $i++){
		for($j=0; $j<count($arr[$i]); $j++){
			if(is_array($arr[$i][$j])){
				if(count($arr[$i][$j])===0){ throw new Error('guessFirst: there is an empty array being guessed'); }
				$arr[$i][$j] = $arr[$i][$j][0];
				return $arr;
			}
		}
	}
	return $arr;
}

function stillValid($arr){
	// arr -> bool
	return !array_some(function($r){ return array_some(function($c){ return is_array($c)&&count($c)===0; }, $r);}, $arr);
//	for($i=0; $i<count($arr); $i++){
//		for($j=0; $j<count($arr[$i]); $j++){
//			if(is_array($arr[$i][$j])&&$arr[$i][$j]===0){ return false; }
//		}
//	}
//	return true;
}

function init($arr){ return array_slice($arr, 0, count($arr)-1); }
function init_test(){
	varjson(init([1,2,3,4]));	
	varjson(init([]));	
	varjson(init(init([1,2,3,4])));	
	throw new Error('init');
}
//init_test();

function last($arr){ 
	return (null!==array_key_last($arr) ? $arr[array_key_last($arr)] : []);
}
function last_test(){
	varjson(last([]));
	varjson(last([1,2,3]));
	varjson(last([3,[4]]));
	varjson(last([[5]]));
	varjson(last([6]));
	throw new Error('last');
}
// -----------
function stillValid2($arr){
	$arr = purge($arr);
	for($i=0; $i<count($arr); $i++){
		for($j=0; $j<count($arr[$i]); $j++){
			if(count(invert(getNeighbours($arr, $j, $i)))===0){ return false; }
		}
	}
	return true;
}
function simplify($arr){
	// arr -> arr
	return array_map(function($r){ return array_map(function($c){ return (is_array($c)&&count($c)===1?$c[0]:$c); }, $r); }, $arr);
}

function hassingletons($arr){ 
	// arr -> bool
	return array_some(function($r){ return array_some(function($c){ return is_array($c)&&count($c)===1;}, $r); }, $arr);
}

function simplifychain($arr){
	// arr -> arr|false
	if(!stillValid2($arr)){ return false; }
	if(hassingletons($arr)){ return simplifychain(eliminate(simplify($arr))); }
	return $arr;
}

function elimguess($arr) { return simplifychain(eliminate(guessFirst($arr)));   }

function solve($arr, $acc=[], $first=true){
	// arr -> arr|false
	if(!isset($arr)){ return false; }
	if($first===true){ 
		return solve($arr, [initialisePuzzle($arr)], 1);  
	}
	if(($a = last($acc)===false)||($b = !stillValid(last($acc))))	{ 
		return solve($arr, [...init(init($acc)), discardSolution(last(init($acc)))], ++$first);
	}
	if(finishedSolving(last($acc))){ 
		if(!stillValid2(last($acc))){ return false; }
		return (count(last($acc))>0 ? last($acc) : false);
	}
  return solve($arr, [...$acc, elimguess(last($acc))], ++$first); 
}
function ampuzz($i){
	return [
		  genpuzzle(".........,.........,.........,.........,.........,.........,.........,.........,.........")
		, genpuzzle("123456789,.........,.........,.........,.........,.........,.........,.........,.........")
		, genpuzzle("123456789,456789123,789123456,271364895,835291647,964578231,312645978,597812364,648937512")
		, genpuzzle("123456789,456789123,789123456,271364895,835291647,964578231,312645978,597812364,64893751.")
		, genpuzzle("123456789,456789123,789123456,271364895,835291647,964578231,312645978,5978.....,.........")
		, genpuzzle("123456789,456789123,789123456,271364895,835291647,964578231,312645978,.........,.........")
		, genpuzzle("..2.15.7.,145.7.2..,.3786....,2..6..51.,.........,.53..7..4,....3168.,..6.8.932,.9.72.1..")
		, genpuzzle("53...9...,.62......,4..1.5..2,...4..1.7,.7.....8.,2.8..3...,1..5.7..3,......89.,...9...54")
		, genpuzzle("533..9...,.62......,4..1.5..2,...4..1.7,.7.....8.,2.8..3...,1..5.7..3,......89.,...9...54")
		, genpuzzle("8........,..36.....,.7..9.2..,.5...7...,....457..,...1...3.,..1....68,..85...1.,.9....4..")
		, genpuzzle("88.......,..36.....,.7..9.2..,.5...7...,....457..,...1...3.,..1....68,..85...1.,.9....4..")
	][$i];
}

function validstr($str){
	if(strlen($str)!==89){ return false; }
	$strarr = str_split($str, 1);
	$strrows = explode(',', $str);
	if
	(   array_some(function($r) { return array_some(
		function($c){ return array_search($c, str_split('123456789.'), true)===false; }, 
		str_split($r, 1));} , $strrows)
	){
		return [false, "Error: Received invalid input."];
	}
	return [true, null];
}


//$puzz = ampuzz(0);
$puzz = genpuzzle($data);

$result = solve($puzz);


try{
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode($result);
	header("HTTP/1.0 200 Ok!");
}catch(Exception $e) {
  echo 'ERROR occured: <br>'. $e->getMessage();
  header("HTTP/1.0 201 API ERROR!".$e->getMessage());
}

?>
