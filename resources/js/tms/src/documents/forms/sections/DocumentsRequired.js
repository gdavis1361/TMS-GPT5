Ext.define('TMS.documents.forms.sections.DocumentsRequired', {
	extend:'TMS.form.Abstract',
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.documents.forms.sections.DocumentsRequiredRow'
	],
	
	title:'Documents Required',
	baseTitle:'Documents Required',
	bodyStyle:{
		padding:'8px'
	},
	processingPage:'/at-ajax/modules/contact/process/',
	url:'/at-ajax/modules/contact/process/save-documents-required',
	contact_id:0,
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
		this.initHidden();
		this.initListeners();
		this.initStore();
		
		if (this.contact_id) {
			this.loadContact(this.contact_id);
		}
		if (this.order_id) {
			this.loadData();
		}
	},
	
	initHidden: function() {
		this.contactIdField = Ext.create('Ext.form.field.Hidden', {
			name:'contact_id',
			value:this.contact_id
		});
		this.items.push(this.contactIdField);
		
		this.documentTypeIds = Ext.create('Ext.form.field.Hidden', {
			name:'document_type_ids'
		});
		this.items.push(this.documentTypeIds);
		
		this.documentTypeQuantities = Ext.create('Ext.form.field.Hidden', {
			name:'document_type_quantities'
		});
		this.items.push(this.documentTypeQuantities);
		
	},
	
	initListeners: function() {
		this.on('add', this.itemAdded, this, {buffer:500});
		this.on('remove', this.itemRemoved, this);
		this.on('beforesubmit', function(form){
			var rows = this.getRows();
			var numRows = rows.length;
			var types = [];
			var data = [];
			
			for (var i = 0; i < numRows; i++) {
				types.push(rows[i].typeSelector.getValue());
				data.push(rows[i].quantityField.getValue());
				
				rows[i].typeSelector.name = 'document_type_id_' + i;
				rows[i].quantityField.name =  'document_type_quantity_' + i;
			}
			
			this.documentTypeIds.setValue(Ext.encode(types));
			this.documentTypeQuantities.setValue(Ext.encode(data));
			this.contactIdField.setValue(this.contact_id);
		}, this);
	},
	
	initStore: function() {
		this.documentTypeStore = Ext.create('Ext.data.Store', {
			fields: [
				'document_type_id',
				'document_type_name'
			],
			proxy: {
				type: 'ajax',
				extraParams:{
					showAll:false
				},
				url: this.processingPage + 'get-document-types',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.documentTypeStore.load();
	},
	
	selectFirst: function(combobox) {
		var record = combobox.store.getAt(0);
		if (record) {
			combobox.setValue(record.get('document_type_id'));
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
			if (existingIds.indexOf(records[i].data.document_type_id) == -1) {
				indexToSelect = i;
				break;
			}
		}
		
		return indexToSelect;
	},
	
	selectFirstUnused: function(combobox) {
		if (combobox && combobox.store) {
			var record = combobox.store.getAt(this.getFirstUnusedIndex(combobox));
			combobox.setValue(record.get('document_type_id'));
		}
	},
	
	createRow: function() {
		var rowPanel = Ext.create('TMS.documents.forms.sections.DocumentsRequiredRow', {
			store:this.documentTypeStore,
			readOnly: this.readOnly
		});
		rowPanel.quantityField.on('keyup', function(textfield) {
			if (textfield.getValue().length) {
				var fields = this.query('#document_type_quantity');
				var lastField = fields[fields.length-1];
				if (lastField.getValue().length) {
					// add another field
					var newRow = this.createRow();
					this.add(newRow);
					this.selectFirstUnused(newRow.typeSelector);
				}
			}
		}, this);
		
		rowPanel.quantityField.on('change', function(textfield) {
			if (!textfield.getValue().length) {
				var fields = this.query('#document_type_quantity');
				var lastField = fields[fields.length-1];
				if (textfield != lastField) {
					textfield.ownerCt.destroy();
				}
			}
			this.save();
		}, this, {buffer:500});
		
		return rowPanel;
	},
	
	loadData: function() {
		if (this.documentTypeStore.isLoading()) {
			this.documentTypeStore.on('load', function() {
				this.loadData();
			}, this);
			return;
		}
		
		if (this.order_id || this.contact_id) {
			this.setLoading(true);
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-documents-required-data',
				params:{
					contact_id:this.contact_id,
					order_id:this.order_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					var records = response.records;

					// remove old rows - need to suspend events so this remove doesn't trigger for a previous contact
					this.suspendEvents();
					this.destroyRows();
					this.resumeEvents();

					// loop through all records and make a row for each
					for (var i = 0; i < records.length; i++) {
						var panel = this.createRow();
						panel.on('afterrender', function(panel, options) {
							var combobox = panel.typeSelector;
							var textfield = panel.quantityField;
							combobox.setValue(options.record.document_type_id);
							textfield.setRawValue(options.record.quantity);
						}, this, {
							record:records[i]
						});
						this.add(panel);
					}
					
					// add another field
					if(!this.readOnly){
						var newRow = this.createRow();
						this.add(newRow);
						this.selectFirst(newRow.typeSelector);
					}
					
					this.fireEvent('dataload', this);
				}
			});
		}
	},
	
	loadContact: function(contact_id, name) {
		this.contact_id = contact_id;
		var newTitle = this.title;
		if (name != null) {
			newTitle = this.baseTitle + ' for ' + name;
		}
		
		if (this.rendered) {
			this.setTitle(newTitle);
		}
		else {
			this.title = newTitle;
		}
		
		if (this.documentTypeStore.isLoading()) {
			this.documentTypeStore.on('load', function() {
				this.loadContact(this.contact_id);
			}, this);
		}
		else {
			if (this.contact_id) {
				this.loadData();
			}
			else {
				if(!this.readOnly){
					var newRow = this.createRow();
					this.add(newRow);
					this.selectFirst(newRow.typeSelector);
				}
			}
		}
	},
	
	destroyRows: function() {
		Ext.each(this.query('> .panel'), function(el){
			el.destroy();
		});
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
	
	getRows: function() {
		return this.query('> .panel');
	},
	
	save: function() {
		if (this.contact_id && this.autoSave) {
			this.submit();
		}
	}
	
});