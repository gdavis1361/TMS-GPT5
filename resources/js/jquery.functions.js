function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
function blank(v){
	return (v.length < 1);
}
function round(num, dec) {
	return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
}
function validate_email(emailToTest){
	var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
	if(reg.test(emailToTest) === false ){
		return false;
	}
	return true;
}
function validate_phone_number(numberToTest){
	// validates international and domestic phone numbers with Ext
	var reg = /^([\+][0-9]{1,3}([ \.\-])?)?(([\(]{1})?[0-9]{3}[\)])?([0-9A-Z \.\-]{1,32})((x|ext|extension)?( )?[0-9]{1,4}?)$/;
	if(reg.test(numberToTest) === false ){
		return false;
	}
	return true;
}