Ext.define('TMS.comment.forms.sections.Comments', {
	extend: 'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.comment.view.Grid',
		'TMS.comment.forms.sections.Form',
		'TMS.comment.filter.Comment'
	],
	
	//Config
	layout:'border',
	title:'Comments',
	baseTitle:'Comments',
	
	field_value:0,
	type:'contact',
	extraFilters:{},
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTopBar();
		this.initGrid();
		this.initForm();
		this.initFilter();
		this.initListeners();
	},
	
	initTopBar: function() {
		this.topToolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items:[{
				scope:this,
				text:'Add New Comment',
				handler:this.addNewComment,
				icon:'/resources/icons/add-16.png'
			}]
		});
		this.dockedItems.push(this.topToolbar);
	},
	
	initGrid: function() {
		this.gridPanel = Ext.create('TMS.comment.view.Grid', {
			region:'center',
			field_value:this.field_value,
			type:this.type
		});
		this.items.push(this.gridPanel);
	},
	
	initForm: function() {
		this.formPanel = Ext.create('TMS.comment.forms.sections.Form', {
			field_value:this.field_value,
			commentType:this.type
		});
		
		this.formWindow = Ext.create('Ext.window.Window', {
			title:'Comment Details',
			autoShow:false,
			modal:true,
			resizable:false,
			draggable:false,
			width:400,
			closeAction:'hide',
			items:[
				this.formPanel
			]
		});
		
		this.formPanel.getForm().setValues({
			field_value:this.field_value
		});
		
	},
	
	addNewComment: function() {
		this.formPanel.getForm().reset();
		this.formPanel.getForm().setValues({
			field_value:this.field_value
		});
		this.formPanel.selectFirst();
		this.formPanel.bottomToolbar.enable();
		this.formWindow.show();
	},
	
	initFilter: function() {
		this.filterPanel = Ext.create('TMS.comment.filter.Comment', {
			region:'east',
			width:250,
			title:'Filter',
			collapsible:true,
			collapsed:true,
			titleCollapse:true
		});
		
		this.filterPanel.on('filter', function(form, values){
			Ext.apply(values, this.extraFilters);
			this.gridPanel.store.proxy.extraParams.filter = Ext.encode(values);
			this.gridPanel.store.loadPage(1);
		}, this);
		
		this.items.push(this.filterPanel);
	},
	
	initListeners: function() {
		this.gridPanel.store.on('load', function(store) {
			if (store.totalCount) {
				this.setTitle(this.baseTitle + ' (' + store.totalCount + ')');
			}
			else {
				this.setTitle(this.baseTitle);
			}
		}, this);
		
		this.formPanel.on('formsuccess', function() {
			this.gridPanel.store.load();
			this.addNewComment();
			this.formWindow.hide();
		}, this);
		this.formPanel.on('formfailure', function() {
			
		}, this);
		
		this.gridPanel.on('itemclick', function(grid, record, item, index, e) {
			var data = record.data;
			this.formPanel.getForm().setValues(data);
			this.formPanel.expand();
			this.formPanel.bottomToolbar.disable();
		}, this);
	}
});