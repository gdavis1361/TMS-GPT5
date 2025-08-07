Ext.define('TMS.carrier.filter.Carrier', {
	extend: 'TMS.filter.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	init: function(){
		this.initName();
		this.initMc();
		this.initScac();
		this.initCity();
		this.initStateField();
		this.initZip();
	},
	
	initName: function(){
		this.name = new Ext.form.field.Text(Ext.apply({
			scope: this,
			name: 'name',
			fieldLabel: 'Name'
		}, this.defaults));
		this.items.push(this.name);
	},
	
	initMc: function(){
		this.mc = new Ext.form.field.Text(Ext.apply({
			scope: this,
			name: 'mc',
			fieldLabel: 'MC#'
		}, this.defaults));
		this.items.push(this.mc);
	},
	
	initScac: function(){
		this.scac = new Ext.form.field.Text(Ext.apply({
			scope: this,
			name: 'scac',
			fieldLabel: 'SCAC'
		}, this.defaults));
		this.items.push(this.scac);
	},
	
	initCity: function(){
		this.city = new Ext.form.field.Text(Ext.apply({
			scope: this,
			name: 'city',
			fieldLabel: 'City'
		}, this.defaults));
		this.items.push(this.city);
	},
	
	initStateField: function(){
		this.stateStore = Ext.create('Ext.data.Store', {
			autoLoad: true,
			fields:['display', 'value'],
			proxy: {
				type: 'ajax',
				url: '/at-ajax/modules/util/data/states',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.stateField = new Ext.form.field.ComboBox(Ext.apply({
			scope: this,
			queryMode:'local',
			name: 'state',
			displayField:'display',
			valueField:'value',
			fieldLabel: 'State',
			store:this.stateStore
		}, this.defaults));
		
		this.items.push(this.stateField);
	},
	
	initZip: function(){
		this.zip = new Ext.form.field.Text(Ext.apply({
			scope: this,
			name: 'zip',
			fieldLabel: 'Zip'
		}, this.defaults));
		this.items.push(this.zip);
	}
	
});