Ext.define('TMS.preorders.forms.sections.Charge', {
	extend:'TMS.orders.forms.sections.Charge',
	
	processingPage:'/at-ajax/modules/preorder/process/',
	loadByKey:'pre_order_id',
	pre_order_id:0
	
});