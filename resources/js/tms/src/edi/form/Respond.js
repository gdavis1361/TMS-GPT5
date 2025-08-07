Ext.define('TMS.edi.form.Respond', {
	extend:'TMS.form.Abstract',
	
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.edi.model.Log'
	],
	
	//Config
	url: '/at-ajax/modules/contact/process/',
	
	initComponent: function(){
		this.items = [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		
		this.callParent(arguments);
	},
	
	init: function() {
		this.initContentField();
		TMS.edi.model.Log.load(3, {
			scope: this,
			success: function(record, response){
				this.loadRecord(record);
			}
		});
	},
	
	initContentField: function(){
		console.log(this.items);
		this.content = new Ext.form.field.TextArea({
			name: 'content'
		});
		this.items.push(this.content);
	}
});