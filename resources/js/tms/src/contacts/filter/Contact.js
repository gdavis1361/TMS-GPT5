Ext.define('TMS.contacts.filter.Contact', {
	extend: 'TMS.filter.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	init: function(){
		this.initName();
		this.initCompany();
		this.initOwner();
		this.initUpToDate();
		this.initStatus();
	},
	
	initName: function(){
		this.items.push({
			name: 'name',
			fieldLabel: 'Name'
		});
	},
	
	initCompany: function(){
		this.items.push({
			name: 'company',
			fieldLabel: 'Company'
		});
	},
	
	initOwner: function() {
		this.items.push({
			name: 'owner',
			fieldLabel: 'Owner'
		});
	},
	
	initUpToDate: function() {
		var data = {
			data:[{
				'upToDate':-1,
				'display':'All'
			},{
				'upToDate':0,
				'display':'No'
			},{
				'upToDate':1,
				'display':'Yes'
			}]
		};
		this.upToDateStore = Ext.create('Ext.data.Store', {
			autoLoad: true,
			fields:['upToDate', 'display'],
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
			name: 'upToDate',
			displayField:'display',
			valueField:'upToDate',
			fieldLabel: 'Up To Date',
			store:this.upToDateStore
		});
	},
	
	initStatus: function() {
		var data = {
			data:[{
				'status_id':-1,
				'status_name':'All'
			},{
				'status_id':9,
				'status_name':'Cold'
			},{
				'status_id':10,
				'status_name':'Warm'
			},{
				'status_id':11,
				'status_name':'Hot'
			}]
		};
		this.statusStore = Ext.create('Ext.data.Store', {
			autoLoad: true,
			fields:['status_id', 'status_name'],
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
			name: 'status',
			displayField:'status_name',
			valueField:'status_id',
			fieldLabel: 'Status',
			store:this.statusStore
		});
	}
	
});