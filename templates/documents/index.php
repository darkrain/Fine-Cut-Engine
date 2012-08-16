<!DOCTYPE html>
<html lang="ru">
	<head>

		<?php include( $success["components"]["json_info"] ); ?>

		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

		<title><?php echo $success['header']->title; ?></title>

		<meta name="keywords" content="<?php echo $success['header']->keywords; ?>">
		<meta name ="description" content="<?php echo $success['header']->description; ?>">

		<script type="text/javascript" src="<?php echo $success['deep']; ?>/_jquery/jquery-1.7.2.min.js" charset="utf-8"></script>

		<link rel="stylesheet" type="text/css" media="screen" 
			href="<?php echo $success['deep']; ?>/_js/stanlemon-jgrowl-463438153435/jquery.jgrowl.css" charset="utf-8">
		<script type="text/javascript" src="<?php echo $success['deep']; ?>/_js/stanlemon-jgrowl-463438153435/jquery.jgrowl_minimized.js" charset="utf-8"></script>

		<link rel="stylesheet" type="text/css" media="screen" href="<?php echo $success['deep']; ?>/_tmps/bootstrap/css/bootstrap.css" charset="utf-8">
		<script type="text/javascript" src="<?php echo $success['deep']; ?>/_tmps/bootstrap/js/bootstrap.min.js" charset="utf-8"></script>

		<link rel="stylesheet" type="text/css" media="screen" href="<?php echo $success['deep']; ?>/units/style.css" charset="utf-8">


		<?php echo $success['header']->additional; ?>

	</head>
	<body>

		<div class = "container well">

			<div class = "hero-unit white logo">
				<table border = "0">
				<tr>
				<td>
					<?php if( !$success['isMain'] ) { echo '<a href = "http://'.$_SERVER['HTTP_HOST'].$success['deep'].'">'; } ?>
					<image border = "0" src = "<?php echo $success['deep']; ?>/units/img/logo.png" width = "100" height = "100"
						alt = "FineCut Logo" class = "logo">
					<?php if( !$success['isMain'] ) { echo '</a>'; } ?>
				</td>
				<td>
					<h1 >
						&nbsp;&nbsp;&nbsp;Sites are Simple again!
					</h1>
				</td>
				</tr>
				</table>

			</div>
			<hr>
			<div class = "navbar" id = "navigation">
				<div class = "navbar-inner">
					<div class = "container" >
							
							
							<ul class="nav">
								<?php if( $success['isMain'] ){ ?>
								<li style = "padding: 12px 9px 0px 0px"><span class = "icon-home"></span></li>
								<?php } ?>
								<li class="divider-vertical"></li>
								<?php include ( $success['components']['menu_main'] ); ?>
							</ul>
							
							<ul class = "nav pull-right">
								<?php if( !$success['isMain'] ){ 
									echo '<li><a href="'.$success['deep'].'/" > <span class = "icon-home"></span> </a></li>';
									echo '<li class="divider-vertical"></li>';
								 } ?>
								<li>
									<form class = "navbar-search" action = "/search/"  method = "POST">
										<input type="text" class="search-query span2" placeholder="Search" name = "q">
										<span class = "icon-search" id = "searchButton"></span>
									</form>
								</li>
							</ul>
					</div>
				</div>
			</div>
			
			<hr>
			
			<div class = "row-fluid">
				<div class = "span3">
					<div class = "well white" >
						<?php include ( $success['components']['menu_documents'] ); ?>
					</div>
				</div>
				<div class = "span7">
					<div class = "well white">

						<?php include ( $success['components']['nav_chain'] ); ?>
						
						<?php
							if($success['header']->pageIsCode){
								include $success['content'];
							}else{
								$size = readfile($success['content']);
							}
						?>

						<br>

						<hr>
 <?php if( $success['blocks'][0]->value !== '' ){ ?>
						<pre>
So, this is all about <?php echo  $success['blocks'][0]->value; ?>

						</pre>
 <?php } ?>
					</div>
				</div>
				<div class = "span2">
					<div class = "well white">
						Features:<br>
						- Keep it Simple<br>
						- No Database<br>
						- Free from Fat<br>
						- Free to Use<br>
						- Integrate Well<br>
						- No Pop Corn<br>
						- No Spoon<br>
					</div>
				</div>
			</div>
			
			<hr>
			<div class = "content well well-small white">
				<div>
				</div>
				<div class = "pull-right">
					<span style = "font-size: 9px"> 2012 ,</span>
					Fine Cut is dual GPL and MIT Licensed
				</div>
			</div>
		</div>
		<br>

	</body>
</html><!-- -->