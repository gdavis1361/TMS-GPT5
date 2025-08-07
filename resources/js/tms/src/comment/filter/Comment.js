Ext.define('TMS.comment.filter.Comment', {
	extend: 'TMS.filter.Abstract',
	
	init: function(){
		this.initShowAll();
	},
	
	initShowAll: function() {
		this.items.push({
			xtype:'checkbox',
			fieldLabel:'Show All Customer Contacts',
			labelWidth:200,
			name:'showAll'
		});
	}
	
});