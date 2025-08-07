Ext.define('TMS.league.model.Season', {
    extend: 'Ext.data.Model',
	idProperty: 'season_id',
	
	//Requires
	requires:[
		'TMS.league.model.Week'
	],
	
	//Fields
    fields: [{
		name: 'season_id',
		type: 'int'
	},{
		name: 'title',
		type: 'string'
	},{
		name: 'start_date',
		type: 'date'
		
	},{
		name: 'end_date',
		type: 'date'
	}],
	
	//Proxy
	proxy: {
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
	},

	//Relations
	hasMany: {
		model: 'TMS.league.model.Week',
		name: 'weeks',
		primaryKey: 'season_id',
		associationKey: 'season_id',
		foreignKey: 'season_id'
	}
});