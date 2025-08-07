Ext.define('TMS.form.plugin.Help', {
	extend: 'Ext.util.Observable',
	
	//Config
	field: null,
	message: '',
	
	constructor: function(message, config){
		this.message = message;
		this.callParent([config]);
	},
	
	// private
    init: function(field) {
		
		//Save the field
		this.field = field;

		//Make sure this is a field
		if(!Ext.ComponentQuery.is(this.field, 'field')){
			return;
		}
		
		if (!this.field.rendered) {
			field.on('afterrender', this.onAfterRender, this);
		}
		else {
			// probably an existing input element transformed to extjs field
			this.onAfterRender();
		}
    },
	
	initLabel: function(){
		this.field.labelEl.set({
			style:{
				cursor: 'help'
			}
		});
	},
	
	initTip: function(){
		this.tip = Ext.create('Ext.tip.ToolTip', {
			scope: this,
			target: this.field.labelEl,
			anchor: 'top',
			autoHide: true,
			html: this.message,
			listeners: {
				'beforeshow': Ext.bind(function(){
					
				}, this)
			}
		});
	},
	
	onAfterRender: function(){
		var labelEl = this.field.labelEl;
		if(labelEl == null){
			return;
		}
		this.initLabel();
		this.initTip();
	}
});