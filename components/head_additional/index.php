<?php
	include_once dirname(__FILE__).'/../commonFn.php';

	// echo $success['header']->additional;
	echo preparseContentStr( $success['header']->additional, $success['deep'] );
?>