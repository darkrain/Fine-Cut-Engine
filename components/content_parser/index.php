<?php
	include_once dirname(__FILE__).'/../commonFn.php';
	
	if($success['header']->pageIsCode){
		include $success['content'];
	}else{
		// $size = readfile($success['content']);
		echo preparseContentStr(file_get_contents($success['content']), $success['deep']);
	}
?>