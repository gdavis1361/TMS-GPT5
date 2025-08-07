<?php 
/**
 * Carrier Base Extended
 *
 * @author Steve Keylon
 */
 
class CarrierBaseExtended extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'carrier_base_extended';


	public function create(	$nCarrierId, $sMcNumber, $sSafetyRating, $sSafetyRatingDate, $nCommonAuthority,
							$nContractAuthority, $nBrokerAuthority,	$nCreatedById ) {
		
		$key = __CLASS__ . '::' . __METHOD__;
		// Validate Data
		if ( !number($nCarrierId,TRUE) ) {
			add_error('Missing Carrier Id - $nCarrierId', $key);
			$this->addError("Invalid Carrier");
			return FALSE;
		}
		if ( !string($sMcNumber,TRUE) ) {
			add_error('Missing String - $sMcNumber', $key);
			$this->addError("MC Number is required");
			return FALSE;
		}
		if ( !is_string($sSafetyRating) ) {
			add_error('missing string - $sSafetyRating', $key);
			return FALSE;
		}
		if ( !is_string($sSafetyRatingDate) ) {
			add_error('Missing String - ' . var_dump($sSafetyRatingDate), $key);
			return FALSE;
		}
		
		$nCommonAuthority   = (bool)$nCommonAuthority;
		$nContractAuthority = (bool)$nContractAuthority;
		$nBrokerAuthority   = (bool)$nBrokerAuthority;
		
		if ( !number($nCreatedById,TRUE) ) {
			add_error('missing numeric - $$nCreatedById', $key);
			return FALSE;
		}
		
		// Save Data
		$this->set_carrier_id($nCarrierId);
		$this->set_mc_no($sMcNumber);
		$this->set_safety_rating($sSafetyRating);
		$this->set_safety_rating_date($sSafetyRatingDate);
		$this->set_common_authority($nCommonAuthority);
		$this->set_contract_authority($nContractAuthority);
		$this->set_broker_authority($nBrokerAuthority);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		$this->set_active(1);
		
		$o = new Carrier411();
		$o->start_monitoring('MC' . $sMcNumber);
		
		$success = $this->save();
		
		return $success;
	}
	
	public function save() {
		parent::save();
		$this->checkTasks();
	}
	
	public function checkTasks() {
		$this->checkPayToTask();
		$this->checkDocumentsTask();
	}
	
	public function checkPayToTask() {
		// Make sure this carrier is linked to a pay to
		$myUserId = get_user_id();
		$payToId = $this->getPayToId();
		$taskDetails = array(
			'carrier_id' => $this->get('carrier_id')
		);

		$taskName = 'Assign Pay To';
		$taskTypes = new TaskTypes();
		$taskTypes->load(array(
			'task_name' => $taskName
		));
		$taskTypeId = $taskTypes->get('task_type_id');

		$carrierPayablesId = UserRoles::CarrierPayables;
		
		// find any existing task rows for this task
		$taskRow = TaskBase::findTask($carrierPayablesId, $taskTypeId, $taskDetails, 'role_id');
		
		if ($payToId) {
			// Check if there is a task to complete for setting the pay to
			if ($taskRow) {
				$task = new TaskBase();
				$task->load($taskRow['task_id']);
				$task->complete();
			}
		}
		else {
			// Make a task for setting the pay to
			if (!$taskRow) {
				$task = new TaskBase();
				
				// Get carrier info for task details
				$taskDetails['mc_no'] = $this->get('mc_no');
				$taskDetails['carrier_name'] = $this->getCarrierName();
				
				$task->create($taskTypeId, 0, time(), $taskDetails, $myUserId, $carrierPayablesId);
			}
		}
	}
	
	public function getPayToId() {
		$carrierToPayTo = new CarrierToPayTo(array(
			'carrier_id' => $this->get('carrier_id')
		));
		return $carrierToPayTo->get('pay_to_location_id');
	}
	
	/**
	 *
	 * @return array array of mode ids
	 */
	public function getModeIds() {
		// get contact modes
		$modeIds = array();
		$query = "SELECT mode_id FROM carrier_used_modes WHERE carrier_id = {$this->get('carrier_id')}";
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
		$query = "SELECT jaguar_equipment_id FROM carrier_to_equipment WHERE carrier_id = {$this->get('carrier_id')}";
		$rows = LP_Db::fetchAll($query);
		for ($i = 0; $i < count($rows); $i++) {
			$equipmentIds[] = $rows[$i]['jaguar_equipment_id'];
		}
		return $equipmentIds;
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
		$query = "DELETE FROM carrier_used_modes WHERE carrier_id = {$this->get('carrier_id')}";
		LP_Db::execute($query);
		$query = "DELETE FROM carrier_to_equipment WHERE carrier_id = {$this->get('carrier_id')}";
		LP_Db::execute($query);
		
		// insert submitted data to make new relationships
		for ($i = 0; $i < $numModesAllowed; $i++) {
			$carrierUsedModes = new CarrierUsedModes();
			$carrierUsedModes->create($this->get('carrier_id'), $modesAllowed[$i], get_user_id() );
			
		}
		
		for ($i = 0; $i < $numEquipmentAllowed; $i++) {
			$carriersToEquipment = new CarrierToEquipment();
			//TODO: add a way to manage the quantity
			$carriersToEquipment->create($this->get('carrier_id'), $equipmentAllowed[$i], 0, get_user_id());
		}
		
		$this->checkTasks();
	}
	
	public function getContacts() {
		$rows = array();
		if ($this->get('carrier_id')) {
			$query = "SELECT contact_base.contact_id, contact_base.first_name, contact_base.last_name
				FROM contact_base, location_to_carriers, location_to_contact
				WHERE location_to_carriers.carrier_id = {$this->get('carrier_id')}
				AND location_to_carriers.location_id = location_to_contact.location_id
				AND location_to_contact.contact_id = contact_base.contact_id
				ORDER BY first_name, last_name";
			$rows = LP_Db::fetchAll($query);
		}
		return $rows;
	}
	
	public function getRateConfirmationContactMethod() {
		// super inefficient, sorry
		$contacts = $this->getContacts();
		for ($i = 0; $i < count($contacts); $i++) {
			$contact = new ContactBase();
			$contact->load($contacts[$i]->get('contact_id'));
			$contactMethods = $contact->getContactMethods();
			for ($j = 0; $j < count($contactMethods); $j++) {
				if ($contactMethods[$j]['method_type'] == 'Email') {
					return $contactMethods[$j];
				}
				else if ($contactMethods[$j]['method_type'] == 'Fax') {
					return $contactMethods[$j];
				}
			}
		}
		
		return false;
	}
	
	public function getCarrierName() {
		$query = "SELECT CarrName FROM ContractManager.dbo.CarrierMaster WHERE CarrID = {$this->get('carrier_id')}";
		$row = LP_Db::fetchRow($query);
		$carrierName = '';
		if ($row) {
			$carrierName = $row['CarrName'];
		}
		return $carrierName;
	}
	
	public function checkDocumentsTask() {
		$myUserId = get_user_id();
		$taskDetails = array(
			'carrier_id' => $this->get('carrier_id')
		);
		$taskTypes = new TaskTypes();
		$taskTypes->load(array(
			'task_name' => 'Approve Carrier'
		));
		$carrierApprovalId = UserRoles::CarrierApproval;
		$approveCarrierTypeId = $taskTypes->get('task_type_id');
		$approveCarrierRow = TaskBase::findTask($carrierApprovalId, $approveCarrierTypeId, $taskDetails, 'role_id');
		
		// Check if this carrier is approved
		if ($this->get('status_id') == 1) {
			if ($approveCarrierRow) {
				// Complete the task
				$task = new TaskBase();
				$task->load($approveCarrierRow['task_id']);
				$task->complete();
			}
		}
		else {
			if (!$approveCarrierRow) {
				// Create the task
				$taskDetails['CarrName'] = $this->getCarrierName();
				$task = new TaskBase();
				$task->create($approveCarrierTypeId, 0, time(), $taskDetails, $myUserId, $carrierApprovalId);
			}
		}
		
	}
	
	public function approve() {
		$this->set('status_id', 1);
		$this->save();
		
		// Make notification for the user who added this carrier
		$carrierName = $this->getCarrierName();
		$description = "$carrierName has been approved for use.";
		Notification::create($this->get('created_by_id'), $description);
	}
	
	public function decline() {
		// Make notification for the user who added this carrier
		$carrierName = $this->getCarrierName();
		$description = "$carrierName has been declined for use. Refer to the carrier comments for the reason.";
		Notification::create($this->get('created_by_id'), $description);
	}
	
	public function getPayToRecord() {
		$query = "SELECT
					customer_base.customer_name pay_to_customer_name,
					customer_base.customer_id pay_to_customer_id,
					location_base.location_id AS pay_to_location_id,
					location_base.location_name_1 AS pay_to_location_name
				FROM
					carrier_base_extended
				LEFT JOIN location_to_carriers ON location_to_carriers.carrier_id = carrier_base_extended.carrier_id
				LEFT JOIN location_base ON location_base.location_id = location_to_carriers.location_id
				LEFT JOIN location_types ON location_types.location_type_id = location_base.type
				LEFT JOIN customer_to_location ON customer_to_location.location_id = location_base.location_id
				LEFT JOIN customer_base ON customer_base.customer_id = customer_to_location.customer_id
				WHERE
					carrier_base_extended.carrier_id = {$this->get('carrier_id')}
					AND location_types.name IN ('Pay-to', 'Terminal/Pay-to')";
		$row = LP_Db::fetchRow($query);
		return $row;
	}
	
	public function addLocation($locationId) {
		$locationId = intval($locationId);
		$carrierId = $this->get('carrier_id');
		
		$locationToCarriers = new LocationToCarriers();
		$locationToCarriers->load(array(
			'carrier_id' => $carrierId,
			'location_id' => $locationId
		));
		$success = $locationToCarriers->create($locationId, $carrierId);
		
		return $success;
	}
	
}