<?php
	// phpinfo();
	$time_start = microtime(true);
	
	$root = dirname( dirname(__FILE__) ).DIRECTORY_SEPARATOR;
	include_once $root.'_adm'.DIRECTORY_SEPARATOR.'settings.php';
	
	// echo '000 '.$_SERVER["REQUEST_URI"].'<br>';
	
	// echo $deep;
	
	$uri = preg_replace( $deep , '' , rawurldecode( $_SERVER["REQUEST_URI"] ), 1 );
	$uri = preg_replace( '/index.php/' , '' , $uri , 1 );
	$uri = preg_replace( '/index.htm/' , '' , $uri , 1 );
	$uri = preg_replace( '/index.html/' , '' , $uri , 1 );
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
        
        $static_Fpath = $static_path.DIRECTORY_SEPARATOR.'index.html';
        $dynamic_path = $path.DIRECTORY_SEPARATOR.'content.txt';
        
        $S_time = @filemtime($static_Fpath);
        
        if($S_time){
            if($S_time > filemtime($dynamic_path)){
                $get_static = true;
            }
        }
        
        if($get_static){
            
            readfile($static_Fpath);
            
        }else{

            
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
            $success['deep'] = $prepath;
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
                ob_start();

                parseTemplate( $templPath, $success );
                
                if(!file_exists(dirname($static_Fpath))){
                    mkdir(dirname($static_Fpath), 0777, true);
                }
                file_put_contents($static_Fpath, ob_get_contents());

            } catch (Exception $e) {
                echo 'Caught exception: ',  $e->getMessage(), "\n";
            }
        }

        $time_end = microtime(true);
        $time = $time_end - $time_start;
        if( $microtimeEcho == true ){ echo '<!-- [ microtime '.$time.' seconds ] static:'.$get_static.' //-->'; }

    }else{
		header("HTTP/1.0 404 Not Found");
		include $_SERVER["DOCUMENT_ROOT"].DIRECTORY_SEPARATOR.'404.php';
	}
?>