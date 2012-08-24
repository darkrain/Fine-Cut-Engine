<?php
	mb_internal_encoding("UTF-8");

	include_once dirname(__FILE__).DIRECTORY_SEPARATOR.'settings.php';

	$action = ''; $template = ''; $source = ''; $snippet = '';
	if( isset( $_POST['action'] ) ){ $action = $_POST['action']; }
	if( isset( $_POST['template'] ) ){ $template = $_POST['template']; }
	if( isset( $_POST['source'] ) ){ $source = $_POST['source']; }
	if( isset( $_POST['snippet'] ) ){ $snippet = $_POST['snippet']; }
	if( isset( $_POST['header'] ) ){ $header = $_POST['header']; }else{
		
	}

	function nameU( $str ){
		include dirname(__FILE__).DIRECTORY_SEPARATOR.'settings.php';
		return mb_convert_encoding($str, $fileNameEncoding, "UTF-8");
	}
	function nameS( $str ){
		include dirname(__FILE__).DIRECTORY_SEPARATOR.'settings.php';
		return mb_convert_encoding($str, "UTF-8", $fileNameEncoding);
	}

	function getfiles( $ppath ){
		$handle = fopen($ppath, 'r') or die("can't open file");
		$contents = '';
		if( filesize($ppath) > 0 ){
			$contents = fread($handle, filesize($ppath));
		}
		fclose($handle);
		return $contents;
	}

	function setfiles( $path , $str ){
		include dirname(__FILE__).DIRECTORY_SEPARATOR.'settings.php';
		$fh = fopen($path, 'w') or die("can't open file");
		fwrite($fh, $str);
		@chmod( $fh, $perm_file );
		fclose($fh);
	}

	if( $template != ''){

		$path = dirname( dirname(__FILE__) ).DIRECTORY_SEPARATOR.'templates'.DIRECTORY_SEPARATOR.nameU( $template );

		if( $action == 'get' ){
			if(file_exists($path) && is_dir($path)){
				$sucess = array();
				$templatePath = $path.DIRECTORY_SEPARATOR.'index.php';
				$sucess['source'] = '';
				if(file_exists($templatePath)){
					$sucess['source'] = getfiles( $templatePath );
				}
				$sucess['snippet'] = '';
				$snippetPath = $path.DIRECTORY_SEPARATOR.'snippet.txt';
				if(file_exists($snippetPath)){
					$sucess['snippet'] = getfiles( $snippetPath );
				}
				$sucess['header'] = '';
				$snippetPath = $path.DIRECTORY_SEPARATOR.'header.txt';
				if(file_exists($snippetPath)){
					$sucess['header'] = getfiles( $snippetPath );
				}
				echo json_encode ($sucess);
			}
		}

		if( $action == 'getInfo' ){
			if(file_exists($path) && is_dir($path)){
				$sucess = array();
				$templatePath = $path.DIRECTORY_SEPARATOR.'index.php';
				if(file_exists($templatePath)){
					$sucess['snippet'] = '';
					$snippetPath = $path.DIRECTORY_SEPARATOR.'snippet.txt';
					if(file_exists($snippetPath)){
						$sucess['snippet'] = getfiles( $snippetPath );
					}
					$sucess['header'] = '';
					$headerPath = $path.DIRECTORY_SEPARATOR.'header.txt';
					if(file_exists($snippetPath)){
						$sucess['header'] = getfiles( $headerPath );
					}
					echo json_encode ($sucess);
				}
			}
		}
		
		if( $action == 'add' ){
			if(file_exists($path) && is_dir($path)){
				echo '{"error":"Template with the same name already exists."}';
			}else{
				
				mkdir( $path , $perm_folder ) or die ( '{"error":"can\'t create dir $path."}' );

				setfiles( $path.DIRECTORY_SEPARATOR.'index.php' , $source );
				setfiles( $path.DIRECTORY_SEPARATOR.'snippet.txt' , $snippet );
				setfiles( $path.DIRECTORY_SEPARATOR.'header.txt' , $header );
				
				echo 'success';
				
			}
			
		}

		if( $action == 'save' ){
			if(file_exists($path) && is_dir($path)){

				setfiles( $path.DIRECTORY_SEPARATOR.'index.php' , $source );
				setfiles( $path.DIRECTORY_SEPARATOR.'snippet.txt' , $snippet );
				setfiles( $path.DIRECTORY_SEPARATOR.'header.txt' , $header );
				
				echo 'success';
				
			}
		}

		if( $action == 'del' ){
			if(file_exists($path) && is_dir($path)){

				// * Great thanks to Elfinder for this _remove()!
				function _remove($path){
					if (!is_dir($path)) {
						if (!@unlink($path)) {
							die('Unable to remove file '.$path);
						}
					} else {
						$ls = scandir($path);
						for ($i=0; $i < count($ls); $i++) {
							if ('.' != $ls[$i] && '..' != $ls[$i]) {
								_remove($path.DIRECTORY_SEPARATOR.$ls[$i]);
							}
						}
						if (!@rmdir($path)) {
							die('Unable to remove file '.$path);
						}
					}
					return true;
				}
				if( _remove($path) ){ echo 'success'; }
				
			}
		}

	}
