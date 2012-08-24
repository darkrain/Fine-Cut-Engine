<?php

include_once dirname(__FILE__).'/../commonFn.php';

$menuFileName = $info->leftMenu->menuFile;
$menuFilePath = dirname(__FILE__).DIRECTORY_SEPARATOR.$menuFileName;
$menuActiveLink = $info->leftMenu->active;

$menu = json_decode(getfile($menuFilePath));


foreach ($menu as &$value) {
	if( isset ($value->type) ){
		if( $value->type == 'link' ){
			
			
			if( isset ($value->menu) ){
				echo '<li>';
				if( $value->link == $menuActiveLink ){
					echo '<a href = "'.$success['deep'].$value->link.'" class = "active">'.$value->title.'</a>';
				}else{
					echo '<a href = "'.$success['deep'].$value->link.'" >'.$value->title.'</a>';
				}
				
				echo '<ul>';
				foreach ($value->menu as &$sub) {

					if( isset ($sub->type) ){
						if( $sub->type == 'link' ){
							if( $sub->link == $menuActiveLink ){
								echo '<li><a href = "'.$success['deep'].$sub->link.'" class = "active">'.$sub->title.'</a></li>';
							}else{
								echo '<li><a href = "'.$success['deep'].$sub->link.'" >'.$sub->title.'</a></li>';
							}
							
							// echo '<li><a href = "'.$sub->link.'">'.$sub->title.'</a></li>';
						}
						if( $sub->type == 'divider' ){
							echo '<li class = "divider"></li>';
						}
						if( $sub->type == 'header' ){
							echo '<li class = "header">'.$sub->title.'</li>';
						}
					}
				}
				echo '</ul>';
			}else{
				echo '<li>';
				if( $value->link == $menuActiveLink ){
					echo '<a href="'.$success['deep'].$value->link.'" class = "active">'.$value->title.'</a>';
				}else{
					echo '<a href="'.$success['deep'].$value->link.'">'.$value->title.'</a>';
				}
			}
			
			echo '</li>';
		}
		if( $value->type == 'divider' ){
			echo '<li class = "divider"></li>';
		}
		if( $sub->type == 'header' ){
			echo '<li class = "header">'.$sub->title.'</li>';
		}
	}
}

?>