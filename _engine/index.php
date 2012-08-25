<?php

	$settingsPrepath = '_adm/settings.php';
	
	$time_start = microtime(true);
	
	// phpinfo();
	
	$drt = $_SERVER["DOCUMENT_ROOT"];
	$sfn = $_SERVER["SCRIPT_FILENAME"];
	$dsfn = dirname(dirname( $sfn ));
	
	$prepath = '';
	$root = $dsfn;
	
	if($drt !== $dsfn.'/'){
		$drt = '/'.preg_replace( '/\//' , '\\/' , $drt ).'/';
		$prepath = preg_replace( $drt, '', $root );
	}
	
	$root = $root.'/';
	
	$deep = '/'.preg_replace( '/\//' , '\\/' , $prepath ).'/';
	
	$settings_path = $root.$settingsPrepath;
	
	include_once $settings_path;
	
	// echo '000 '.$_SERVER["REQUEST_URI"].'<br>';
	
	$uri = preg_replace( $deep , '' , rawurldecode( $_SERVER["REQUEST_URI"] ), 1 );
	$uri = preg_replace( '/index.php/' , '' , $uri , 1 );
	$uri = preg_replace( '/index.htm/' , '' , $uri , 1 );
	$uri = preg_replace( '/index.html/' , '' , $uri , 1 );
	$uri = preg_replace( '/_index\//' , '' , $uri , 1 );
	$uri = preg_replace( '/_index/' , '' , $uri , 1 );
	$uri = preg_replace( '/\//' , '' , $uri , 1 );
	
	// echo '00 '.$uri.'<br>';
	
	$path = $root.$pages.DIRECTORY_SEPARATOR.$uri;
	$static_path = $root.$static.DIRECTORY_SEPARATOR.$uri;

	// echo '0 '.$path.'<br>';
	
	// echo '1 '.$root.$pages.DIRECTORY_SEPARATOR.'index.html<br>';
	
	$isMain = false;
	
	if($path == $root.$pages.DIRECTORY_SEPARATOR.'index.html'){
		$path = $root.$pages.DIRECTORY_SEPARATOR.'_index';
		$static_path = $root.$static.DIRECTORY_SEPARATOR.'_index';
		$isMain = true;
	}
	
	// echo '2 '.$root.$pages.DIRECTORY_SEPARATOR.'<br>';
	
	if($path == $root.$pages.DIRECTORY_SEPARATOR){
		$path = $root.$pages.DIRECTORY_SEPARATOR.'_index';
		$static_path = $root.$static.DIRECTORY_SEPARATOR.'_index';
		$isMain = true;
	}
	
	// echo '3 '.$path.'<br>';
	
	$get_static = false;
	
	if(file_exists($path) && is_dir($path)){
		

		function getfilescontent( $name , $path ){
			return file_get_contents($path.DIRECTORY_SEPARATOR.$name);
		}
		
		function parseHeader( $path ){
			return json_decode(getfilescontent('header.txt', $path ));
		}
		
		// function pageIsCodeOrNot( $path ){
			// return (strpos(getfilescontent('header.txt', $path ),'"pageIsCode":false') > 0)?true:false;
		// }

		$static_file_path = $static_path.DIRECTORY_SEPARATOR.'index.html';
		$dynamic_path = $path.DIRECTORY_SEPARATOR.'header.txt';
		$pageIsCodePath = $path.DIRECTORY_SEPARATOR.'pageIsCode.txt';
		
		
		$static_file_time = @filemtime($static_file_path);
		$settings_time = @filemtime($settings_path);
		$dynamic_file_time = @filemtime($dynamic_path);
		$engine_time = @filemtime(__FILE__);
		
		$header = false;
		
		if($use_static){ // from settings
			if(file_exists($static_file_path)){
				if($static_file_time && $settings_time){
				
					// echo $static_file_time."\n";
					// echo $settings_time."\n";
					// echo $dynamic_file_time."\n";
					
					if( ($static_file_time > $dynamic_file_time) && ($static_file_time > $settings_time)
					&& ($static_file_time > $engine_time) ){
					
						// if( file_exists ($pageIsCodePath) ){
							// $get_static = false;
						// } else {
							// $get_static = true;
						// }

						$header = parseHeader($path);
						if($header->pageIsCode){
						// if(pageIsCodeOrNot()){
							$get_static = false;
						}else{
							$get_static = true;
							// $templPath = dirname( dirname(__FILE__) ).DIRECTORY_SEPARATOR.'templates'.DIRECTORY_SEPARATOR.$header->template.DIRECTORY_SEPARATOR.'index.php';
							// $templ_time = @filemtime($templPath);
							// if( $static_file_time > $templ_time ){
								// $get_static = true;
							// }
						}
					}
				}
			}
		}
		
		if($get_static){
			
			readfile($static_file_path);
			
		}else{

			
			// echo 'uri: '.$uri.'<br>';

		   
			$success = array();
			
			if(!$header){ $header = parseHeader($path); }
			
			$success['header'] = $header;
			// $success['contentText'] = ''.getfilescontent('content.txt', $path );
			$success['content'] = $path.DIRECTORY_SEPARATOR.'content.txt';
			$success['info'] = ''.getfilescontent( 'info.txt', $path );
			$success['blocks'] = json_decode( ''.getfilescontent( 'blocks.txt', $path ) );
			$success['root'] = $root;
			$success['deep'] = $prepath;
			$success['path'] = $path;
			$success['pagesPath'] = $root.$pages.DIRECTORY_SEPARATOR;
			$success['pagesName'] = $pages;
			$success['isMain'] = $isMain;
			$success['components'] = array();
			$success['fileNameEncoding'] = $fileNameEncoding;
			
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
				ob_start();

				parseTemplate( $templPath, $success );
				
				if(!file_exists(dirname($static_file_path))){
					mkdir(dirname($static_file_path), 0777, true);
				}
				file_put_contents($static_file_path, ob_get_contents());

			} catch (Exception $e) {
				echo 'Caught exception: ',  $e->getMessage(), "\n";
			}
		}

		$time_end = microtime(true);
		$time = $time_end - $time_start;
		if( $microtimeEcho == true ){ echo '<!-- [ microtime '.$time.' seconds ] static:'.($get_static?'true':'false').' //-->'; }

	}else{
		header("HTTP/1.0 404 Not Found");
		include $_SERVER["DOCUMENT_ROOT"].DIRECTORY_SEPARATOR.'404.php';
	}
?>