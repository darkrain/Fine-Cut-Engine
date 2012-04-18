<?php
	function nameS( $str ){
		mb_internal_encoding("UTF-8");
		include dirname(__FILE__).DIRECTORY_SEPARATOR.'settings.php';
		return mb_convert_encoding($str, "UTF-8", $fileNameEncoding);
	}

	function includeTemplates( $elemId, $width, $include_label ) {
?>
<?php if($include_label === true) { echo '<label for = "'.$elemId.'" >Select Template</label>'; } ?>
										<select id = "<?php echo $elemId; ?>" style="width:<?php echo $width; ?>px;" >
											<option value = "default"> Default
<?php										
	
	$templates = dirname( dirname(__FILE__) ).DIRECTORY_SEPARATOR.'templates'.DIRECTORY_SEPARATOR;
	// echo $templates;
	if ($handle = opendir($templates)) {
		while (false !== ($entry = readdir($handle))) {
			// echo $entry.'<br>';
			if( $entry != "." && $entry != ".." ){
				if( is_dir( $templates.DIRECTORY_SEPARATOR.$entry ) ){
					$entry = nameS( $entry );
					if( $entry != 'default' ){
						echo '<option value = "'.$entry.'"> '.$entry;
					}
				}
			}
		}
		closedir($handle);
	}
?>										</select>
<?php
	}
?>
