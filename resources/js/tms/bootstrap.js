var TMSPath = '/resources/js/tms/src';
var ExtPath = '/resources/js/extjs/src';
if (Ext.Loader.config.enabled) {
	Ext.Loader.setPath('Ext', ExtPath);
	Ext.Loader.setPath('TMS', TMSPath);
}
else {
	Ext.Loader.setConfig({
		enabled: true,
		paths:{
			TMS: TMSPath,
			Ext: ExtPath
		}
	});
}

//Check for a console, if one doesnt exist make one
if(window.console == null){
	window.console = {
		log: function(s){
			//alert(s);
		},
		warn: function(){},
		info: function(){}
	};
}

//WHy?
Ext.define('TMS.comment.Types', {
	singleton: true,
    Contact: 'contact',
    Customer: 'customer',
    Carrier: 'carrier',
	Order: 'order'
});