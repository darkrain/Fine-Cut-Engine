<?php
	// phpinfo();
	$time_start = microtime(true);
	
	$root = dirname( dirname(__FILE__) ).DIRECTORY_SEPARATOR;
	include_once $root.'_adm'.DIRECTORY_SEPARATOR.'settings.php';
	
	// echo '000 '.$_SERVER["REQUEST_URI"].'<br>';
	
	// echo $deep;
	
	$uri = preg_replace( $deep , '' , rawurldecode( $_SERVER["REQUEST_URI"] ), 1 );
	$uri = preg_replace( '/index.php/' , '' , $uri , 1 );
	$uri = preg_replace( '/index.html/' , '' , $uri , 1 );
	$uri = preg_replace( '/index.htm/' , '' , $uri , 1 );
	$uri = preg_replace( '/\//' , '' , $uri , 1 );
	
	// echo '00 '.$uri.'<br>';
	
	$path = $root.$pages.DIRECTORY_SEPARATOR.$uri;
	
	// echo '0 '.$path.'<br>';
	
	// echo '1 '.$root.$pages.DIRECTORY_SEPARATOR.'index.html<br>';
	
	$isMain = false;
	
	if($path == $root.$pages.DIRECTORY_SEPARATOR.'index.html'){
		$path = $root.$pages.DIRECTORY_SEPARATOR.'_index';
		$isMain = true;
	}
	
	// echo '2 '.$root.$pages.DIRECTORY_SEPARATOR.'<br>';
	
	if($path == $root.$pages.DIRECTORY_SEPARATOR){
		$path = $root.$pages.DIRECTORY_SEPARATOR.'_index';
		$isMain = true;
	}
	
	// echo '3 '.$path.'<br>';
	
	if(file_exists($path) && is_dir($path)){

		// echo 'uri: '.$uri.'<br>';

		function getfilescontent( $name , $path ){
			$ppath = $path.DIRECTORY_SEPARATOR.$name;
			// echo $ppath;
			$handle = fopen($ppath, 'r') or die("can't open file");
			if( filesize($ppath) > 0 ){
				$contents = fread($handle, filesize($ppath));
				fclose($handle);
			}else{
				return '';
			}
			return $contents;
		}
		
		$success = array();
		$success['header'] = unserialize( getfilescontent('header.txt', $path ) );
		// $success['contentText'] = ''.getfilescontent('content.txt', $path );
		$success['content'] = $path.DIRECTORY_SEPARATOR.'content.txt';
		$success['info'] = ''.getfilescontent('info.txt', $path );
		$success['root'] = $root;
		$success['path'] = $path;
		$success['isMain'] = $isMain;
		$success['components'] = array();
		$components = $root.DIRECTORY_SEPARATOR.'components'.DIRECTORY_SEPARATOR;

		if ($handle = opendir($components)) {
			while (false !== ($entry = readdir($handle))) {
				if( $entry != "." && $entry != ".." ){
					if( is_dir( $components.DIRECTORY_SEPARATOR.$entry ) ){
						$success['components'][$entry] = $components.DIRECTORY_SEPARATOR.$entry.DIRECTORY_SEPARATOR.'index.php';
					}
				}
			}
			closedir($handle);
		}		
		
		try {
			
			$templPath = dirname( dirname(__FILE__) ).DIRECTORY_SEPARATOR.'templates'.DIRECTORY_SEPARATOR.$success['header']->template.DIRECTORY_SEPARATOR.'index.php';
			function parseTemplate( $templPath, $success ){
				include $templPath;
			}
			parseTemplate( $templPath, $success );
			
			$time_end = microtime(true);
			$time = $time_end - $time_start;
			if( $microtimeEcho == true ){ echo '<!-- [ microtime '.$time.' seconds ] //-->'; }
			
		} catch (Exception $e) {
			echo 'Caught exception: ',  $e->getMessage(), "\n";
		}
	}else{
		header("HTTP/1.0 404 Not Found");
		include $_SERVER["DOCUMENT_ROOT"].DIRECTORY_SEPARATOR.'404.php';
	}
?>