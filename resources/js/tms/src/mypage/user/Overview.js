Ext.define('TMS.mypage.user.Overview', {
	extend:'Ext.view.View',
	
	//Config
	processingPage: '/at-ajax/modules/stats/user/grid',
	multiSelect: false,
	trackOver: true,
	deferEmptyText:false,
	overItemCls: 'mypage-user-overview-item-over',
	itemSelector: '.mypage-user-overview-item',
	emptyText: 'No stats...',
	
	//Inits
	initComponent: function(){
		this.items = [];
		this.dockedItems = [];
		this.init();
		return this.callParent(arguments);
	},
	
	init: function(){
		this.initStore();
		this.initTemplate();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'value'
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
	},
	
	initTemplate: function(){
		this.tpl = new Ext.XTemplate(
			'<table class="mypage-user-overview-table">',
				'<tbody>',
					'<tpl for=".">',
						'<tr>',
							'<td class="name">',
								'{name}',
							'</td>',
							'<td class="value">',
								'{value}',
							'</td>',
						'</tr>',
					'</tpl>',
				'</tbody>',
			'</table>'
		);
	}
});