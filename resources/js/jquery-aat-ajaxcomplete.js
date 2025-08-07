/**
 * Apply the .autocomplete class to any input field you want autocompleted
 * <input class="autocomplete" ajax="ajax-page.php" callback="callbackfunction" />
 *
**/
var ajax_mouse_is_inside = false;
var ajax_focus_input = false;
var ajax_input_index = 0;
var ajax_focus_index = 0;
var ajax_results = [];


//Create a timeout so we are not constantly cancelling the request
var ajaxBuffer = 500;
var ajaxTimeout = null;

$(document).ready(function() {
    $('body').append('<div id="ajax_results" style="position:absolute;z-index:10000 !important;background:#fff;display:none;min-height:15px;max-height:160px;overflow-x:hidden;"></div>');

    $('#ajax_results,#ajax_results li').live('mouseenter mouseleave', function(event) {
    	
        if (event.type == 'mouseenter') {
            ajax_mouse_is_inside = true;
        } else {
            ajax_mouse_is_inside = false;
        }
    });

    $('html').mousedown(function(){
        if( !ajax_mouse_is_inside ) $('#ajax_results').hide();
    });
});

$('.ajaxcomplete').live('click',function(e){
    if ( document.getElementById('ajax_results') && $('#ajax_results').html().length > 0 && $('#ajax_results').css('display') == 'none' ) {
    	if ( ajax_is_same_input( $(this) ) ) {
        	$('#ajax_results').show();
        } else {
        	ajax_perform_search( $(this) );
        }
    } 
    else {
    	ajax_perform_search( $(this) );
    }
    
});

$('#ajax_results ul li').live('hover',function(){
    window.nSelected = $(this).attr('indexid');
    ajax_focus_result( '#ajax_results ul li', window.nSelected, false );
});


$('#ajax_results ul li').live('click',function(){
    ajax_choose_result( ajax_focus_input, window.nSelected );
});

$('.ajaxcomplete').live('keyup',function(e){
	ajax_perform_search( $(this), e );
});
$('.ajaxcomplete').live('keydown',function(e){
	if ( ajax_is_same_input( $(this) ) ) {
		switch( e.keyCode ) {
			case 13: // Enter
				e.preventDefault();
			case 9:  // Tab
				ajax_choose_result( $(this), window.nSelected );
		}
	}
});

function ajax_is_same_input( obj ) {
	if ( ajax_focus_index == obj.attr('ajax-index') ) {
		return true;
    } else {
    	return false;
    }
}

function show_results(  ) {
	
}

function ajax_perform_search( obj, e ) {
	var SearchBox = obj;
    var ResultBox = $('#ajax_results');
    ajax_focus_input = SearchBox;
    
    if ( !SearchBox.attr('ajax-index') ) {
    	SearchBox.attr( 'ajax-index', ajax_input_index );
    	ajax_focus_index = ajax_input_index;
    	ajax_input_index++;
    } else if ( SearchBox.attr('ajax-index') != ajax_focus_index ) {
    	ajax_focus_index = SearchBox.attr('ajax-index');
    	ResultBox.hide().html('');
    }
    
    if ( e ) {
		switch( e.keyCode ) {
			case 38: // Up Arrow
	            e.preventDefault();
	            if ( ResultBox.css('display') != 'none' ) {
	                ajax_focus_result( '#ajax_results ul li', window.nSelected - 1, true );
	            }
				return false;
			case 40: // Down Arrow
	            e.preventDefault();
	            if ( ResultBox.css('display') != 'none' ) {
	                ajax_focus_result( '#ajax_results ul li', window.nSelected + 1, true );
	            }
				return false;
			case 13: // Enter
			case 9:  // Tab
				//e.preventDefault();
				//ajax_choose_result( ajax_focus_input, window.nSelected );
				return false;
			case 27: // ESC
				SearchBox.val('');
				ResultBox.hide();
				window.nSelected = 0;
				return false;
			case 17: // Ctrl
			case 36: // PgUp
			case 35: // PgDn
			case 32: // Space
			case 16: // Shift
			case 20: // Caps Lock
			case 18: // Alt
			case 91: // Windows Key
				return false;
			default:
		}
    }
    
	var approx_width   = SearchBox.width();
    var padding_top    = Number(SearchBox.css('padding-top').replace(/px/, ''));
    var padding_right  = Number(SearchBox.css('padding-right').replace(/px/, ''));
    var padding_bottom = Number(SearchBox.css('padding-bottom').replace(/px/, ''));
    var padding_left   = Number(SearchBox.css('padding-left').replace(/px/, ''));

    var box_width   = approx_width + padding_right + padding_left;
    var offset_top  = SearchBox.offset().top + SearchBox.height() + padding_top + padding_bottom + 5;
    var offset_left = SearchBox.offset().left;

    ResultBox.css( 'min-width', approx_width );
	ResultBox.css( 'width', box_width + 'px' );
	ResultBox.css( 'top', offset_top + 'px' );
	ResultBox.css( 'left', offset_left + 'px' );

	if ( SearchBox.val().length == 0 ) {
		ResultBox.hide();
        SearchBox.css('background-image','');
        return false;
	}
    else if ( SearchBox.val().length < 2 ) {
    	ResultBox.html('<div style="text-align:center;background:#fdfdfd;font-size:11px;padding:5px;"> Must enter 2 or more characters</div>').show();
		SearchBox.css('background-image','');
    	return false;
	}

	// AJAX URL
	if ( !SearchBox.attr('ajax') ) {
		alert('No `AJAX` attribute (ajax url) provided for autocomplete');
		return false;
	}

	if ( window.ActiveAjaxRequest ) {
		window.ActiveAjaxRequest.abort();
	}
    SearchBox.css('background-image','url(/resources/ajax_icons/fb-blue.gif)');
    SearchBox.css('background-position','97% 50%');
    SearchBox.css('background-repeat','no-repeat');
    
    var sAjaxUrl = SearchBox.attr('ajax');
    var sAjaxUrlParams = '';
    if ( sAjaxUrl.indexOf('?') > 0 ) {
    	var aAjaxUrl    = sAjaxUrl.split('?');
    	sAjaxUrl        = aAjaxUrl[0];
    	sAjaxUrlParams  = aAjaxUrl[1];
    	sAjaxUrlParams += '&' 
    }
    
    if(ajaxTimeout != null){
    	clearTimeout(ajaxTimeout);
    	ajaxTimeout = null;
    }

    ajaxTimeout = setTimeout(function(){
		$.getJSON( sAjaxUrl+'?'+sAjaxUrlParams+'method=ajax&q=' + SearchBox.val(), function(data) {
		    ResultBox.html('<ul></ul>').show();
			SearchBox.css('background-image','');
			
			// AJAX RETURN
			var n = 0;
			$.each( data.RESULTS, function( i, item ){
				if ( item.HTML ) {
					if ( !ajax_results[ajax_focus_index] ) {
						ajax_results[ajax_focus_index] = [];
					}
		            ajax_results[ajax_focus_index][i] = item;
					ResultBox.find('ul').append( '<li class="ajax_result" indexid="'+i+'">'+item.HTML+'</li>' );
					n++;
				}
			});
			
			if ( n > 0 ) {
				ajax_focus_result( ResultBox.find('ul li'), 0, true );
			} else {
				ResultBox.html('<div style="text-align:center;background:#fdfdfd;font-size:11px;padding:5px;">No Results Found :( </div>');
			}
		});
    }, ajaxBuffer);
}

function ajax_focus_result( sSelectedClass, nSelectedIndex, vScrollTo ){

    if ( !nSelectedIndex || (nSelectedIndex && nSelectedIndex < 0) ) {
        var nSelectedIndex = 0;
    }

    if ( nSelectedIndex && nSelectedIndex > ($(sSelectedClass).size()-1) ) {
        nSelectedIndex = $(sSelectedClass).size()-1;
    }

    $(sSelectedClass).each( function(n){
        if ( nSelectedIndex == n ) {
            if( vScrollTo ) {
                $(this).parent().parent().scrollTo( $(this) );
            }
            $(this).css('background','#fffebb');
        }
        else {
            $(this).css('background','#fff');
        }
    });
    window.nSelected = nSelectedIndex;
}

function ajax_choose_result( oFocusTextbox, nChosenIndex ){
    // Set the Data Object
    if ( ajax_results[ajax_focus_index] && ajax_results[ajax_focus_index][nChosenIndex] ) {
        oDataObject = ajax_results[ajax_focus_index][nChosenIndex];
        
        // Auto Complete
        if ( oDataObject.COMPLETE ) {
        	oFocusTextbox.val( oDataObject.COMPLETE );
        }else if ( oDataObject.HTML ) {
        	oFocusTextbox.val( oDataObject.HTML );
        }

        $('#ajax_results').html('').hide();

        // Send to Callback
        if ( oFocusTextbox && oFocusTextbox.attr('callback') ) {
            var sFunctionName = oFocusTextbox.attr('callback');
            window[sFunctionName]( oDataObject );
        }
        
        ajax_results[ajax_focus_index] = [];
        
        oFocusTextbox.focus();
        
        return true;
    }
    
    return false;
}