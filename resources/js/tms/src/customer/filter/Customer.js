Ext.define('TMS.customer.filter.Customer', {
	extend: 'TMS.filter.Abstract',
	
	init: function(){
		this.initName();
	},
	
	initName: function(){
		this.items.push({
			name: 'name',
			fieldLabel: 'Name'
		});
	}
});