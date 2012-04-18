<?php
	try {
		
		$serveroot = dirname( dirname( dirname(__FILE__) ) ).DIRECTORY_SEPARATOR;
		include $serveroot.'_adm'.DIRECTORY_SEPARATOR.'settings.php';

		if( $success['isMain'] == true ){
			
		}else{
			
		}
		
	} catch (Exception $e) {
		echo 'Caught exception: ',  $e->getMessage(), "\n";
	}


?>