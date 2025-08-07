Ext.define('TMS.league.model.Game', {
    extend: 'Ext.data.Model',
	idProperty: 'game_id',
	
	//Fields
    fields: [{
		name: 'game_id',
		type: 'int'
	},{
		name: 'week_id',
		type: 'int'
	},{
		name: 'home_team_id',
		type: 'int'
	},{
		name: 'away_team_id',
		type: 'int'
	},{
		name: 'winning_team_id',
		type: 'int'
	},{
		name: 'losing_team_id',
		type: 'int'
	},{
		name: 'home_team_name',
		type: 'string'
	},{
		name: 'away_team_name',
		type: 'string'
	},{
		name: 'home_team_pic',
		type: 'string'
	},{
		name: 'away_team_pic',
		type: 'string'
	},{
		name: 'home_team_record'
	},{
		name: 'away_team_record'
	},{
		name: 'home_score',
		type: 'int'
	},{
		name: 'away_score',
		type: 'int'
	}],

	//Proxy
	proxy: {
		type: 'ajax',
		api: {
			read: '/at-ajax/modules/league/game/read',
			create: '/at-ajax/modules/league/game/create',
			update: '/at-ajax/modules/league/game/update',
			destroy: '/at-ajax/modules/league/game/destroy'
		},
		reader: {
			idProperty: 'game_id',
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
	//Relations
	/*
	belongsTo:[{
		model: 'TMS.league.model.Week',
		primaryKey: 'game_id',
		associationKey: 'week_id',
		foreignKey: 'week_id',
		getterName: 'getWeek',
		setterName: 'setWeek'
	}]
	*/
});