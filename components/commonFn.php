<?php

function getfile( $ppath ){
	try {
		$handle = fopen($ppath, 'r');
		$contents = '';
		if( filesize($ppath) > 0 ){
			$contents = @fread($handle, filesize($ppath));
		}
		fclose($handle);
		return $contents;
	} catch (Exception $e) {}
	return '';
}

?>