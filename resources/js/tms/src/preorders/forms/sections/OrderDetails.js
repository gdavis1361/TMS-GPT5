Ext.define('TMS.preorders.forms.sections.OrderDetails', {
	extend:'TMS.orders.forms.sections.OrderDetails',
	
	loadByKey:'pre_order_id',
	pre_order_id:0,
	
	processingPage:'/at-ajax/modules/preorder/process/'
	
});