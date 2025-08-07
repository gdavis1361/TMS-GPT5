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