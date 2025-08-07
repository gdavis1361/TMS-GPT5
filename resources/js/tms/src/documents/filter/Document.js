Ext.define('TMS.documents.filter.Document', {
	extend: 'TMS.filter.Abstract',
	processingPage: '/at-ajax/modules/document/grid/',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	init: function(){
		this.initTaskTypes();
		this.initTaskOwners();
		this.initCreatedBy();
		this.initAssignedTo();
		this.initDueDateOn();
		this.initDueDateFrom();
		this.initDueDateTo();
	},
	
	initTaskTypes: function() {
		this.typeStore = Ext.create('Ext.data.Store', {
			fields: [
				'task_type_id',
				'task_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-task-type-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.typeStore.load();
		
		this.items.push({
			xtype:'realcombobox',
			queryMode:'local',
			name: 'status',
			displayField:'task_name',
			valueField:'task_type_id',
			fieldLabel: 'Task Type',
			store:this.typeStore
		});
	},
	
	initTaskOwners: function() {
		var data = {
			data:[{
				'value':'all',
				'display':'All'
			},{
				'value':'unclaimed',
				'display':'Unclaimed'
			},{
				'value':'me',
				'display':'Me'
			},{
				'value':'others',
				'display':'Others'
			}]
		};
		this.taskOwnerStore = Ext.create('Ext.data.Store', {
			autoLoad: true,
			fields:['value', 'display'],
			data:data,
			proxy: {
				type: 'memory',
				reader: {
					type: 'json',
					root: 'data'
				}
			}
		});
		this.items.push({
			xtype:'realcombobox',
			queryMode:'local',
			name: 'taskOwner',
			displayField:'display',
			valueField:'value',
			fieldLabel: 'Task Owners',
			store:this.taskOwnerStore
		});
	},
	
	initCreatedBy: function(){
		this.items.push({
			name: 'created_by',
			fieldLabel: 'Created By'
		});
	},
	
	initAssignedTo: function() {
		this.items.push({
			name: 'assigned_to',
			fieldLabel: 'Assigned To'
		});
	},
	
	initDueDateOn: function() {
		this.items.push({
			xtype:'datefield',
			name:'dueDateOn',
			fieldLabel:'Due Date On'
		});
	},
	
	initDueDateFrom: function() {
		this.items.push({
			xtype:'datefield',
			name:'dueDateFrom',
			fieldLabel:'Due Date From'
		});
	},
	
	initDueDateTo: function() {
		this.items.push({
			xtype:'datefield',
			name:'dueDateTo',
			fieldLabel:'Due Date To'
		});
	}
	
});