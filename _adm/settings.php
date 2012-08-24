<?php
	
	// path to pages: where we going to store pages regarding to site folder on server
	$pages = 'pages';

	// if we are going to to use static cache for generated pages, then
	$use_static = true;

 	// path to static: where we a going to store static cache redarding to site folder
	$static = 'static';

	// default settings, usually not need to change
	$perm_folder = 0755;
	$perm_file = 0644;

	// which file encoding to use for filenames (file system encoding)
	// and, yes, inside of files there is always UTF-8
	$fileNameEncoding = "UTF-8";
	// or, for example: $fileNameEncoding = 'windows-1251';
	
	$microtimeEcho = true;
	
?>