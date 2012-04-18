(function( jQuery, undefined ){
jQuery.fn.extend( {
	  warp : function( obj, prop, setcallback, interval ){
		try{
			var val = obj[prop];
			if( !obj ){ obj = window; }
			if(Object.defineProperty){
				Object.defineProperty( obj, prop, {
					  get : function () { try{ return obj[prop]; }catch(e){ return; } }
					, set : function ( value ) {
						try{
							val = value;
							if(setcallback){
								if(interval) { window.setTimeout( function(){
									setcallback( value, prop, obj );
								}, interval); }else{ setcallback( value, prop, obj ); }
							}
							return val;
						}catch(e){ return; }
					}
				});
			}else{
				if(!interval){ interval = 1000; }
				var intvl = window.setInterval( function(){
					if(obj[prop] !== undefined){
						if( val != obj[prop] ){
							val = obj[ prop ];
							if( setcallback ){ setcallback( val, prop, obj ); } 
						}
					}else{ window.clearInterval( intvl ); }
				}, interval);
			}
		}catch(e){ return; }

	}
	, observe : function( value , setcallback ){
		return function( val ){
			try{
				if( val !== undefined ){
					if( val != value ){
						value = val;
						if( setcallback ){ setcallback( value ); }
					}
				}else{ return value; }
			}catch(er){ alert(er); }
		};
	}
} );
})( jQuery );