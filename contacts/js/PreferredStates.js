//Map the database fields to this object
PreferredStatesFields = {
	Id: 'preferred_states_id',
	CarrierId: 'carrier_id',
	ContactId: 'contact_id',
	State: 'state',
	Origin: 'origin',
	CreatedBy: 'created_by_id',
	CreatedAt: 'created_at',
	UpdatedBy: 'updated_by_id',
	UpdatedAt: 'updated_at'
};
$('document').ready(function(){
//Create the preferred states object to store all data
PreferredStates = {
	
	//Config
	processingPage: '/contacts/process/PreferredStates.php',
	renderTo: 'preferred-lanes-render',
	originStateId: 'preferred-lanes-origin-state',
	originRenderId: 'preferred-lanes-origins',
	originEmptyText: "<div>Choose an origin from the select box...</div>",
	destinationStateId: 'preferred-lanes-destination-state',
	destinationRenderId: 'preferred-lanes-destinations',
	destinationEmptyText: "<div>Choose a destination from the select box...</div>",
	carrierId: 'carrier-id',
	carrierContactsId: 'carrier-contacts',
	contactId: 0,
	
	//Elements
	el: null,
	originState: null,
	destinationState: null,
	originEl: null,
	destinationEl: null,
	carrierContactsEl: null,
	loadingIndicatorEl: null,
	
	//Objects/Arrays
	originMap: {},
	destinationMap: {},
	contactMethodsMap: {},
	
	//Init Functions
	init: function(){
		
		//Init the main container element
		this.initEl();
		
		//Init the state drop down boxes
		this.initOriginState();
		this.initDestinationState();
		
		//Init the origin and destination containers
		this.initOriginEl();
		this.initDestinationEl();
		
		//Init the contacts select box
		this.initCarrierContacts();
		
		//Init the loading indicator, to show when a contacts states are loading
		this.initLoadingIndicator();
		
		//Load the current origins and destinations
		this.load();
	},
	
	initEl: function(){
		this.el = $("#" + this.renderTo);
	},
	
	initOriginState: function(){
		this.originState = $("#" + this.originStateId);
		this.originState.combobox({
			emptyText: 'Choose State...',
			selected: $.proxy(this.addOrigin, this)
		});
	},
	
	initDestinationState: function(){
		this.destinationState = $("#" + this.destinationStateId);
		this.destinationState.combobox({
			emptyText: 'Choose State...',
			selected: $.proxy(this.addDestination, this)
		});
		
	},
	
	initOriginEl: function(){
		this.originEl = $("#" + this.originRenderId);
		
		//Add an empty message
		this.originEl.append(this.originEmptyText);
	},
	
	initDestinationEl: function(){
		this.destinationEl = $("#" + this.destinationRenderId);
		
		//Add an empty message
		this.destinationEl.append(this.destinationEmptyText);
	},
	
	initLoadingIndicator: function(){
		this.loadingIndicatorEl = $('<div class="preferred-states-loading"></div>');
		this.carrierContactsEl.parent().prepend(this.loadingIndicatorEl);
		this.loadingIndicatorEl.hide();
	},
	
	initCarrierContacts: function(){
		this.carrierContactsEl = $("#" + this.carrierContactsId);
		this.carrierContactsEl.combobox({
			emptyText: 'Search Contacts...',
			selected: $.proxy(this.setContact, this)
		});
		var obj = this;
		$('.contact_link').click(function(){
			if($(this).attr('rel') != obj.contactId){
				obj.contactId = $(this).attr('rel');
				obj.load();
				obj.el.slideDown();
			}
			return false;
		});
		$('#update_contact_methods a').click(function(){
			obj.update_contact_methods();
			return false;
		});
		$('.new_empty_row .new_empty_contact_method_data').live('keyup', function(){
			if($(this).val().length > 6){
				$(this).parent().removeClass('new_empty_row');
				$(this).parent().addClass('new_created_row');
				obj.addContactMethodField();
			}
		});
		$('.new_created_row input').live('blur', function(){
			if($(this).val().length == 0)
				$(this).parent().remove();
		});
		$('.remove_method_type').live('click', function(){
			if($(this).parent().parent().children('.contact_method_container').length == 1)
				$(this).parent().parent().parent().hide();
			$(this).parent().remove();
			obj.update_contact_methods();
		});
		$('.modes').change(function(){
			var modeTypeId = $(this).val();
			var okToAdd = true;
			if(modeTypeId == '')
				return false;
			$('.mode_item .type_id').each(function(){
				if($(this).val() == modeTypeId){
					alert('You cannot add a Mode that is already added.');
					okToAdd = false;
					return false;
				}
			});
			if(okToAdd)
				obj.addModeField(this);
			$('select.modes').val('').attr('selected', true);
		});
		$('.equipments').change(function(){
			var equipTypeId = $(this).val();
			var okToAdd = true;
			if(equipTypeId == '')
				return false;
			$('.equipment_item .type_id').each(function(){
				if($(this).val() == equipTypeId){
					alert('You cannot add an Equipment that is already added.');
					okToAdd = false;
					return false;
				}
			});
			if(okToAdd){
				obj.addEquipmentField(this);
				$('#equip_help_container').show();
			}
			$('select.equipments').val('').attr('selected', true);
		});
		$('.remove_mode_equipment').live('click', function(){
			obj.editModeEquipment('delete', $(this).parent().parent());
		});
		$('.equipment_qty').live('keyup', function(e){
			if(e.keyCode == 13){ // Up arrow
				obj.editModeEquipment('update', $(this).parent());
				$(this).blur();
			}
			return false;
		});
	},
	
	//Action Functions
	addModeField: function(obj){
		insertHTML = 	'<div class="mode_item">'+
							'<input class="type" type="hidden" value="mode"/>'+
							'<input class="type_id" type="hidden" value="'+$(obj).val()+'"/>'+
							'<input class="carrier_mode_id" type="hidden" value="0"/>'+
							'<span class="name">'+$(".modes option:selected").text()+'</span>'+
							'<span class="mode_delete"><img class="remove_mode_equipment x-img" src="/resources/silk_icons/cross.png" alt="delete"/></span>'+
						'</div>';
		$('#mode_list').append(insertHTML);
		this.editModeEquipment('add', insertHTML);
	},
	
	addEquipmentField: function(obj){
		var equip_name = $(".equipments option:selected").text();
		var qty = 'a';
		while((qty != null && isNaN(qty)) || qty == '')
			qty = prompt('How many '+equip_name+' are there?');
		if(qty != null && !isNaN(qty)){
			insertHTML = 	'<div class="equipment_item">'+
								'<input class="type" type="hidden" value="equipment"/>'+
								'<input class="type_id" type="hidden" value="'+$(obj).val()+'"/>'+
								'<span class="name">'+equip_name+'</span>'+
								'<input class="equipment_qty" type="text" value="'+qty+'" size="3"/>'+
								'<span class="equipment_delete"><img class="remove_mode_equipment x-img" src="/resources/silk_icons/cross.png" alt="delete"/></span>'+
							'</div>';
			$('#equipment_list').append(insertHTML);
			this.editModeEquipment('add', insertHTML);
		}
	},
	
	addContactMethodField: function(){
		if(!$('.new_empty_row').length){
			$('#add_new_contact_method_form').append($('#contact_method_type_template').html());
			$('#add_new_contact_method_form .contact_method_row_template').addClass('new_empty_row');
			$('#add_new_contact_method_form .new_empty_row').removeClass('contact_method_row_template');
		}
	},
	
	editModeEquipment: function(add_delete, obj){
		var carrierId = $('#' + this.carrierId).val();
		var mode_equipment = $(obj).children('.type').val();
		var type = add_delete+'-'+mode_equipment;
		var type_id = $(obj).children('.type_id').val();
		var carrierModeId = $(obj).children('.carrier_mode_id').val(); // only relevant to modes
		var qty = $(obj).children('.equipment_qty').val(); // only relevant to equipment

		$.ajax({
			url: this.processingPage,
			context: this,
			dataType: 'json',
			type: 'post',
			data: {
				action: type,
				carrierId: carrierId,
				typeId: type_id,
				modeId: carrierModeId,
				qty: qty
			},
			success: function(data){
				if(add_delete == 'delete'){
					$(obj).remove();
					if($('#equipment_list .equipment_item').length == 0)
					$('#equip_help_container').hide();
				}else if(add_delete == 'add' & mode_equipment == 'mode'){
					$('.mode_item input.type_id[value="'+type_id+'"]').siblings('.carrier_mode_id').val(data.id);
				}
			},
			error: function(xhr, reason){
				alert('I failed: '+reason+'  '+xhr.responseText);
				$(obj).remove();
			}
		});
	},
	
	addOrigin: function(event, data){
		var text = data.item.text;
		var value = data.item.value;
		if(!value.length || !this.contactId){
			return false;
		}
		
		//Add to map
		this.originMap[value] = text;
		
		//Render the origins
		this.renderOrigins();
		
		//Save the data
		this.save();
	},
	
	addDestination: function(event, data){
		var text = data.item.text;
		var value = data.item.value;
		if(!value.length || !this.contactId){
			return false;
		}
		
		//Add to map
		this.destinationMap[value] = text;
		
		//Render the destinations
		this.renderDestinations();
		
		//Save the data
		this.save();
	},
	
	renderOrigins: function(){
		//Empty the current items then redraw them
		this.originEl.empty();
		
		$.each(this.originMap, $.proxy(function(key, value) { 
			//Append this state the the origin list
			var el = this.generateStateElement(this.originEl, value);
			
			//Add a click listener to the delete icon
			el.children('.delete').click({ key: key, el: el}, $.proxy(function(event){
				delete this.originMap[event.data.key];
				el.fadeOut(500, $.proxy(function(el){
					$(el).remove();
					this.renderOrigins();
				}, this));
				this.save();
			}, this));
			
		}, this));
		
		//Check for an empty selection and add empty text
		if(!this.originEl.children().size()){
			this.originEl.append(this.originEmptyText);
		}
	},
	
	renderDestinations: function(){
		//Empty the current items then redraw them
		this.destinationEl.empty();
		
		$.each(this.destinationMap, $.proxy(function(key, value) { 
			//Append this state the the origin list
			var el = this.generateStateElement(this.destinationEl, value);
			
			//Add a click listener to the delete icon
			el.children('.delete').click({ key: key, el: el}, $.proxy(function(event){
				delete this.destinationMap[event.data.key];
				el.fadeOut(500, $.proxy(function(el){
					$(el).remove();
					this.renderDestinations();
				}, this));
				this.save();
			}, this));
			
		}, this));
		
		//Check for an empty selection and add empty text
		if(!this.destinationEl.children().size()){
			this.destinationEl.append(this.destinationEmptyText);
		}
	},
	
	generateStateElement: function(element, key){
		var el = $(
			"<div class=\"preferred-lanes-state-item\">" +
				"<span class=\"state\">" + key + "</span>" + 
				"<div class=\"delete\" style=\"float: right; display: inline;\">" +
					"<img src=\"/resources/silk_icons/cross.png\"/>" +
				"</div>" +
				"<div style=\"clear: both;\"></div>" +
			"</div>"
		);
		element.append(el);
		return el;
	},
	
	setContact: function(event, data){
		contactId = data.item.value;
		if(contactId != this.contactId){
			this.contactId = contactId;
			this.load();
			this.el.slideDown();
		}
	},
	
	// update the contact methods
	populate_contact_methods: function(methods){
		$('.contact_method_row .contact_method_type').html('');
		$('.contact_method_row').css('background-color', '#FFF');
		$.each(methods, $.proxy(function(index, record){
			var insertHTML = '<div class="contact_method_container"><input class="contact_method '+record.group+'" type="text" rel="'+record.method_type_id+'-'+record.method_index+'" name="method_5[]" value="'+record.value_1+'"/> <img class="remove_method_type" src="/resources/silk_icons/cross.png" alt="delete"/></div>';
			$('#contact_method_type_'+record.method_type_id).append(insertHTML);
			$('#contact_method_row_'+record.method_type_id).show();
			loop_count++;
		}, this));
		var loop_count = 0;
		$('.contact_method_row').each(function(index){
			if($(this).css('display') != 'none'){
				if( loop_count % 2 == 1 )
					$(this).css('background-color', '#EEE');
				loop_count++;
			}
		});
		$('#view_contact_link a').attr('href', '/contacts/?d=contacts&a=view&id='+this.contactId);
		$('.contact_list_item').css("background-color", "#FFF");
		$('#contact_link_'+this.contactId).css('background-color', '#FEFE99');
		$('.new_created_row').remove();
		$('.new_empty_row input').val('');
		$('#edit_controls').show();
	},
	
	//Load the states that are already associated with this carrier
	load: function(){
		if(!this.contactId){
			return false;
		}
		
		//Show the loading indicator
		this.loadingIndicatorEl.show();
		$('.contact_method').val('');
		
		//Load the data
		$.ajax({
			url: this.processingPage,
			context: this,
			dataType: 'json',
			type: 'post',
			data: {
				action: 'get-states',
				contactId: this.contactId,
				carrierId: $('#' + this.carrierId).val()
			},
			success: function(response){
				if(response.good){
					//Reset the maps
					this.originMap = {};
					this.destinationMap = {};
					this.contactMethodsMap = {};
					
					//Remap the records
					$.each(response.records, $.proxy(function(index, record){
						var state =  record[PreferredStatesFields.State];
						var text = this.destinationState.children("option[value=" + state + "]").html();
						if(parseInt(record[PreferredStatesFields.Origin])){
							this.originMap[state] = text;
						}
						else{
							this.destinationMap[state] = text;
						}
					}, this));
					this.renderOrigins();
					this.renderDestinations();
					
					//Hide the loading indicator
					this.loadingIndicatorEl.hide();
					$('.contact_method_row').hide();
					// populate the contact methods
					this.populate_contact_methods(response.contact_methods);
				}
				else{
					//TODO: handle error
				}
			}
		});
	},
	
	//Save the states of this carrier
	save: function(){
		//Turn origins and destinations into arrays
		var origins = [];
		var destinations = [];
		$.each(this.originMap, function(key, value){
			origins.push(key);
		});
		$.each(this.destinationMap, function(key, value){
			destinations.push(key);
		});
		
		//Send the information to the processing page for saving
		$.ajax({
			url: this.processingPage,
			context: this,
			dataType: 'json',
			type: 'post',
			data: {
				action: 'save-states',
				contactId: this.contactId,
				carrierId: $('#' + this.carrierId).val(),
				'origins[]': origins,
				'destinations[]': destinations
			},
			success: function(){
				
			}
		});
	},
	
	// update the contact's contact_methods
	update_contact_methods: function(){
		var existing = [];
		$.each($('#contact_info_form').find('.contact_method'), function(){
			var key = $(this).attr('rel');
			var value = $(this).val();
			value = value.replace(/ /g, '');
			if(value.length  > 0){
				var arr = new Array(key, value);
				existing.push(arr);
			}
		});
		var created = [];
		$.each($('#add_new_contact_method_form .new_row'), function(){
			var key = $(this).children('select').val();
			var value = $(this).children('input').val();
			value = value.replace(/ /g, '');
			if(value.length > 0){
				var arr = new Array(key, value);
				created.push(arr);
			}
		});

		// Send the information to the processing page for updating
		$.ajax({
			url: this.processingPage,
			context: this,
			dataType: 'json',
			type: 'post',
			data: {
				action: 'update-contact-methods',
				contactId: this.contactId,
				'existing[]': existing,
				'created[]': created
			},
			success: function(d){
				this.populate_contact_methods(d.methods);
			},
			error: function(xhr,reason){
				alert('I failed '+reason+'  '+xhr.responseText);
			}
		});
	}
};

//Init the preferred states
PreferredStates.init();
});