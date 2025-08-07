Ext.define('TMS.league.model.Week', {
    extend: 'Ext.data.Model',
	idProperty: 'week_id',
	
	//Requires
	requires:[
		'TMS.league.model.Game'
	],
	
	//Fields
    fields: [{
		name: 'week_id',
		type: 'int'
	},{
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
		startParam: undefined,
		limitParam: undefined,
		api: {
			read: '/at-ajax/modules/league/week/read',
			create: '/at-ajax/modules/league/week/create',
			update: '/at-ajax/modules/league/week/update',
			destroy: '/at-ajax/modules/league/week/destroy'
		},
		reader: {
			idProperty: 'week_id',
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
	hasMany: [{
		model: 'TMS.league.model.Game',
		name: 'games',
		primaryKey: 'week_id',
		associationKey: 'week_id',
		foreignKey: 'week_id'
	}],
	belongsTo: 'TMS.league.model.Season',
	
	//Functions
	isActive: function(){
		var today = new Date();
		var startDate = new Date(this.get('start_date'));
		var endDate = new Date(this.get('end_date'));
		
		if(today >= startDate && today <= endDate){
			return true;
		}
		else{
			return false;
		}
	}
});