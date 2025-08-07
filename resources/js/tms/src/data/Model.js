Ext.define('TMS.data.Model', {
    extend: 'Ext.data.Model',
	
	//Config
	idProperty: '',
	url: '',
	
	onClassExtended: function(cls, data) {
		this.init()
		return this.callParent(arguments);
	},
	
	init: function(){
		this.initProxy();
	},
	
	initProxy: function(){
		this.proxy = {
			type: 'ajax',
			api: {
				read: '/at-ajax/modules/league/season/read',
				create: '/at-ajax/modules/league/season/create',
				update: '/at-ajax/modules/league/season/update',
				destroy: '/at-ajax/modules/league/season/destroy'
			},
			reader: {
				idProperty: 'season_id',
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
		};
	}
});