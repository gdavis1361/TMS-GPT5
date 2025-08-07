Ext.define('TMS.preorders.forms.sections.CustomerInformation', {
	extend:'TMS.orders.forms.sections.CustomerInformation',
	
	loadByKey:'pre_order_id',
	pre_order_id:0,
	
	processingPage:'/at-ajax/modules/preorder/process/'
	
});