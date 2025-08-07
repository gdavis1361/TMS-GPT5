Ext.define('TMS.league.store.Team', {
	extend: 'Ext.data.Store',
	requires:[
		'TMS.league.model.Team'
	],
	model: 'TMS.league.model.Team',
	autoLoad: true,
    autoSync: true,
	remoteSort: true
});