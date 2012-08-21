<?php
	
	// path to pages: where we going to store pages regarding to site folder on server
	$pages = 'pages';

	// if we are going to to use static cache for generated pages, then
	$use_static = true;

 	// path to static: where we a going to store static cache redarding to site folder
	$static = 'static';

	// this is MAIN SETTINGS for service url discovery!
	// preparation path -- is where currend site in from regarding folder

	$prepath = '';

	// for example direct installation to root
	// e.g. to URI like http://example.com/
	// $prepath = '';

	// installation to sub directory
	// if finecut used inside of http://example.com/finecut/
	// $prepath = '/finecut';

	// if finecut used inside of http://example.com/sub/directory/finecut
	// $prepath = '/sub/directory/finecut';

	$deep = '/'.preg_replace( '/\//' , '\\/' , $prepath ).'/';


	// default settings, usually not need to change
	$perm_folder = 0755;
	$perm_file = 0644;

	// which file encoding to use for filenames (file system encoding)
	// and, yes, inside of files there is always UTF-8
	$fileNameEncoding = "UTF-8";
	// or, for example: $fileNameEncoding = 'windows-1251';

	
	$microtimeEcho = true;
	
?>