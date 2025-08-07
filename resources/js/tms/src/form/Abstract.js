Ext.define('TMS.form.Abstract', {
	extend:'Ext.form.Panel',
	alias: 'widget.tmsform',
	
	//Config
	submitParams: {},
	fieldPrefix: '',
	fieldPostfix: '',
	autoDestroy: true,
	autoScroll: true,
	
	constructor: function(){
		this.submitParams = {};
		return this.callParent(arguments);
	},
	
	initComponent: function(){
		//Set up items
		if(!this.url){
		}
		
		//Prototype the field to always show the msgTarget on the side
		Ext.form.field.Base.prototype.msgTarget = '';
		
		//Add events
		this.addEvents(
			'beforesubmit',
			'submit',
			'success',
			'failure',
			'cancelsubmit'
		);
			
		//Init the field names
		this.setFieldPrefix(this.fieldPrefix);
		this.setFieldPostfix(this.fieldPostfix);
		this.on('add', function(form, item){
			if(Ext.ComponentQuery.is(item, 'field')){
				this.applyPrefixPostfix(item);
			}
		}, this);
			
		//Call the parent function
		this.callParent(arguments);
	},
	
	setFieldPrefix: function(prefix){
		if(!this.rendered){
			this.on('afterrender', function(panel, options){
				this.setFieldPrefix(options.prefix);
			}, this, {prefix: prefix});
			return;
		}
		this.fieldPrefix = prefix;
		this.getForm().getFields().each(function(field){
			if(field.name != null && field.name.length){
				this.applyPrefixPostfix(field);
			}
		}, this);
	},
	
	setFieldPostfix: function(postfix){
		if(!this.rendered){
			this.on('afterrender', function(panel, options){
				this.setFieldPostfix(options.postfix);
			}, this, {postfix: postfix});
			return;
		}
		this.fieldPostfix = postfix;
		this.getForm().getFields().each(function(field){
			if(field.name != null && field.name.length){
				this.applyPrefixPostfix(field);
			}
		}, this);
	},
	
	applyPrefixPostfix: function(field){
		if(field.defaultName == null){
			field.defaultName = field.name;
		}

		var newName = field.defaultName;
		if(this.fieldPrefix.toString().length){
			newName = this.fieldPrefix + "-" + newName;
		}
		if(this.fieldPostfix.toString().length){
			newName += "-" + this.fieldPostfix;
		}

		field.name = newName;
	},
	
	useDefaultNames: function(){
		this.getForm().getFields().each(function(field){
			if(field.name != null && field.name.length){
				if(field.defaultName != null){
					field.name = field.defaultName;
				}
			}
		}, this);
	},
	
	usePrefixPostfixNames: function(){
		this.setFieldPrefix(this.fieldPrefix);
		this.setFieldPostfix(this.fieldPostfix);
	},
	
	setParams: function(object){
		Ext.apply(this.submitParams, object);
	},
	
	setParam: function(param, value){
		this.submitParams[param] = value;
	},
	
	getValues: function(){
		var values = this.getForm().getValues();
		Ext.apply(values, this.submitParams);
		return values;
	},
	
	setValues: function(values){
		if(!this.rendered){
			this.on('afterrender', function(form, options){
				this.setValues(values);
			}, this, { values: values});
			return;
		}
		this.useDefaultNames();
		this.getForm().setValues(values);
		this.usePrefixPostfixNames();
	},
	
	anyErrors: function(){
		var hasErrors = false;
		this.getForm().getFields().each(function(field){
			if(field.hasActiveError()){
				hasErrors = true;
			}
		}, this);
		
		return hasErrors;
	},
	
	submit: function(){
		if(this.rendered && this.getForm().isValid() && this.fireEvent('beforesubmit', this, this.submitParams) !== false){
			var values = this.getValues();
			Ext.apply(values, this.submitParams);
			this.getForm().submit({
				scope: this,
				url: this.url,
				params: values,
				success: function(form, action){
					this.fireEvent('success', form, action);
					this.fireEvent('submit', form, action);
				},
				failure: function(form, action){
					this.fireEvent('failure', form, action);
					this.fireEvent('submit', form, action);
					setTimeout(Ext.bind(function(errors){
						var errorsArray = [];
						for(var id in errors){
							errorsArray.push({
								id: id,
								msg: errors[id]
							});
						}
						this.getForm().markInvalid(errorsArray);
					}, this, [action.result.errors]));
				}
			});
		}
		else{
			this.fireEvent('cancelsubmit', this);
		}
	}
});