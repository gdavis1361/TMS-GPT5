/**
 * Temp rig until the location selector is in here
 **/
function getContactTypeId() {
	return Ext.getCmp('contact_type_id').getValue();
}
function getContactTypeName() {
	return Ext.get('contact_type_id').down('input').getValue();
}


$(document).ready(function(){
	$('#formReset').click();
	
	$('input[name=name]').blur(function(){ 
		if (!this.value.length) {
			return;
		}
		var count = 0;
		var dialog = $('#nameSearchDialog');
		dialog.html('<center id="loading"><img src="/resources/ajax_icons/loading-green.gif"></center>');
		
		$.post('/at-ajax/contact_check.php', $(this).serialize(), function(d) {
			dialog.find('#loading').remove();
			var s = "Did You Mean: <div id='contact_check'>";
			$.each(d, function(i, v) {
				s += "<br/><b>" + v.contact_name + "</b> Owned By <b><i>" + v.owner_name + "</i></b>?";
				count++;
			});
			dialog.html(s + "</div>");
		
			if (count > 0) {
				dialog.dialog({ 
							modal: true,
							title: "Checking Contact",
							width: 500
							});
			}
		}, 'json');
	});
	
	$('#optional_toggle').click(function(){
		$('#optional_names').toggle();
	});
	
	$('#details_toggle').click(function() {
		$('#optional_details').toggle();
	});
	
	$('input[value=Cancel]').click(function(){
		$('#formReset').click();
		$('#customer_div').hide();
		$('#sic_search_results').html('').hide();
		$('input[title!=""]').hint();
	});
 
	$("input[name=is_customer]").click(function() {
		var val = $(this).attr('checked');
		if (val) {
			$('#customer_div').show();	
		}else{
			$('#customer_div').hide();
		}	
	});
	
	$('#newLocation').click(function() {
		var selected = $('select[name=contact_type_id] :selected');
		if (selected.val() != '') {
			$.post('/at-widgets/company_add.php', {
				"contact_type_id": selected.val(), 
				"contact_type_name": selected.html(),
				"name": $('#location_search').val(),
				"customer_status": $('select[name=contact_potential_id] :selected').html()
				}, function(s) { 
				$('#location_add').remove();
				$('#newLocDialog').html(s);
				$('#newLocDialog').dialog( { 
					modal: true,
					title: "New " + $('select[name=contact_type_id] :selected').html() + " Company",
					width: 'auto',
					height: 'auto',
					resizable: false,
					dialogClass: 'add_new_dialog',
					buttons: [{
							text: "Save",
							click: function() {
									//alert($('#location_add').length );
									//$('#location_add').click();
									add_location();
								}
							}]
				});
			});
		}else{ // Empty
			alert('First, set a Contact Type');
			$('select[name=contact_type_id]').change();
		}
	});
	
	//$('#newLocation').click( function() { $('#newLocLink').trigger('click'); } );

	/*********************BELOW*****************************/
	$('#location_search').live('keyup',function(e){
		// Up arrow
		if (e.keyCode == 38) {
			select_location_result( window.nSelectedLocation - 1 );
			return false;
		}
		// Down arrow
		if (e.keyCode == 40) {
			select_location_result( window.nSelectedLocation + 1 );
			return false;
		}
		// Enter
		if (e.keyCode == 13) {
			choose_location_result( window.nSelectedLocation );
			return false;
		}
		var nContactTypeId = getContactTypeId();
		if ( !nContactTypeId  || !$(this).val() ) return;
		
		if ( window.ActiveAjaxRequest ) {
			window.ActiveAjaxRequest.abort();
		}
		
		// AJAX URL 
		var SearchBox = $(this);
		SearchBox.css('background-image','url(/resources/ajax_icons/fb-blue.gif)');
//		var url = '/at-ajax/company_search.php?q='+SearchBox.val()+'&type='+nContactTypeId;
		var url = '/at-ajax/modules/contact/process/company-search';
		window.ActiveAjaxRequest = $.ajax({
			type:'post',
			url:url,
			data:{
				q:SearchBox.val(),
				type:nContactTypeId
			},
			dataType:'json',
			success: function(response) {
				var data = response.records;
				SearchBox.css('background-image','');
				$('#location_search_results').html('<div style="background:#ccc;border-bottom:1px solid #888;padding:4px;font-size:10px;font-weight:bold;margin-bottom:6px;">'+data.length+' results returned</div>');
				
				if (data.length > 0) {
					$.each( data, function(i,item){
						if ( item.name ) {
							$('#location_search_results').append('<a href="javascript:void(0);" class="location_search_result" rel="'+(item.customer_id?item.customer_id:(item.carrier_id?item.carrier_id:''))+'" contact_type="'+nContactTypeId+'" style="display:block;padding:3px 5px;text-decoration:none;color:#000padding:4px;border-bottom:1px solid #aaa;">'+
								item.name+'</a>');
						}
					});
				}

				$('#location_search_results').append('<a href="#" class="location_search_result" rel="" id="newLocation" style="display:block;padding:3px 5px;text-decoration:none;color:#000padding:4px;border-bottom:1px solid #aaa;">Add this company!</a>');

				select_location_result();
			}
		});
	});

	function select_location_result( nSelected ){
		if ( !nSelected || (nSelected && nSelected < 0) ) {
			nSelected = 0;
		}
		
		if ( nSelected && nSelected > ($('.location_search_result').size()-1) ) {
			nSelected = $('.location_search_result').size()-1;
		}
		
		$('.location_search_result').each( function(n){
			if ( nSelected == n ) {
				$(this).css('background','#fffebb');
			}
			else {
				$(this).css('background','#fff');
			}
		});
		window.nSelectedLocation = nSelected;
	}

	function choose_location_result( nSelected ){
		if ( !nSelected || (nSelected && nSelected < 0) ) {
			var nSelected = 0;
		}
		
		if ( nSelected && nSelected > $('.location_search_result').size() ) {
			nSelected = $('.location_search_result').size();
		}
		
		$('.location_search_result').each( function(n){
			if ( nSelected == n ) {
				$(this).click();
				$('#contact_comment').focus();
			}
		});
		window.nSelectedLocation = nSelected;
	}

	$('.location_search_result').live('click', function(){
		var company_id = $(this).attr('rel');
		var company_name = $(this).html();
		var contact_type = $(this).attr('contact_type');
		if ( company_id == '' ) {
			$('#newLocation').click();
			return false;
		}
		
		var url = '/at-widgets/company_locations.php?id='+company_id+'&contact_type='+contact_type;
		
		$.get(url, function(d){
			$('#locSearchStage').html(d);
			$('#locSearchStage').dialog({
				title: company_name,
				height: 'auto',
				width: 'auto',
				modal: true
			});
		});
	});

	$('#location_search_again').live('click', function(){
		$('#location_id').val( '' );
		$('#location_search_selected').hide();
		$('#location_search_stage').show();
		$('#location_search').focus();
		$('#location_search').select();
	});
	
	$('#location_change').live('click', function(){
		$('#locSearchStage').dialog("open");
	});
	/********************ABOVE******************************/

	function select_result( sSelectedClass, nSelected ){
		if ( !nSelected || (nSelected && nSelected < 0) ) {
			var nSelected = 0;
		}
		
		if ( nSelected && nSelected > ($(sSelectedClass).size()-1) ) {
			nSelected = $(sSelectedClass).size()-1;
		}
		
		$(sSelectedClass).each( function(n){
			if ( nSelected == n ) {
				$(this).parent().scrollTo($(this));
				$(this).css('background','#fffebb');
			}
			else {
				$(this).css('background','#fff');
			}
		});
		window.nSelected = nSelected;
	}
	
	function choose_result( sSelectedClass, nSelected ){
		if ( !nSelected || (nSelected && nSelected < 0) ) {
			var nSelected = 0;
		}
		
		if ( nSelected && nSelected > $(sSelectedClass).size() ) {
			nSelected = $(sSelectedClass).size();
		}
		
		$(sSelectedClass).each( function(n){
			if ( nSelected == n ) {
				$(this).click();
			}
		});
		window.nSelected = nSelected;
	}

	$('#search_sic').live('keyup',function(e){
		var quickName = $(this).attr('id'); 

		// Autocomplete styling
		if ( $('#'+quickName+'_results') ) {
			$('body').append('<div id="'+quickName+'_results" style="position:absolute;z-index:10000 !important;border: 1px solid #888;background:#fff;display:none;-moz-border-radius: 3px;border-radius: 3px;height:160px;overflow-x:hidden;"></div>');
		}
		
		switch( e.keyCode ) {
			case 38: // Up Arrow
				select_result( '.'+quickName+'_result', window.nSelected - 1 );
				return false;
			case 40: // Down Arrow
				select_result( '.'+quickName+'_result', window.nSelected + 1 );
				return false;
			case 13: // Enter
			case 9:  // Tab
				choose_result( '.'+quickName+'_result', window.nSelected );
				return false;
			case 27: // ESC
				$(this).val('');
				$('#'+quickName+'_results').hide();
				window.nSelected = 0;
				return false;
			case 36: // PgUp
			case 35: // PgDn
				return false;
			default: 
		}

		var approx_width = $(this).width();

		$('#'+quickName+'_results').css( 'min-width', approx_width );
		$('#'+quickName+'_results').css( 'width', approx_width );
		$('#'+quickName+'_results').css( 'top', $(this).offset().top + $(this).height() * 2 );
		$('#'+quickName+'_results').css( 'left', $(this).offset().left );

		if ( $(this).val().length == 0 ) {
			$('#'+quickName+'_results').hide();
			return false;
		} else if ( $(this).val().length < 2 ) {
			$('#'+quickName+'_results').html('Your search must be at least 2 characters');
			$('#'+quickName+'_results').show();
			return false;
		} 
		if ( window.ActiveAjaxRequest ) {
			window.ActiveAjaxRequest.abort();
		}

		var SearchBox = $(this);
		SearchBox.css('background-image','url(/resources/ajax_icons/fb-blue.gif)');
		
		// AJAX URL 
		window.ActiveAjaxRequest = $.getJSON('/at-ajax/ajax-siclookup.php?q=' + $(this).val(), function(data) {
			$('#'+quickName+'_results').html('');
			$('#'+quickName+'_results').show();
			SearchBox.css('background-image','');

			// AJAX RETURN
			$.each( data.RESULTS, function(i,item){
				if ( item.INDUSTRY_NAME ) {
					$('#'+quickName+'_results').append('' + 
					'<table class="'+quickName+'_result" rev="<table width=\'100%\'><tr><td width=\'55\'>'+item.CODE+'</td><td>'+item.INDUSTRY_NAME+'</td><td width=\'16\'><a href=\'javascript:void(0);\'><img src=\'/resources/silk_icons/delete.png\' width=\'16\' height=\'16\' /></a></td></tr></table>" rel="'+item.ID+'" cellpadding="0" cellspacing="0" width="100%" style="border-bottom:1px solid #aaa;font-size:11px;font-family:arial;"><tr>' +
					'<td width="75"><a href="javascript:void(0);" class="code_search_resul" style="display:block;text-decoration:none;color:#000;padding:4px;">'+item.CODE+'</a></td>' +
					'<td><a href="javascript:void(0);" class="code_search_resul" style="display:block;text-decoration:none;color:#000;padding:4px;">'+item.INDUSTRY_NAME+'</a></td>' +
					'</tr></table>');
				}
			});
			
			select_result('.'+quickName+'_result');
		});
	});

	function reset_search_sic() {
		$('#search_sic').val('');
		$('#search_sic_results').html('');
		$('#search_sic_results').hide();
	}

	$('.search_sic_result').live('click', function() {
		reset_search_sic();
		$('#search_sic_selected').append( '<div class="industry_listing">'+$(this).attr('rev')+'<input type="hidden" name="industry_id[]" value="'+$(this).attr('rel')+'" /></div>' );
	});

	// Remove an industry
	$('.industry_listing a').live('click',function(){
		$(this).parent().parent().parent().parent().parent().remove();
	});


	// Use JS to hide the template
	$('#contact_method_type_template').hide();
	
	// Adds New field row if one does not exist
	function addContactMethodField() {
		if ( !$('.contact_method_row_new').length ) {
			$('#contact_method_stage').append( $('#contact_method_type_template').html() );
			$('#contact_method_stage .contact_method_row_temp').addClass('contact_method_row_new');
			$('#contact_method_stage .contact_method_row_temp').removeClass('contact_method_row_temp');
		}
	}
	
	// Checks to see if there is new input in the field. If yes, then 
	$('.contact_method_row_new .contact_method_data').live('keyup', function(){
		if ( $(this).val().length > 0 ) { 
			$(this).parent().removeClass('contact_method_row_new');
			$(this).parent().addClass('contact_method_row_used');
			addContactMethodField();
		}
	});

	// If a used box is emptied and the user blurs, kill it.
	$('.contact_method_row_used .contact_method_data').live('blur', function(){
		if ( $(this).val().length == 0 ) {
			$(this).parent().remove();
			addContactMethodField();
		}
	});

	addContactMethodField();

	//Press Enter in INPUT moves cursor to next INPUT

	$('#content_form input, #content_form select').keypress(function(e){
		if ( e.which == 13 ) {
			return false;
			//$(this).next().focus();  //Use whatever selector necessary to focus the 'next' input
		}
	});
});