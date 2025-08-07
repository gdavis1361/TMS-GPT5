Ext.define('TMS.comment.filter.Comment', {
	extend: 'TMS.filter.Abstract',
	
	init: function(){
		this.initShowAll();
	},
	
	initShowAll: function() {
		this.items.push({
			xtype:'checkbox',
			fieldLabel:'Show All Customer Contacts',
			labelWidth:200,
			name:'showAll'
		});
	}
	
});
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
Ext.define('TMS.comment.forms.sections.Form', {
	extend:'Ext.form.Panel',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	layout: 'anchor',
	processingPage:'/at-ajax/modules/comment/process/',
	defaults:{
		anchor: '100%'
	},
	
	commentType: 'contact',
	field_value:0,
	
	initComponent: function() {
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initStore();
		this.initBottomBar();
		this.initCommentType();
		this.initCommentBox();
		this.initHidden();
	},
	
	initStore: function(){
		this.store = Ext.create('Ext.data.Store', {
			fields: [
				'comment_type_id',
				'comment_type_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-comment-types',
				reader: {
					type: 'json',
					root: 'records'
				},
				extraParams: {
					commentType: this.commentType
				}
			}
		});
		this.store.load();
		this.store.on('load', this.selectFirst, this);
	},
	
	selectFirst: function() {
		if (this.commentType) {
			var record = this.commentType.store.getAt(0);
			if (record) {
				this.commentType.setValue(record.get('comment_type_id'));
			}
		}
	},
	
	initBottomBar: function() {
		this.bottomToolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'bottom',
			pack:'right'
		});
		this.dockedItems.push(this.bottomToolbar);
		
		this.bottomToolbar.add('->', {
			scope:this,
			text:'Save Comment',
			handler:this.saveComment,
			icon:'/resources/icons/save-16.png'
		});
	},
	
	initCommentType: function(){
		this.commentType = Ext.create('Ext.ux.form.field.RealComboBox', {
			fieldLabel: 'Type',
			store: this.store,
			displayField: 'comment_type_name',
			valueField: 'comment_type_id',
			labelWidth: 50,
			name: 'comment_type_id',
			margin: '10',
			queryMode:'local'
		});
		
		this.commentType.on('change', function(o, result) {
			if (result) {
				this.comment.show();
			}
			else {
//				this.comment.hide();
			}
		}, this);
		this.items.push(this.commentType);
	},
	
	initCommentBox: function() {
		this.comment = Ext.create('Ext.form.TextArea', {
			grow: true,
			anchor: '100%',
			name: 'comment', 
			margin: '10',
			height:70
		});
//		this.comment.hide();
		this.items.push(this.comment);
	},
	
	initHidden: function() {
		this.commentId = Ext.create('Ext.form.field.Hidden', {
			name:'comment_id',
			value:0
		});
		this.items.push(this.commentId);
		
		this.fieldValue = Ext.create('Ext.form.field.Hidden', {
			name:'field_value',
			value:this.field_value
		});
		this.items.push(this.fieldValue);
		
	},
	
	changeCommentType: function(typeId) {
		this.commentType.clearValue();
		this.store.proxy.extraParams.group_id = typeId;
		this.store.load();
		this.commentType.fireEvent('change');
	},
	
	saveComment: function() {
		this.setLoading('Saving');
		this.getForm().submit({
			scope:this,
			url:this.processingPage + 'save-comment',
			success: function(form, action) {
				this.setLoading(false);
				this.fireEvent('formsuccess');
			},
			failure: function(form, action) {
				this.setLoading(false);
				this.fireEvent('formfailure');
				Ext.Msg.alert('Failure', action.result.errorStr);
			}
		});
	}
});
Ext.define('TMS.comment.view.Grid', {
	extend: 'Ext.grid.Panel',
	
	requires:[
		'Ext.ux.RowExpander'
	],
	
	processingPage: '/at-ajax/modules/comment/process/',
	viewConfig: {
		stripeRows: true
	},
	features: [{
		ftype: 'rowbody',
		getAdditionalData: function(data, idx, record, orig) {
			var headerCt = this.view.headerCt,
				colspan  = headerCt.getColumnCount();

			return {
				rowBody: record.get('comment'),
				rowBodyCls: this.rowBodyCls,
				rowBodyColspan: colspan
			};
		}
	}],
	disableSelection: true,
	
	field_value:0,
	type: 'contact',
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initListeners();
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Comment About',
			dataIndex: 'field_display',
			width: 100,
			xtype:'templatecolumn',
			tpl:'{field_display}'
		},{
			header:'Created By',
			dataIndex: 'created_by_first_name',
			width: 100,
			xtype:'templatecolumn',
			tpl:'{created_by_first_name} {created_by_last_name}'
		},{
			header:'Created At',
			dataIndex:'created_at'
		},{
			header:'Type',
			dataIndex:'comment_type_name'
		},{
			header:'Comment',
			dataIndex:'comment',
			flex:1,
			sortable:false
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'comment_id',
				'comment',
				
				'field_value',
				'field_display',
				
				'created_by_id',
				'created_by_first_name',
				'created_by_last_name',
				
				'created_at',
				'updated_at',
				'comment_type_id',
				
				'comment_type_name'
			],
			remoteSort: true,
			pageSize: 10,
			proxy: {
				type: 'ajax',
				url : this.processingPage + 'get-grid-records',
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				},
				extraParams:{
					field_value:this.field_value,
					type:this.type
				}
			}
		});
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.store.on('load', function(store, records) {
			return;
			var nodes = this.getView().getNodes();
			Ext.each(nodes, function(node){
				Ext.create('Ext.tip.ToolTip', {
					scope: this,
					target: node,
					anchor: 'top',
					autoHide: true,
					html: this.getView().getRecord(node).get('comment'),
					listeners: {
						'beforeshow': Ext.bind(function(){
							
						}, this)
					}
				});
			}, this);
		}, this);
	}
	
});
