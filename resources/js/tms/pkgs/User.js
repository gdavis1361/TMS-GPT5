Ext.define('TMS.user.lookup.User', {
	extend: 'Ext.ux.form.field.RealComboBox',
	
	//Config
	processingPage: '/at-ajax/modules/user/lookup/',
	
	displayField: 'name',
	valueField: 'user_id',
	emptyText: 'Search users by name...',
	typeAhead: false,
	hideTrigger:true,
	anchor: '100%',
	pageSize: 10,
	minChars: 0,
	listConfig: {
		loadingText: 'Searching...',
		emptyText: 'No users found.'
	},
	store:false,
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initStore();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'user_id',
				'name'
			],
			remoteSort: true,
			pageSize: 10,
			proxy: {
				type: 'ajax',
				url : this.processingPage + 'get-user-list',
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
	}
});
            
Ext.define('TMS.user.model.Branches', {
    extend: 'Ext.data.Model',
	idProperty: 'branch_id',
	
	//Fields
    fields: [{
		name: 'branch_id',
		type: 'int'
	},{
		name: 'branch_name',
		type: 'string'
	}],

	//Proxy
	proxy: {
		type: 'ajax',
		api: {
			read: '/at-ajax/modules/user/branches/read',
			create: '/at-ajax/modules/user/branches/create',
			update: '/at-ajax/modules/user/branches/update',
			destroy: '/at-ajax/modules/user/branches/destroy'
		},
		reader: {
			idProperty: 'branch_id',
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
