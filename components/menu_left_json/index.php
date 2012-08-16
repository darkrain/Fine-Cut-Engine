<?php

$dirNameMenu = 'documentation';

$menuPath = $success['pagesPath'].$dirNameMenu.DIRECTORY_SEPARATOR;

function nameU( $str ){
	$turn = mb_convert_encoding($str, $success['fileNameEncoding'], "UTF-8");
	return $turn;
}

function nameS( $str ){
	$turn = mb_convert_encoding($str, "UTF-8", $success['fileNameEncoding']);
	return $turn;
}

function getfiles( $ppath ){
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


function readDirs($dir, $prefix){
	$pagesPath = nameU($dir);
	$handle = opendir($pagesPath);
	if ($handle) {
		while (false !== ($entry = readdir($handle))) {
			if( $entry != "." && $entry != ".." ){
				$entryNM = nameS( $entry );
				$entryPth = $pagesPath.$entryNM.DIRECTORY_SEPARATOR;
				if( is_dir( $entryPth ) ){
					
					$headerPth = $entryPth.'header.txt';
					
					if(file_exists($headerPth)){
						$header = unserialize( getfiles( $headerPth ) );
						// echo $headerPth;
						echo '<li><a href = "/'.$prefix.'/'.$entryNM.'/">'.$header->title.'</a></li><br>';
					}

					readDirs($entryPth, $prefix.'/'.$entryNM);
				}
			}
		}
	}
	closedir($handle);
}
echo '<ol>';
readDirs($menuPath, $dirNameMenu);
echo '</ol>';

?>