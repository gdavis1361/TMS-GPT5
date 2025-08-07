Ext.define('TMS.orders.forms.sections.Details', {
	extend:'Ext.panel.Panel',
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	//Config
	processingPage:'/at-ajax/modules/tools/detail-types/',
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initListeners();
		this.initStore();
		this.on('afterrender', function(){
			this.detailStore.on('load', function(){
				var newRow = this.createRow();
				this.add(newRow);
				this.selectFirst(newRow.down('realcombobox'));
			}, this, {single: true});
			this.detailStore.load();
		}, this);
	},
	
	initListeners: function() {
		this.on('add', this.itemAdded, this);
		this.on('remove', this.itemRemoved, this);
	},
	
	initStore: function() {
		this.detailStore = Ext.create('Ext.data.Store', {
			fields: [
				'detail_type_id',
				'detail_type_name',
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
	},
	
	selectFirst: function(combobox) {
		combobox.setValue(combobox.store.getAt(0).get('detail_type_id'));
	},
	
	getFirstUnusedIndex: function(combobox) {
		var indexToSelect = 0;
		
		// Loop through existing selections and store the currently used ids
		var existingIds = [];
		var items = this.items.items;
		for (var i = 0; i < items.length - 1; i++) {
			var subItem = items[i].items.items[0];
			var typeId = subItem.getValue();
			existingIds.push(typeId);
		}

		// Loop through records and find the first one that isnt in use
		var records = combobox.store.data.items;
		var numRecords = records.length;
		for (var i = 0; i < numRecords; i++) {
			if (existingIds.indexOf(records[i].data.detail_type_id) == -1) {
				indexToSelect = i;
				break;
			}
		}
		
		return indexToSelect;
	},
	
	selectFirstUnused: function(combobox) {
		if (combobox && combobox.store) {
			var record = combobox.store.getAt(this.getFirstUnusedIndex(combobox));
			combobox.setValue(record.get('detail_type_id'));
		}
	},
	
	setValues: function(records) {
		if(!records.length){
			return false;
		}
		if(!this.rendered){
			this.on('afterrender', function(panel, options){
				this.setValues(options.records);
			}, this, {records: records});
			return false;
		}
		
		//Set the values
		this.setLoading(true);
		this.removeAll();
		Ext.each(records, function(record){
			var row = this.createRow();
			this.add(row);
			var type = row.down('#detail_type_id');
			var value = row.down('#detail_value');
			var detailId = row.down('#detail_id');
			
			if(!type.isStoreLoaded){
				this.detailStore.on('load', function(store, records, bool, options){
					var type = options.type;
					var record = options.record;
					type.select(this.detailStore.getAt(this.detailStore.find('detail_type_id', record.detail_type_id)));
					
				}, this, {record: record, type: type});
			}
			else{
				type.select(this.detailStore.getAt(this.detailStore.find('detail_type_id', record.detail_type_id)));
			}
			value.setValue(record.detail_value);
			detailId.setValue(record.detail_id);
		}, this);
		this.setLoading(false);
	},
	
	getValues: function() {
		var ids = this.query('#detail_type_id');
		var values = this.query('#detail_value');
		var detailIds = this.query('#detail_id');
		var records = [];
		for(var i = 0; i < ids.length; i++){
			var id = ids[i].getValue();
			var detailId = detailIds[i].getValue();
			var value = values[i].getValue();
			var record = {
				detail_id: detailId,
				detail_type_id: id,
				detail_value: value
			};
			if(value.length){
				records.push(record);
			}
		}
		
		return records;
	},
	
	getCount: function(){
		return this.items.items.length;
	},
	
	createRow: function() {
		var p = Ext.create('Ext.panel.Panel', {
			layout:'hbox',
			border:false,
			defaults:{
				border:false
			},
			items:[{
				flex:1,
				xtype:'realcombobox',
				valueField:'detail_type_id',
				displayField:'detail_type_name',
				store: this.detailStore,
				queryMode: 'local',
				editable:false,
				margin:'2',
				itemId:'detail_type_id',
				name:'detail_type_id[]'
			},{
				flex:1,
				xtype: 'textfield',
				enforceMaxLength: true,
				maxLength: 100,
				name: 'detail_value[]',
				margin:'2',
				itemId:'detail_value',
				enableKeyEvents:true,
				listeners:{
					scope:this,
					keyup:function(textfield) {
						if (textfield.getValue().length) {
							var fields = this.query('#detail_value');
							var lastField = fields[fields.length-1];
							if (lastField.getValue().length) {
								// add another field
								var newRow = this.createRow();
								this.add(newRow);
								this.selectFirstUnused(newRow.down('realcombobox'));
							}
						}
					},
					blur:function(textfield) {
						if (!textfield.getValue().length) {
							var fields = this.query('#detail_value');
							var lastField = fields[fields.length-1];
							if (textfield != lastField) {
								textfield.ownerCt.destroy();
							}
						}
					}
				}
			},{
				xtype: 'hiddenfield',
				name: 'detail_id',
				itemId: 'detail_id',
				value: 0
			},{
				xtype: 'button',
				margin:'2',
				icon:'/resources/icons/delete-16.png',
				width:24,
				scope:this,
				handler:function(button) {
					// remove if not the last one
					button.ownerCt.destroy();
				}
			}]
		});
		return p;
	},
	
	itemAdded: function(panel, item, options) {
		var rows = this.query('> .panel');
		this.manageRemoveButtons(rows);
		//this.doLayout();
	},
	
	
	itemRemoved: function(panel, item, options) {
		// Get all rows
		var rows = this.query('> .panel');
		if (rows.length) {
			this.manageRemoveButtons(rows);
		}
	},
	
	manageRemoveButtons: function(rows) {
		for (var i = 0; i < rows.length-1; i++) {
			rows[i].down('.button').enable();
		}
		rows[rows.length-1].down('.button').disable();
	}
	
});