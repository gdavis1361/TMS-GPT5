function calculate_accessorials() {
	var fuel = parseFloat($('input[name=fuel_charge]').val());
	var linehaul = parseFloat($('input[name=linehaul_charge]').val());
	//var accessorial = parseFloat($('input[name=accessorial_charge]').val());
	var total = 0;
	$('.accessorial_chg_amt').each(function(index, value){
		var charge = parseFloat( $(this).val() );
		if ( isNaN(charge)  ) return;
		var count = parseFloat( $(this).parent().find('.accessorial_chg_cnt').val() );
		if ( isNaN(count) ) return;
		total += charge * count;
	});
	$('input[name=accessorial_charge]').val(total);
	if (isNaN(fuel)) fuel = 0;
	if (isNaN(linehaul)) linehaul = 0;
	if (isNaN(total)) total = 0;
	$('#total_charge').html(fuel + linehaul + total);

	$('#accessorial_cost').keyup();
	
	if(window.total_profits != null){
		total_profits();
	}
}

$.fn.outerHTML = function() {
	return $("<div>").html(this.eq(0).clone()).html();
};

/*
Cufon.replace('.Delicious', { fontFamily: 'Delicious',hover: true });
Cufon.replace('h1, h2, h3, h4');
Cufon.replace('.Calibri', { fontFamily: 'Calibri',hover: true });
Cufon.replace('.Corbel', { fontFamily: 'Corbel',hover: true });
*/

$(document).ready(function(){
	$('textarea').elastic(); // Vertically Flexible Textareas
	$('input[title!=""]').hint(); // Input tips

});

function print_object( oObj, nIndent ){
	var sOutput  = '';
	var sIndent = '';
	if ( !nIndent ) nIndent = 0;
	for ( x = 0; x < nIndent; x++ )
		sIndent += '';

	for (property in object) {
		sOutput += sIndent + property + ': ';
		if( typeof(o) != 'object' || typeof(o) != 'array' )
			sOutput += object[property];
		sOutput += '\n';
	} 
	return sOutput;
}

function pre(object,indent) {
	var output = '';
	if (!indent){indent = 0;}
	var indenttext='';
	for ( ix=0; ix<indent; ix++ ){ indenttext += "    "; }
	if ( object != '[object Object]' )
		output = indenttext + object;
	else{
		for (var property in object) {
			var thistext = object[property];
			if ( thistext == '[object Object]' )
				thistext = '\n' + pre(object[property],indent+1) + '';
			else
				thistext += '\n';
			if ( !thistext ) { thistext = ''; }
			output += indenttext + property + ': ' + thistext;
			thistext = null;
		}
	}
	if ( indent == 0 )
		alert(output);
	else
		return output;
}