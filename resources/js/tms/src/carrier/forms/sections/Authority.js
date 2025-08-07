Ext.define('TMS.carrier.forms.sections.Authority', {
	extend:'TMS.form.Abstract',
	
	title:'Carrier Authority',
	processingPage:'/at-ajax/modules/carrier/authority/',
	url:'/at-ajax/modules/carrier/authority/save/',
	
	carrier_id:0,
	bodyPadding:8,
	
	initComponent: function() {
		this.items = this.items || [];
		
		this.initCommon();
		this.initContract();
		this.initBroker();
		
		this.initHidden();
		this.initListeners();
		
		if (this.carrier_id) {
			this.loadData(this.carrier_id);
		}
		
		this.callParent(arguments);
	},
	
	initCommon: function() {
		this.commonField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Common Authority',
			name:'common_authority',
			readOnly:true
		});
		this.items.push(this.commonField);
	},
	
	initContract: function() {
		this.contractField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Contract Authority',
			name:'contract_authority',
			readOnly:true
		});
		this.items.push(this.contractField);
	},
	
	initBroker: function() {
		this.brokerField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Broker Authority',
			name:'broker_authority',
			readOnly:true
		});
		this.items.push(this.brokerField);
	},
	
	initHidden: function() {
		this.carrierIdField = Ext.create('Ext.form.field.Hidden', {
			name:'carrier_id',
			value:this.carrier_id
		});
		this.items.push(this.carrierIdField);
	},
	
	initListeners: function() {
		
	},
	
	loadData: function(carrier_id) {
		this.carrier_id = carrier_id || this.carrier_id;
		if (this.carrier_id) {
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'load',
				params:{
					carrier_id:this.carrier_id
				},
				success: function(r) {
					var response = Ext.decode(r.responseText);
					if (response.success) {
						this.setValues(response.record);
					}
				}
			});
		}
	},
	
	setValues: function(record) {
		this.commonField.setValue(this.getDisplay(record.common_authority));
		this.contractField.setValue(this.getDisplay(record.contract_authority));
		this.brokerField.setValue(this.getDisplay(record.broker_authority));
	},
	
	getDisplay: function(value) {
		if (value) {
			return 'Yes';
		}
		else {
			return 'No';
		}
	}
	
});