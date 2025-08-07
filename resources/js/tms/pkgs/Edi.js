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
Ext.define('TMS.edi.model.Log', {
    extend: 'Ext.data.Model',
	idProperty: 'id',
	
	//Fields
    fields: [{
		name: 'id',
		type: 'int'
	},{
		name: 'type',
		type: 'int'
	},{
		name: 'pre_order_id',
		type: 'int'
	},{
		name: 'customer_id',
		type: 'int'
	},{
		name: 'broker_id',
		type: 'int'
	},{
		name: 'status',
		type: 'int'
	},{
		name: 'responded_at',
		type: 'date'
	},{
		name: 'comments',
		type: 'string'
	},{
		name: 'created_at',
		type: 'date'
	},{
		name: 'content',
		type: 'string'
	},{
		name: 'description',
		type: 'string'
	}],
	
	//Proxy
	proxy: {
		type: 'ajax',
		api: {
			read: '/at-ajax/modules/edi/log/read',
			create: '/at-ajax/modules/edi/log/create',
			update: '/at-ajax/modules/edi/log/update',
			destroy: '/at-ajax/modules/edi/log/destroy'
		},
		reader: {
			idProperty: 'id',
			type: 'json',
			root: 'records',
			totalProperty: 'total'
		},
		writer: {
			type: 'json',
			allowSingle: false,
			writeAllFields: false,
			root: 'records',
			encode: true
		}
	}
});
