<?php

class ContactBase extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = 'contact_base';
	public $fireEvents = true;

	public function create($nContactTypeId, $sFirstName, $sLastName, $sMiddleName, $sPreferredName, $sTitle, $nCreatedById) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		
		if (!string($sTitle)) {
			$this->addError('Title is required', $key);
		}
		if (!string($sPreferredName)) {
			$this->addError('PREFERRED NAME requires a string', $key);
		}
		if (!string($sLastName, TRUE)) {
			$this->addError('LAST NAME requires a string', $key);
		}
		if (!string($sFirstName, TRUE)) {
			$this->addError('FIRST NAME requires a string', $key);
		}
		if (!empty($nContactTypeId) && !number($nContactTypeId, TRUE)) {
			$this->addError('CONTACT TYPE ID requires a number', $key);
		}
		if (!number($nCreatedById)) {
			$this->addError('CREATED BY ID requires a number', $key);
		}
		
		// Save Data
		$this->set_title($sTitle);
		$this->set_contact_type_id($nContactTypeId);
		$this->set_first_name($sFirstName);
		$this->set_last_name($sLastName);
		$this->set_middle_name($sMiddleName);
		$this->set_preferred_name($sPreferredName);
		$this->set_active(1);

		if (!$this->is_loaded()) {
			$this->set_created_by_id($nCreatedById);
		}
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}
		
		
		$success = $this->save();
		
		// Report
		return $success;
	}

	function get_FirstLastName() {
		return $this->get_First_name() . " " . $this->get_Last_Name();
	}

	function get_FullName() {
		$sFirst = $this->get('first_name');
		$sMiddle = $this->get('middle_name');
		$sLast = $this->get('last_name');
		return $sFirst . (empty($sMiddle) ? '' : ' ' . $sMiddle) . (empty($sLast) ? '' : ' ' . $sLast);
	}

	function get_ContactType() {
		$o = new ContactTypes();
		$o->load($this->get_contact_type_id());
		return $o;
	}

	function add_ContactMethod($nMethodTypeId, $sContactValue, $sContactValue2, $nCreatedById) {
		$nContactId = $this->get_contact_id();
		if (empty($nContactId)) {
			add_error('Contact Method adding Failed because there was no ContactId');
			return false;
		}
		$o = new ContactMethods();
		$o->create($nContactId, $nMethodTypeId, $sContactValue, $sContactValue2, $nCreatedById);
		return $o;
	}

	function add_Comment($sComment, $nCreatedById) {
		$nContactId = $this->get_contact_id();
		if (empty($nContactId))
			return;
		$o = new ContactComments();

		$nCommentSourceId = 0;

		$o->create($nContactId, $sComment, 0, $nCreatedById);
		return $o;
	}

	function get_associated_customers($nContactId) {
		$aResult = array();

		if (!number($nContactId))
			return $aResult;

		$aRes = $this->get_associated_locations($nContactId);
		foreach ($aRes as $aLocation) {

			$aCustomerIds = array();

			// Get our related Customer Ids from Location
			$oCustomerToLocation = new CustomerToLocation;
			$oCustomerToLocation->where('location_id', '=', $aLocation['location_id']);
			$oLocationResult = $oCustomerToLocation->list();
			foreach ($oLocationResult->rows as $oLocationDatalet) {
				$aCustomerIds[] = $oLocationDatalet->get('customer_id');
			}

			// Get our related Customer Ids from Shipping Location
			$oCustomerToShippingLocation = new CustomerToShippingLocation;
			$oCustomerToShippingLocation->where('location_id', '=', $aLocation['location_id']);
			$oLocationResult = $oCustomerToShippingLocation->list();
			foreach ($oLocationResult->rows as $oLocationDatalet) {
				$aCustomerIds[] = $oLocationDatalet->get('customer_id');
			}

			// Get Customer Data by Customer Id
			if (count($aCustomerIds)) {
				foreach ($aCustomerIds as $nCustomerId) {
					$oCustomer = new CustomerBase;
					$oCustomer->where('customer_id', '=', $nCustomerId);
					$oCustomerResult = $oCustomer->list();
					foreach ($oCustomerResult->rows as $oCustomerDatalet) {
						$aResult[] = $oCustomerDatalet->get();
					}
				}
			}
		}

		return $aResult;
	}

	function get_associated_locations($nContactId) {
		$aResult = array();

		if (!number($nContactId))
			return $aResult;

		$oLocationToContact = new LocationToContact();
		$aResult = $oLocationToContact->get_locations_by_contact_id($nContactId);

		return $aResult;
	}

	function get_comments() {
		$nId = $this->get('contact_id');
		if (empty($nId))
			return array();

		$s = "SELECT TOP 10 comment.comment, comment.created_at, (contact.first_name + ' ' + contact.last_name) as name, type.comment_type_name as type_name FROM tms.dbo.contact_comments comment
				LEFT JOIN tms.dbo.user_base ON user_base.user_id = comment.created_by_id
				LEFT JOIN tms.dbo.contact_base contact ON user_base.contact_id = contact.contact_id
				LEFT JOIN tms.dbo.tools_comment_types type ON type.comment_type_id = comment.comment_type_id
				WHERE comment.contact_id = '" . $nId . "'
				ORDER BY comment.created_at DESC";

		$res = $this->query($s);

		$a = array();
		while ($row = $this->db->fetch_array($res)) {
			$row['created_at'] = date('m/d/Y H:ia', strtotime($row['created_at']));
			$a[] = $row;
		}
		return $a;
	}

	function list_orders() {
		$nId = $this->get('contact_id');
		if (empty($nId))
			return array();
		/*
		  $o = new OrderBase();
		  $o->where('ordered_by_id', '=', $nId);

		  $oList = $o->list();

		  $a = array();
		  foreach($oList->rows as $row) {
		  $a[] = $row->get();
		  }
		 */

		$s = "SELECT TOP 10 order_base.*, customer.customer_name FROM order_base
				LEFT JOIN customer_base customer ON customer.customer_id = order_base.customer_id
				WHERE order_base.ordered_by_id = '" . $nId . "'
				ORDER BY order_base.created_at DESC";

		$res = $this->db->query($s);

		$a = array();
		while ($row = $this->db->fetch_object($res)) {
			$a[] = $row;
		}

		return $a;
	}

	function get_owner() {
		$nId = $this->get('contact_id');
		if (empty($nId))
			return FALSE;
		$o = new ContactOwners();
		$o->where('contact_id', '=', $nId);
		$a = $o->list()->rows;

		if (isset($a[0])) {
			return $a[0]->get('owner_id');
		}
		return FALSE;
	}

	public static function list_owned_contacts($aUserId, $vObj = false) {
		// UserId = OwnerId
		//$this->clear_filters();
		//this->where('owner_id', '=', $nUserId);
		//$this->where('active', '=', 1);
		//$this->connect();
		$s = "SELECT owners.contact_id as id, customer.customer_name, 
					(contact.first_name + ' ' + contact.last_name) as contact_name, 
					(owner.first_name + ' ' + owner.last_name) as owner_name, 
					contact.*, user_base.*, details.*, status.status_name as status
				FROM tms.dbo.contact_base contact
				LEFT JOIN tms.dbo.contact_owners AS owners ON contact.contact_id = owners.contact_id
				LEFT JOIN tms.dbo.user_base ON user_base.user_id = owners.owner_id
				LEFT JOIN tms.dbo.contact_base AS owner ON user_base.contact_id = owner.contact_id
				LEFT JOIN tms.dbo.location_to_contact loc ON loc.contact_id = contact.contact_id
				LEFT JOIN tms.dbo.customer_to_location toloc ON toloc.location_id = loc.location_id
				LEFT JOIN tms.dbo.customer_base customer ON toloc.customer_id = customer.customer_id
				LEFT JOIN tms.dbo.contact_customer_detail details ON details.contact_id = contact.contact_id
				LEFT JOIN tms.dbo.tools_status_types status ON status.status_id = details.status_id
				WHERE owners.owner_id IN (" . implode(", ", $aUserId) . ")";

		$res = LP_Db::fetchAll($s);

		$a = array();
		foreach ($res as $row) {
			if (!$vObj) {
				$a[] = $row;
			}
			else {
				$a[] = (object) $row;
			}
		}
		return $a;
	}

	public static function getContactIds($aUsers) {
		if (!is_array($aUsers))
			$aUsers = array(intval($aUsers));

		$aContacts = self::list_owned_contacts($aUsers);
		//pre($aContacts);
		$a = array();
		foreach ($aContacts as $contact) {
			$a[] = $contact['contact_id'];
		}
		return $a;
	}

	/**
	 * override the parent delete function to also delete all related db data
	 */
	public function delete($aKeys = FALSE, $sTable = FALSE) {
		$nId = $this->get_contact_id();
		if (empty($nId))
			return false;
		// contact_comments. should reassign comments to someone else, but who?
		// delete related data from contact_customer_detail
		$o = new ContactCustomerDetail();
		$o->where('contact_id', '=', $nId);
		$o->delete();
		// delete from contact_customer_stats
		// use raw query for now, since the associated php class doesn't exist at this time
		$o = new DBModel();
		$o->connect();
		$o->query("DELETE FROM contact_customer_stats WHERE contact_id = $nId");
		// delete from contact_methods
		$o = new ContactMethods();
		$o->where('contact_id', '=', $nId);
		$o->delete();
		// contact owners.  should reassign owned contacts.  for now, have appropriate user reassign throu interface
		// delete where this contact is owned
		$o = new ContactOwners();
		$o->where('contact_id', '=', $nId);
		$o->delete();
		// delete where this contact is the owner
		$o = new ContactOwners();
		$o->where('owner_id', '=', $nId);
		$o->delete();
		// contact to accounting.  should there be any reassigning here?
		$o = new ContactToAccounting();
		$o->where('contact_id', '=', $nId);
		$o->delete();
		// delete from contact_to_call
		$o = new ContactToCall();
		$o->where('contact_id', '=', $nId);
		$o->delete();
		// delete from contact_to_email
		$o = new ContactToEmail();
		$o->where('contact_id', '=', $nId);
		$o->delete();
		// delete from contact_to_visits
		$o = new ContactToVisit();
		$o->where('contact_id', '=', $nId);
		$o->delete();
		// delete from contact_to_goals
		$o = new ContactToGoals();
		$o->wehre('contact_id', '=', $nId);
		$o->delete();
		// delete from contact_used_equipment
		$o = new ContactUsedEquipment();
		$o->where('contact_id', '=', $nId);
		$o->delete();
		// delete from contact_used_modes
		$o = new ContactUsedModes();
		$o->where('contact_id', '=', $nId);
		$o->delete();

		// delete self
		return( parent::delete($aKeys, $sTable) );
	}

	public function getContactMethods() {
		if (!$this->get('contact_id')) {
			return false;
		}
		$query = "SELECT
				contact_value_1, contact_value_2, method_id, method_type, method_group_id, method_type_id
				FROM contact_methods, contact_method_types
				WHERE contact_methods.contact_id = {$this->get('contact_id')}
				AND contact_methods.method_type_id = contact_method_types.method_id
				ORDER BY method_index";
		$rows = LP_Db::fetchAll($query);

		$rows = array_map(function($row) {

					// Format phone types to handle extension
					if ($row['method_group_id'] == 1) {
						$row['contact_value_1_raw'] = $row['contact_value_1'];
						$tmp = $row['contact_value_1'];
						if (!empty($row['contact_value_2'])) {
							$tmp .= 'x' . $row['contact_value_2'];
						}
						$formatted = ContactMethods::formatPhoneNumber($tmp);
						$row['contact_value_1'] = $formatted;
					}

					return $row;
				}, $rows);
		return $rows;
	}

	public function getPhone() {
		if (!$this->get('contact_id')) {
			return '';
		}
		$query = "SELECT
				contact_value_1
				FROM contact_methods, contact_method_types
				WHERE contact_methods.contact_id = {$this->get('contact_id')}
				AND contact_methods.method_type_id = contact_method_types.method_id
				AND method_group_id = " . ToolsMethodGroups::PhoneType;
		$row = LP_Db::fetchRow($query);
		if ($row) {
			return $row['contact_value_1'];
		}
		return $row;
	}

	public function getEmail() {
		if (!$this->get('contact_id')) {
			return '';
		}
		$query = "SELECT
				contact_value_1
				FROM contact_methods, contact_method_types
				WHERE contact_methods.contact_id = {$this->get('contact_id')}
				AND contact_methods.method_type_id = contact_method_types.method_id
				AND method_group_id = " . ToolsMethodGroups::EmailType;
		$row = LP_Db::fetchRow($query);
		if ($row) {
			return $row['contact_value_1'];
		}
		return $row;
	}

	public function getEmails() {
		$emails = array();
		if (!$this->get('contact_id')) {
			return $emails;
		}
		$query = "SELECT
				contact_value_1
				FROM contact_methods, contact_method_types
				WHERE contact_methods.contact_id = {$this->get('contact_id')}
				AND contact_methods.method_type_id = contact_method_types.method_id
				AND method_group_id = " . ToolsMethodGroups::EmailType;
		$rows = LP_Db::fetchAll($query);
		for ($i = 0; $i < count($rows); $i++) {
			$emails[] = array(
				'contactName' => $this->getName(),
				'contact_id' => $this->get('contact_id'),
				'email' => $rows[$i]['contact_value_1']
			);
		}
		return $emails;
	}

	public function getFax() {
		if (!$this->get('contact_id')) {
			return false;
		}
		// fax type = 3
		$query = "SELECT
				contact_value_1
				FROM contact_methods
				WHERE contact_methods.contact_id = {$this->get('contact_id')}
				AND method_type_id = 3";
		$row = LP_Db::fetchRow($query);
		if ($row) {
			return $row['contact_value_1'];
		}
		return $row;
	}

	public function getFaxes() {
		$faxes = array();
		if (!$this->get('contact_id')) {
			return $faxes;
		}
		// fax type = 3
		$query = "SELECT
				contact_value_1
				FROM contact_methods
				WHERE contact_methods.contact_id = {$this->get('contact_id')}
				AND method_type_id = 3";
		$rows = LP_Db::fetchAll($query);
		for ($i = 0; $i < count($rows); $i++) {
			$faxes[] = array(
				'contactName' => $this->getName(),
				'contact_id' => $this->get('contact_id'),
				'fax' => $rows[$i]['contact_value_1']
			);
		}
		return $faxes;
	}

	/**
	 *
	 * @return array array of mode ids
	 */
	public function getModeIds() {
		// get contact modes
		$modeIds = array();
		$query = "SELECT mode_id FROM contact_used_modes WHERE contact_id = {$this->get('contact_id')}";
		$rows = LP_Db::fetchAll($query);
		for ($i = 0; $i < count($rows); $i++) {
			$modeIds[] = $rows[$i]['mode_id'];
		}

		return $modeIds;
	}

	/**
	 *
	 * @return array array of equipment ids
	 */
	public function getEquipmentIds() {
		// get contact equipment
		$equipmentIds = array();
		$query = "SELECT equipment_id FROM contact_used_equipment WHERE contact_id = {$this->get('contact_id')}";
		$rows = LP_Db::fetchAll($query);
		for ($i = 0; $i < count($rows); $i++) {
			$equipmentIds[] = $rows[$i]['equipment_id'];
		}
		return $equipmentIds;
	}

	/**
	 *
	 * @param array $contactMethods should contain method_type_id, method_index, contact_value_1
	 */
	public function updateContactMethods($contactMethods) {
		$contactId = $this->get('contact_id');

		$query = "SELECT method_id FROM contact_method_types WHERE method_group_id = '" . ToolsMethodGroups::PhoneType . "'";
		$phoneTypes = LP_Db::fetchAll($query);
		$phoneTypes = array_map(function($b) {
					return $b['method_id'];
				}, $phoneTypes);

		// load up existing contact methods and just update them in order of the index
		// then insert/delete any extra contact methods
		$existingMethods = $this->getContactMethods();
		$numExisting = count($existingMethods);
		$numSubmitted = count($contactMethods);

		for ($i = 0; $i < $numExisting && $i < $numSubmitted; $i++) {
			//Get the existing method
			$existingMethod = $existingMethods[$i];

			//get the data
			$contactMethods[$i]['contact_value_2'] = '';
			$contactMethods[$i]['method_type_id'] = intval($contactMethods[$i]['method_type_id']);
			$contactMethods[$i]['method_index'] = $i;

			// Check if this is a phone type
			if (in_array(intval($contactMethods[$i]['method_type_id']), $phoneTypes)) {
				// Prepare all submitted data so it is safe in queries
				$number = ContactMethods::cleanPhoneNumber($contactMethods[$i]['contact_value_1']);
				$contactMethods[$i]['contact_value_1'] = $number['number'];
				$contactMethods[$i]['contact_value_2'] = $number['extension'];
			}

			$query = "UPDATE contact_methods
				SET
					method_type_id = {$contactMethods[$i]['method_type_id']},
					contact_value_1 = '{$contactMethods[$i]['contact_value_1']}',
					contact_value_2 = '{$contactMethods[$i]['contact_value_2']}'
				WHERE
					contact_id = $contactId
					AND method_type_id = {$existingMethod['method_type_id']}
					AND method_index = $i";
			LP_Db::execute($query);
		}

		// need to insert any new contact methods
		for ($i = $numExisting; $i < $numSubmitted; $i++) {
			$contactMethod = new ContactMethods();
			$contactMethod->create($contactId, $contactMethods[$i]['method_type_id'], $contactMethods[$i]['contact_value_1'], '', get_user_id());
		}

		// need to delete any removed methods
		if ($numSubmitted < $numExisting) {
			$methodIndex = $numSubmitted;
			$query = "DELETE FROM contact_methods WHERE contact_id = $contactId AND method_index >= $methodIndex";
			LP_Db::execute($query);
		}
	}

	/**
	 *
	 * @param array $modesAllowed array of mode ids
	 * @param array $equipmentAllowed array of equipment ids
	 */
	public function updateModesEquipment($modesAllowed, $equipmentAllowed) {
		$numModesAllowed = count($modesAllowed);
		$numEquipmentAllowed = count($equipmentAllowed);

		// prepare all data for being used in queries
		for ($i = 0; $i < $numModesAllowed; $i++) {
			$modesAllowed[$i] = intval($modesAllowed[$i]);
		}
		for ($i = 0; $i < $numEquipmentAllowed; $i++) {
			$equipmentAllowed[$i] = intval($equipmentAllowed[$i]);
		}

		// delete current relationships
		$query = "DELETE FROM contact_used_modes WHERE contact_id = {$this->get('contact_id')}";
		LP_Db::execute($query);
		$query = "DELETE FROM contact_used_equipment WHERE contact_id = {$this->get('contact_id')}";
		LP_Db::execute($query);

		// insert submitted data to make new relationships
		$myUserId = get_user_id();
		for ($i = 0; $i < $numModesAllowed; $i++) {
			$contactUsedModes = new ContactUsedModes();
			$contactUsedModes->create($this->get('contact_id'), $modesAllowed[$i], $myUserId);
		}
		for ($i = 0; $i < $numEquipmentAllowed; $i++) {
			$contactUsedEquipment = new ContactUsedEquipment();
			$contactUsedEquipment->create($this->get('contact_id'), $equipmentAllowed[$i], $myUserId);
		}
	}

	public function hasModes() {
		$query = "SELECT COUNT(*) num FROM contact_used_modes WHERE contact_id = {$this->get('contact_id')}";
		$row = LP_Db::fetchRow($query);
		return $row['num'];
	}

	public function hasEquipment() {
		$query = "SELECT COUNT(*) num FROM contact_used_equipment WHERE contact_id = {$this->get('contact_id')}";
		$row = LP_Db::fetchRow($query);
		return $row['num'];
	}

	public function getOwnerId() {
		$query = "SELECT owner_id FROM contact_owners WHERE contact_id = {$this->get('contact_id')}";
		$ownerId = 0;
		$row = LP_Db::fetchRow($query);
		if ($row) {
			$ownerId = $row['owner_id'];
		}
		return $ownerId;
	}

	public function checkTasks() {
		$this->checkContactStatusTasks();
	}

	/**
	 * Check for tasks based on contact status
	 */
	public function checkContactStatusTasks() {
		if ($this->get('contact_type_id') == ContactTypes::Customer) {

			// get status id
			$contactCustomerDetail = new ContactCustomerDetail();
			$contactCustomerDetail->load($this->get('contact_id'));
			$statusId = $contactCustomerDetail->get('status_id');

			$myUserId = get_user_id();

			// get the owner id
			$contactOwnerId = $this->getOwnerId();

			$taskDetails = array(
				'contact_id' => $this->get('contact_id')
			);

			$taskName = 'Update Contact Modes and Equipment';
			$taskTypes = new TaskTypes();
			$taskTypes->load(array(
				'task_name' => $taskName
			));
			$taskTypeId = $taskTypes->get('task_type_id');

			// find any existing task rows for this task
			$taskRow = TaskBase::findTask(-1, $taskTypeId, $taskDetails);

			$billTo = $this->getBillTo();
			$creditAndCollectionsId = UserRoles::CreditAndCollections;

			$taskName = 'Assign Bill To';
			$taskTypes->load(array(
				'task_name' => $taskName
			));
			$billToTaskTypeId = $taskTypes->get('task_type_id');
			$billToTaskDetails = array(
				'contact_id' => $this->get('contact_id')
			);

			// find any existing task rows for this task
			$billToTaskRow = TaskBase::findTask($creditAndCollectionsId, $billToTaskTypeId, $billToTaskDetails, 'role_id');

			if ($statusId == ContactCustomerDetail::Cold) {
				// make sure there are no tasks for warm or hot
				if ($taskRow) {
					$task = new TaskBase();
					$task->load($taskRow['task_id']);
					$task->delete();
				}
			}

			if ($statusId == ContactCustomerDetail::Warm || $statusId == ContactCustomerDetail::Hot) {
				// if warm, need to know modes allowed and equipment allowed for this contact
				// check if both of these are satisfied
				$hasModes = $this->hasModes();
				$hasEquipment = $this->hasEquipment();
				// Check if contact is missing either modes or equipment
				if (!$hasModes || !$hasEquipment) {
					// make a task to complete if this task doesn't exist already
					if (!$taskRow) {
						$task = new TaskBase();
						$task->create($taskTypeId, $contactOwnerId, time(), $taskDetails, $myUserId);
					}
				}
				else {
					// Contact has both modes and equipment, so complete the task if it exists
					if ($taskRow) {
						$task = new TaskBase();
						$task->load($taskRow['task_id']);
						$task->complete();
					}
				}
			}

			if ($statusId == ContactCustomerDetail::Hot) {
				// If hot, needs a bill to assigned to this contact

				if ($billTo['location_id']) {
					if ($billToTaskRow) {
						// If user has a bill to and there was a task to assign a bill to, complete the task
						$task = new TaskBase();
						$task->load($billToTaskRow['task_id']);
						$task->complete();
					}
				}
				else {
					// Make a task to assign a bill to
					if (!$billToTaskRow) {
						$task = new TaskBase();
						$task->create($billToTaskTypeId, 0, time(), $billToTaskDetails, $myUserId, $creditAndCollectionsId);
					}
				}
			}
			else {
				// Check if we need to clear any tasks related to hot contacts
				if ($billToTaskRow) {
					$task = new TaskBase();
					$task->load($billToTaskRow['task_id']);
					$task->delete();
				}
			}
		}
	}

	public function getName() {
		return $this->get('first_name') . ' ' . $this->get('last_name');
	}

	public function setBillTo($locationId) {
		$locationId = intval($locationId);

		// Load existing row for this contact if it exists
		$contactToBillTo = new ContactToBillTo();
		$contactToBillTo->load(array(
			'contact_id' => $this->get('contact_id')
		));
		$contactToBillTo->set('contact_id', $this->get('contact_id'));
		$contactToBillTo->set('location_id', $locationId);
		$contactToBillTo->save();
	}

	public function getBillTo() {
		$query = "SELECT
				contact_base.first_name,
				contact_base.last_name,
				(contact_base.first_name + ' ' + contact_base.last_name) AS contact_name,
				customer_base.customer_id,
				customer_base.customer_name,
				location_base.location_id,
				location_base.location_name_1,
				location_base.location_name_2
			FROM contact_base
			LEFT JOIN contact_to_bill_to ON contact_to_bill_to.contact_id = contact_base.contact_id
			LEFT JOIN location_base ON location_base.location_id = contact_to_bill_to.location_id
			LEFT JOIN customer_to_location ON customer_to_location.location_id = location_base.location_id
			LEFT JOIN customer_base ON customer_base.customer_id = customer_to_location.customer_id
			WHERE contact_base.contact_id = '{$this->get('contact_id')}'
			";
		$row = LP_Db::fetchRow($query);
		return $row;
	}

	public function getDocumentsRequired() {
		$query = "SELECT document_type_id, quantity FROM contact_document_requirements WHERE contact_id = {$this->get('contact_id')}";
		return LP_Db::fetchAll($query);
	}

	public function updateDocumentsRequired($documentsRequired) {
		$contactId = $this->get('contact_id');

		// delete existing requirements
		$query = "DELETE FROM contact_document_requirements WHERE contact_id = $contactId";
		LP_Db::execute($query);

		// Insert submitted requirements
		$typesInserted = array();
		for ($i = 0; $i < count($documentsRequired); $i++) {
			if (!in_array($documentsRequired[$i]['document_type_id'], $typesInserted)) {
				$document = new ContactDocumentRequirements();
				$document->create($contactId, $documentsRequired[$i]['document_type_id'], $documentsRequired[$i]['quantity']);
				$typesInserted[] = $documentsRequired[$i]['document_type_id'];
			}
		}
	}

	public function getBillToRecord() {
		$query = "SELECT
					contact_to_bill_to.location_id AS bill_to_location_id,
					customer_base.customer_name bill_to_customer_name,
					customer_base.customer_id bill_to_customer_id,
					location_base.location_name_1 AS bill_to_location_name
				FROM
					contact_to_bill_to
				LEFT JOIN location_base ON location_base.location_id = contact_to_bill_to.location_id
				LEFT JOIN customer_to_location ON customer_to_location.location_id = location_base.location_id
				LEFT JOIN customer_base ON customer_base.customer_id = customer_to_location.customer_id
				WHERE contact_to_bill_to.contact_id = {$this->get('contact_id')}";
		$row = LP_Db::fetchRow($query);
		return $row;
	}

}