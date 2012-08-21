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

function preparseContentStr( $str, $deep ){
	try {
		$str = preg_replace( '/href="\//' , "href=\"$deep/" , $str );
		$str = preg_replace( '/href = "\//' , "href = \"$deep/" , $str );
		$str = preg_replace( '/src="\//' , "src=\"$deep/" , $str );
		$str = preg_replace( '/src = "\//' , "src = \"$deep/" , $str );
		return $str;
	} catch (Exception $e) { }
}

?>