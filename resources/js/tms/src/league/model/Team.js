Ext.define('TMS.league.model.Team', {
    extend: 'Ext.data.Model',
	idProperty: 'league_team_id',
	
	//Requires
	requires:[
		'TMS.league.model.Game'
	],
	
	//Fields
    fields: [{
		name: 'league_team_id',
		type: 'int'
	},{
		name: 'team_name',
		type: 'string'
	},{
		name: 'team_pic',
		type: 'string'
	},{
		name: 'team_music',
		type: 'string'

	},{
		name: 'team_video',
		type: 'string'
	},{
		name: 'captain_id',
		type: 'int'
	}],

	//Proxy
	proxy: {
		type: 'ajax',
		startParam: undefined,
		limitParam: undefined,
		api: {
			read: '/at-ajax/modules/league/team/read',
			create: '/at-ajax/modules/league/team/create',
			update: '/at-ajax/modules/league/team/update',
			destroy: '/at-ajax/modules/league/team/destroy'
		},
		reader: {
			idProperty: 'league_team_id',
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