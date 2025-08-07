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