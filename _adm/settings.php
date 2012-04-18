<?php
	
	// default settings, usually not need to change
	$perm_folder = 0755;
	$perm_file = 0644;
	$pages = 'pages';
	
	// this is MAIN SETTINGS for service url discovery!
	$deep = '//'; // REG EXP !
	/*
	Examples:
	$deep = '//';  							// this is default empty URI like http://example.com/ ( or http://example.com )
	$deep = '/\/afa\/zxc\/someelse/';		// for http://example.com/afa/zxc/someelse or with /
	$deep = '/\/zxc/';						// for http://example.com/zxc or with /
	*/
	
	
	// this is only for saving in _adm because non Latin files are not supported here!
	// $fileNameEncoding = 'windows-1251';
	$fileNameEncoding = "UTF-8";
	
	$microtimeEcho = true;
	
	
?>