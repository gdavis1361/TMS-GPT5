Ext.define('TMS.documents.forms.ScannerImport', {
	extend:'TMS.form.Abstract',
	url:'/at-ajax/modules/document/process/import-documents',
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initScannerStore();
		this.initScannerSelect();
		this.initButtons();
		this.initListeners();
	},
	
	initScannerStore: function() {
		this.scannerStore = Ext.create('Ext.data.Store', {
			fields: [
				'scannerName',
				'scannerDisplay'
			],
			proxy: {
				type: 'ajax',
				url: '/at-ajax/modules/document/process/get-scanner-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.scannerStore.load();
	},
	
	initScannerSelect: function() {
		this.scannerSelector = Ext.create('Ext.form.field.ComboBox', {
			fieldLabel:'Scanner',
			name:'scannerName',
			store:this.scannerStore,
			
			triggerAction: 'all',
			queryMode:'local',
			valueField:'scannerName',
			displayField:'scannerDisplay',
			editable:false
		});
		this.items.push(this.scannerSelector);
	},
	
	initButtons: function() {
		this.buttons = [{
			scope:this,
			text:'Import 10',
			scale:'medium',
			icon:'/resources/icons/download-24.png',
			handler: function() {
				this.submitParams.limit = 10;
				this.submit();
			}
		},{
			scope:this,
			text:'Import 20',
			scale:'medium',
			icon:'/resources/icons/download-24.png',
			handler: function() {
				this.submitParams.limit = 20;
				this.submit();
			}
		},{
			scope:this,
			text:'Import All',
			scale:'medium',
			icon:'/resources/icons/download-24.png',
			handler: function() {
				this.submitParams.limit = -1;
				this.submit();
			}
		}]
	},
	
	initListeners: function() {
		this.on('beforesubmit', function() {
			this.setLoading();
		}, this);
		
		this.on('submit', function() {
			this.setLoading(false);
			
		}, this);
		
	}
	
});