//Always required
Ext.require([
	'TMS.Application'
]);


//Run on load
//Ext.EventManager.on(window, 'load', function() {
//	Ext.create('TMS.task.TaskManager');
//});

//Setup the cookie provider
Ext.onReady(function(){
	// setup the state provider, all state information will be saved to a cookie
    Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));
});


function isNumber(n){
	return !isNaN(parseFloat(n)) && isFinite(n);
}
function blank(v){
	return (v.length < 1);
}

function round(num, dec){
	return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
}

// add functionality to ext components
Ext.onReady(function() {
	Ext.panel.Panel.prototype.scrollIntoView = function() {
		Ext.getBody().scrollTo('top', this.getEl().getY(), {
			duration:300
		});
	}
});