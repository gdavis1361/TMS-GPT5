Ext.define('TMS.contacts.view.FreeAgentsGrid', {
	extend: 'Ext.grid.Panel',
	requires:[
		'TMS.contacts.forms.sections.Claim'
	],
	
	//Config
	processingPage: '/at-ajax/modules/contact/process/get-free-agents-records',
	viewConfig: {
		stripeRows: true
	},
	title:'Free Agents',
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initListeners();
		this.initColumns();
		this.initStore();
		this.initPager();
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.on('itemdblclick', function(view, record){
			this.setLoading(true);
			location.href = Ext.String.format('/contacts/?d=contacts&a=view&id={0}', record.get('contact_id'));
		}, this);
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Contact Name',
			dataIndex: 'contact_name',
			flex: 1
		},{
			header: 'Title',
			dataIndex: 'title',
			flex: 1
		},{
			header: 'Customer',
			dataIndex: 'customer_name',
			flex: 1
		},{
			header: 'Restriction',
			dataIndex: 'restrictionDisplay',
			flex: 1
		},{
			header: 'Date',
			dataIndex: 'updated_at',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'{dateDisplay}'
		},{
			header: 'Claim',
			dataIndex: 'contact_id',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'<div class="rounded5 button box-right">' +
					'<a href="#" class="claim-button" id="claim-{contact_id}">Claim</a>' +
				'</div>'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'contact_id',
				'contact_name',
				'title',
				'updated_at',
				'dateDisplay',
				
				'owner_name',
				
				'customer_id',
				'customer_name',
				
				'restrictionDisplay'
			],
			remoteSort: true,
			pageSize: 20,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
		
		this.store.on('load', function() {
			Ext.select('.claim-button').on('click', function(e, el) {
				e.preventDefault();
				var contact_id = el.id.split('-')[1];
				var claimWindow = Ext.create('TMS.contacts.forms.sections.Claim', {
					contact_id:contact_id
				});
				claimWindow.on('close', function() {
					this.store.load();
				}, this);
			}, this);
		}, this);
	}
	
});