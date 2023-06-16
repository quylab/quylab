<?php
	
	$json = trim(file_get_contents('php://input'));
	$data = json_decode($json, true);
	
	$handle = new PDO("mysql:host=localhost:3306;dbname=busstops", "root", "");

	$handle->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$data['epoch'] = is_int($data['epoch'])?$data['epoch']:0; // handling nulls
	function fetchdb($qry){
		global $handle;
		$get = $handle->prepare($qry);
		$get->execute();
		$gotten = $get->fetchAll();
		return $gotten;
	}
	try{
		$ticked = false;
		if(strval($data['modid'])==='epoch'){
			$qry = $handle->query("UPDATE game SET epoch = epoch+1;");
			$ticked=true;
		}
		if(strval($data['modid'])==='clear'){
			$qry1 = $handle->query("START TRANSACTION; TRUNCATE TABLE buses; TRUNCATE TABLE stops; TRUNCATE TABLE passengers; TRUNCATE TABLE routes; TRUNCATE TABLE game; TRUNCATE TABLE nodes; TRUNCATE TABLE roads; INSERT INTO game (epoch) VALUES (0); TRUNCATE table pausedbuses; TRUNCATE table deletedbuses; COMMIT;");
			$ticked=true;
		}
		
		if($data['modid']===0){ // bus
			$qry = $handle->prepare("INSERT INTO buses (id, epoch) VALUES (?,?)");
			$qry->execute([$data['id'], $data['epoch']]);
			
			// route:
			$explodedroutes = array_map(function($x){ return intval($x); }, explode(',', $data['route']));
			$explodedroutes2 = [];
			$myindex = 0;
			function iseven($n){ return $n%2===0; }
			foreach($explodedroutes as $y){
				if(iseven($myindex)){
					$explodedroutes2[] = array_slice($explodedroutes, $myindex, 2);
				}
				$myindex++;
			}
			forEach($explodedroutes2 as $y){
				$qry = $handle->prepare("INSERT INTO routes (busid, stopid, posid) VALUES (?,?,?)");
				$qry->execute([$data['id'], $y[1], $y[0]]);
			}
			$ticked = true;
		}
		
		if($data['modid']===1){ // nodes
			$qry = $handle->prepare("INSERT INTO nodes (id, epoch, x, y) VALUES (?,?,?,?)");
			$qry->execute([$data['id'], $data['epoch'], $data['x'], $data['y']]);
			$ticked = true;
		}
		
		if($data['modid']===2){ // ps
			$qry = $handle->prepare("INSERT INTO passengers (id, epoch, startx, starty, endx, endy, type) VALUES (?,?,?,?,?,?,?)");
			$qry->execute([$data['id'], $data['epoch'], $data['startx'], $data['starty'], $data['endx'], $data['endy'], $data['type']]);
			$ticked = true;
		}
		
		if($data['modid']===3){ // stops
			$qry = $handle->prepare("INSERT INTO stops (nodeid, epoch, name) VALUES (?,?,?)");
			$qry->execute([$data['id'], $data['epoch'], $data['name']]);
			$ticked = true;
		}
		
		if($data['modid']===4){ // roads
			$qry = $handle->prepare("INSERT INTO roads (epoch, node_a, node_b) VALUES (?,?,?)");
			$qry->execute([$data['epoch'], $data['node_a'], $data['node_b']]);
			$ticked = true;
		}
		
		if($data['modid']===5){ // deletedbuses
			$qry = $handle->prepare("INSERT INTO deletedbuses (busid, epoch) VALUES (?,?)");
			$qry->execute([$data['id'], $data['epoch']]);
			$ticked = true;
		}
		
		if($data['modid']===6){ // pausedresumed
			$qry = $handle->prepare("INSERT INTO pausedbuses (busid, epoch, pausedresumed) VALUES (?,?,?)");
			$qry->execute([$data['id'], $data['epoch'], $data['pausedresumed']]);
			$ticked = true;
		}
		
		if($ticked===false){ throw new Exception('No query sent to Database!'); }
		header("HTTP/1.0 200 Ok!");
	} catch(PDOException $e) {
	  echo 'ERROR occured <br>'. $e->getMessage();
	  header("HTTP/1.0 201 Database Error!".$e->getMessage());
	} catch(Exception $e) {
	  echo 'ERROR occured: <br>'. $e->getMessage();
	  header("HTTP/1.0 201 API Exception!".$e->getMessage());
	}
	
?>