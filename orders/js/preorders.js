Ext.onReady(function(){
	return;
	// Quote Expiration
	Ext.create('TMS.preorders.forms.sections.Expiration', {
		renderTo: 'expiration-wrap',
		pre_order_id: Ext.get('pre_order_id').getValue()
	});

	// Customer information
	var customerInformationPanel = Ext.create('TMS.preorders.forms.sections.CustomerInformation', {
		renderTo:'customer-information-wrap',
		pre_order_id:Ext.get('pre_order_id').getValue(),
		loadByKey:'pre_order_id'
	});

	// Order details
	Ext.create('TMS.preorders.forms.sections.OrderDetails', {
		renderTo:'order-details-wrap',
		pre_order_id:Ext.get('pre_order_id').getValue()
	});

	//Modes and equipment
	var modesEquipment = Ext.create('TMS.contacts.forms.sections.ModesEquipment', {
		renderTo: 'modes-equipment-wrap'
	});

	// Charges
	var chargesPanel = Ext.create('TMS.preorders.forms.sections.Charge', {
		renderTo:'charge-wrap',
		pre_order_id:Ext.get('pre_order_id').getValue(),
		title:'Charges'
	});


	// Stops
	window.stopsContainer = Ext.create('TMS.orders.forms.sections.Stops', {
		renderTo: 'stops-wrap',
		pre_order_id: Ext.get('pre_order_id').getValue(),
		type:'preorder'
	});

	// Set up listeners
	customerInformationPanel.contactSelector.on('change', function(field, value) {
		if (isNaN(value)) {
			return;
		}
		else {
			modesEquipment.loadContact(value);
		}
	}, this);


	Ext.get('submit-button').on('click', function() {
		Ext.get('order-form-container').mask('Saving...');
		Ext.get('submit-button').hide();
		var submission = Ext.create('TMS.form.Submission', 'content_form', {
			removeSubmit:false,
			extraParams:{
				stops:Ext.encode(stopsContainer.getValues()),
				charges:Ext.encode(chargesPanel.getValues())
			}
		});
		submission.on('complete', function() {
			Ext.get('submit-button').show();
			Ext.get('order-form-container').unmask();
		});
		
		submission.on('success', function() {
			Ext.get('submit-button').hide();
			location.href = '/orders/?d=quotes';
		});
		
	});
	
	if (Ext.get('save-and-convert')) {
		Ext.get('save-and-convert').on('click', function() {
			Ext.get('order-form-container').mask('Saving...');
			Ext.get('save-and-convert').hide();
			var submission = Ext.create('TMS.form.Submission', 'content_form', {
				removeSubmit:false,
				extraParams:{
					stops:Ext.encode(stopsContainer.getValues()),
					charges:Ext.encode(chargesPanel.getValues()),
					doConvert:1
				}
			});
			submission.on('complete', function() {
				Ext.get('save-and-convert').show();
				Ext.get('order-form-container').unmask();
			});

			submission.on('success', function(form, response) {
				Ext.get('save-and-convert').hide();
				if (response.order_id) {
					location.href = '/orders/?d=orders&a=show&id=' + response.order_id;
				}
			});

		});
	}
});