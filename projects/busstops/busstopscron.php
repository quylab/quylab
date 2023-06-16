<?php

	$handle = new PDO("", "", "");
	$handle->query("START TRANSACTION; TRUNCATE TABLE buses; TRUNCATE TABLE stops; TRUNCATE TABLE passengers; TRUNCATE TABLE routes; TRUNCATE TABLE game; TRUNCATE TABLE nodes; TRUNCATE TABLE roads; INSERT INTO game (epoch) VALUES (0); TRUNCATE table pausedbuses; TRUNCATE table deletedbuses; COMMIT;");

?>