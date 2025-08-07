Ext.define('TMS.orders.forms.sections.OrderDetails', {
	extend:'TMS.form.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.orders.forms.sections.OrderDetailRow'
	],
	
	//Config
	title:'Order Details',
	baseTitle:'Order Details',
	bodyStyle:{
		padding:'8px'
	},
	processingPage:'/at-ajax/modules/order/process/',
	url:'/at-ajax/modules/order/process/save-contact-methods',
	loadByKey:'order_id',
	order_id:0,
	autoSave:false,
	readOnly: false,
	
	initComponent: function(){
		this.items = this.items || [];
		this.addEvents('dataload');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initListeners();
		this.initStore();
		this.loadData();
	},
	
	initListeners: function() {
		this.on('add', this.itemAdded, this);
		this.on('remove', this.itemRemoved, this);
		this.on('beforesubmit', function(form){
			if(!this.rendered){
				return;
			}
			var rows = this.getRows();
			var numRows = rows.length;
			var types = [];
			var data = [];
			
			for (var i = 0; i < numRows; i++) {
				types.push(rows[i].detailType.getValue());
				data.push(rows[i].detailValue.getValue());
				
				rows[i].detailType.name = 'order_detail_type_id_' + i;
				rows[i].detailValue.name =  'order_detail_value_' + i;
			}
			
			form.setParam('order_detail_type_id', Ext.encode(types));
			form.setParam('order_detail_value', Ext.encode(data));
		}, this);
	},
	
	initStore: function() {
		this.store = Ext.create('Ext.data.Store', {
			fields: [
				'detail_type_id',
				'detail_type_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-order-details-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.store.load();
	},
	
	getRows: function() {
		return this.query('> .panel');
	},
	
	selectFirst: function(combobox) {
		if (combobox && combobox.store) {
			var record = combobox.store.getAt(0);
			if (record) {
				combobox.setValue(record.get('detail_type_id'));
			}
		}
	},
	
	getFirstUnusedIndex: function(combobox) {
		var indexToSelect = 0;
		
		// Loop through existing selections and store the currently used ids
		var existingIds = [];
		var items = this.getRows();
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
	
	addContactMethod: function() {
		
	},
	
	setValues: function() {
		
	},
	
	getValues: function() {
		var types = [];
		var data = [];
		var rows = this.getRows();
		for (var i = 0; i < rows.length; i++) {
			types.push(rows[i].detailType.getValue());
			data.push(rows[i].detailValue.getValue());
		}
		var params = {
			'order_detail_type_id[]':types,
			'order_detail_value[]':data
		};
		params[this.loadByKey] = this[this.loadByKey];
		return params;
	},
	
	createRow: function() {
		var row = Ext.create('TMS.orders.forms.sections.OrderDetailRow', {
			scope: this,
			store: this.store,
			readOnly: this.readOnly
		});
		
		//Listeners
		row.detailValue.on('keyup', function(textfield) {
			if (textfield.getValue().length) {
				var fields = this.query('#detail_value');
				var lastField = fields[fields.length-1];
				if (lastField.getValue().length) {
					// add another field
					var newRow = this.createRow();
					this.add(newRow);
					this.selectFirstUnused(newRow.detailType);
				}
			}
		}, this);
		
		row.detailValue.on('change', function(textfield) {
			if (!textfield.getValue().length) {
				var fields = this.query('#detail_value');
				var lastField = fields[fields.length-1];
				if (textfield != lastField) {
					textfield.ownerCt.destroy();
				}
			}
			this.save();
		}, this, {buffer:500});
		
		return row;
	},
	
	destroyRows: function() {
		Ext.each(this.query('> .panel'), function(el){
			el.destroy();
		});
	},
	
	loadData: function(loadByValue, name) {
		this[this.loadByKey] = loadByValue || this[this.loadByKey];
		var newTitle = this.baseTitle;
		if (name != null) {
			newTitle = this.baseTitle + ' - ' + name;
		}
		
		if (this.rendered) {
			this.setTitle(newTitle);
		}
		else {
			this.title = newTitle;
		}
		
		if (this.store.isLoading()) {
			this.store.on('load', function() {
				this.loadData();
			}, this);
		}
		else {
			if (this[this.loadByKey]) {
				this.setLoading(true);
				var params = {};
				params[this.loadByKey] = this[this.loadByKey];
				Ext.Ajax.request({
					scope:this,
					method:'post',
					url:this.processingPage + 'get-order-details-data',
					params:params,
					success: function(r) {
						this.setLoading(false);
						var response = Ext.decode(r.responseText);
						var records = response.records;
						
						// remove old rows - need to suspend events so this remove doesn't trigger for a previous contact
						this.suspendEvents();
						this.destroyRows();
						this.resumeEvents();
						
						// loop through all contact method records and make a row for each
						for (var i = 0; i < records.length; i++) {
							var panel = this.createRow();
							panel.on('afterrender', function(panel, options) {
								var combobox = panel.detailType;
								var textfield = panel.detailValue;
								combobox.setValue(options.record.detail_type_id);
								textfield.setRawValue(options.record.detail_value);
							}, this, {record: records[i]});
							this.add(panel);
						}
						// add another field
						if(!this.readOnly){
							var newRow = this.createRow();
							this.add(newRow);
							this.selectFirst(newRow.detailType);
						}
						this.fireEvent('dataload', this);
					}
				});
			}
			else {
				if(!this.readOnly){
					var newRow = this.createRow();
					this.add(newRow);
					this.selectFirst(newRow.detailType);
				}
			}
		}
	},
	
	itemAdded: function(panel, item, options) {
		var rows = this.query('> .panel');
		this.manageRemoveButtons(rows);
	},
	
	
	itemRemoved: function(panel, item, options) {
		// Get all rows
		var rows = this.query('> .panel');
		if (rows.length) {
			this.manageRemoveButtons(rows);
			this.save();
		}
	},
	
	manageRemoveButtons: function(rows) {
		if (rows.length) {
			for (var i = 0; i < rows.length-1; i++) {
				rows[i].down('.button').enable();
			}
			rows[rows.length-1].down('.button').disable();
		}
	},
	
	save: function() {
		if (this.autoSave && this[this.loadByKey]) {
			this.submit();
			var params = this.getValues();
			
			/*
			
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'save-contact-methods',
				params:params,
				success:function(r) {
					var response = Ext.decode(r.responseText);
					
				}
			});
			*/
		}
	}
	
});