Ext.define('TMS.form.Submission', {
	extend:'Ext.util.Observable',
	processingPage:'/at-ajax/modules/task/process/',
	
	redirect:true,
	removeSubmit:true,
	timeoutSeconds:30,
	callback:function() {},
	scrollToMessage:false,
	autoSubmit:true,
	extraParams:{},
	invalidCls:'form-invalid',
	
	constructor: function(formId, config) {
		Ext.apply(this, config);
		this.form = Ext.get(formId);
		this.addEvents('success', 'failure', 'complete');
		this.submitButton = this.form.down('input[type=submit]');
		
		if (this.autoSubmit) {
			this.submit();
		}
		
		return this;
	},
	
	submit: function() {
		this.submitButton.focus();
		this.messageDiv = this.form.down('.message');
		this.form.select('.' + this.invalidCls).removeCls(this.invalidCls);
		if (this.messageDiv == null) {
			this.messageDiv = Ext.get(document.createElement('div')).appendTo(this.submitButton.parent()).addCls('message');
		}
		this.messageDiv.dom.innerHTML = '<span class="loadingSpinner"></span><span class="messageText">Submitting...</span>';
		this.messageText = this.messageDiv.down('.messageText');
				
		this.statusTimeout = setTimeout(Ext.Function.bind(function() {
			this.messageText.dom.innerHTML += 'Still working...';
		}, this), 10000);
		this.unlockTimeout = setTimeout(Ext.Function.bind(function() {
			this.messageDiv.dom.innerHTML = 'There was a problem processing your request. Please wait a few minutes and try submitting again.';
			if (this.request.abort) {
				this.request.abort();
			}
			this.enableForm();
		}, this), this.timeoutSeconds * 1000);
		this.request = Ext.Ajax.request({
			form:this.form,
			params:Ext.urlEncode(this.extraParams),
			success:this.complete,
			scope:this
		});
		this.disableForm();
	},
	
	complete: function(r) {
		var response = Ext.decode(r.responseText);
		this.submitButton.focus();
		this.messageDiv.removeCls('form-errors');
		this.messageDiv.removeCls('form-messages');
		if (response.success) {
			this.messageDiv.addCls('form-messages');
			this.messageDiv.update(response.msg);
			
			this.fireEvent('success', this, response);
			
			if (this.removeSubmit) {
				this.form.select('input[type=submit]').remove();
			}
			if (response.redirect && this.redirect) {
				location.href = response.redirect;
			}
		}
		else {
			this.messageDiv.addCls('form-errors');
			var field;
			var errorMessages = '<ul>';
			for(var i in response.errors) {
				errorMessages += '<li>' + response.errors[i] + '</li>';
				if (this.form.dom[i]) {
					field = Ext.get(this.form.dom[i]);
					if (field) {
						field.addCls(this.invalidCls);
					}
				}
			}
			errorMessages += '</ul>';
			this.fireEvent('failure', this, response);
			this.messageDiv.dom.innerHTML = errorMessages;
		}
		this.fireEvent('complete', this, response);
		
		if (this.scrollToMessage) {
			Ext.get(this.messageDiv).scrollIntoView();
			Ext.get(this.messageDiv).frame();
		}
		else {
			var messageFocus = Ext.get(Ext.core.DomHelper.append(this.messageDiv, {
				tag: 'input',
				type: 'text'
			}));
			messageFocus.focus();
			messageFocus.remove();
		}
		
		this.enableForm();
		clearTimeout(this.statusTimeout);
		clearTimeout(this.unlockTimeout);
	},
	
	enableForm: function() {
		this.form.select(TMS.form.itemTypes).each(function(el) {
			el.dom.disabled = false;
		});
	},
	
	disableForm: function() {
		this.form.select(TMS.form.itemTypes).each(function(el) {
			el.dom.disabled = true;
		});
	}
	
});

Ext.ns('TMS.form');
TMS.form.itemTypes = 'input,button,select,textarea';
TMS.form.focus = function(id) {
	var item = Ext.get(id);
	if (item) {
		item.focus();
		item.frame();
	}
};
TMS.form.enable = function(form) {
	Ext.get(form).select(TMS.form.itemTypes).each(function(el) {
		el.dom.disabled = false;
	});
};
TMS.form.disable = function(form) {
	Ext.get(form).select(TMS.form.itemTypes).each(function(el) {
		el.dom.disabled = true;
	});
};
