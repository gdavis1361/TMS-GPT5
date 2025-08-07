Ext.define('TMS.league.store.Season', {
	extend: 'Ext.data.Store',
	requires:[
		'TMS.league.model.Season'
	],
	model: 'TMS.league.model.Season',
	autoLoad: true,
    autoSync: true,
	remoteSort: true,
	pageSize: 10
});