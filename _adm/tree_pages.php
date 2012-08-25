<?php
	mb_internal_encoding("UTF-8");

	include_once dirname(__FILE__).DIRECTORY_SEPARATOR.'settings.php';
	
	$action = ''; $leaf = ''; $path = ''; $data = '';
	if( isset( $_POST['action'] ) ){ $action = $_POST['action']; }
	if( isset( $_POST['leaf'] ) ){ $leaf = $_POST['leaf']; }
	if( isset( $_POST['path'] ) ){ $path = $_POST['path']; }
	if( isset( $_POST['data'] ) ){ $data = $_POST['data']; }

	function nameU( $str ){
		include dirname(__FILE__).DIRECTORY_SEPARATOR.'settings.php';
		return mb_convert_encoding($str, $fileNameEncoding, "UTF-8");
	}
	function nameS( $str ){
		include dirname(__FILE__).DIRECTORY_SEPARATOR.'settings.php';
		return mb_convert_encoding($str, "UTF-8", $fileNameEncoding);
	}

	function paths( $leaf ){
		include dirname(__FILE__).DIRECTORY_SEPARATOR.'settings.php';
		$pages = $pages;
		$pagesPath = dirname( dirname(__FILE__) ).preg_replace( '/\/top/' , DIRECTORY_SEPARATOR.$pages , nameU( $leaf ), 1 );
		return $pagesPath;
	}
	function getfiles( $name , $path ){
		try {
			$ppath = $path.DIRECTORY_SEPARATOR.$name;
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
	function setfiles( $name , $path , $str ){
		// echo "writing1$name \n";
		include dirname(__FILE__).DIRECTORY_SEPARATOR.'settings.php';
		$fh = fopen($path.DIRECTORY_SEPARATOR.$name, 'w') or die("can't open file");
		fwrite($fh, $str);
		@chmod( $fh, $perm_file );
		fclose($fh);
		// echo "writing2$name \n";
	}


	// to get entire tree
	if( $action == 'get' ){
		$pagesPath = paths( $leaf );
		if ($handle = opendir($pagesPath)) {
			$arr = array();
			while (false !== ($entry = readdir($handle))) {
				if( $entry != "." && $entry != ".." ){
					if( is_dir( $pagesPath.DIRECTORY_SEPARATOR.$entry) ){
						$entry = nameS( $entry );
						$arr[]["name"] = $entry;
						if ($handleF = opendir($pagesPath.DIRECTORY_SEPARATOR.$entry)) {
							while (false !== ($entryF = readdir($handleF))) {
								if( $entryF != "." && $entryF != ".." ){
									if( is_dir( $pagesPath.DIRECTORY_SEPARATOR.$entry.DIRECTORY_SEPARATOR.$entryF) ){
										$arr[count($arr)-1]["folder"] = true;
										break;
									}
								}
							}
						}
					}
				}
			}
			echo json_encode ($arr);
			closedir($handle);
		}
	}

		
	// delete leaf
	if( $action == 'del' ){
		$pagePath = paths( $leaf );
		// * Great thanks to Elfinder for this _remove()!
		function _remove($rempath){
			if (!is_dir($rempath)) {
				if (!@unlink($rempath)) {
					die('Unable to remove file '.$rempath);
				}
			} else {
				$ls = scandir($rempath);
				for ($i=0; $i < count($ls); $i++) {
					if ('.' != $ls[$i] && '..' != $ls[$i]) {
						_remove($rempath.DIRECTORY_SEPARATOR.$ls[$i]);
					}
				}
				if (!@rmdir($rempath)) {
					die('Unable to remove file '.$rempath);
				}
			}
			return true;
		}
		if( _remove($pagePath) ){ echo 'success'; }
	}
	
	function getPage( $pagePath ){
		include dirname(__FILE__).DIRECTORY_SEPARATOR.'settings.php';
		
		if(file_exists($pagePath) && is_dir($pagePath)){
			$success = array();
			$success['page'] = array();
			$headerContent = getfiles( 'header.txt', $pagePath );
			try{
				$headerContentUNS = unserialize( $headerContent );
			} catch (Exception $e) {
				$headerContentUNS = false;
			}
			if($headerContentUNS){ $headerContent = $headerContentUNS; }
			
			$success['page']['header'] = $headerContent;
			$success['page']['content'] = ''.getfiles( 'content.txt', $pagePath );
			$success['page']['info'] = ''.getfiles( 'info.txt', $pagePath );
			$success['page']['blocks'] = ''.getfiles( 'blocks.txt', $pagePath );
			$success['status'] = true;
			echo json_encode ($success);			
		}
	}
	function setPage( $pagePath , $data ){
		// echo "setPage1$pagePath \n";
		include dirname(__FILE__).DIRECTORY_SEPARATOR.'settings.php';
		
		if(file_exists($pagePath) && is_dir($pagePath)){
			// echo "setPage2$pagePath \n";
			$data = json_decode( $data );

			$header = $data->header;
			
			setfiles( 'header.txt' , $pagePath , $data->header );					
			setfiles( 'content.txt' , $pagePath , $data->content );
			setfiles( 'blocks.txt' , $pagePath , $data->blocks );
			// setfiles( 'info.txt' , $pagePath , $data->info );
			
			$contents = $data->info;
			$isEmpty = ''.$contents;
			
			$templatePath = dirname( dirname(__FILE__) ).DIRECTORY_SEPARATOR.'templates'.DIRECTORY_SEPARATOR.$data->header->template.DIRECTORY_SEPARATOR;
			$snippetPath = $templatePath.'snippet.txt';
			if( file_exists ($snippetPath ) && $isEmpty == '' ){
				$handle = fopen($snippetPath, 'r');
				if( filesize($snippetPath) > 0 ){
					$contents = fread($handle, filesize($snippetPath));
				}
				fclose($handle);
			}
			setfiles( 'info.txt' , $pagePath , $contents );



			$headerPath = $templatePath.'header.txt';
			if( file_exists ($headerPath ) && $isEmpty == '' ){
				$handle = fopen($headerPath, 'r');
				if( filesize($headerPath) > 0 ){
					$header = $headerCt = fread($handle, filesize($headerPath));
				}
				fclose($handle);
				setfiles( 'header.txt' , $pagePath , $headerCt );			
			}
			
			// $header = json_decode($header);
			// if($header->pageIsCode){
				// setfiles( 'pageIsCode.txt' , $pagePath , '' );
			// }else{
				// $pageIsCodePath = $path.DIRECTORY_SEPARATOR.'pageIsCode.txt';
				// if( file_exists ($pageIsCodePath) ){
					// _remove($pageIsCodePath);
				// }
			// }
						
			getPage( $pagePath );
			
		}else{
			echo '{"error":"File is not a path!"}';
		}
	}

	if( $action == 'set' ){
		// echo "start\n";
		$path = nameU( $path );
		// echo "$path\n";
		$new_path = paths( $leaf ).DIRECTORY_SEPARATOR.$path;
		// echo "$new_path\n";
		if(file_exists($new_path) && is_dir($new_path)){
			echo '{"error":"The page with the same name already exists."}';
		}else{
			
			mkdir( $new_path , $perm_folder ) or die ( '{"error":"can\'t create dir $new_path."}' );

			setfiles( 'info.txt' , $new_path , '' );
			setfiles( 'header.txt' , $new_path , '' );
			setfiles( 'content.txt' , $new_path , '' );
			setfiles( 'blocks.txt' , $new_path , '' );
			
			setPage( $new_path , $data );

		}
	}

	if( $action == 'content_get' ){
		$pagePath = paths( $leaf );
		getPage( $pagePath );
	}

	if( $action == 'content_set' ){
		$pagePath = paths( $leaf );
		setPage( $pagePath , $data );
	}

?>