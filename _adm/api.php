<?php		$settingsPath = dirname(__FILE__).DIRECTORY_SEPARATOR.'settings.php';	include_once $settingsPath;	$action = ''; $data = '';	if( isset( $_POST['action'] ) ){ $action = $_POST['action']; }	if( isset( $_POST['data'] ) ){ $data = $_POST['data']; }		if( $action == 'clear_cache' ){		$root = dirname( dirname(__FILE__) ).DIRECTORY_SEPARATOR;		$path = dirname( dirname(__FILE__) ).DIRECTORY_SEPARATOR.$static;		if($root !== $path){			function _remove($path){				if (!is_dir($path)) {					if (!@unlink($path)) {						die('Unable to remove cause not exist.'."\n".$path);					}				} else {					$ls = scandir($path);					for ($i=0; $i < count($ls); $i++) {						if ('.' != $ls[$i] && '..' != $ls[$i]) {							_remove($path.DIRECTORY_SEPARATOR.$ls[$i]);						}					}					if (!@rmdir($path)) {						die('Unable to remove.'."\n".$path);					}				}				return true;			}			if( _remove($path) ){ echo 'success'; }else{ echo 'falure'; }		}	}	if( $action == 'settings' ){		if( $data !== '' ){			$fh = fopen($settingsPath, 'w') or die("can't open file");			fwrite($fh, $data);			@chmod( $fh, $perm_file );			fclose($fh);			readfile($settingsPath);		}	}