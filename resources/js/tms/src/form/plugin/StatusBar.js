Ext.define('TMS.form.plugin.StatusBar', {
	extend: 'Ext.util.Observable',
	
	//Config
	form: null,
	dockTo: null,
	redirect: true,
	redirectTimeout: 2000,
	
	constructor: function(){
		this.callParent(arguments);
		this.addEvents('showerror');
	},
	
	// private
    init: function(form) {
		
		//Save the form
		this.form = form;

		//Make sure this is a tms form
		if(!Ext.ComponentQuery.is(this.form, 'tmsform')){
			return;
		}
		
		//Init the listeners
		this.initListeners();
		
		//Init the statusbar
		this.initStatusBar();
    },
	
	initListeners: function(){
		//before submit listener
		this.form.on('beforesubmit', this.onBeforeSubmit, this);
		
		//Submit listener
		this.form.on('submit', this.onSubmit, this);
		
		//Cancel listener
		this.form.on('cancelsubmit', this.onCancelSubmit, this);
		
		//Failure Listener
		this.form.on('failure', function(form, response){
			this.onFailure(response.result);
		}, this);
		
		//Success Listener
		this.form.on('success', function(form, response){
			this.onSuccess(response.result);
		}, this);
	},
	
	initStatusBar: function(){
		this.statusBar = Ext.create('Ext.ux.statusbar.StatusBar', {
			scope: this,
			docked: 'bottom',
			dock: 'bottom',
			items: this.items || []
		});
		
		this.statusBar.on('afterrender', function(){
			this.statusTip = Ext.create('Ext.tip.ToolTip', {
				scope: this,
				target: this.statusBar.getEl(),
				anchor: 'top',
				autoHide: false,
				hasContent: false,
				listeners: {
					'beforeshow': Ext.bind(function(){
						if(!this.statusTip.hasContent){
							return false;
						}
					}, this)
				}
			});
			this.statusTip.on('afterrender', function(){
				this.statusTip.getEl().on('click', function(event, el){
					var element = event.getTarget('li');
					if(element == null){
						return;
					}
					var field = Ext.get(element).getAttribute('field');
					var formField = this.form.getForm().findField(field);
					this.fireEvent('showerror', field);
					this.statusTip.hide();
				}, this);
			}, this);

		}, this);
		
		if(this.dockTo){
			this.dockTo.addDocked(this.statusBar);
		}
		else{
			this.form.addDocked(this.statusBar);
		}
	},
	
	setStatus: function(config){
		this.statusBar.clearStatus();
		this.statusBar.setStatus(config);
		
		//Check if there is a config tooltip
		if(config.tooltip != null){
			//Update the message of the tip
			this.statusTip.update(config.tooltip);
			this.statusTip.hasContent = true;
			this.statusTip.show();
		}
		else{
			this.statusTip.hasContent = false;
			this.statusTip.update('');
		}
	},
	
	onBeforeSubmit: function() {
		this.statusBar.showBusy('Saving...');
	},
	
	onSubmit: function() {
		//Was this form invalid
		if(!this.form.getForm().isValid()){
			
			//Build the error string
			var errorStr = '<div class="form-errors"><ul>';
			this.form.getForm().getFields().each(function(field){
				var msg = field.getErrors()[0];
				if (msg) {
					errorStr += '<li field="' + field.name + '">' + field.name + ' - ' + msg + '</li>';
				}
			}, this);
			errorStr += '</div>';
			
			this.setStatus({
				text: 'There are errors in your form.',
				iconCls: 'warning-icon-16',
				tooltip: errorStr
			});
		}
	},
	
	onCancelSubmit: function(){
		this.setStatus({
			text: ''
		});
	},
	
	onSuccess: function(response) {
		this.setStatus({
			text: response.msgStr,
			iconCls: 'check-icon-16'
		});

		//Redirect
		if(this.redirect && response.redirect.length){
			setTimeout(Ext.bind(function(){
				location.href = response.redirect;
			}, this), this.redirectTimeout);
		}
		else{
			setTimeout(Ext.bind(function(){
				this.statusBar.clearStatus();
			}, this), 4000);
		}
	},
	
	onFailure: function(response) {
		this.setStatus({
			text: 'There was an error submitting the form.',
			iconCls: 'warning-icon-16',
			tooltip: response.errorStr
		});
	}
});