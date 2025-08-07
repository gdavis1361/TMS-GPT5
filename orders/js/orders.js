Ext.onReady(function(){
	Ext.create('TMS.orders.forms.sections.CustomerInformation', {
		renderTo:'customer-information-wrap',
		order_id:Ext.get('order_id').getValue()
	});
	
	Ext.create('TMS.orders.forms.sections.OrderDetails', {
		renderTo:'order-details-wrap',
		order_id:Ext.get('order_id').getValue(),
		autoSave:true
	});
	
	window.stopsContainer = Ext.create('TMS.orders.forms.sections.Stops', {
		renderTo: 'stops-render',
		order_id: Ext.get('order_id').dom.value
	});
	
	Ext.create('TMS.orders.forms.sections.Goods',{
		renderTo: 'goods-render',
		order_id: Ext.get('order_id').dom.value
	});
});


/*** posts js ***/
$(document).ready(function(){
	$('.expand_post_details').click(function(){
		if($(this).hasClass('expanded')){
			$(this).removeClass('expanded');
			$(this).parents('tr').next().fadeOut()
		}else{
			$(this).addClass('expanded');
			$(this).parents('tr').next().fadeIn();
		}
		return false;
	});
	
	
	
	$('.carrier_search_tool').live('click', function() {
		window.carrierSearch = Ext.create('TMS.orders.forms.sections.Carrier', {
			//renderTo: 'contact-search',
			width: 950,
			order_id: $(this).attr('order_id')
		});
		
		window.win = Ext.create('Ext.window.Window', {
			title: 'Carrier Search',
			order_id: $(this).attr('order_id'),
			modal: true,
			width: 950,
			layout: 'fit',
			items: [window.carrierSearch],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'bottom',
				items: [{ 
					xtype: 'button', 
					text: 'Save',
					handler: function(){
						data = {
							carrier_id: window.carrierSearch.carrier_search.getValue(),
							contact_id: window.carrierSearch.contactLookup.getValue(),
							equipment_id: window.carrierSearch.usedEquip.getValue(),
							order_id: window.win.order_id,
							action: 'carrier'
						};
						Ext.Ajax.request({
							url: '/orders/loads.php',
							params: data,
							success: function(response){
								window.win.hide();
								window.location.reload();
							}
						});
					}
				}]
			}]
		}).show();
		return false;
	});
});

// This js code was at the bottom of the page
Ext.onReady(function() {
	Ext.get('submit-button').on('click', function() {
		Ext.get('order-form-container').mask('Saving...');
		Ext.get('submit-button').hide();
		var submission = Ext.create('TMS.form.Submission', 'content_form', {
			removeSubmit:false,
			extraParams:{
				stops:Ext.encode(stopsContainer.getValues()),
				revenue:Ext.encode(revenuePanel.getValues())
			}
		});
		
		submission.on('complete', function(form, response) {
			Ext.get('submit-button').show();
			Ext.get('order-form-container').unmask();
		});
		
		submission.on('success', function() {
			Ext.get('order-form-container').unmask();
			location.href = '/orders/';
		});
	});
	
	Ext.get('rate-confirmation-button').on('click', function(e, el) {
		e.preventDefault();
		Ext.get('submit-button').hide();
		Ext.get('order-form-container').mask('Saving...');
		var submission = Ext.create('TMS.form.Submission', 'content_form', {
			removeSubmit:false,
			extraParams:{
				stops:Ext.encode(stopsContainer.getValues()),
				revenue:Ext.encode(revenuePanel.getValues())
			}
		});
		submission.on('complete', function() {
			Ext.get('submit-button').show();
			Ext.get('order-form-container').unmask();
			
			Ext.create('TMS.orders.rateconfirmation.Preview', {
				order_id:Ext.get('order_id').getValue()
			})
		})
	});
	
	//Carrier Search
	/*var carrier_search = Ext.create('TMS.carrier.lookup.Carrier', {
		renderTo: 'carrier-search-field',
		width: 320
	});
	*/
   
   // edit

	var modesEquipment = Ext.create('TMS.contacts.forms.sections.ModesEquipment', {
		renderTo: 'modes-equipment-render',
		modeIds: Ext.get('modeIds').getValue().split(','),
		equipmentIds: Ext.get('equipmentIds').getValue().split(',')
	});

//		Ext.get('ordered_by_id').on('change', function(e, field) {
//			var contact_id = field.value;
//			modesEquipment.loadContact(contact_id);
//		});

	var carrier_search = Ext.create('TMS.orders.forms.sections.Carrier', {
		renderTo: 'carrier-search-field',
		width: 950,
		order_id: Ext.get('order_id').getValue()
	});

	modesEquipment.equipmentAllowed.on('change', function(field, records) {
		var numRecords = records.length;
		var data = [];

		for (var i = 0; i < numRecords; i++) {
			var r = modesEquipment.equipmentAllowed.store.getAt( modesEquipment.equipmentAllowed.store.find('CarrEquipId', records[i] ) );
		//	data.push([records[i], r.data.CarrEquipDesc]);
		}

	//	carrier_search.makeNewStore(data);

	}, this);

	var documentGrid = Ext.create('TMS.documents.view.Interface', {
		renderTo:'documents-wrap',
		collapsed:true,
		extraParams:{
			order_id:Ext.get('order_id').getValue()
		}
	})

	//Customer search
	Ext.create('TMS.comment.forms.sections.Comments', {
		renderTo:'order-comments-wrap',
		field_value:Ext.get('order_id').getValue(),
		type:'order',
		collapsed:true
	});
	
	// Revenue section
	window.revenuePanel = Ext.create('TMS.orders.forms.sections.Revenue', {
		renderTo:'revenue-wrap',
		order_id:Ext.get('order_id').getValue()
	})
});