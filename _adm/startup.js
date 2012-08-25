( function( undefined ) { $(document).ready(function() {
	var e;
	try{

		var ServerPaths = {
			  pages		: './tree_pages.php'
			, templates	: './template_action.php'
			, api		: './api.php'
		};

		var settings_path = '';
		
		var load_settings_path = function(){
			$.ajax( {
				  type: "POST"
				, async: false
				, data : { action: 'settings_path' }
				, dataType : 'text'
				, url: ServerPaths.api
				, success: function( data ){ settings_path = data; }
			} ) ;
		}

		
		$( '#tabsContent' ).tabs();

		// for saving changes: copy/paste;
		var _emptyleaf = function(){
			/*
			!!! order of properties in this object must be the same everywhere !!!
			therefore, each time You are creating new one, do copy of this, but not
			creation properties in unpredicted order!!!
			*/
			return {
				  header : {
					  title			: ''
					, template		: 'default'
					, pageIsCode	: false
					, keywords		: ''
					, description	: ''
					, additional	: ''
				}
				, content : ''
				, info : ''
				, blocks		: [ { value : '' } ]
			};
		};
		var emptyleaf = _emptyleaf();
		var buffer = _emptyleaf();

		$('#treePages').treeControl( {
			  saveState : true
			, root		: 'top'
			, handlers	: {
				  select	: function( leaf ){
					var tree = $('#treePages').prop( 'tree' );
					var path = tree.getPath( leaf );
					// helpers.clearValues();
					helpers.growl( 'Requesting Leaf Content...' );
					tree.shLoader( path.leaf, true );
					tree.ws( { leaf : path.str , action : 'content_get' } , function( data ) {
						helpers.response( data , path.leaf );
						tree.shLoader( path.leaf, false );
						helpers.growl( 'Leaf Loaded...' , 800 );
					} );
				}
				, blur		: function( currentLeaf , blurCallback ){
					if( helpers.checkValues( currentLeaf.obj.page ) ){
						helpers.clearValues();
						blurCallback();
					}else{
						helpers.confirm( 'What happens?', 'You have unsaved changes.\nDo You whant to save?'
						, function() {
							var tree = $('#treePages').prop( 'tree' );
							tree.x.current = currentLeaf;
							$( currentLeaf.elem.heading ).addClass( tree.x.classes.selected );
						}
						, function() {
							helpers.clearValues();
							blurCallback();
						} );
					}
					return true;
				}
			}
			, ws		: function( val , cb ) {
				try{
					var val = ( typeof( val ) == 'string' ) ? { 'leaf' : val , action : 'get' } : ( ( typeof( val ) == 'object' ) ? val : false );
					if( val ){
						$.ajax( {
							  type: "POST"
							, async: true
							, data : val
							, dataType : 'text'
							, url: ServerPaths.pages
							, success: function( data ){ if( data !== ''){ cb( data ); } }
							, error: function(data){ alert(data); }
						} ) ;
					}
				}catch(e){ alert(e); }
			}
			, init		: [ 1000 ,  function( treeControl ){ }  ]  // here is ability to set 'delay' and 'calback' to init
		} ); //.hide().fadeIn( 1000 );



		// Blocks


		var BlocksModel = function( blocks ) {
			var self = this;

			// self.blocks = ko.observableArray( ko.utils.arrayMap( blocks, function( block ) {
				// return { value : blocks.value || '' };
			// } ) );

			self.blocks = ko.mapping.fromJS( [ { value : '' } ] );

			self.addBlock = function() { self.blocks.push( { value: '' } ); };

			self.delBlock = function( block ) {
				if( self.blocks().length > 1 ){
					self.blocks.remove( block );
				}else{
					helpers.message( 'Keep in Mind', 'You can\'t delete last block.' );
				}
			};

			self.save = function() {
				return ko.toJS( self.blocks );
			};

			self.visibl = function(){
				return !( self.blocks().length > 0 );
			}

			self.clear = function( tf ) {
				// ko.utils.arrayMap( self.blocks(), function( block ) {
					// self.blocks.remove( block );
				// } ) ;
				// if( tf === undefined){ self.blocks.push({ value: '' }); }
				ko.mapping.fromJS( [ { value : '' } ] , self.blocks );
			};

			self.load = function( blks ){
				// self.clear( true );
				ko.mapping.fromJS( blks , self.blocks );
				// ko.utils.arrayMap( blks , function( block ) {
					// self.blocks.push( { value: block.value } );
				// } ) ;
			}

		};
		var blocks = new BlocksModel( [{value:''}] );

		ko.applyBindings( blocks );

		// Blocks


		$( '#treePagesEditor-info' ).on( 'click change' , function(){
			var snippetjson = {};
			var val = $(this).val();
			if (val) {
				try { snippetjson = JSON.parse( val ); }
				catch (e) { alert('Error in parsing json. ' + e); }
			} else { snippetjson = {}; }

			$('#treePagesEditor-info-snippet').jsonEditor( snippetjson, { change: function() {
				try{
					$('#treePagesEditor-info').val( js_beautify ( JSON.stringify( snippetjson ) , {
						  indent_size : 1
						, indent_char : '\t'
						, brace_style : 'collapse'
					} ) );
				}catch(e){ alert(e); }
			} } );
		} ).on('dblclick', function(){
			if( $('#settings-trees-expand').attr('checked') ){
				$('#treePagesEditor-info-snippet').toggleClass('expanded');
			} } );

		var helpers = {
			  growl : function( message , delay , opts ){
				if( $('#settings-growl-notify').attr('checked') ){
					var message = message || "Request is pending...";
					var delay = delay || 500;
					var opts = opts || {};
					$.extend( opts , { life: delay } );
					$.jGrowl( message, opts );
				}
			}
			, message : function( title , message ){
				if( !$( "#ui-dialog-message-dialog" )[0] ){
					$( "#ui-dialog-message" ).tmpl( {title:1, message:2} ).appendTo( $(document.body) );
					$( "#ui-dialog-message-dialog" ).dialog({
						  autoOpen: false, modal: true, show: 'highlight', hide: 'fade'
						, buttons: { Ok: function() { $( this ).dialog( "close" ); } }
						, close: function(){ $( "#ui-dialog-message-dialog" ).remove(); }
					});
				}
				$( "#ui-dialog-message-dialog" ).dialog( { title : title } );
				$( "#ui-dialog-message-dialog span.message" ).text( message );
				$( "#ui-dialog-message-dialog" ).dialog( 'open' );
			}
			, confirm : function( title , message , callback , cancelcb ){
				var confirm = function(){ callback && callback(); $( this ).dialog( "close" ); }
				var cancel = function() { cancelcb && cancelcb(); $( this ).dialog( "close" ); }
				if( !$( "#ui-dialog-confirm-dialog" )[0] ){
					$( "#ui-dialog-confirm" ).tmpl( {title:1, message:2} ).appendTo( $(document.body) );
					$( "#ui-dialog-confirm-dialog" ).dialog({
						  autoOpen: false, modal: true, show: 'highlight', hide: 'fade'
						, buttons: { 'Confirm' : confirm, Cancel: cancel }
						, close: function(){ $( "#ui-dialog-dialog-dialog" ).remove(); }
					});
				}else{
					$( "#ui-dialog-confirm-dialog" ).dialog({
						buttons: { 'Confirm' : confirm, Cancel: cancel }
					});
				}
				$( "#ui-dialog-confirm-dialog" ).dialog( { title : title } );
				$( "#ui-dialog-confirm-dialog span.message" ).text( message );
				$( "#ui-dialog-confirm-dialog" ).dialog( 'open' );
			}
			, response	: function( data , leaf , callback ){
				try{
					if( data !== '' ){
						var obj = JSON.parse( data );

						if(typeof(obj.page.header) === 'string'){
							obj.page.header = JSON.parse( obj.page.header );
						}
						
						if( obj.status ){
							leaf.obj.page = obj.page;
							helpers.setValues( obj.page );
							callback && callback();
						}else{ helpers.message( 'Notification!', data ); }
					}
				}catch(e){ alert(e); }
			}

			, clearValues : function(){
				for( var i in emptyleaf.header ){
					$( '#treePagesEditor-' + i ).val( '' );
				}
				$( '#treePagesEditor-info' ).val( '' );
				window.setTimeout( function(){ // forcing jsoneditor
					$('#treePagesEditor-info').click();
				}, 300 );


				$('#treePagesEditor-pageIsCode').attr('checked', false);

				$( '#pages-editor' ).val( '' );

				// $( '#pages-editor' ).elrte('val', '   ' )
				// $( '#pages-editor' ).elrte('updateSource');

				blocks.clear();

				$("#treePagesEditor-template").trigger("liszt:updated");
			}
			, getValues : function(){

				var obj = {
					  header 	: emptyleaf.header
					, content	: $( '#pages-editor' ).val()
					// , content	: $( '#pages-editor' ).elrte('val')
					, info		: $( '#treePagesEditor-info' ).val()
				};

				for( var i in emptyleaf.header ){
					if( $( '#treePagesEditor-' + i )[0] ){
						obj.header[i] = $( '#treePagesEditor-' + i ).val();
					}
				}

				var chkd = ( $('#treePagesEditor-pageIsCode').attr('checked') == 'checked' ) ? true : false;

				obj.header.pageIsCode = chkd;
				obj.blocks = blocks.save();
				
				return obj;

			}

			, setValues : function( obj ){
				try{

					// helpers.clearValues();
					
					if( obj.header !== undefined ){
						for( var i in emptyleaf.header ){
							if( obj.header[i] !== undefined ){
								$( '#treePagesEditor-' + i ).val( obj.header[i] );
							}else{
								$( '#treePagesEditor-' + i ).val( emptyleaf.header[i] );
							}
						}
					}
					if( obj.info !== undefined ){
						$( '#treePagesEditor-info' ).val( obj.info );
						window.setTimeout( function(){ // forcing jsoneditor
							$('#treePagesEditor-info').click();
						}, 300 );
					}

					if( ( obj.blocks == undefined ) || ( obj.blocks == '' )){
						if( obj.header.blocks !== undefined ){
							obj.blocks = obj.header.blocks;
						}else{
							obj.blocks = [{value:''}];
						}
					}else{
						obj.blocks = JSON.parse( obj.blocks );
					}

					blocks.load( obj.blocks );

					$('#treePagesEditor-pageIsCode').attr( 'checked', obj.header.pageIsCode );

					$( '#pages-editor' ).val( obj.content );
					$("#treePagesEditor-template").trigger("liszt:updated");

				}catch(e){ alert(e); }
			}
			, checkValues : function( compare ){
				var compareObj = compare || emptyleaf;
				var valuesObj = helpers.getValues();
				var compare = JSON.stringify( compareObj );
				var values = JSON.stringify( valuesObj );

				// debugger;
				// !!! keep in mind about ORDER of properties in string !!!
				
				if( compare ==  values ) {
					return true;
				}else{
					return false;
				}

			}
			, saveLeaf : function(){
				try{

					var ed = $('#pages-editor');
					var editor = ed[0];
					var scrollTop = editor.scrollTop;
					var carretPosition = editor.selectionStart;

					var tree = $('#treePages').prop( 'tree' );
					var path = tree.currentPath();
					if( path.arr.length > 1 ){
						helpers.growl( 'Saving Leaf Started...', 1000 );
						tree.shLoader( path.leaf, true );
						// var enc = function(str){ return encodeURIComponent(str); }
						var data = helpers.getValues();
						data.blocks = JSON.stringify( data.blocks );
						data.header = JSON.stringify( data.header );

						var obj = { leaf : path.str , action : 'content_set' , data : JSON.stringify( data ) };
						tree.ws( obj , function( data ){
							helpers.clearValues();
							helpers.response( data , path.leaf );
							tree.shLoader( path.leaf, false );
							
							editor.scrollTop = scrollTop;
							editor.setSelectionRange( carretPosition, carretPosition);
							
							helpers.growl( 'Leaf Saved...', 2000 );
						} );
					}else{
						if( !helpers.checkValues( emptyleaf ) ){
							helpers.confirm( 'We Need Your Confirmation!', 'You have made Changes without selecting a leaf. Do You need to save this changes in New Leaf ( "Confirm" ), or just to degrade them ( filled data becomes lost ).'
							, function(){
								$( '#tree-dialog-leaf-add-form' ).dialog( 'open' );
							}
							, function(){
								helpers.clearValues();
								$( '#tree-dialog-leaf-add-form' ).dialog( 'open' );
							} );

						}else{
							helpers.message('Notification!', 'You need to Select some page before trying to Save it!');
						}
					}
					
				}catch(e){ alert(e); }
			}
		}



		$('#elfinder').elfinder({
			  url: './elfinder-1.2/connectors/php/connector_server.php'  // connector URL (REQUIRED)
			, height: '530px'
			, disableShortcuts: true
		}).elfinder('instance');



		// $('#pages-editor').elrte({
				  // cssClass : 'el-rte'
				// , lang     : 'en'
				// , height : 370
				// , styleWithCSS : true
				// , fmAllow : false
				// , toolbar  : 'vinni'
				// , cssfiles : ['../_js/elrte-1.3/css/elrte-inner.css']
				// , megaSave : helpers.saveLeaf
		// });

		// jQuery('#pages-editor').wymeditor();

		$('#pages-editor').markItUp( mySettings );
		$('#markItUpPages-editor, .markItUpContainer').addClass('ui-corner-all');


		var markitupHelper = {
			get: function () {
				var textarea = $('#pages-editor');
				var selection, caretPosition;
				if (document.selection) {
					selection = document.selection.createRange().text;
					if ($.browser.msie) { // ie
						var range = document.selection.createRange(),
						rangeCopy = range.duplicate();
						
						rangeCopy.moveToElementText(textarea);
						caretPosition = -1;
						while(rangeCopy.inRange(range)) {
							rangeCopy.moveStart('character');
							caretPosition ++;
						}
					} else { // opera
						selection = textarea.selectionStart;
					}
				} else { // gecko & webkit
					selection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
				} 
				return  textarea.selectionStart; // gecko & webkit & opera
			}		
		};
		
		

		var rid_index = function( direct ) {

			// menu generation code for current leaf, used for documentation!
			/*
			var leafTree = tree.getTreeCurrent({type: 'link'}, function(leaf){
				return {
					title : '' + leaf.name,
					link: '' + leaf.path.strp,
					type: '' + leaf.type
				};
			});
			console.log(js_beautify(JSON.stringify(leafTree)));
			*/

			var tree = $('#treePages').prop( 'tree' );
			var path = tree.currentPath();
			var strp = '';
			if( path.strp ){ strp = path.strp; }
			if( strp === '/_index/' ){ strp = '/'; }
			if(direct){
				return strp;
			}else{
				return settings_path + strp;
			}
		}

		$( '#leaf_copy_path' ).button({ text: false, icons: { primary: 'ui-icon-arrowreturnthick-1-e' }
			, label: ' Copy this Leaf Path '  }).click(	function(){
			window.prompt ( "Copy to clipboard: Ctrl+C, Enter", rid_index(true) );
		} );

		$( '#leaf_copy_url' ).button({ text: false, icons: { primary: 'ui-icon-arrowreturnthick-1-s' }
			, label: ' Copy this Leaf URL '  }).click(	function(){
			window.prompt ( "Copy to clipboard: Ctrl+C, Enter", window.location.href.split( window.location.pathname )[0] + rid_index() );
		} );
		$( '#leaf_go_url' ).button({ text: false, icons: { primary: 'ui-icon-arrowreturnthick-1-n' }
			, label: ' Go this Leaf URL '  }).click(	function(){

			window.open ( window.location.href.split( window.location.pathname )[0] + rid_index() );

		} );


		$( '#leaf_save' ).button({ text: false, icons: { primary: 'ui-icon-disk' }
			, label: '   Save Current Leaf \n( Ctrl + S also works )' }).click(	function(){ helpers.saveLeaf(); } );

		$( '#leaf_copy' ).button({ text: false, icons: { primary: 'ui-icon-scissors' }
			, label: 'Copy Leaf Contents to Internal Clipboard' }).click( function(){
				buffer = helpers.getValues(); } );

		$( '#leaf_paste' ).button({ text: false, icons: { primary: 'ui-icon-clipboard' }
			, label: 'Paste Leaf Contents from Internal Clipboard' }).click( function(){
				helpers.clearValues(); helpers.setValues( buffer ); } );

		$( '#tree_refresh' ).button({ text: false, icons: { primary: 'ui-icon-refresh' }
			, label: 'Refresh Tree' }).click( function(){
				helpers.clearValues();
				var tree = $('#treePages').prop( 'tree' );
				// tree.x.obj.click(); // tree.x.current = null; + callbacks
				tree.leaf( tree.treeViewModel ); } );

		$( '#leaf_del' ).button({ text: false, icons: { primary: 'ui-icon-close' }
			, label: 'Delete Leaf' }).click( function(){
				var tree = $('#treePages').prop( 'tree' );
				var path = tree.currentPath();
				var pathParent = tree.currentPath( true );
				if( path.arr.length > 1 ){
					helpers.confirm( 'Are You Sure?', 'You will not be able to UnDo this action.' , function(){
						tree.x.obj.click(); // tree.x.current = null; + callbacks == helpers.clearValues();
						var obj = { leaf : path.str , action : 'del' };
						tree.ws( obj , function( data ){
							tree.leaf( pathParent.leaf );
							if( data == 'success' ){
								// helper.clearValues();
							}else{ helpers.message('Notification!', data); }
						} );
					} );
				}else{
					helpers.message('Notification!', 'You need to Select some page before trying to delet it!');
				}
			} );

		$( '#leaf_add' ).button({ text: false, icons: { primary: 'ui-icon-note' }
			, label: 'Add Leaf' }).click( function(){

					var tree = $('#treePages').prop( 'tree' );
					var path = tree.currentPath();
					if( path.arr.length < 2 ) {
						$( '#tree-dialog-leaf-add-form' ).dialog( 'open' );
					}else{
						if( !helpers.checkValues( path.leaf.obj.page ) ) {
							helpers.confirm( 'Wassup?', 'You have unsaved changes.\n If You Do Whant to save, press "Confirm" button!'
							, function() {}
							, function() {
								$( '#tree-dialog-leaf-add-form' ).dialog( 'open' );
							} );
						}else{
							$( '#tree-dialog-leaf-add-form' ).dialog( 'open' );
						}
					}

			} );

		$( '#toggle_tree' ).button({ text: false, icons: { primary: 'ui-icon-circle-arrow-w' }
			, label: ' Hide / Show Tree' }).click(
				function(){
					$('#treePages').toggle();
					var elem = $(this).find('span').eq(0);
					if( elem.hasClass('ui-icon-circle-arrow-w') ){
						elem.removeClass('ui-icon-circle-arrow-w').addClass('ui-icon-circle-arrow-e');
					}else{
						elem.removeClass('ui-icon-circle-arrow-e').addClass('ui-icon-circle-arrow-w');
					}
				} );


		$( '#tree-dialog-leaf-add-form' ).dialog({
			  autoOpen: false
			, width: 430
			, height:280
			, modal: true
			, buttons: {
				  'Create Leaf': function() {
					try{
						var text = $( '#tree-dialog-leaf-add-form-text' ).val();
						if( text.length > 0 ){
							$( '#tree-dialog-leaf-add-form' ).prop( 'allFields' ).val('').removeClass( 'ui-state-error' );


							var tree = $('#treePages').prop( 'tree' );
							var path = tree.currentPath();
							var leafData = emptyleaf;
							
							if( path.arr.length > 1 ){ // if there is selected leaf
								var chk = $( '#tree-dialog-leaf-add-form-checkbox' ).attr('checked') == 'checked';
								path = tree.currentPath( chk );
								path.leaf.obj.folder = true;
								path.leaf.obj.open = true;
							}else{
								if( !helpers.checkValues( emptyleaf ) ){ var leafData = helpers.getValues(); }
								path = path;
							}
							
							leafData.header.template = $( '#tree-dialog-leaf-add-form-template' ).val();


							// debugger;
							tree.ws( { leaf : path.str , action : 'set' , path : text , data : JSON.stringify( leafData ) }
								, function( data ){
									// debugger;
									if( data !== '' ){
										var obj = JSON.parse( data );
										if( typeof( obj.error ) == 'string'){
											helpers.message( 'Error Occures' , obj.error );
										}else{
											// helpers.clearValues();
											var cb = function( leaf , controlObject ){
												try{
													$.map( leaf.children, function( el, idx ){
														el.obj.page = emptyleaf;
														if( el.name == text ){ el.elem.heading.click(); }
														// do not uncomment, it forces 'You have unsaved changes!
														// helpers.setValues( el.obj.page );
													} );
												}catch(e){ alert(e); }
											};
											if(path.leaf.obj.open){
												tree.leaf( path.leaf , cb );
											}else{
												tree.leafControl( path.leaf , cb );
											}
										}
									}

								}
							);

							$( this ).dialog( 'close' );
						}else{ helpers.message('Notification!', '"Leaf Name" is required field!'); }
					}catch(e){ alert(e); }
				}
				, Cancel: function() {
					$( '#tree-dialog-leaf-add-form' ).prop( 'allFields' ).val('').removeClass( 'ui-state-error' );
					$( this ).dialog( 'close' );
				}
			}
			, show: { effect : 'explode', duration : 500 }
			, hide: { effect : 'fold', duration : 500 }
			, open: function( evt, ui ){
					// var str = ''; for( var i in ui ){ str += i + ' ' + ui[i] + '\n'; }
					$( '#tree-dialog-leaf-add-form' ).prop( 'allFields' ).val('').removeClass( 'ui-state-error' );

					var path = $('#treePages').prop( 'tree' ).currentPath();
					var checkbox = $( '#tree-dialog-leaf-add-form-checkbox-div' );
					checkbox.hide();
					if( path.arr.length > 1 ){ checkbox.show(); }
					window.setTimeout( function() { $( '#tree-dialog-leaf-add-form-text' ).focus(); } , 1000 );
			}
			, close: function() {
				$( '#tree-dialog-leaf-add-form' ).prop( 'allFields' ).val('').removeClass( 'ui-state-error' );
			}
		}).prop( 'allFields' , $( [] ).add( $( '#tree-dialog-leaf-add-form-text' ).width('95%') ) );

		$( '#tree-dialog-leaf-add-form-checkbox' ).button().click( function(){
			 $( 'label[for=tree-dialog-leaf-add-form-checkbox] input' )[0].checked =
			  $( '#tree-dialog-leaf-add-form-checkbox ' )[0].checked;
		} );



		// templates

		
		var applyTemplateDataToPage = function( obj ){

			$('#treePagesEditor-info').val( obj.snippet );
			window.setTimeout( function(){
				// forcing jsoneditor
				$('#treePagesEditor-info').click();
			}, 300 );
			
			var header = emptyleaf.header;
			try{
				header = JSON.parse( obj.header );
			}catch(e){ }
			
			for( var i in emptyleaf.header ){
				if( $( '#treePagesEditor-' + i )[0] ){
					var val = header[i] || emptyleaf.header[i];
					$( '#treePagesEditor-' + i ).val( val );
				}
			}
			
			$("#treePagesEditor-template").trigger("liszt:updated");
			
		}
		
		$( '#treePagesEditor-template' ).chosen().change( function(){
			var val = $( '#treePagesEditor-template' ).val();
			templateAction( 'getInfo', val,
				function( data ){
					var obj = JSON.parse( data );
					helpers.growl( 'Template "' + val + '" data Received.' , 1000 );
					
					var tree = $('#treePages').prop( 'tree' );
					var path = tree.currentPath();
					
					if( path.arr.length > 1 ){ // if there is selected leaf
						helpers.confirm( 'Need confirmation', 'Apply Template data to page?' , function(){
							applyTemplateDataToPage( obj );
						} );	
					}else{
						applyTemplateDataToPage( obj );
					}
				}
			);

		} );

		
		$('#templ-snippet-editor').on( 'click change', function(){
			var snippetjson = {};
			var val = $(this).val();
			if (val) {
				try { snippetjson = JSON.parse( val ); }
				catch (e) { alert('Error in parsing json. ' + e); }
			} else { snippetjson = {}; }

			$('#snippeteditor').jsonEditor( snippetjson, { change: function() {
				try{
					$('#templ-snippet-editor').val( js_beautify ( JSON.stringify( snippetjson ) , {
						  indent_size : 1
						, indent_char : '\t'
					} ) );
					// $('#templ-snippet-editor').val( JSON.stringify( snippetjson , null , 2 ) );
				}catch(e){ alert(e); }
			} } ); //.addClass('expanded');
		} )
		.on( 'dblclick', function(){
			if( $('#settings-trees-expand').attr('checked') ){
				$('#snippeteditor').toggleClass('expanded');
			} }
		);

		var currentTemplate = 'default' || $( '#templManager-template' ).val();

		var configTemplateButtons = function(){
			currentTemplate = $( '#templManager-template' ).val();
			$( '#del_template' ).removeClass('disabled');
			if( currentTemplate == 'default' ){ $( '#del_template').addClass('disabled'); }
		};

		var collectTemplateHeader = function( templateName ){
			var header = emptyleaf.header;
			for( var i in emptyleaf.header ){
				if( $( '#templHeader-' + i )[0] ){
					header[i] = $( '#templHeader-' + i ).val();
				}
			}
			header.template = $( '#templManager-template' ).val();
		
			var chkd = ( $('#templHeader-pageIsCode').attr('checked') == 'checked' ) ? true : false;

			header.pageIsCode = chkd;
			
			return JSON.stringify( header );
		};

		var templateAction = function( action, tplname, callbackFn ){ // get add dell save

			var callback = '';

			var obj = { action : action , template : tplname || currentTemplate }

			helpers.growl( 'Template action ' + action + ' initialised...' );

			if( action == 'get' ){
				callback = function( data ){
					var obj = JSON.parse( data );
					$('#templ-source-editor').val( obj.source );
					$('#templ-snippet-editor').val( obj.snippet );

					
					var header = emptyleaf.header;
					try{
						header = JSON.parse( obj.header );
					}catch(e){ }
					
					for( var i in emptyleaf.header ){
						if( $( '#templHeader-' + i )[0] ){
							var val = header[i] || emptyleaf.header[i];
							$( '#templHeader-' + i ).val( val );
						}
					}

					helpers.growl( 'Template was Successfully Received.' , 1000 );
					window.setTimeout( function(){ // forcing jsoneditor
						$('#templ-snippet-editor').click();
					}, 300 );
					
					callbackFn && callbackFn(data)
				}
			}

			if( action == 'getInfo' ){
				callback = callbackFn;
			}

			if( action == 'save' ){

				$.extend( obj , {
					source : $('#templ-source-editor').val(),
					snippet : $('#templ-snippet-editor').val(),
					header: collectTemplateHeader( obj.template )
				});

				callback = function( data ){
					if( data == 'success' ){
						helpers.growl( 'Template was Successfully Saved.' );
						templateAction( 'get' );
					}else{ alert(data); }
				};

			}

			if(  action == 'add' ){

				$.extend( obj , {
					source : $('#templ-source-editor').val(),
					snippet : $('#templ-snippet-editor').val(),
					header: collectTemplateHeader( obj.template )
				});

				callback = function( data ){
					if( data == 'success' ){
						helpers.growl( 'Template was Successfully Added.' );

						$( '#tree-dialog-leaf-add-form-template option[value="'+currentTemplate+'"]' ).removeAttr('selected');
						$( '#tree-dialog-leaf-add-form-template' ).append('<option value = "'+tplname+'">'+tplname);
						$( '#tree-dialog-leaf-add-form-template' ).trigger("liszt:updated");

						$( '#treePagesEditor-template option[value="'+currentTemplate+'"]' ).removeAttr('selected');
						$( '#treePagesEditor-template' ).append('<option value = "'+tplname+'">'+tplname);
						$( '#treePagesEditor-template' ).trigger("liszt:updated");

						$( '#templManager-template option[value="'+currentTemplate+'"]' ).removeAttr('selected');
						$( '#templManager-template' ).append('<option value = "'+tplname+'" selected = "selected">'+tplname);
						$( '#templManager-template' ).trigger("liszt:updated");

						configTemplateButtons();
						templateAction( 'get' );
					}else{ alert(data); }
				};
			}

			if( action == 'del' ){
				// alert( $( '#templManager-template option[value="'+currentTemplate+'"]' ).attr('value') );
				callback = function( data ){
					if( data == 'success' ){
						helpers.growl( 'Template was Successfully Deleted.' );
						$( '#treePagesEditor-template option[value="'+currentTemplate+'"]' ).remove();
						$( '#treePagesEditor-template' ).trigger("liszt:updated");
						$( '#tree-dialog-leaf-add-form-template option[value="'+currentTemplate+'"]' ).remove();
						$( '#tree-dialog-leaf-add-form-template' ).trigger("liszt:updated");
						$( '#templManager-template option[value="'+currentTemplate+'"]' ).remove();
						$( '#templManager-template' ).trigger("liszt:updated");
						configTemplateButtons();
						templateAction( 'get' );
					}else{ alert(data); }
				};
			}

			$.ajax( {
				  type: "POST"
				, async: true
				, data : obj
				, dataType : 'text'
				, url: ServerPaths.templates
				, success: function( data ){ if( data !== '' ){ callback && callback ( data ); } }
				, error: function(data){ alert(data); }
			} ) ;

		}

		$( '#templManager-template' ).chosen().change( function(){
			configTemplateButtons();
			templateAction( 'get' );
		} );

		$( '#del_template' ).click( function(){ configTemplateButtons(); if( currentTemplate !== 'default' ){ templateAction( 'del' ); } } );

		$( '#add_template' ).click( function(){
			configTemplateButtons();
			var val = prompt('Plase Fill Name!');
			if(val){
				templateAction( 'add' , val );
			}
		} );

		$( '#save_template' ).click( function(){
			configTemplateButtons();
			templateAction( 'save' );
		} );

		configTemplateButtons();

		// setting default template to emtpy page
		templateAction( 'get', false, function(data){
			var obj = JSON.parse( data );
			// applyTemplateDataToPage( obj );
		});

		// templates






		// settings

		var saveSettingsAction = function(){ // used for keydown Ctrl + S reaction
			helpers.growl( 'Saving Settings.' );
			var val = $('#settings-editor-text').val();
			$.ajax( {
				  type: "POST"
				, async: true
				, data : { action: 'settings', data: val }
				, dataType : 'text'
				, url: ServerPaths.api
				, success: function( data ){
					$('#settings-editor-text').val(data);
					load_settings_path();
					if( $('#settings-growl-notify').attr('checked') ){
						helpers.growl( 'Settings Saved.' );
					}else{
						helpers.message( 'Info', 'Settings Saved.' );
					}
				}
			} );
		};

		window.setTimeout( function(){
			if( $.cookie ){
				var val = $.cookie( 'settings_growl_control_cookie_name' ) || false;
				$('#settings-growl-notify').attr('checked' ,  val );
				var val = $.cookie( 'settings_tree_expand_name' ) || false;
				$('#settings-trees-expand').attr('checked' ,  val );
			}
			$('#settings-growl-notify').click( function(){
				var opts = { name : 'settings_growl_control_cookie_name', opts : { expires: 7 } };
				$.cookie( opts.name , $('#settings-growl-notify').attr('checked'), opts.opts );
			} );
			$('#settings-trees-expand').click( function(){
				var opts = { name : 'settings_tree_expand_name', opts : { expires: 7 } };
				$.cookie( opts.name , $('#settings-trees-expand').attr('checked'), opts.opts );
			} );
			$('#settings-trees-expand').click( function(){
				var opts = { name : 'settings_tree_expand_name', opts : { expires: 7 } };
				$.cookie( opts.name , $('#settings-trees-expand').attr('checked'), opts.opts );
			} );


			$('#saveSettingsButton').click( function(){ saveSettingsAction(); } );

			$('#clearCacheButton').click( function(){
				var val = $('#settings-editor-text').val();
				$.ajax( {
					  type: "POST"
					, async: true
					, data : { action: 'clear_cache' }
					, dataType : 'text'
					, url: ServerPaths.api
					, success: function( data ){ helpers.message( 'Info', data ); }
				} ) ;
			} );


		}, 300 );

		// settings


		// resizer

		window.setTimeout(function(){


			var initialHeightsConfig = ['tabsContent', 'treePages', 'treePagesEditor', 'pages-editor',
				'treePagesEditor-description', 'treePagesEditor-additional', 'treePagesEditor-info-snippet',
				'templHeader-description', 'templHeader-additional',
				'templ-source-editor', 'snippeteditor', 'fileManager', 'settings-editor-text'];

			var initialHeights = {};

			$.map(initialHeightsConfig, function(val, i){
				initialHeights[val] = $('#' + val).height();
			});

			var starter = initialHeights.tabsContent;

			var resizerTrack = 0;

			var resizer = function(){
				var wh = $(window).height();
				if( wh > starter + 7 ){
					for(var i in initialHeights){
						var diff = starter - initialHeights[i];
						// console.log(i + ' ' + diff + ' ' + $('#' + i).height());
						$('#' + i).height( wh - 27 - diff );
					};


					$('#elfinder').find('div.el-finder-nav, div.el-finder-cwd')
						.height( wh - ( starter - 530 ) - 27 );
				}else{
					for(var i in initialHeights){
						$('#' + i).height( initialHeights[i] );
					};
					$('#elfinder').find('div.el-finder-nav, div.el-finder-cwd')
						.height( 530 );
				}
			};

			$(window).on('resize', function(){
				resizerTrack++;
				(function(track){
					window.setTimeout(function(){
						if(track == resizerTrack){ resizer(); }
					}, 500);
				})(resizerTrack);
			});

			resizer();

		}, 1000);

		// resizer





		$(window).on( 'keydown' , function(evt) {
			try{
				// Ctrl + S
				if (evt.ctrlKey && evt.keyCode == 83) {
					evt.stopPropagation();
					evt.preventDefault();
					if( !$( '#pagesManager' ).hasClass('ui-tabs-hide') ){
						helpers.saveLeaf();
					}
					if( !$( '#templManager' ).hasClass('ui-tabs-hide') ){
						templateAction( 'save' );
					}
					if( !$( '#settingsManager' ).hasClass('ui-tabs-hide') ){
						saveSettingsAction();
					}
				}
			}catch(e){ alert(e); }
		} );

		try{
			window.setTimeout( function(){
				// http://stackoverflow.com/questions/6140632/how-to-handle-tab-in-textarea
				$( '.tabEditable' ).on( 'keydown', function( evt ){
					if( evt.keyCode === 9){
						// get caret position/selection
						var start = this.selectionStart, end = this.selectionEnd;
						var $this = $(this);
						// set textarea value to: text before caret + tab + text after caret
						$this.val( $this.val().substring(0, start)
									+ '\t'
									+ $this.val().substring(end) );
						// put caret at right position again
						this.selectionStart = this.selectionEnd = start + 1;
						// prevent the focus lose
						return false;
					}
				} );
			}, 3000 );
		}catch(e){ alert(e); }



		document.title = 'Configured...';

		/* ie */
		if( $.browser.msie ){
			$('input[type=checkbox], input[type=radio]').focus( function( evt ){
				evt.preventDefault();
				evt.stopPropagation();
				// $(evt.target).css( { outline : 'none' } );
				$(evt.target).blur();
				return false;
			} );
		}
		if( $.browser.msie && parseInt($.browser.version) < 9 ){
			alert( 'You need latest browser for working with this page.' );
		}else{
			$(document.body).fadeIn( 500 );
		}
		
		load_settings_path();

	}catch(e){ alert(e); }

}); } )();