<?php

/**
 * Description of ProcessController
 *
 * @author wesokes
 */
class Contact_ProcessController extends AjaxController {

	public function addAction() {
		///////////////////////////////////////////////////////////////////////////////////////////
		//	Get user information
		///////////////////////////////////////////////////////////////////////////////////////////
		
		//Get user info
		$myUser = UserBase::getMyUser();
		$myUserRole = $myUser->get('role_id');
		
		//Save the post
		$this->setParam('post', $_POST);
		
		//Get the general information
		$sName = request('contact_name', '');
		$aParts = explode_name($sName);
		$sFirstName = $aParts['first_name'];
		$sMiddleName = $aParts['middle_name'];
		$sLastName = $aParts['last_name'];
		$sPreferredName = $aParts['preferred_name'];

		$sTitle = request('contact_title', '');
		$nContactTypeId = intval(request('contact_type_id'));

		// Contact Method Data
		$aContactMethodType = json_decode(request('contact_method_types', '[]'), true);
		$aContactMethodData = json_decode(request('contact_method_data', '[]'), true);

		// Location data
		$nLocationId = intval(request('location_id', 0));
		$nContactPriorityId = request('contact_priority_id');

		// Location Customer Data
		$nIndustryId = request('industry_id', '');
		$nIsCustomer = request('is_customer', 0);

		$nUserId = get_user_id();

		// Validate all submitted data before creating new records
		if (!$nContactTypeId) {
			$this->addError('Please select a Contact Type', 'contact_type_id');
		}
		if (!strlen(trim($sName))) {
			$this->addError('Please enter a name for this contact', 'contact_name');
		}
		if (count($aContactMethodType) <= 1 || !strlen(trim($aContactMethodData[0]))) {
			$this->addError('Please enter at least one Contact Method');
		}
		$nCallInterval = intval(request('call_interval', 0));
		$nEmailInterval = intval(request('email_interval', 0));
		$nVisitInterval = intval(request('visit_interval', 0));
		$nContactStatusId = intval(request('status_id', 0));
		
		//If there are already errors return
		if($this->anyErrors()){
			return;
		}
		
		
		///////////////////////////////////////////////////////////////////////////////////////////
		//	Check to make sure the user has permissions to save/create this customer type
		//////////////////////////////////////////////////////////////////////////////////////////
		if ($myUserRole == UserRoles::Admin || $myUserRole == UserRoles::CreditAndCollections) {
			$contactTypes[] = ContactTypes::BillTo;
		}
		if ($myUserRole == UserRoles::Admin || $myUserRole == UserRoles::CarrierPayables) {
			$contactTypes[] = ContactTypes::PayTo;
		}
		if ($myUserRole == UserRoles::Admin || $myUserRole == UserRoles::Broker || $myUserRole == UserRoles::PodLoader) {
			$contactTypes[] = ContactTypes::Carrier;
			$contactTypes[] = ContactTypes::Customer;
		}
		
		//Check for a carrier and customer
		if($nContactTypeId == ContactTypes::Carrier || $nContactTypeId == ContactTypes::Customer){
			if ($myUserRole != UserRoles::Admin && $myUserRole != UserRoles::Broker && $myUserRole != UserRoles::PodLoader) {
				$this->addError("You do not have permission to add this type of customer.");
			}
		}
		
		//Check for a pay to
		if($nContactTypeId == ContactTypes::PayTo){
			if ($myUserRole != UserRoles::Admin && $myUserRole != UserRoles::CarrierPayables) {
				$this->addError("You do not have permission to add this type of customer.");
			}
		}
		
		//Check for a bill to
		if($nContactTypeId == ContactTypes::BillTo){
			if ($myUserRole != UserRoles::Admin && $myUserRole != UserRoles::CreditAndCollections) {
				$this->addError("You do not have permission to add this type of customer.");
			}
		}
		
		//if there are arrors return
		if($this->anyErrors()){
			return;
		}
		
		
		///////////////////////////////////////////////////////////////////////////////////////////
		//	Make sure there is a location if customer is warm or hot
		//////////////////////////////////////////////////////////////////////////////////////////
		if (!$nLocationId && $nContactTypeId == ContactTypes::Customer) {
			// Check if contact is a customer and cold
			if ($nContactTypeId == ContactTypes::Customer && $nContactStatusId == ContactCustomerDetail::Cold) {
				// This is ok
			}
			else {
				// Require the location
				$this->addError('Please assign a company and location', 'location_id');
			}
		}

		// if not customer, set these to 0
		if ($nContactTypeId != ContactTypes::Customer) {
			$nCallInterval = 0;
			$nEmailInterval = 0;
			$nVisitInterval = 0;
			$nContactStatusId = 0;
		}

		// Check Status if contact is customer
		if ($nContactTypeId == ContactTypes::Customer) {

			// Require a status
			if (!$nContactStatusId) {
				$this->addError('Please select a Status for this Customer', 'status_id');
			}

			// Validate contact method types
			$phoneTypes = array(1, 2, 4);
			$emailTypes = array(5);
			$hasEmail = false;
			$hasPhone = false;

			// Check contact methods - ignore last index because there is always and extra
			for ($i = 0; $i < count($aContactMethodType) - 1; $i++) {

				// Check if email
				if (in_array($aContactMethodType[$i], $emailTypes)) {
					$hasEmail = true;
					// regex was taken from a jquery functions file and modified to allow a + in the email address because that is allowed
					if (!preg_match('/^([A-Za-z0-9_\-\.\+])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/', $aContactMethodData[$i])) {
						$this->addError('You have entered an invalid email');
					}
				}

				// Check if phone number
				if (in_array($aContactMethodType[$i], $phoneTypes)) {
					$hasPhone = true;

					// regex was taken from a jquery functions file
					if (!(strlen($aContactMethodData[$i]) > 6 && preg_match('/^([\+][0-9]{1,3}([ \.\-])?)?(([\(]{1})?[0-9]{3}[\)])?([0-9A-Z \.\-]{1,32})((x|ext|extension)?( )?[0-9]{1,4}?)$/', $aContactMethodData[$i]))) {
						$this->addError('You have entered an invalid phone number', "contact_method_type[]");
					}
				}
			}

			// If there is an email interval, there must be an email address
			if ($nEmailInterval && !$hasEmail) {
				$this->addError('If you have an email interval, then you must have a valid email');
			}

			// If there is a phone interval, there must be a number
			if ($nCallInterval && !$hasPhone) {
				$this->addError('If you have a call interval, then you must have a valid phone number');
			}
		}
		
		//Return if any errors
		if($this->anyErrors()){
			return;
		}

		
		///////////////////////////////////////////////////////////////////////////////////////////
		//	If there are not any errors process everything
		//////////////////////////////////////////////////////////////////////////////////////////
		if (!$this->anyErrors()) {

			// Create new Contact Base
			$oContact = new ContactBase();
			$oContact->create($nContactTypeId, $sFirstName, $sLastName, $sMiddleName, $sPreferredName, $sTitle, $nUserId);

			// Retrieve ContactId for later use. 
			$nContactId = $oContact->get_Contact_Id();

			// Insert each contact method
			foreach ($aContactMethodType as $key => $nMethodTypeId) {
				if (!empty($aContactMethodData[$key])) {
					$oContact->add_ContactMethod($nMethodTypeId, $aContactMethodData[$key], null, $nUserId);
				}
			}

			// Add Customer Details to the Contact.
			$oCustomerDetail = new ContactCustomerDetail();
			$oCustomerDetail->checkTasks = false;
			$oCustomerDetail->create($nContactId, $nContactStatusId, 0, $nCallInterval, $nEmailInterval, $nVisitInterval, $nUserId);

			// Associate a Location to the Contact
			if ($nLocationId) {
				$oLocationToContact = new LocationToContact();
				$oLocationToContact->create($nLocationId, $nContactId, $nContactPriorityId, $nUserId);
			}

			// set the contact to be owned by the user who created it
			$oContactOwners = new ContactOwners();
			$oContactOwners->create($nContactId, $nUserId, time(), 1, $nUserId);

			// get the customer information for this contact's location
			$query = "SELECT customer_id FROM customer_to_location WHERE location_id = $nLocationId";
			$row = LP_Db::fetchRow($query);
			$customerId = 0;
			if ($row) {
				$customerId = $row['customer_id'];
			}
			$customer = new CustomerBase();
			$customer->load($customerId);

			// handle documents required for bill to contacts
			if ($nContactTypeId == ContactTypes::BillTo) {
				$documentTypeIds = post('document_type_ids', array());
				$documentTypeQuantities = post('document_type_quantities', array());
				$customer = new CustomerBase();
				$customer->load($customerId);
				if ($customerId) {
					$newDocuments = array();
					for ($i = 0; $i < count($documentTypeIds) - 1; $i++) {
						$typeId = intval($documentTypeIds[$i]);
						$quantity = intval($documentTypeQuantities[$i]);
						$newDocuments[] = array(
							'document_type_id' => $typeId,
							'quantity' => $quantity
						);
					}
					$customer->updateDocumentsRequired($newDocuments);
				}
			}

			// Check for tasks related to the contact
			$oContact->checkTasks();

			//Update session contact lists to reflect new contact.
			$userEmployee = new UserEmployees();
			$userEmployee->load(get_user_id());
			$userEmployee->update_contact_scope();

			$nId = $nContactId;

			$this->addMessage('Contact has been added. You will be redirected to the contact page.');
			$this->setRedirect("/contacts?d=contacts&a=view&id=$nId");
		}
	}

	public function companySearchAction() {
		$aReturn = array();
		$sQuery = request('q');

		/**
		 * Search Type:
		 * 2 - Customer 
		 * 3 - Carrier
		 */
		$nCarrierType = 3;
		$nCustomerType = 2;
		$nType = request('type', 2);

		$sQuery = trim(preg_replace("/[^0-9A-Za-z]/", " ", $sQuery));
		$aQuery = explode(' ', $sQuery);

		//query and type can't be zero or empty...
		if (empty($aQuery) || empty($nType)) {
			$this->setParam('records', $aReturn); //empty json array
			return;
		}


		//Things a user might try to search by:
		$aZips = array();
		$aStates = array();
		$aWords = array();
		$aNumbers = array();

		//see if any part of the query might be in a word group
		foreach ($aQuery as $word) {
			if (strlen($word) < 2) {
				continue; //smallest word size: 2
			}

			if (strlen($word) == 5 && is_numeric($word)) {
				$aZips[] = $word;
			}
			if (strlen($word) == 2 && !is_numeric($word)) {
				$aStates[] = $word;
			}
			if (is_numeric($word)) {
				$aNumbers[] = $word;
			}

			// Everything goes to Words array. (except words under 2 characters)
			$aWords[] = $word; //mkay
		}

		if ($nType == $nCustomerType) {
			// Array for sql conditions
			$aWhere = array();
			$aWordColumns = array('customer.customer_name', 'location.location_name_1',
				'location.location_name_2', 'location.address_1',
				'location.address_2', 'location.address_3', 'location.location_abbr',
				'info.City', 'can.City');
			$aNumberColumns = array('customer.industry_id');
			$aStateColumns = array('info.State', 'can.State');
			foreach ($aWords as $word) {
				foreach ($aWordColumns as $column) {
					$aWhere[] = $column . " LIKE '%" . $word . "%'";
				}
			}
			foreach ($aNumbers as $number) {
				foreach ($aNumberColumns as $column) {
					$aWhere[] = $column . " = '" . $number . "'";
				}
			}
			foreach ($aStates as $state) {
				foreach ($aStateColumns as $column) {
					$aWhere[] = $column . " = '" . $state . "'";
				}
			}
			foreach ($aZips as $zip) {
				$aWhere[] = "location.zip = '" . $zip . "'";
			}

			$where = '';
			if (count($aWhere)) {
				$where = ' WHERE ' . implode(' OR ', $aWhere);
			}

			$s = "
				SELECT 
					customer.customer_name as name, customer.customer_id
				FROM 
					tms.dbo.customer_base customer
					LEFT JOIN tms.dbo.customer_to_location c2l ON c2l.customer_id = customer.customer_id
					LEFT JOIN tms.dbo.location_base location ON location.location_id = c2l.location_id
					LEFT JOIN ContractManager.dbo.ZipsPostalCodesUS info ON (info.Zip = location.zip AND info.Seq = location.seq)
					LEFT JOIN ContractManager.dbo.ZipsPostalCodesCAN can ON (can.Zip = location.zip AND can.Seq = location.seq)
				$where
				GROUP BY 
					customer.customer_name, customer.customer_id";
		}
		else if ($nType == $nCarrierType) {
			$aWhere = array();

			$aWordColumns = array('carrier.CarrSCAC', 'carrier.CarrName', 'info.City', 'can.City');

			$aNumberColumns = array('ex.mc_no');
			$aStateColumns = array('can.State', 'info.State');

			foreach ($aWords as $word) {
				foreach ($aWordColumns as $column) {
					$aWhere[] = $column . " LIKE '%" . $word . "%'";
				}
			}
			foreach ($aNumbers as $number) {
				foreach ($aNumberColumns as $column) {
					$aWhere[] = $column . " = '" . $number . "'";
				}
			}
			foreach ($aStates as $state) {
				foreach ($aStateColumns as $column) {
					$aWhere[] = $column . " = '" . $state . "'";
				}
			}
			foreach ($aZips as $zip) {
				$aWhere[] = "location.zip = '" . $zip . "'";
			}

			$where = '';
			if (count($aWhere)) {
				$where = ' WHERE ' . implode(' OR ', $aWhere);
			}

			$s = "
			SELECT
				carrier.CarrName as name, carrier.CarrID as carrier_id
			FROM 
				ContractManager.dbo.CarrierMaster carrier
				LEFT JOIN tms.dbo.carrier_base_extended ex ON ex.carrier_id = carrier.CarrID
				LEFT JOIN tms.dbo.location_to_carriers l2c ON l2c.carrier_id = ex.carrier_id
				LEFT JOIN tms.dbo.location_base location ON location.location_id = l2c.location_id
				LEFT JOIN ContractManager.dbo.ZipsPostalCodesUS info ON (info.Zip = location.zip AND info.Seq = location.seq)
				LEFT JOIN ContractManager.dbo.ZipsPostalCodesCAN can ON (can.Zip = location.zip AND can.Seq = location.seq)
				$where
				GROUP BY 
					carrier.CarrName, carrier.CarrID";
		}

		$oDB = $GLOBALS['oDB'];
		$res = $oDB->query($s);
		$this->setParam('query', $s);
		while ($row = $oDB->db->fetch_object($res)) {
			$aReturn[] = $row;
		}

		$this->setParam('records', $aReturn);
	}

	public function getContactMethodTypesAction() {
		$query = "SELECT method_id, method_type, method_group_id FROM contact_method_types";
		$rows = LP_Db::fetchAll($query);
		$this->setParam('records', $rows);
	}

	public function getContactMethodDataAction() {
		$contactId = intval(request('contact_id', 0));
		$contactBase = new ContactBase();
		$contactBase->load($contactId);
		$rows = $contactBase->getContactMethods();
		$this->setParam('records', $rows);
	}

	public function saveContactAction() {
		$contactId = intval(request('contact_id', 0));
		$contactBase = new ContactBase();
		$contactBase->load($contactId);
		if ($contactBase->get('contact_id')) {
			$name = request('contact_name', '');
			$nameParts = explode_name($name);
			$firstName = $nameParts['first_name'];
			$middleName = $nameParts['middle_name'];
			$lastName = $nameParts['last_name'];
			$preferredName = $nameParts['preferred_name'];
			$title = request('contact_title', '');
			$statusId = intval(request('status_id', 0));
			$contactBase->set('first_name', $firstName);
			$contactBase->set('middle_name', $middleName);
			$contactBase->set('last_name', $lastName);
			$contactBase->set('preferred_name', $preferredName);
			$contactBase->set('title', $title);
			
			$contactBase->save();

			if ($contactBase->get('contact_type_id') == 2) {
				// update the customer details
				$contactCustomerDetail = new ContactCustomerDetail();
				$contactCustomerDetail->load($contactId);

				// Do a check because some old customers don't have a row for some reason
				if ($contactCustomerDetail->get('contact_id')) {
					$contactCustomerDetail->set('status_id', $statusId);
					$contactCustomerDetail->save();
					$this->addMessage('Contact Details Saved');
				}
				else {
					$contactCustomerDetail->create($contactId, $statusId, 0, 0, 0, 0, get_user_id());
					$this->addMessage('Contact Details Saved');
				}
			}
		}
	}

	public function saveContactMethodsAction() {
		
		// TODO: error handling - fields will be named like contact_method_data_0
		
		// get the posted contact id that needs updated
		$contactId = intval(request('contact_id', 0));
		if ($contactId) {

			// load the record for this contact
			$contactBase = new ContactBase();
			$contactBase->load($contactId);

			// get the submitted data that needs to be updated
			$contactMethodTypes = json_decode(getParam('contact_method_types', '[]'), true);
			$contactMethodData = json_decode(getParam('contact_method_data', '[]'), true);

			// build the data to pass to the contact object for updating
			$newMethods = array();
			$numSubmitted = count($contactMethodData) - 1; // Always going to be one extra
			for ($i = 0; $i < $numSubmitted; $i++) {
				$newMethods[] = array(
					'method_type_id' => $contactMethodTypes[$i],
					'method_index' => $i,
					'contact_value_1' => $contactMethodData[$i]
				);
			}

			$contactBase->updateContactMethods($newMethods);
			
			$this->addMessage('Contact Methods Saved');
		}
	}

	public function getContactIntervalDataAction() {
		$contactId = intval(request('contact_id', 0));
		$contactCustomerDetail = new ContactCustomerDetail();
		$contactCustomerDetail->load($contactId);
		$record = $contactCustomerDetail->get();
		
		$nextCall = strtotime($record['next_call']);
		$nextEmail = strtotime($record['next_email']);
		$nextVisit = strtotime($record['next_visit']);
		
		$record['now'] = time();
		
		if ($nextCall) {
			$record['next_call_ts'] = $nextCall;
			$record['next_call'] = date('n/j/Y', $nextCall);
		}
		if ($nextEmail) {
			$record['next_email_ts'] = $nextEmail;
			$record['next_email'] = date('n/j/Y', $nextEmail);
		}
		if ($nextVisit) {
			$record['next_visit_ts'] = $nextVisit;
			$record['next_visit'] = date('n/j/Y', $nextVisit);
		}
		
		$this->setParam('record', $record);
	}

	public function saveContactIntervalAction() {
		// get the posted contact id that needs updated
		$contactId = intval(getParam('contact_id', 0));
		$contactBase = new ContactBase($contactId);
		$contactCustomerDetail = new ContactCustomerDetail($contactId);
		
		$callInterval = intval(getParam('call_interval', 0));
		$emailInterval = intval(getParam('email_interval', 0));
		$visitInterval = intval(getParam('visit_interval', 0));
		$nextCall = strtotime(getParam('next_call'));
		$nextEmail = strtotime(getParam('next_email'));
		$nextVisit = strtotime(getParam('next_visit'));
		
		$currentNextCall = strtotime($contactCustomerDetail->get('next_call'));
		$currentNextEmail = strtotime($contactCustomerDetail->get('next_email'));
		$currentNextVisit = strtotime($contactCustomerDetail->get('next_visit'));
		
		if ($nextCall) {
			if (!$currentNextCall) {
				// If there is no current next call in the db and the user set one, save it
				$contactCustomerDetail->set('next_call', $nextCall);
			}
			else {
				$currentNextCall = strtotime('12am', $currentNextCall);
				// If the next action value was changed and the next action is overdue
				if ($nextCall != $currentNextCall && $currentNextCall < time()) {
					$this->addError('Cannot change next call date because it is overdue');
				}
				else {
					if ($nextCall > time()) {
						$contactCustomerDetail->set('next_call', $nextCall);
					}
					else if ($nextCall != $currentNextCall) {
						$this->addError('New call date must be in the future');
					}
					
				}
			}
		}
		if ($nextEmail) {
			if (!$currentNextEmail) {
				// If there is no current next email in the db and the user set one, save it
				$contactCustomerDetail->set('next_email', $nextEmail);
			}
			else {
				$currentNextEmail = strtotime('12am', $currentNextEmail);
				// If the next action value was changed and the next action is overdue
				if ($nextEmail != $currentNextEmail && $currentNextEmail < time()) {
					$this->addError('Cannot change next email date because it is overdue');
				}
				else {
					if ($nextEmail > time()) {
						$contactCustomerDetail->set('next_email', $nextEmail);
					}
					else if ($nextEmail != $currentNextEmail) {
						$this->addError('New email date must be in the future');
					}
				}
			}
		}
		if ($nextVisit) {
			if (!$currentNextVisit) {
				// If there is no current next visit in the db and the user set one, save it
				$contactCustomerDetail->set('next_visit', $nextVisit);
			}
			else {
				$currentNextVisit = strtotime('12am', $currentNextVisit);
				// If the next action value was changed and the next action is overdue
				if ($nextVisit != $currentNextVisit && $currentNextVisit < time()) {
					$this->addError('Cannot change next visit date because it is overdue');
				}
				else {
					if ($nextVisit > time()) {
						$contactCustomerDetail->set('next_visit', $nextVisit);
					}
					else if ($nextVisit != $currentNextVisit) {
						$this->addError('New visit date must be in the future');
					}
				}
			}
		}
		
		$contactCustomerDetail->set('call_interval', $callInterval);
		$contactCustomerDetail->set('email_interval', $emailInterval);
		$contactCustomerDetail->set('visit_interval', $visitInterval);
		
		$contactCustomerDetail->save();
		
		$this->addMessage('Contact Interval Saved');
	}

	public function getModesEquipmentAction() {
		$contactId = intval(request('contact_id', 0));
		$carrierId = intval(request('carrier_id', 0));

		if ($contactId) {
			$contact = new ContactBase();
			$contact->load($contactId);
			$this->setParam('modeIds', $contact->getModeIds());
			$this->setParam('equipmentIds', $contact->getEquipmentIds());
		}
		else if ($carrierId) {
			$carrier = new CarrierBaseExtended();
			$carrier->load($carrierId);
			$this->setParam('modeIds', $carrier->getModeIds());
			$this->setParam('equipmentIds', $carrier->getEquipmentIds());
		}
	}

	public function saveModesEquipmentAction() {
		$contactId = intval(request('contact_id', 0));
		$carrierId = intval(request('carrier_id', 0));

		$modesAllowed = json_decode(request('modesAllowed', '[]'), true);
		$equipmentAllowed = json_decode(request('equipmentAllowed', '[]'), true);

		if ($contactId) {
			$contact = new ContactBase();
			$contact->load($contactId);
			$contact->updateModesEquipment($modesAllowed, $equipmentAllowed);
			$contact->checkTasks();
		}
		else if ($carrierId) {
			$carrier = new CarrierBaseExtended();
			$carrier->load($carrierId);
			$carrier->updateModesEquipment($modesAllowed, $equipmentAllowed);
		}
		
		$this->addMessage('Updated Modes and Equipment');
	}

	public function getModesListAction() {
		$query = "SELECT mode_id, mode_name FROM modes";
		$records = LP_Db::fetchAll($query);
		$this->setParam('modeList', $records);
	}

	public function getEquipmentListAction() {
		$query = "SELECT CarrEquipId, CarrEquipDesc FROM ContractManager.dbo.AvailableEquipment";
		$records = LP_Db::fetchAll($query);
		$this->setParam('equipmentList', $records);
	}

	public function getContactTypesAction() {
		$contactTypes = array();
		$myUser = UserBase::getMyUser();
		$myUserRole = $myUser->get('role_id');
		if ($myUserRole == UserRoles::Admin || $myUserRole == UserRoles::CreditAndCollections) {
			$contactTypes[] = ContactTypes::BillTo;
		}
		if ($myUserRole == UserRoles::Admin || $myUserRole == UserRoles::CarrierPayables) {
			$contactTypes[] = ContactTypes::PayTo;
		}
		if ($myUserRole == UserRoles::Admin || $myUserRole == UserRoles::Broker || $myUserRole == UserRoles::PodLoader) {
			$contactTypes[] = ContactTypes::Carrier;
			$contactTypes[] = ContactTypes::Customer;
		}
		$contactTypesSql = implode(',', $contactTypes);

		$query = "SELECT type_id, type_name FROM contact_types WHERE type_id IN ($contactTypesSql)";
		$rows = LP_Db::fetchAll($query);
		$this->setParam('records', $rows);
	}

	public function getContactStatusTypesAction() {
		$query = "SELECT status_id, status_name FROM tools_status_types, tools_status_groups
			WHERE tools_status_types.status_group_id = tools_status_groups.group_id
			AND group_name = 'Contact Statuses'";
		$rows = LP_Db::fetchAll($query);
		$this->setParam('records', $rows);
	}

	public function getContactDataAction() {
		$contactId = intval(request('contact_id', 0));
		$contact = new ContactBase();
		$contact->load($contactId);
		$name = $contact->get('first_name') . ' ' . $contact->get('middle_name') . ' ' . $contact->get('last_name');
		$name = preg_replace('/ +/', ' ', $name);


		$record = array(
			'contact_id' => $contact->get('contact_id'),
			'first_name' => $contact->get('first_name'),
			'middle_name' => $contact->get('middle_name'),
			'last_name' => $contact->get('last_name'),
			'contact_name' => $name,
			'contact_title' => $contact->get('title'),
			'contact_type_id' => $contact->get('contact_type_id'),
			'status_id' => 0
		);

		// get status_id
		$query = "SELECT status_id FROM contact_customer_detail WHERE contact_id = $contactId";
		$row = LP_Db::fetchRow($query);
		if ($row) {
			$record['status_id'] = $row['status_id'];
		}

		$this->setParam('record', $record);
	}

	public function claimContactAction() {
		$this->getContactDataAction();

		$record = $this->getParam('record');
		$contact = new ContactBase();
		$contact->load($record['contact_id']);

		$myUserId = get_user_id();
		$myUser = get_user();

		// get contact owner info
		$contactOwners = new ContactOwners();
		$contactOwners->load(array(
			'contact_id' => $contact->get('contact_id')
		));
		if ($contactOwners->get('contact_owners_id')) {

			// check if free agent
			if ($contactOwners->get('free_agent')) {

				// check if restricted by seeing if there is an owner id and if it isn't owned by the logged in user
				if ($contactOwners->get('owner_id') && $contactOwners->get('owner_id') != $myUserId) {
					// restricted, so request transfer by creating a task for the owner
					$userId = $contactOwners->get('owner_id');
					$brokerUser = new UserBase();
					$brokerUser->load($userId);

					$myUserId = get_user_id();
					$taskName = 'Confirm Contact Transfer';
					$taskTypes = new TaskTypes();
					$taskTypes->load(array(
						'task_name' => $taskName
					));
					$taskTypeId = $taskTypes->get('task_type_id');

					$taskDetails = array(
						'contact_id' => $contact->get('contact_id'),
						'requested_by_id' => $myUserId,
						'user_name' => $myUser->getContactName(),
						'contact_name' => $contact->getName(),
						'task_type_id' => $taskTypeId
					);
					$lookupTaskDetails = array(
						'contact_id' => $contact->get('contact_id'),
						'requested_by_id' => $myUserId
					);

					// find any existing task rows for this task
					$taskRow = TaskBase::findTask($userId, $taskTypeId, $lookupTaskDetails);
					if ($taskRow) {
						$this->addMessage('Request already sent to ' . $brokerUser->getContactName());
					}
					else {
						$task = new TaskBase();
						$task->create($taskTypeId, $userId, time(), $taskDetails, $myUserId);
						$this->addMessage('Request sent to ' . $brokerUser->getContactName());
					}
				}
				else {
					// unrestricted, so claim user
					$contactOwners->set('owner_id', $myUserId);
					$contactOwners->set('free_agent', 0);
					$contactOwners->set('updated_by_id', $myUserId);
					$contactOwners->set('updated_at', time());
					$contactOwners->save();
					$this->addMessage('You have claimed ' . $contact->getName());

					// update contact list
					$userEmployee = new UserEmployees();
					$userEmployee->load($myUserId);
					$userEmployee->update_contact_scope();
				}
			}
			else {
				$this->addError('Contact is not a free agent');
			}
		}
	}

	public function getAction() {
		$db = new DBModel();
		$db->connect();
		$oSession = $GLOBALS['oSession'];
		$aScope = $oSession->session_var('user_scope');
		$this->setParam('scope', $aScope);
		$start = request("start", 0);
		$limit = request("limit", 10);
		$order = 'contact_name';
		$sort = array();
		$where = "1=1";
		if (!count($aScope)) {
			$aScope = array(0);
		}
		$where .= " AND owners.owner_id IN (" . implode(", ", $aScope) . ")";
		$filter = json_decode(request("filter", json_encode(array())), true);

		//Process the sort
		if (isset($_REQUEST['sort'])) {
			$sortArray = json_decode($_REQUEST['sort'], true);
			foreach ($sortArray as $sortItem) {
				$sort[] = $sortItem['property'] . " " . $sortItem['direction'];
			}
		}
		else {
			$sort[] = 'next_action_date DESC';
		}

		$nowDate = date('n/j/Y', strtotime('12am'));

		//Process any filters
		foreach ($filter as $key => $value) {
			if (!strlen($value)) {
				continue;
			}

			$cleanValue = LP_Db::escape($value);
			switch ($key) {

				case "name":
					$where .= " AND (contact.first_name LIKE '$cleanValue%' OR contact.last_name LIKE '$cleanValue%')";
					break;

				case "company":
					$where .= " AND customer.customer_name LIKE '$cleanValue%'";
					break;

				case 'owner':
					$where .= " AND (owner.first_name LIKE '$cleanValue%' OR owner.last_name LIKE '$cleanValue%')";
					break;

				case 'upToDate':
					$value = intval($cleanValue);
					if ($value == 0) {
						// not up to date
						$where .= " AND (details.next_action_date IS NULL OR details.next_call < '$nowDate' OR details.next_email < '$nowDate' OR details.next_visit < '$nowDate')";
					}
					else if ($value == 1) {
						// up to date
						$where .= " AND (details.next_action_date IS NOT NULL AND details.next_call >= '$nowDate' AND details.next_email >= '$nowDate' AND details.next_visit >= '$nowDate')";
					}
					else if ($value == -1) {
						// all
					}
					break;

				case 'status':
					$statusId = intval($cleanValue);
					if ($statusId > 0) {
						$where .= " AND details.status_id = $statusId";
					}
					else if ($statusId == -1) {
						// all
					}
					break;
			}
		}

		//Get the total
		$query = "SELECT COUNT(*) total
			FROM tms.dbo.contact_base contact
			LEFT JOIN tms.dbo.contact_owners AS owners 
				ON contact.contact_id = owners.contact_id
			LEFT JOIN tms.dbo.user_base 
				ON user_base.user_id = owners.owner_id
			LEFT JOIN tms.dbo.contact_base AS owner
				ON user_base.contact_id = owner.contact_id
			LEFT JOIN tms.dbo.location_to_contact loc 
				ON loc.contact_id = contact.contact_id
			LEFT JOIN tms.dbo.customer_to_location toloc 
				ON toloc.location_id = loc.location_id
			LEFT JOIN tms.dbo.customer_base customer 
				ON toloc.customer_id = customer.customer_id
			LEFT JOIN tms.dbo.contact_customer_detail details 
				ON details.contact_id = contact.contact_id
			LEFT JOIN tms.dbo.tools_status_types status 
				ON status.status_id = details.status_id
			WHERE $where";
		$row = LP_Db::fetchRow($query);
		if ($row) {
			$this->setParam('total', $row['total']);
		}

		//Get the records
		$query = "SELECT 
					owners.contact_id as contact_id,
					customer.customer_name, 
					customer.customer_id, 
					(contact.first_name + ' ' + contact.last_name) as contact_name, 
					(owner.first_name + ' ' + owner.last_name) as owner_name,
					contact.first_name,
					contact.last_name,
					contact.middle_name,
					contact.preferred_name,
					contact.title,
					contact.active,
					user_base.user_id,
					user_base.role_id,
					user_base.user_name,
					user_base.image,
					user_base.total_logins,
					user_base.last_login,
					details.call_interval,
					details.email_interval,
					details.visit_interval,
					details.next_call,
					details.next_email,
					details.next_visit,
					details.next_action_date,
					details.next_action_name,
					status.status_name as status
					FROM 
						tms.dbo.contact_base contact
					LEFT JOIN tms.dbo.contact_owners AS owners 
						ON contact.contact_id = owners.contact_id
					LEFT JOIN tms.dbo.user_base 
						ON user_base.user_id = owners.owner_id
					LEFT JOIN tms.dbo.contact_base AS owner 
						ON user_base.contact_id = owner.contact_id
					LEFT JOIN tms.dbo.location_to_contact loc 
						ON loc.contact_id = contact.contact_id
					LEFT JOIN tms.dbo.customer_to_location toloc 
						ON toloc.location_id = loc.location_id
					LEFT JOIN tms.dbo.customer_base customer 
						ON toloc.customer_id = customer.customer_id
					LEFT JOIN tms.dbo.contact_customer_detail details 
						ON details.contact_id = contact.contact_id
					LEFT JOIN tms.dbo.tools_status_types status 
						ON status.status_id = details.status_id
					WHERE 
						$where";
		
		//Build the order/sort
		if (count($sort)) {
			$sort = implode(", ", $sort);
		}
		else {
			$sort = '';
		}
		$query = LP_Util::buildQuery($query, $sort, $limit, $start);
		$rows = LP_Db::fetchAll($query);
		$records = array();
		$nowTs = time();
		$todayTs = strtotime('12am', time());
		
		// Calculate the next action and up to date text and status
		foreach($rows as $row) {
			$row['nowTs'] = $nowTs;
			$row['upToDate'] = true;
			$row['upToDateDisplay'] = true;
			
			$nextActionTs = strtotime($row['next_action_date']);
			$nextCallTs = strtotime($row['next_call']);
			$nextEmailTs = strtotime($row['next_email']);
			$nextVisitTs = strtotime($row['next_visit']);
			
			$row['nextActionTs'] = $nextActionTs;
			if ($nextCallTs && $todayTs > $nextCallTs)  {
				$row['upToDate'] = false;
			}
			if ($nextEmailTs && $todayTs > $nextEmailTs)  {
				$row['upToDate'] = false;
			}
			if ($nextVisitTs && $todayTs > $nextVisitTs)  {
				$row['upToDate'] = false;
			}
			if ($nextActionTs && $todayTs > $nextActionTs) {
				$row['upToDateDisplay'] = false;
			}
			
			// Generate the next action text
			$nextActionName = ucfirst($row['next_action_name']);
			
			$timeTillAction = calc_time_difference(date('Y-m-d', $todayTs), date('Y-m-d', $nextActionTs));
			$timeTillAction = time_difference_tostring($timeTillAction, 'day');
			
			$nextActionDisplay = '';
			if (strlen($nextActionName)) {
				if ($row['upToDateDisplay']) {
					if (strlen($timeTillAction)) {
						$nextActionDisplay = "$nextActionName in $timeTillAction";
					}
					else {
						$nextActionDisplay = "$nextActionName today";
					}
				}
				else {
					$nextActionDisplay = "$nextActionName $timeTillAction";
				}
				
			}
			
			$row['next_action_date_display'] = $nextActionDisplay;
			
			//Add the row to the records
			$records[] = $row;
		}
		foreach ($rows as $row) {
			$aNextAction = array();
			$aNextAction['call'] = empty($row['next_call']) ? "" : strtotime($row['next_call']);
			$aNextAction['email'] = empty($row['next_email']) ? "" : strtotime($row['next_email']);
			$aNextAction['visit'] = empty($row['next_visit']) ? "" : strtotime($row['next_visit']);
			asort($aNextAction);
			$sNextAction = "";
			$sNextDate = "";
			if ($row['contact_id'] == 361) {
				$this->setParam('nextAction', $aNextAction);
			}

			foreach ($aNextAction as $key => $val) {
				if (!empty($val)) {
					$sNextAction = $key;
					$sNextDate = $val;
					continue;
				}
			}
			$sNextAction = $row['next_action_name'];
			$aTimeTillAction = array();
			$sTimeTillAction = "";
			$upToDate = 1;
			if (!empty($sNextDate)) {
				$aTimeTillAction = calc_time_difference(date('Y-m-d', time()), date('Y-m-d', $sNextDate));

				$sTimeTillAction = time_difference_tostring($aTimeTillAction, 'day');
				if (substr($sTimeTillAction, strlen($sTimeTillAction) - 3) == "ago")
					$upToDate = 0;
			}

			//Set the up to date value
			$row['up_to_date'] = $upToDate;

			//set the next action value
			$row['next_action'] = empty($sNextAction) ? "None Set" : ucfirst($sNextAction) . " " . (!$upToDate ? "" : "in ") . $sTimeTillAction;

			// new way to show next action
			$row['next_action_date_display'] = 'None Set';
			$row['nextActionTs'] = strtotime($row['next_action_date']);
			$row['nowTs'] = $nowTs;
			$row['upToDate'] = true;
			if ($row['nowTs'] > $row['nextActionTs']) {
				$row['upToDate'] = false;
			}
			if ($row['nextActionTs']) {
				$aTimeTillAction = calc_time_difference(date('Y-m-d', time()), date('Y-m-d', $row['nextActionTs']));
				$sTimeTillAction = time_difference_tostring($aTimeTillAction, 'day');
				$display = ucfirst($sNextAction) . " " . (!$upToDate ? "" : "in ") . $sTimeTillAction;
				$row['next_action_date_display'] = $display;
			}

			//Add the row to the records
//			$records[] = $row;
		}

		$this->setParam("records", $records);
	}

	public function getStateListAction() {
		$this->setParam('records', GeoData::getStateList());
	}

	public function getPreferredStatesAction() {
		$contactId = intval(request('contact_id', 0));
		$carrierId = intval(request('carrier_id', 0));
		$preferredStates = new CarrierPreferredStates();
		$states = $preferredStates->getPreferredStates($contactId, $carrierId);
		$this->setParam('records', $states);
	}

	public function savePreferredStatesAction() {
		$contactId = intval(request('contact_id', 0));
		$carrierId = intval(request('carrier_id', 0));

		$originStates = json_decode(request("originStates", '[]'), true);
		$destinationStates = json_decode(request("destinationStates", '[]'), true);
		$preferredStates = new CarrierPreferredStates();
		$preferredStates->set_carrier_contact_states($contactId, $carrierId, $originStates, $destinationStates);
		$this->addMessage("Preferred states were saved.");
	}

	public function saveLocationAction() {
		$contactId = intval(request('contact_id', 0));
		$locationId = intval(request('location_id', 0));

		$query = "UPDATE location_to_contact SET location_id = $locationId WHERE contact_id = $contactId";
		LP_Db::execute($query);
	}

	public function releaseAction() {
		$this->setParam('post', $_POST);
		$contactId = post('contact_id', 0);
		$restricted = intval(post('restricted', 0));
		$contact = new ContactBase();
		$contact->load($contactId);
		$myUserId = get_user_id();

		if ($contact->get('contact_id')) {
			$name = $contact->get('first_name') . ' ' . $contact->get('last_name');

			$contactOwners = new ContactOwners();
			$contactOwners->load(array(
				'contact_id' => $contact->get('contact_id')
			));
			if (!$restricted) {
				$contactOwners->set('owner_id', 0);
			}
			$contactOwners->set('free_agent', 1);
			$contactOwners->set('updated_by_id', get_user_id());
			$contactOwners->set('updated_at', time());
			$contactOwners->save();
			
			// update contact list
			$userEmployee = new UserEmployees();
			$userEmployee->load($myUserId);
			$userEmployee->update_contact_scope();

			$message = "$name was released as an unrestricted contact";
			if ($restricted) {
				$message = "$name was released as a restricted contact";
			}
			$this->addMessage($message);
			$this->setParam('name', $name);
		}
		else {
			$this->addError('Invalid Contact');
		}
	}

	public function getTransferDataAction() {
		$contact_id = intval(post('contact_id', 0));
		$requested_by_id = intval(post('requested_by_id', 0));
		$contact = new ContactBase();
		$contact->load($contact_id);
		$user = new UserBase();
		$user->load($requested_by_id);
		$this->addMessage('Are you sure you want to transfer your contact ' . $contact->getName() . ' to ' . $user->getContactName() . '?');
	}

	public function transferContactAction() {
		$contact_id = intval(post('contact_id', 0));
		$requested_by_id = intval(post('requested_by_id', 0));
		$contact = new ContactBase();
		$contact->load($contact_id);
		$user = new UserBase();
		$user->load($requested_by_id);
		$myUserId = get_user_id();

		$contactOwners = new ContactOwners();
		$contactOwners->load(array(
			'contact_id' => $contact_id,
			'owner_id' => $myUserId
		));
		if ($contactOwners->get('contact_owners_id')) {
			$contactOwners->set('owner_id', $requested_by_id);
			$contactOwners->set('free_agent', 0);
			$contactOwners->save();

			// update contact list
			$userEmployee = new UserEmployees();
			$userEmployee->load($myUserId);
			$userEmployee->update_contact_scope();

			// complete any task for this
			// get status id
			$createdById = $requested_by_id;
			$taskDetails = array(
				'contact_id' => $contact_id,
				'requested_by_id' => $requested_by_id
			);
			$taskName = 'Confirm Contact Transfer';
			$taskTypes = new TaskTypes();
			$taskTypes->load(array(
				'task_name' => $taskName
			));
			$taskTypeId = $taskTypes->get('task_type_id');

			// find any existing task rows for this task
			$taskRow = TaskBase::findTask($myUserId, $taskTypeId, $taskDetails);
			if ($taskRow) {
				$task = new TaskBase();
				$task->load($taskRow['task_id']);
				$task->complete();
			}
			$this->addMessage('You have transferred ' . $contact->getName() . ' to ' . $user->getContactName());
		}
		else {
			$this->addError('You do not own this contact');
		}
	}

	public function denyTransferContactAction() {
		$contact_id = intval(post('contact_id', 0));
		$requested_by_id = intval(post('requested_by_id', 0));
		$contact = new ContactBase();
		$contact->load($contact_id);
		$user = new UserBase();
		$user->load($requested_by_id);
		$myUserId = get_user_id();

		$contactOwners = new ContactOwners();
		$contactOwners->load(array(
			'contact_id' => $contact_id,
			'owner_id' => $myUserId
		));
		if ($contactOwners->get('contact_owners_id')) {
			// complete any task for this
			// get status id
			$createdById = $requested_by_id;
			$taskDetails = array(
				'contact_id' => $contact_id,
				'requested_by_id' => $requested_by_id
			);
			$taskName = 'Confirm Contact Transfer';
			$taskTypes = new TaskTypes();
			$taskTypes->load(array(
				'task_name' => $taskName
			));
			$taskTypeId = $taskTypes->get('task_type_id');

			// find any existing task rows for this task
			$taskRow = TaskBase::findTask($myUserId, $taskTypeId, $taskDetails);
			if ($taskRow) {
				$task = new TaskBase();
				$task->load($taskRow['task_id']);
				$task->complete();
			}
			$this->addMessage('You have denied the transfer of ' . $contact->getName() . ' to ' . $user->getContactName());
		}
		else {
			$this->addError('You do not own this contact');
		}
	}

	public function getSimilarAction() {
		$contactTypeId = intval(request("contactTypeId", 0));
		$limit = 5;
		$querySearch = request("query", "");
		$records = array();
		if ($contactTypeId && strlen($querySearch)) {
			$where = "1=1";
			$where .= " AND contact_type_id = '$contactTypeId'";
			$queryParts = explode(" ", $querySearch);
			if (count($queryParts) == 2) {
				$where .= " AND first_name LIKE '{$queryParts[0]}%' AND last_name LIKE '{$queryParts[1]}%'";
			}
			else {
				$where .= " AND first_name LIKE '$querySearch%' OR last_name LIKE '$querySearch%'";
			}
			$query = "SELECT 
						TOP $limit
						(first_name + ' ' + last_name) name,
						l.location_name_1 location,
						(
							SELECT TOP 1 (first_name + ' ' + last_name) name
							FROM user_base
							LEFT JOIN contact_base
							ON contact_base.contact_id = user_base.contact_id
							WHERE user_base.user_id = co.owner_id
						) owner
						FROM contact_base c
						LEFT JOIN contact_owners co
						ON co.contact_id = c.contact_id
						LEFT JOIN location_to_contact ltc
						ON c.contact_id = ltc.contact_id
						LEFT JOIN location_base l
						ON l.location_id = ltc.location_id
						WHERE $where
						ORDER BY first_name ASC";
			$rows = LP_Db::fetchAll($query);
			foreach ($rows as $row) {
				$records[] = $row;
			}
		}
		$this->setParam("records", $records);
	}
	
	public function getDocumentTypesAction() {
		$showAll = getParam('showAll', true);
		$ignoreNames = array(
			'Rate Confirmation'
		);
		$ignoreNamesSql = "'" . implode("','", $ignoreNames) . "'";
		
		$orderTypeId = DocumentTypeGroups::Order;
		$query = "SELECT document_type_id, document_type_name
			FROM document_types
			WHERE document_type_group_id = $orderTypeId";
		if (!$showAll) {
			$query .= " AND document_type_name NOT IN($ignoreNamesSql) ";
		}
		$rows = LP_Db::fetchAll($query);
		$this->setParam('records', $rows);
	}

	public function getDocumentsRequiredDataAction() {
		$contactId = intval(getParam('contact_id', 0));
		$orderId = intval(getParam('order_id', 0));
		if ($contactId) {
			$contactBase = new ContactBase($contactId);
			$rows = $contactBase->getDocumentsRequired();
		}
		else if ($orderId) {
			$orderBase = new OrderBase($orderId);
			$rows = $orderBase->getDocumentsRequired();
		}
		
		$this->setParam('records', $rows);
	}

	public function saveDocumentsRequiredAction() {
		
		// TODO: error handling - fields will be named like document_type_quantity_0
		
		// get the posted contact id that needs updated
		$contactId = intval(request('contact_id', 0));
		$contactBase = new ContactBase($contactId);
		if ($contactBase->get('contact_id')) {

			// get the submitted data that needs to be updated
			$documentTypeIds = json_decode(getParam('document_type_ids', '[]'), true);
			$documentTypeQuantities = json_decode(getParam('document_type_quantities', '[]'), true);

			// build the data to pass to the customer object for updating
			$newDocuments = array();
			$numSubmitted = count($documentTypeIds) - 1; // should always going to be one extra
			for ($i = 0; $i < $numSubmitted; $i++) {
				$newDocuments[] = array(
					'document_type_id' => $documentTypeIds[$i],
					'quantity' => $documentTypeQuantities[$i]
				);
			}
			
			$this->setParam('docs', $newDocuments);
			
			$contactBase->updateDocumentsRequired($newDocuments);
			
			$this->addMessage('Documents Required Saved');
		}
	}
	
	public function saveBillToAction() {
		$contactId = intval(getParam('contact_id', 0));
		$locationId = intval(getParam('bill_to_location_id', 0));
		$customerId = intval(getParam('bill_to_customer_id', 0));
		$contactBase = new ContactBase($contactId);
		$contactBase->setBillTo($locationId);
		
		if ($locationId) {
			$this->addMessage('Set new bill to');
		}
		else {
			$this->addMessage('Unassigned bill to');
		}
		
		$contactBase->checkTasks();
	}
	
	public function getBillToDataAction() {
		$contactId = intval(getParam('contact_id', 0));
		$contactBase = new ContactBase($contactId);
		$record = $contactBase->getBillTo();
		if ($record && $record['location_id']) {
			$this->setParam('record', $record);
		}
		else {
			$this->addError('Bill to not set for this contact');
		}
	}
	
	public function getFreeAgentsRecordsAction() {
		// get submitted params
		$sortBy = getParam('sort', false);
		$filter = json_decode(getParam('filter', '{}'), true);
		
		// Setup the filtering and query variables
		$start = intval(getParam('start', 0));
		$limit = intval(getParam('limit', 10));
		
		// build query data
		$fields = array(
			"(contact_base.first_name + ' ' + contact_base.last_name) as contact_name",
			'contact_base.title',
			'contact_owners.*',
			
			"(contact_base2.first_name + ' ' + contact_base2.last_name) as owner_name",
			
			'customer_base.customer_id',
			'customer_base.customer_name'
		);
		$from = array(
			'contact_owners'
		);
		$join = array(
			'LEFT JOIN contact_base ON contact_base.contact_id = contact_owners.contact_id',
			'LEFT JOIN user_base ON user_base.user_id = contact_owners.owner_id',
			'LEFT JOIN contact_base AS contact_base2 ON contact_base2.contact_id = user_base.contact_id',
			'LEFT JOIN location_to_contact ON location_to_contact.contact_id = contact_base.contact_id',
			'LEFT JOIN customer_to_location ON customer_to_location.location_id = location_to_contact.location_id',
			'LEFT JOIN customer_base ON customer_base.customer_id = customer_to_location.customer_id'
		);
		$where = array(
			'contact_owners.free_agent = 1'
		);
		$sort = array(
			
		);
		if ($sortBy) {
			$sortArray = json_decode($sortBy, true);
			$numSorters = count($sortArray);
			$sort = array();
			for ($i = 0; $i < $numSorters; $i++) {
				$sort[] = $sortArray[$i]['property'] . ' ' . $sortArray[$i]['direction'];
			}
		}

		// convert query data to sql
		$fieldsSql = implode(',', $fields);
		$fromSql = ' FROM ' . implode(',', $from);
		$joinSql = implode(' ', $join);

		//Process any filters
		foreach ($filter as $key => $value) {
			if (strlen($value)) {
				$cleanValue = LP_Db::escape($value);
				switch ($key) {
					case 'company':
//						$where[] = "customer_base.customer_name LIKE '$cleanValue%'";
						break;
				}
			}
		}

		$whereSql = 'WHERE ' . implode(' AND ', $where);
		if (!count($where)) {
			$whereSql = '';
		}
		$sortSql = implode(',', $sort);

		// get total count
		$total = 0;
		$totalQuery = "SELECT COUNT(*) total $fromSql $joinSql $whereSql ";
		$row = LP_Db::fetchRow($totalQuery);
		if ($row) {
			$total = $row['total'];
		}
		$this->setParam('total', $total);

		// get records
		$query = "SELECT $fieldsSql $fromSql $joinSql $whereSql ";
		$this->setParam('query', $query);
		$query = LP_Util::buildQuery($query, $sortSql, $limit, $start);
		$rows = LP_Db::fetchAll($query);
		$numRows = count($rows);
		
		for ($i = 0; $i < $numRows; $i++) {

			// Set restriction display
			$rows[$i]['restrictionDisplay'] = '';
			$rows[$i]['restricted'] = 0;
			$rows[$i]['restrictionDisplay'] = 'Unrestricted';
			if ($rows[$i]['owner_id']) {
				$rows[$i]['restricted'] = 1;
				$rows[$i]['restrictionDisplay'] = $rows[$i]['owner_name'];
			}
			
			// Set date display
			$rows[$i]['dateDisplay'] = date('n/j/y', strtotime($rows[$i]['updated_at']));
			
		}
		
		
		$this->setParam('records', $rows);
	}
	
	public function setDueDateAction() {
		$contactId = intval(getParam('contact_id', 0));
		$field = getParam('field', false);
		$date = getParam('date', 'tomorrow');
		$this->setParam('date', $date);
		
		if ($field == 'next_call' || $field == 'next_visit' || $field == 'next_email') {
			if ($date) {
				$contactCustomerDetail = new ContactCustomerDetail($contactId);
				if ($contactCustomerDetail->get('contact_id')) {
					
					// Do not let the user change this if it is expired
					$currentValue = strtotime($contactCustomerDetail->get($field));
					if ($currentValue > 0 && $currentValue < time()) {
						return;
					}
					else {
						$contactCustomerDetail->set($field, $date);
						$contactCustomerDetail->save();
					}
				}
			}
		}
		
		$this->setParam('post', $_POST);
	}
	
	public function sendEmailAction(){
		$this->setParam('request', $_REQUEST);
		//Make sure a contact exists
		$contactId = request('contact_id', 0);
		if(!$contactId){
			$this->addError('You must choose a contact to email.');
			return;
		}
		
		//Make sure an email exists
		$email = request('email', '');
		if(!strlen($email)){
			$this->addError('You must choose an email address.', 'email');
			return;
		}

		//Get the subject
		$subject = request('subject', '');
		
		//Make sure there is a message
		$message = trim(request('message', ''), '&nbsp;');
		if(!strlen($message)){
			$this->addError('You must type a message to send this email.', 'message');
			return;
		}
		
		//Get the contact
		$contactBase = new ContactBase($contactId);
		$contactName = $contactBase->get('first_name') . " " . $contactBase->get('last_name');
		
		//Get the user
		$userBase = new UserBase(get_user_id());
		$userContactBase = new ContactBase($userBase->get('contact_id'));
		$userName = $userContactBase->get('first_name') . " " . $userContactBase->get('last_name');
		$userEmail = $userContactBase->getEmail();
		if(!strlen($userEmail)){
			$this->addError('You do not have an email address, you must have an email address to send emails.');
			return;
		}
		
		$mail = new Zend_Mail();
		$mail->setBodyHtml($message);
		$mail->setFrom($userEmail, $userName);
		$mail->addTo($email, $contactName);
		$mail->setSubject($subject);
		$mail->send();
		$this->addMessage("Email was sent to $email($contactName) from $userEmail($userName)");
		
		// Add this as a comment for the contact
		// Get the Personal Email comment type id
		$commentType = new ToolsCommentTypes();
		$commentType->load(array(
			'comment_type_name' => 'Personal Email'
		));
		$commentBase = new CommentBase();
		$commentBase->create($commentType->get('comment_type_id'), $contactId, $message);
	}

}