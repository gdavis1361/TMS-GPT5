Ext.define('TMS.contacts.forms.sections.ContactMethods', {
	extend:'TMS.form.Abstract',
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.contacts.forms.sections.ContactMethodRow'
	],
	
	title:'Contact Methods',
	baseTitle:'Contact Methods',
	bodyStyle:{
		padding:'8px'
	},
	processingPage:'/at-ajax/modules/contact/process/',
	url:'/at-ajax/modules/contact/process/save-contact-methods',
	contact_id:0,
	
	autoSave:false,
	
	initComponent: function(){
		this.items = [];
		this.addEvents('save', 'recordload');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initHidden();
		this.initListeners();
		this.initStore();
		this.loadRecord();
	},
	
	initHidden: function() {
		this.contactIdField = Ext.create('Ext.form.field.Hidden', {
			name:'contact_id',
			value:this.contact_id
		});
		this.items.push(this.contactIdField);
	},
	
	initListeners: function() {
		this.on('add', this.itemAdded, this, {buffer:500});
		this.on('remove', this.itemRemoved, this, {buffer: 1000});
		this.on('beforesubmit', function(form){
			if(!this.rendered){
				return;
			}
			
			var rows = this.getRows();
			var numRows = rows.length;
			var types = [];
			var data = [];
			
			for (var i = 0; i < numRows; i++) {
				types.push(rows[i].contactMethodSelector.getValue());
				data.push(rows[i].contactMethodField.getValue());
				
				rows[i].contactMethodSelector.name = 'contact_method_type_' + i;
				rows[i].contactMethodField.name =  'contact_method_data_' + i;
			}
			
			this.contactIdField.setValue(this.contact_id);
			form.setParam('contact_method_types', Ext.encode(types));
			form.setParam('contact_method_data', Ext.encode(data));
		}, this);
	},
	
	getEmail: function() {
		var email = false;
		var rows = this.getRows();
		var numRows = rows.length;
		for (var i = 0; i < numRows; i++) {
			if (rows[i].contactMethodSelector.getRawValue() == 'Email') {
				return rows[i].contactMethodField.getValue();
			}
		}
	},
	
	initStore: function() {
		this.contactMethodStore = Ext.create('Ext.data.Store', {
			fields: [
				'method_id',
				'method_type',
				'method_group_id'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-contact-method-types',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.contactMethodStore.load();
	},
	
	selectFirst: function(combobox) {
		if (combobox && combobox.store) {
			var record = combobox.store.getAt(0);
			if (record) {
				combobox.setValue(record.get('method_id'));
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
			if (existingIds.indexOf(records[i].data.method_id) == -1) {
				indexToSelect = i;
				break;
			}
		}
		
		return indexToSelect;
	},
	
	selectFirstUnused: function(combobox) {
		if (combobox && combobox.store) {
			var record = combobox.store.getAt(this.getFirstUnusedIndex(combobox));
			combobox.setValue(record.get('method_id'));
		}
	},
	
	addContactMethod: function() {
		
	},
	
	createRow: function() {
		var rowPanel = Ext.create('TMS.contacts.forms.sections.ContactMethodRow', {
			store:this.contactMethodStore
		});
		
		rowPanel.contactMethodField.on('keyup', function(textfield) {
			if (textfield.getValue().length) {
				var fields = this.query('#method_data');
				var lastField = fields[fields.length-1];
				if (lastField.getValue().length) {
					// add another field
					var newRow = this.createRow();
					this.add(newRow);
					this.selectFirstUnused(newRow.contactMethodSelector);
				}
			}
		}, this);
		
		rowPanel.contactMethodField.on('change', function(textfield) {
			if (!textfield.getValue().length) {
				var fields = this.query('#method_data');
				var lastField = fields[fields.length-1];
				if (textfield != lastField) {
					textfield.ownerCt.destroy();
				}
			}
			this.save();
		}, this, {buffer: 700 });
		
		return rowPanel;
	},
	
	loadRecord: function(contact_id, name) {
		this.contact_id = contact_id || this.contact_id;
		var newTitle = this.baseTitle;
		if (name != null && this.baseTitle.length) {
			newTitle = this.baseTitle + ' - ' + name;
		}
		
		if (this.rendered) {
			this.setTitle(newTitle);
		}
		else {
			this.title = newTitle;
		}
		
		if (this.contactMethodStore.isLoading()) {
			this.contactMethodStore.on('load', function() {
				this.loadRecord();
			}, this);
		}
		else {
			if (this.contact_id) {
				this.setLoading(true);
				Ext.Ajax.request({
					scope:this,
					method:'post',
					url:this.processingPage + 'get-contact-method-data',
					params:{
						contact_id:this.contact_id
					},
					success: function(r) {
						this.setLoading(false);
						var response = Ext.decode(r.responseText);
						var records = response.records;
						this.fireEvent('recordload', this, records);
						
						// remove old rows - need to suspend events so this remove doesn't trigger for a previous contact
						this.suspendEvents();
						this.destroyRows();
						this.resumeEvents();
						
						// loop through all contact method records and make a row for each
						for (var i = 0; i < records.length; i++) {
							var panel = this.createRow();
							panel.contactMethodSelector.setValue(records[i].method_id);
							panel.contactMethodField.setRawValue(records[i].contact_value_1);
							this.add(panel);
						}
						// add another field
						var newRow = this.createRow();
						this.add(newRow);
						this.selectFirst(newRow.contactMethodSelector);
					}
				});
			}
			else {
				var newRow = this.createRow();
				this.add(newRow);
				this.selectFirst(newRow.contactMethodSelector);
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