( function( undefined ) { $(function() {
	var e;
	try{

		$( '#tabsContent' ).tabs();
		
		// for saving changes: copy/paste;
		var _emptyleaf = function(){
			return {
				  header : { title : '' , keywords : '' , description : '' 
				  , pageIsCode : false, additional : '' , template : 'default' }
				, content : '' , info : '' }; };
		var emptyleaf = _emptyleaf();
		var buffer = _emptyleaf();

		$('#treePages').treeControl( {
			  saveState : true
			, root		: 'top'
			, handlers	: {
				  select	: function( leaf ){
					var tree = $('#treePages').prop( 'tree' );
					var path = tree.getPath( leaf );
					helpers.clearValues();
					helpers.growl( 'Requesting Leaf Content...' );
					tree.shLoader( path.leaf, true );
					tree.ws( { leaf : path.str , action : 'content_get' } , function( data ) {
						helpers.response( data , path.leaf );
						tree.shLoader( path.leaf, false );
						helpers.growl( 'Leaf Loaded...' , 800 );
					} );
				}
				, blur		: function( currentLeaf , result ){
					if( helpers.checkValues( currentLeaf.obj.page ) ){
						helpers.clearValues();
						result();
					}else{
						helpers.confirm( 'What happens?', 'You have unsaved changes.\nDo You whant to save?'
						, function() {
							var tree = $('#treePages').prop( 'tree' );
							tree.x.current = currentLeaf;
							$( currentLeaf.elem.heading ).addClass( tree.x.classes.selected );
						}
						, function() {
							helpers.clearValues();
							result();
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
							, url: './tree_pages.php'
							, success: function( data ){ if( data !== ''){ cb( data ); } }
							, error: function(data){ alert(data); }
						} ) ;
					}
				}catch(e){ alert(e); }
			}
			, init		: [ 1000 ,  function( treeControl ){ }  ]  // here is ability to set 'delay' and 'calback' to init
		} ); //.hide().fadeIn( 1000 );


		( function(){
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
		} )();


		$( '#treePagesEditor-info' ).on( 'click change' , function(){
			var snippetjson = {};
			var val = $(this).val();
			if (val) {
				try { snippetjson = $.parseJSON( val ); }
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

		
		// var controlCodeType = function(){
			// if( $('#treePagesEditor-pageIsCode').attr('checked') ){
				// $('#pages-editor-wrapper').hide();
				// $('#pages-editor-codearea').show();
			// }else{
				// $('#pages-editor-wrapper').show();
				// $('#pages-editor-codearea').hide();
			// }
		// }
		// controlCodeType();
		
		// $('#treePagesEditor-pageIsCode').on( 'click', controlCodeType );
		
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
						var obj = $.parseJSON( data );
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
				
				// controlCodeType();
				// $('#pages-editor-codearea').val( '' );
				
				$( '#pages-editor' ).val( '' );
				
				// $( '#pages-editor' ).elrte('val', '   ' )
				// $( '#pages-editor' ).elrte('updateSource');
				
				
				$("#treePagesEditor-template").trigger("liszt:updated");
			}
			, getValues : function(){
				var obj = {
					  header 	: {}
					, content	: $( '#pages-editor' ).val()
					// , content	: $( '#pages-editor' ).elrte('val')
					, info		: $( '#treePagesEditor-info' ).val()
				};
				for( var i in emptyleaf.header ){
					 obj.header[i] = $( '#treePagesEditor-' + i ).val();
				}
				
				
				var chkd = ( $('#treePagesEditor-pageIsCode').attr('checked') == 'checked' ) ? true : false;
				// if(chkd){
					// obj.content = $('#pages-editor-codearea').val( );
				// }else{
					// obj.content = $( '#pages-editor' ).elrte('val');
				// }
				
				
				obj.header.pageIsCode = chkd;
				
				return obj;
			}
			, setValues : function( obj ){
				try{
					helpers.clearValues();
					if( obj.header !== undefined ){
						for( var i in obj.header ){
							if( obj.header[i] !== undefined ){ $( '#treePagesEditor-' + i ).val( obj.header[i] ); }
						}
					}
					if( obj.info !== undefined ){
						$( '#treePagesEditor-info' ).val( obj.info );
						window.setTimeout( function(){ // forcing jsoneditor
							$('#treePagesEditor-info').click();
						}, 300 );				
					}
					
					$('#treePagesEditor-pageIsCode').attr( 'checked', obj.header.pageIsCode );
					// if(obj.header.pageIsCode){
						// $('#treePagesEditor-pageIsCode').attr('checked', true);
						// $('#pages-editor-codearea').val( obj.content );
					// }else{
						// if( obj.content !== undefined ){ $( '#pages-editor' ).elrte('val', '  '+obj.content ); }
						// else{ $( '#pages-editor' ).elrte('val', '   ' ); }
						// $( '#pages-editor' ).elrte('updateSource');
					// }
					
					$( '#pages-editor' ).val( obj.content );
					// controlCodeType();
					$("#treePagesEditor-template").trigger("liszt:updated");
					
				}catch(e){ alert(e); }
			}
			, checkValues : function( compare ){
				var compare = compare || emptyleaf;
				var compare = JSON.stringify( compare );
				var values = JSON.stringify( helpers.getValues() );
				if( compare ==  values ) {
					return true; 
				}else{
					return false;
				}
				// if( $( '#treePagesEditor-title' ).val() != compare.header.title )  return false;
				// if( $( '#treePagesEditor-keywords' ).val() != compare.header.keywords )  return false;
				// if( $( '#treePagesEditor-description' ).val() != compare.header.description )  return false;
				// return true;
				// if( _.isEqual( compare, values ) ){ return false; }else{ return true; }
			}
			, saveLeaf : function(){
				try{
					var tree = $('#treePages').prop( 'tree' );
					var path = tree.currentPath();
					if( path.arr.length > 1 ){
						helpers.growl( 'Saving Leaf Started...', 1000 );
						tree.shLoader( path.leaf, true );
						// var enc = function(str){ return encodeURIComponent(str); }
						var data = helpers.getValues();
						var obj = { leaf : path.str , action : 'content_set' , data : JSON.stringify( data ) };
						tree.ws( obj , function( data ){
							helpers.clearValues();
							helpers.response( data , path.leaf );
							tree.shLoader( path.leaf, false );
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

		$(window).on( 'keydown' , function(evt) {
			try{
				if (evt.ctrlKey && evt.keyCode == 83) {
					evt.stopPropagation();
					evt.preventDefault();
					if( !$( '#pagesManager' ).hasClass('ui-tabs-hide') ){
						helpers.saveLeaf();
					}
					if( !$( '#templManager' ).hasClass('ui-tabs-hide') ){
						templateAction( 'save' );
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

		$( '#treePagesEditor-template' ).chosen();

		// templates
		
		$('#templ-snippet-editor').on( 'click change', function(){
			var snippetjson = {};
			var val = $(this).val();
			if (val) {
				try { snippetjson = $.parseJSON( val ); }
				catch (e) { alert('Error in parsing json. ' + e); }
			} else { snippetjson = {}; }
			
			$('#snippeteditor').jsonEditor( snippetjson, { change: function() {
				try{
					$('#templ-snippet-editor').val( js_beautify ( JSON.stringify( snippetjson ) , {
						  indent_size : 1
						, indent_char : '\t'
					} ) );
				}catch(e){ alert(e); }
			} } ); //.addClass('expanded');
		} ).on('dblclick', function(){
			if( $('#settings-trees-expand').attr('checked') ){
				$('#snippeteditor').toggleClass('expanded'); 
			} } );
		
		var currentTemplate = 'default' || $( '#templManager-template' ).val();
		var configTemplateButtons = function(){
			currentTemplate = $( '#templManager-template' ).val();
			$( '#del_template' ).removeClass('disabled');
			if( currentTemplate == 'default' ){ $( '#del_template').addClass('disabled'); }
		}
		var templateAction = function( action , tplname ){ // get add dell save
			var callback = '';
			var obj = { action : action , template : tplname || currentTemplate }
			helpers.growl( 'Template action ' + action + ' initialised...' );
			if( action == 'get' ){
				callback = function( data ){
					var obj = $.parseJSON( data );
					$('#templ-source-editor').val( obj.source );
					$('#templ-snippet-editor').val( obj.snippet );
					helpers.growl( 'Template was Successfully Received.' , 1000 );
					window.setTimeout( function(){ // forcing jsoneditor
						$('#templ-snippet-editor').click();
					}, 300 );
				}
			}

			if( action == 'save' ){
				$.extend( obj , { source : $('#templ-source-editor').val() , snippet : $('#templ-snippet-editor').val() } );
				callback = function( data ){
					if( data == 'success' ){
						helpers.growl( 'Template was Successfully Saved.' );
						templateAction( 'get' );
					}else{ alert(data); }
				};
			}
			if(  action == 'add' ){
				$.extend( obj , { source : $('#templ-source-editor').val() , snippet : $('#templ-snippet-editor').val() } );
				callback = function( data ){
					if( data == 'success' ){
						helpers.growl( 'Template was Successfully Added.' );
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
				, url: './template_action.php'
				, success: function( data ){ if( data !== '' ){ callback && callback ( data ); } }
				, error: function(data){ alert(data); }
			} ) ;

		}

		$( '#templManager-template' ).chosen().change( function(){
			configTemplateButtons();
			templateAction( 'get' );
		} );
		$( '#add_template' ).click( function(){
			configTemplateButtons();
		} );
		$( '#del_template' ).click( function(){ configTemplateButtons(); if( currentTemplate !== 'default' ){ templateAction( 'del' ); } } );
		$( '#add_template' ).click( function(){
			configTemplateButtons();
			var val = prompt('Plase Fill Name!');
			if(val){
				templateAction( 'add' , val );

				$( '#tree-dialog-leaf-add-form-template option[value="'+currentTemplate+'"]' ).removeAttr('selected');
				$( '#tree-dialog-leaf-add-form-template' ).append('<option value = "'+val+'">'+val);
				$( '#tree-dialog-leaf-add-form-template' ).trigger("liszt:updated");

				$( '#treePagesEditor-template option[value="'+currentTemplate+'"]' ).removeAttr('selected');
				$( '#treePagesEditor-template' ).append('<option value = "'+val+'">'+val);
				$( '#treePagesEditor-template' ).trigger("liszt:updated");

				$( '#templManager-template option[value="'+currentTemplate+'"]' ).removeAttr('selected');
				$( '#templManager-template' ).append('<option value = "'+val+'" selected = "selected">'+val);
				$( '#templManager-template' ).trigger("liszt:updated");

				configTemplateButtons();

			}
		} );
		$( '#save_template' ).click( function(){
			configTemplateButtons(); templateAction( 'save' ); 
		} );

		$('#templ-units-elfinder').elfinder({
			  url: './elfinder-1.2/connectors/php/connector_units.php'  // connector URL (REQUIRED)
			, lang: 'ru'
			, height: '445px'
			, disableShortcuts: true
		}).elfinder('instance');

		configTemplateButtons();
		templateAction( 'get' );
		
		// templates


		$('#elfinder').elfinder({
			  url: './elfinder-1.2/connectors/php/connector.php'  // connector URL (REQUIRED)
			, lang: 'ru'
			, height: '530px'
			, disableShortcuts: true
		}).elfinder('instance');

		
		
		$('#full_server_elfinder').elfinder({
			  url: './elfinder-1.2/connectors/php/connector_server.php'  // connector URL (REQUIRED)
			, lang: 'ru'
			, height: '455px'
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
		
		
		

		window.setTimeout( function() {
			var obj = $('#pages-editor-tab iframe')[0];
		}, 1000 );

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
			, width: 420
			, height:270
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
							if( path.arr.length > 1 ){
								var chk = $( '#tree-dialog-leaf-add-form-checkbox' ).attr('checked') == 'checked';
								path = tree.currentPath( chk );
								// alert( path.str );
								path.leaf.obj.folder = true;
								path.leaf.obj.open = true;
							}else{
								if( !helpers.checkValues( emptyleaf ) ){ var leafData = helpers.getValues(); }
								path = path;
							}
							leafData.header.template = $( '#tree-dialog-leaf-add-form-template' ).val();


							tree.ws( { leaf : path.str , action : 'set' , path : text , data : JSON.stringify( leafData ) }
							, function( data ){
							if( data !== '' ){
								var obj = $.parseJSON( data );
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

							} );


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


	}catch(e){ alert(e); }

}); } )();