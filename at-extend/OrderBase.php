<?php

/**
 * Order Base
 *
 * @author Steve Keylon
 */
class OrderBase extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'order_base';
	var $Charge = null;
	var $Details = null;

	/*
	  function load($nId) {
	  parent::load($nId);
	  $this->Charge = new OrderCharge();
	  $this->Details = new OrderDetails();
	  if ( !$this->Charge->load($nId) ) $this->Charge = null;
	  if ( !$this->Details->load($nId) ) $this->Details = null;
	  }
	 */

	public function create($nCustomerId, $nBillToId, // Customer Id
			$nOrderedById, $nCreatedById, $nBrokerId, $vTeamRequired = FALSE) {
		// Validate input
		$key = __CLASS__ . '::' . __METHOD__;
		if (!is_numeric($nCustomerId)) {
			add_error('Customer id: ' . $nCustomerId, $key);
			return FALSE;
		}
		if (!is_numeric($nBillToId)) {
			add_error('Bill to id: ' . $nBillToId, $key);
			return FALSE;
		}
		if (!is_numeric($nOrderedById) || $nOrderedById <= 0) {
			add_error('Ordered By Id: ' . $nOrderedById . ' not valid', $key);
			return FALSE;
		}
		if (!is_numeric($nCreatedById)) {
			add_error('Created By Id: ' . $nCreatedById, $key);
			return FALSE;
		}
		if (!is_numeric($nBrokerId)) {
			add_error('Broker Id: ' . $nBrokerId, $key);
			return FALSE;
		}

		$vTeamRequired = intval($vTeamRequired);

		// Save Input
		$this->set_customer_id($nCustomerId);
		$this->set_bill_to_id($nBillToId);
		$this->set_ordered_by_id($nOrderedById);
		$nStatusId = 1; // Default Status Id to be determined by the table 'tools_status_types'
		$this->set_status_id($nStatusId);
		$this->set_team_required($vTeamRequired);
		$this->set_broker_id($nBrokerId);
		$this->set_active(1);
		if (!$nCreatedById) {
			$nCreatedById = get_user_id();
		}
//		$nCreatedById = $this->get_created_by_id();
		$vCreate = empty($nCreatedId);
		if ($vCreate) {
			$this->set_created_by_id($nCreatedById);
		}
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}
		$this->save();

		// Report
		return true;
	}

	public function get_customer() {

		$nCustomerId = $this->get_customer_id();
		$o = new CustomerBase();

		if (!empty($nCustomerId)) {
			$o->load($nCustomerId);
			return $o;
		}

		return;
	}

	/**
	 * Add Stop
	 *
	 * Wrapper Function for adding a stop while only working with this object.
	 * parameters are the same as Pre-Order Stop's create function.
	 *
	 */
	public function add_stop($nOrderId, $nStopIndex, $sStopType, $nLocationId, $sScheduleDate, $sApptTime, $nCreatedById) {
		$o = new OrderStops();
//		$nOrderId = $this->get_order_id();
		$o->create($nOrderId, $nStopIndex, $sStopType, $nLocationId, $sScheduleDate, $sApptTime, $nCreatedById);
		return $o;
	}

	public function add_comment($sComment, $nOrderId=null) {
		if ($nOrderId === null)
			$nOrderId = $this->get('order_id');
		if (empty($nOrderId) || empty($sComment) || $sComment == "")
			return false;

		$oComment = new OrderComments();
		return $oComment->create($nOrderId, $sComment, get_user_id());
	}

	public function convert_pre_order($oPreOrder) {
		$nCreatedById = get_user_id();
		$oOrder = new OrderBase();
		$v = $oOrder->create($oPreOrder->get('customer_id'), $oPreOrder->get_bill_to_id(), $oPreOrder->get('ordered_by_id'), $nCreatedById, $oPreOrder->get('broker_id'), ($oPreOrder->get('team_required') ? true : false)
		);
		$nOrderId = $oOrder->get_order_id();
		// Order to Pre Order association
		$oPreOrderToOrder = new PreOrderToOrder();
		$oPreOrderToOrder->create($oPreOrder->get('pre_order_id'), $nOrderId);
		$aPreAccessorials = $oPreOrder->list_accessorials();
		$aAccessorials = array();
		if (!empty($aPreAccessorials)) {
			foreach ($aPreAccessorials as $pre) {
				$oAccessorial = new OrderAccessorials();
				$nAccessorialToBillTo = $pre->get_bill_to();
				if (!is_numeric($nAccessorialToBillTo))
					$nAccessorialToBillTo = $oOrder->get('bill_to_id');
				$v = $oAccessorial->create($nOrderId, $pre->get('accessorial_type_id'), $pre->get('accessorial_qty'), $pre->get('accessorial_per_unit'), $pre->get('accessorial_total_charge'), $pre->get('accessorial_index'), $nAccessorialToBillTo, $nCreatedById
				);
			}
		}
		$oPreCharge = $oPreOrder->get_charge();
		if (!empty($oPreCharge)) {
			$oOrderCharge = new OrderCharge();
			$nFuelCharge = $oPreCharge->get('fuel_charge');
			$nLineHaulCharge = $oPreCharge->get('linehaul_charge');
			$nAccessorialCharge = $oPreCharge->get('accessorial_charge');
			$nFuelCost = 0; // Default. When there's no carrier, there's no charge set. 
			$nLineHaulCost = 0;
			$nAccessorialCost = 0;
			$oOrderCharge->create($nOrderId, $nFuelCharge, $nLineHaulCharge, $nAccessorialCharge, $nFuelCost, $nLineHaulCost, $nAccessorialCost, $nCreatedById);
		}
		// Order Comments
		$aPreComments = $oPreOrder->list_comments();
		if (empty($aPreComments)) {
			return;
		}
		else {
			foreach ($aPreComments as $comment) {
				$oOrder->add_comment($comment->get_comment());
			}
		}
		// Order Details
		$aPreDetails = $oPreOrder->list_details();
		foreach ($aPreDetails as $detail) {
			$nDetailType = $detail->get('detail_type');
			$sDetailValue = $detail->get('detail_value');
			$oDetail = new OrderDetails();
			$oDetail->create($nOrderId, $nDetailType, $sDetailValue, $nCreatedById);
		}
		// Order equipment allowed
		$aPreEquipment = $oPreOrder->list_equipment();
		foreach ($aPreEquipment as $equipment) {
			$oEquipment = new OrderEquipmentAllowed();
			$nEquipmentId = $equipment->get('equipment_id');
			$oEquipment->create($nOrderId, $nEquipmentId);
		}
		// Order modes allowed
		$aPreModes = $oPreOrder->list_modes();
		foreach ($aPreModes as $mode) {
			$oMode = new OrderModesAllowed();
			$nModeId = $mode->get('mode_id');
			$oMode->create($nOrderId, $nModeId, $nCreatedById);
		}
		// Order to posting
		$nPostingId = $oPreOrder->get_posting_id();
		if ($nPostingId) {
			$oOrderPosting = new OrderToPosting();
			$oOrderPosting->create($nOrderId, $nPostingId);
		}
		// Order stops
		$a = array();
		$aPreStops = $oPreOrder->get_stops();

		$nLastStopIndex = null;
		foreach ($aPreStops as $id => $stop) {
			$oOrderStop = new OrderStops();
			$oPreOrderStop = new PreOrderStops();
			$nPreOrderStopId = $stop->get('pre_order_stops_id');
			$oPreOrderStop->load($nPreOrderStopId);
			$oStopToLocation = new PreOrderStopToLocation();
			$oStopToLocation->load($nPreOrderStopId);
			$nStopIndex = $oPreOrderStop->get('stop_index');
			$nLocationId = $oStopToLocation->get('location_id');
			$sStopType = $oPreOrderStop->get('stop_type');
			$sScheduleDate = $oPreOrderStop->get('schedule_date');
			$sApptTime = $oPreOrderStop->get('appt_time');
			if (!$oOrderStop->create($nOrderId, $nStopIndex, $nLocationId, $sStopType, $sScheduleDate, $sApptTime, $nCreatedById)) {
				echo "Failure!";
			}
			$nOrderStopId = $oOrderStop->get('order_stops_id');
			// Order stop_contacts
			$nStopContact = $oPreOrderStop->get_contact_id();
			if ($nStopContact > 0) {
				$oContact = new OrderStopContacts();
				$oContact->create($nOrderId, $nStopIndex, $nStopContact, $nCreatedById);
			}
			// Order stop_details
			$aStopDetails = $oPreOrderStop->list_details();
			foreach ($aStopDetails as $detail) {
				$oPreStopDetail = new PreOrderStopDetails();
				$nPreOrderStopDetailId = $detail->get('pre_order_stop_details_id');

				$oPreStopDetail->load($nPreOrderStopDetailId);

				$nDetailIndex = $oPreStopDetail->get('detail_index');
				$nDetailType = $oPreStopDetail->get('detail_type');
				$sDetailValue = $oPreStopDetail->get('detail_value');

				$oStopDetail = new OrderStopDetails();
				$oStopDetail->create($nOrderId, $nStopIndex, $nDetailIndex, $nDetailType, $sDetailValue);
			}
			// Order stop_instructions
			$aStopInstructions = $oPreOrderStop->list_instructions();
			foreach ($aStopInstructions as $instruction) {
				$oPreStopInstruction = new PreOrderStopInstructions();
				$oPreStopInstruction->load($instruction->get('pre_order_stop_instruction_id'));
				$nInstructionIndex = $oPreStopInstruction->get('instruction_index');
				$nInstructionType = $oPreStopInstruction->get('instruction_type_id');
				$sInstructionValue = $oPreStopInstruction->get('instruction');
				$oStopInstruction = new OrderStopInstructions();
				$oStopInstruction->create($nOrderId, $nStopIndex, $nInstructionIndex, $nInstructionType, $sInstructionValue, $nCreatedById);
			}
		}
		// Order to Movement and Movement to Load
		foreach ($aPreStops as $k => $stop) {
			if (!isset($aPreStops[$k - 1]))
				continue;
			$nOriginIndex = $aPreStops[$k - 1]->get('stop_index');
			$nDestinationIndex = $aPreStops[$k]->get('stop_index');
			$oMovement = new MovementBase();
			$oMovement->create($nOriginIndex, $nDestinationIndex, $nOrderId, $nCreatedById);

			$nMovementId = $oMovement->get('movement_id');

			$oLoad = new LoadBase();
			$oLoad->create(0, ($oPreOrder->get('team_required') ? true : false), 0, 0, 0, $nMovementId, $nCreatedById, $nOrderId);
		}

		// Order documents_required
		$aDocsRequired = $oPreOrder->list_document_requirements();
		foreach ($aDocsRequired as $requirement) {
			$oDocument = new OrderDocumentRequirements();
			$nDocumentTypeId = $requirement['document_type_id'];
			$nQuantity = $requirement['quantity'];

			$oDocument->create($nOrderId, $nDocumentTypeId, $nQuantity, $nCreatedById);
		}

		return true;
	}

	public function set_inactive() {
		$nId = $this->get_order_id();
		if (empty($nId))
			return;
		$this->load($nId);
		$this->set('active', 0);
		$this->set('status_id', 0);
		$this->save();
		return true;
	}

	public function get_stops() {
		$nId = $this->get_order_id();
		if (empty($nId))
			return array();
		//$o = new OrderStops();
		//$o->where('order_id', '=', $nId);
		//$o->order('stop_index', $sOrder);
		//$a = $o->list()->rows;
		$s = "SELECT stop.* FROM order_stops stop
			WHERE stop.order_id = '" . $nId . "'";
		$res = $this->query($s);

		$tmp = array();
		while ($row = $this->db->fetch_object($res)) {
			$tmp[$row->order_stops_id] = $row;
		}
		return $tmp;
	}

	public function get_movement_data($nOrderId=0) {
		if (empty($nOrderId) && $this->is_loaded())
			$nOrderId = $this->get('order_id');

		$s = "SELECT move.*, ld.*, carrier.CarrName as carrier_name
				FROM tms.dbo.movement_base move
				LEFT JOIN tms.dbo.order_to_movement o2m ON o2m.movement_id = move.movement_id
				LEFT JOIN tms.dbo.movement_to_load m2l ON m2l.movement_id = o2m.movement_id
				LEFT JOIN tms.dbo.load_base ld ON ld.load_id = m2l.load_id
				LEFT JOIN ContractManager.dbo.CarrierMaster carrier ON carrier.CarrID = ld.carrier_id
				WHERE ld.order_id = '" . $nOrderId . "'";
//		error_log($s);
		$res = $this->query($s);

		$tmp = array();
		while ($row = $this->db->fetch_object($res)) {
			$tmp[$row->origin_index] = $row;
		}
		return $tmp;
	}

	public function get_posting_id() {
		$nId = $this->get_order_id();
		if (empty($nId))
			return false;
		$o = new OrderToPosting();
		$o->where('order_id', '=', $nId);
		$aPosting = $o->list()->rows;
		if (isset($aPosting[0]))
			return $aPosting[0]->get('posting_id');
		return false;
	}

	public function get_bill_to() {
		$nId = $this->get_bill_to_id();
		if (empty($nId))
			return false;
		$o = new CustomerBase();

		return $o->load($nId) ? $o : false;
	}

	public function get_charge() {
		$nId = $this->get_order_id();
		if (empty($nId))
			return false;
		$o = new OrderCharge();
		$o->where('order_id', '=', $nId);
		$a = $o->list()->rows;

		if (isset($a[0]))
			return $a[0];

		return false;
	}

	public function list_comments() {
		$nId = $this->get_order_id();
		if (empty($nId))
			return false;
		$o = new OrderComments();
		$o->where('order_id', '=', $nId);
		$a = $o->list()->rows;
		return $a;
	}

	public function list_document_requirements() {
		$oBilledCustomer = $this->get_bill_to();
		$aDocs = array();
		if ($oBilledCustomer) {
			$aDocs = $oBilledCustomer->get_required_documents();
		}
		return $aDocs;
	}

	public function list_details($sOrder = 'ASC') {
		$nId = $this->get_order_id();
		if (empty($nId))
			return false;
		$s = "SELECT 
				detail.*, type.detail_type_name as name 
			FROM 
				order_details detail
			LEFT JOIN tools_detail_types type ON type.detail_type_id = detail.detail_type
			WHERE 
				detail.order_id = " . $nId . "
			ORDER BY detail_index $sOrder";

		$res = $this->query($s);
		$a = array();
		while ($row = $this->db->fetch_object($res)) {
			$a[] = $row;
		}

		return $a;
	}

	public function list_modes() {
		$nId = $this->get_order_id();
		if (empty($nId))
			return false;

		$s = "SELECT
				allowed.*, modes.mode_name
			FROM 
				order_modes_allowed allowed
			LEFT JOIN modes ON modes.mode_id = allowed.mode_id
			WHERE 
				allowed.order_id = " . $nId;


		$res = $this->query($s);
		$a = array();
		while ($row = $this->db->fetch_object($res)) {
			$a[] = $row;
		}

		return $a;
	}

	public function list_equipment() {
		$nId = $this->get_order_id();
		if (empty($nId))
			return array();

		$s = "SELECT 
					allowed.*, equip.CarrEquipDesc as name 
				FROM 
					TMS.dbo.order_equipment_allowed allowed
				LEFT JOIN ContractManager.dbo.AvailableEquipment equip ON equip.CarrEquipId = allowed.equipment_id
				WHERE 
					allowed.order_id = " . $nId;

		$res = $this->query($s);
		$a = array();
		while ($row = $this->db->fetch_object($res)) {
			$a[] = $row;
		}

		return $a;
	}

	public function list_accessorials($sOrder = 'ASC') {
		$nId = $this->get_order_id();
		if (empty($nId))
			return false;

		$s = "SELECT rel.*, code.*, code.AccCodeDesc as accessorial_name
			FROM tms.dbo.order_accessorials rel
			LEFT JOIN ContractManager.dbo.AccessorialCodes code ON code.AccCodeId = rel.accessorial_type_id
			LEFT JOIN tms.dbo.customer_base customer ON customer.customer_id = rel.bill_to
			WHERE rel.order_id = " . $nId . "
			ORDER BY rel.created_at $sOrder";

		$res = $this->query($s);
		$a = array();
		while ($row = $this->db->fetch_object($res)) {
			$a[] = $row;
		}

		return $a;
	}

	public function update_stops($stops) {
		//pre($stops); die();
		if (!$this->get('order_id')) {
			return false;
		}

		//Get the current stops, so we can remove any that were deleted
		$currentStops = $this->getStops();
		$currentStopIds = array();
		foreach ($currentStops as $currentStop) {
			$currentStopIds[] = $currentStop['order_stops_id'];
		}
		//Loop through stops
		$stopIds = array();
		for ($i = 0; $i < count($stops); $i++) {
			$stop = $stops[$i];
			$stopIndex = $i;
			$orderStops = new OrderStops();
			$orderStops->load($stop['stop_id']);

			//Process the stop data
			if (strtotime($stop['date'])) {
				$stop['date'] = date('Y-m-d', strtotime($stop['date']));
			}
			else {
				$stop['date'] = null;
			}
			if (strtotime($stop['time'])) {
				$stop['time'] = date('g:i a', strtotime($stop['time']));
			}
			else {
				$stop['time'] = null;
			}

			//If there is no stop_id create the stop
			if (!$orderStops->get('order_stops_id')) {
				$orderStops->create(
						$this->get('order_id'), $stopIndex, $stop['location_id'], $stop['stop_type'], $stop['date'], $stop['time'], get_user_id(), $stop['contact_id']
				);
			}

			//Else this is an existing stop and we just need to update some infor
			else {
				$orderStops->setArray(array(
					"stop_index" => $stopIndex,
					"location_id" => $stop['location_id'],
					"stop_type" => $stop['stop_type'],
					"schedule_date" => $stop['date'],
					"appt_time" => $stop['time'],
					"contact_id" => $stop['contact_id'],
				));
				$orderStops->save();
			}

			//Here we should have the stop if it was new or old, update stop details
			$orderStops->update_details($stop['details']);

			//Add this stop id to the stopIds array so we can check against current stops
			$stopIds[] = $orderStops->get('order_stops_id');
		}

		//Delete any stops that existed in the current stops but were not submitted
		foreach ($currentStopIds as $currentStopId) {
			if (!in_array($currentStopId, $stopIds)) {
				$deleteStop = new OrderStops();
				$deleteStop->load($currentStopId);
				$deleteStop->delete();
			}
		}

		//Make sure this order has a load
		$loadBase = new LoadBase();
		$loadBase->load(array(
			'order_id' => $this->get('order_id')
		));
		if (!$loadBase->get('load_id')) {
			$loadBase->create(
					0, 0, 0, 0, 0, 0, get_user_id(), $this->get('order_id')
			);
		}

//		$this->checkTasks();

		return true;
	}

	/**
	 * update/create/delete this orders modes
	 * because the rows in order_modes_allowed are not uniqui, we only need to create or delete
	 * @param array $aModes an array of modes allowed
	 * 								mode_id
	 * @return bool (true = success, false = failure)
	 */
	public function update_modes($aModes) {
		$nOrderId = $this->get_order_id();
		if (empty($nOrderId))
			return false;
		$nUserId = get_user_id();
		$vSuccess = true;
		$aUpdateIndex = array();
		$oModes = new OrderModesAllowed();
		$oModes->where('order_id', '=', $nOrderId);
		$oModes->order('mode_index', 'ASC');
		$aA = $oModes->list()->rows;
		$aModes = array_unique($aModes); // prevent duplicate entries

		$nSize = count($aA);
		$nIndex = 1;
		$vHasDeleted = false;
		$nDeleteCount = 0;
		for ($i = 0; $i < $nSize; $i++) { // match mode_id's. only keep the unmatched ones
			if (in_array($aA[$i]->get_mode_id(), $aModes)) {
				if ($vHasDeleted)
					$aUpdateIndex[] = array('index' => $nIndex, 'mode' => $aA[$i]->get_mode_id());
				$aModes = remove_item_by_value($aModes, $aA[$i]->get_mode_id());
				unset($aA[$i]);
				$nIndex++;
			}else
				$vHasDeleted = true;
		}
		// delete any remaining stored modes
		$aModeDeleteIds = array();
		foreach ($aA as $a) //  build the mode_id array to delete
			$aModeDeleteIds[] = $a->get_mode_id();
		if (count($aModeDeleteIds) > 0) {
			$oModes = new OrderModesAllowed();
			$oModes->where('order_id', '=', $nOrderId);
			$oModes->where('mode_id', '=', $aModeDeleteIds);
			$oModes->delete();
		}
		// update the index of any stored modes that need updating
		foreach ($aUpdateIndex as $a) { // because there is no unique id, we must update manually
			$o = new DBModel();
			$o->connect();
			$sQuery = "UPDATE order_modes_allowed SET mode_index = " . $a['index'] . ", updated_by_id = $nUserId, updated_at = '" . date('M j Y H:i:s:000 A') . "' WHERE order_id = $nOrderId AND mode_id = " . $a['mode'];
			$o->query($sQuery);
		}
		// create any remaining sent modes
		foreach ($aModes as $nModeId) {
			$oModes = new OrderModesAllowed();
			$nModeId = intval($nModeId);
			$vSuccess = $oModes->create($nOrderId, $nModeId, $nUserId);
			return $vSuccess;
		}
		return true;
	}

	/**
	 * update/create/delete this orders equipment_allowed
	 * because the rows in order_equipment_allowed are not unique, we only need to create or delete
	 * parameters:		array of equipment_ids
	 * 							equipment_id
	 * return:			bool (true = success, false = failure)
	 */
	public function update_equipments($aEquipments) {
		$nOrderId = $this->get_order_id();
		if (empty($nOrderId))
			return false;
		$vSuccess = true;
		$oEquip = new OrderEquipmentAllowed();
		$oEquip->where('order_id', '=', $nOrderId);
		$aA = $oEquip->list()->rows;
		$aEquipments = array_unique($aEquipments); // prevent duplicate entries

		$nSize = count($aA);
		for ($i = 0; $i < $nSize; $i++) { // match equipment_id's. only keep the unmatched ones
			if (in_array($aA[$i]->get_equipment_id(), $aEquipments)) {
				$aEquipments = remove_item_by_value($aEquipments, $aA[$i]->get_equipment_id());
				unset($aA[$i]);
			}
		}
		// delete any remaining stored equipments
		$aEquipDeleteIds = array();
		foreach ($aA as $a) { // build the equipment_id array to delete
			$aEquipDeleteIds[] = $a->get_equipment_id();
		}
		if (count($aEquipDeleteIds) > 0) {
			$oEquip = new OrderEquipmentAllowed();
			$oEquip->where('order_id', '=', $nOrderId);
			$oEquip->where('equipment_id', '=', $aEquipDeleteIds);
			$oEquip->delete();
		}
		// create any remaining sent equipments
		foreach ($aEquipments as $nEId) {
			$oEquip = new OrderEquipmentAllowed();
			$nEId = intval($nEId);
			if ($nEId) {
				$vSuccess = $oEquip->create($nOrderId, $nEId);
			}
			return $vSuccess;
		}
		return true;
	}

	/**
	 * update/create/delete this orders details
	 * parameters:		array of details
	 * 							n[type]		=> detail_type
	 * 							s[value]	=> detail_value
	 * return:			bool (true = success, false = failure)
	 */
	public function update_details($aDetails) {
		$nOrderId = $this->get_order_id();
		if (empty($nOrderId))
			return false;
		$vSuccess = true;
		$nUserId = get_user_id();
		$oOrderDetail = new OrderDetails();
		$oOrderDetail->where('order_id', '=', $nOrderId);
		$oOrderDetail->order('detail_index', 'ASC');
		$aA = $oOrderDetail->list()->rows;
		$loop_limit = min(count($aA), count($aDetails));
		for ($i = 0; $i < $loop_limit; $i++) { // loop through and update detail_type and value in order sent
			if (( $aA[$i]->get_detail_type() != $aDetails[$i]['type'] ||
					$aA[$i]->get_detail_value() != $aDetails[$i]['value'] ) &&
					is_numeric($aDetails[$i]['type'])) { // dosen't match
				// because the OrderDetails object will increment the index to next largest in db, we must update manually
				$sQuery = "UPDATE order_details SET 
								detail_type = " . $aDetails[$i]['type'] . ", 
								detail_value = '" . $aDetails[$i]['value'] . "'
							WHERE order_id = $nOrderId 
							AND detail_index = " . $aA[$i]->get_detail_index();
				$o = new DBModel();
				$o->connect();
				$o->query($sQuery);
			}
			if (is_numeric($aDetails[$i]['type'])) // save for deletion if this sent is the blank
				unset($aA[$i]);
			unset($aDetails[$i]);
		}
		// delete any remaining stored details
		foreach ($aA as $a) {
			$sQuery = "DELETE FROM order_details 
						WHERE order_id = $nOrderId AND detail_index = " . $a->get_detail_index();
			$o = new DBModel();
			$o->connect();
			$oOrderDetail->query($sQuery);
		}
		// create any remaining sent details
		foreach ($aDetails as $aDetail) {
			if (!is_numeric($aDetail['type']))
				continue; // skip empty details
			$oOrderDetail = new OrderDetails();
			$vSuccess = $oOrderDetail->create($nOrderId, $aDetail['type'], $aDetail['value'], $nUserId);
			if (!$vSuccess)
				return false;
		}
		return true;
	}

	/**
	 * update/create/delete this orders charges (fuel, linehaul, accessorials)
	 * parameters:		$nFuelCharge: the fuel charge for this order
	 * 					$nLineHaulCharge: the linehaul charge for this order
	 * 					$aAccessorials: an array of accessorials
	 * 							n[id]			=> id of the accessorial (0 = new accessorial)
	 * 							n[type_id]		=> type of the accessorial
	 * 							n[per_unit]		=> quantity accessorial_qty
	 * 							f[unit_count]	=> price per unit accessorial_per_unit
	 * 							n[bill_to]		=> customer to bill to (if empty then bill to same as order)
	 * 					$nFuelCost: 	the actual cost of the fuel
	 * 					$nLineHaulCharge:	the actual cost of the linehaul
	 * 					$nAccessorialCost:	the actual cost of the accessorials
	 * 					
	 * return:			bool (true = success, false = failure)
	 */
	public function update_charges($nFuelCharge, $nLineHaulCharge, $aAccessorials, $nFuelCost = 0, $nLineHaulCost = 0, $nAccessorialCost = 0) {
		$nOrderId = $this->get_order_id();
		if (empty($nOrderId))
			return false;
		$vSuccess = true;
		$nUserId = get_user_id();
		$nTotalAccessorialCharge = 0;
		$aAccessorials = reindex_by_array_element($aAccessorials, 'id');
		// get the existing accessorials from the db
		$oAccessorials = new OrderAccessorials();
		$oAccessorials->where('order_id', '=', $nOrderId);
		// delete accessorials missing from sent
		foreach ($oAccessorials->list()->rows as $a) {
			if (!array_key_exists($a->get_order_accessorial_id(), $aAccessorials))
				$oAccessorials->delete($a->get_order_accessorial_id());
		}
		// update the remaining existing accessorials
		foreach ($aAccessorials as $nIndex => $a) {
			$oAccessorials = new OrderAccessorials();
			if ($a['id'] > 0)
				$oAccessorials->load($a['id']);
			if ($a['bill_separate'] == 0) // don't bill separte
				$nBillTo = $this->get_bill_to_id();
			else // bill separate if have an id to bill to
				$nBillTo = empty($a['bill_to_id']) ? $this->get_bill_to_id() : $a['bill_to_id'];
			$nCharge = round($a['per_unit'] * $a['unit_count'], 4);
			$nTotalAccessorialCharge += $nCharge;
			$vSuccess = $oAccessorials->create($nOrderId, $a['type_id'], $a['unit_count'], $a['per_unit'], $nCharge, $nIndex, $nBillTo, $nUserId);
			if (!$vSuccess)
				return false;
		}
		// update my order_charge
		$oOrderCharge = new OrderCharge();
		$oOrderCharge->where('order_id', '=', $nOrderId);
		$res = $oOrderCharge->list();
		if (count($res->rows) > 0) {
			$row = $res->rows[0]; // should only every get one result
			if ($row->get_charge_id() != "" || $row->get_charge_id() != 0)
				$oOrderCharge->load($row->get_charge_id());
		}
		return $oOrderCharge->create($nOrderId, $nFuelCharge, $nLineHaulCharge, $nTotalAccessorialCharge, $nFuelCost, $nLineHaulCost, $nAccessorialCost, $nUserId);
	}

	public function was_pre_order_contracted_rate() {
		$nId = $this->get_order_id();
		if (empty($nId))
			return array();
		$sQuery = "SELECT po.is_contracted_rate FROM pre_order_base po
					INNER JOIN pre_order_to_order p2o
					ON po.pre_order_id = p2o.pre_order_id
					
					WHERE p2o.order_id = $nId";
		$res = $this->query($sQuery);
		$row = $this->db->fetch_array($res);
		if ($row['is_contracted_rate'] == 1)
			return true;
		else
			return false;
	}

	/**
	 * gets the orders and their relevant data from db.  Allows for paging of the list
	 * @param $nPageNum the page number of the lists page
	 * @param $nNumItems the number of items per page
	 * @return an array of orders with an array of their relevant data objects
	 */
	public static function get_order_list($nPageNum = 1, $nNumItems = 50, $aFilter=array()) {
		$nInnerLimit = $nPageNum * $nNumItems;
		global $oSession;
		$aReturn = array();
		$sOrderIds = '';
		$aOrderIds = array();

		$aWhere = array();
		$aEquipWhere = array();
		foreach ($aFilter as $row => $value) {
			switch ($row) {
				case "broker_id":
					if (!is_array($value))
						$value = array((int) $value); else
						$value = array_map(function($a) {
									return (int) $a;
								});
					$aWhere[] = "o.broker_id IN (" . implode(", ", $value) . ")";
					break;
				case "equipment":
					if (!is_array($value))
						$value = array($value); else
						$value = array_map(function($a) {
									return (int) $a;
								});
					$aEquipWhere[] = $value;
					break;
				case "radius":
					// HAH!
					break;
				case "status_id":
					$aWhere[] = "o.status_id = '" . (int) $value . "'";
					break;
			}
		}


		$sQuery = LP_Util::buildQueryPage("SELECT
						o.*, c.charge_id, c.total_charge, c.fuel_charge, c.linehaul_charge, 
						c.accessorial_charge, c.total_cost, c.fuel_cost, c.linehaul_cost, 
						c.accessorial_cost, c.total_profit, c.total_profit_pct, 
						c.created_by_id as charge_created_by_id, 
						c.created_at as charge_created_at, c.updated_by_id as charge_updated_by_id, 
						c.updated_at as charge_updated_at,
						(cb.first_name + ' ' + cb.last_name) as broker_name,
						customer.customer_name, status.status_name
					FROM order_base o
					LEFT JOIN order_charge c ON c.order_id = o.order_id
					LEFT JOIN user_base ub ON ub.user_id = o.broker_id
					LEFT JOIN contact_base cb ON cb.contact_id = ub.contact_id
					LEFT JOIN customer_base customer ON customer.customer_id = o.customer_id
					LEFT JOIN tools_status_types status ON status.status_id = o.status_id
					WHERE o.active = 1 AND 
					o.status_id != '4' AND
					o.broker_id IN (" . implode(", ", $oSession->session_var('user_scope')) . ") ", "order_id DESC", $nPageNum, 25);

		$o = new DBModel();
		$o->connect();
		$res = $o->query($sQuery);
		while ($row = $o->db->fetch_object($res)) {
			if ($sOrderIds != "")
				$sOrderIds .= ', ';
			$sOrderIds .= $row->order_id;
			$aOrderIds[] = $row->order_id;
			$oOrder = new OrderBase();
			$oCharge = new OrderCharge();
			$aO = array('order_id' => $row->order_id, 'customer_id' => $row->customer_id,
				'bill_to_id' => $row->bill_to_id, 'ordered_by_id' => $row->ordered_by_id,
				'team_required' => $row->team_required, 'broker_id' => $row->broker_id,
				'created_by_id' => $row->created_by_id, 'created_at' => $row->created_at,
				'updated_by_id' => $row->updated_by_id, 'updated_at' => $row->updated_at,
				'active' => $row->active);
			$aC = array('charge_id' => $row->charge_id, 'order_id' => $row->order_id,
				'total_charge' => $row->total_charge, 'fuel_charge' => $row->fuel_charge,
				'linehaul_charge' => $row->linehaul_charge,
				'accessorial_charge' => $row->accessorial_charge, 'total_cost' => $row->total_cost,
				'fuel_cost' => $row->fuel_cost, 'linehaul_cost' => $row->linehaul_cost,
				'accessorial_cost' => $row->accessorial_cost, 'total_profit' => $row->total_profit,
				'total_profit_pct' => $row->total_profit_pct,
				'created_by_id' => $row->charge_created_by_id,
				'created_at' => $row->charge_created_at,
				'updated_by_id' => $row->charge_updated_by_id,
				'updated_at' => $row->charge_updated_at);
			$oOrder->preload_data($aO);
			$oCharge->preload_data($aC);

			$aReturn[$row->order_id]['order'] = $oOrder->get();
			$aReturn[$row->order_id]['order']['broker_name'] = $row->broker_name;
			$aReturn[$row->order_id]['order']['customer_name'] = $row->customer_name;
			$aReturn[$row->order_id]['order']['status_name'] = $row->status_name;
			$aReturn[$row->order_id]['charge'] = $oCharge->get();
		}

		if (empty($aOrderIds))
			return $aReturn;
		/*
		 * Query for Carriers
		 */
		$s = "SELECT load.*, carrier.CarrName as carrier_name, load.order_id FROM tms.dbo.load_base load 
				LEFT JOIN ContractManager.dbo.CarrierMaster carrier ON carrier.CarrID = load.carrier_id " .
//				LEFT JOIN tms.dbo.movement_to_load m2l ON m2l.load_id = load.load_id
//				LEFT JOIN tms.dbo.order_to_movement o2m ON o2m.movement_id = m2l.movement_id
				"
				WHERE load.order_id IN (" . implode(', ', $aOrderIds) . ")";
		$res = $o->query($s);
		$aLoads = array();
		while ($row = $o->db->fetch_object($res)) {
			$aLoads[$row->order_id][] = $row;
		}
		foreach ($aLoads as $nOrderId => $load) {
			$aReturn[$nOrderId]['loads'] = $load;
		}

		/*
		 * Query for Equipment list
		 */
		$s = "SELECT e.order_id, equip.CarrEquipDesc as name FROM tms.dbo.order_equipment_allowed e
				LEFT JOIN ContractManager.dbo.AvailableEquipment equip ON e.equipment_id = equip.CarrEquipId
				WHERE e.order_id IN (" . implode(", ", $aOrderIds) . ")";
		$res = $o->query($s);
		$aEquipment = array();
		while ($row = $o->db->fetch_object($res)) {
			$aEquipment[$row->order_id][] = $row->name;
		}
		foreach ($aEquipment as $nOrderId => $aEquip) {

			$aReturn[$nOrderId]['equipment'] = $aEquip;
		}

		/*
		 * Query for stop list
		 */
		$s = "SELECT location.*, stop.* FROM order_stops stop
				LEFT JOIN tms.dbo.location_base location ON location.location_id = stop.location_id
				WHERE stop.order_id IN (" . implode(", ", $aOrderIds) . ")
				ORDER BY stop.stop_index ASC";
		$res = $o->query($s);
		$aStops = array();
		while ($row = $o->db->fetch_object($res)) {
			$aStops[$row->order_id][] = (array) $row;
			$sZip = $row->zip;
			if (is_numeric($sZip)) {
				$aUSZips[] = $sZip;
			}
			else {
				$aCANZips[] = $sZip;
			}
		}

		if (!empty($aUSZips)) {
			$s = "SELECT * FROM ContractManager.dbo.ZipsPostalCodesUS
					WHERE Zip IN ('" . implode("', '", $aUSZips) . "')";
			$aCityState = array();
			$res = $o->query($s);
			while ($row = $o->db->fetch_object($res)) {
				$aCityState[$row->Zip] = $row;
			}
		}

		foreach ($aStops as $nOrderId => $aStop) {
			foreach ($aStop as $k => $stop) {
				if (!is_numeric($stop['zip']))
					continue;
				$aStop[$k]['city'] = $aCityState[$stop['zip']]->City;
				$aStop[$k]['state'] = $aCityState[$stop['zip']]->State;
			}
			$aReturn[$nOrderId]['stops'] = $aStop;
		}

		return $aReturn;
	}

	/**
	 * override the parent delete function to also delete all related db data
	 */
	public function delete($aKeys = FALSE, $sTable = FALSE) {
		$nOrderId = $this->get_order_id();
		if (empty($nOrderId))
			return false;
		// delete from order_stops
		$o = new OrderStops();
		$o->where('order_id', '=', $nOrderId);
		$aA = $o->list()->rows;
		foreach ($aA as $a) { // an order_stop needs it's stop_index to delete it's related objects
			$o = new OrderStops();
			$o->where('order_id', '=', $a->get_order_id());
			$o->where('stop_index', '=', $a->get_stop_index());
			$o->delete();
		}
		// delete from order_accessorials
		$o = new OrderAccessorials();
		$o->where('order_id', '=', $nOrderId);
		$o->delete();
		// delete from order_charge
		$o = new OrderCharge();
		$o->where('order_id', '=', $nOrderId);
		$o->delete();
		// delete from order_comments
		$o = new OrderComments();
		$o->where('order_id', '=', $nOrderId);
		$o->delete();
		// delete from order_details
		$o = new OrderDetails();
		$o->where('order_id', '=', $nOrderId);
		$o->delete();
		// delete from order_document_requirements
		$o = new OrderDocumentRequirements();
		$o->where('order_id', '=', $nOrderId);
		$o->delete();
		// delete from order_equipment_allowed
		$o = new OrderEquipmentAllowed();
		$o->where('order_id', '=', $nOrderId);
		$o->delete();
		// delete from order_instructions
		$o = new OrderInstructions();
		$o->where('order_id', '=', $nOrderId);
		$o->delete();
		// delete from order_modes_allowed
		$o = new OrderModesAllowed();
		$o->where('order_id', '=', $nOrderId);
		$o->delete();
		// delete from order_to_posting
		$o = new OrderToPosting();
		$o->where('order_id', '=', $nOrderId);
		$o->delete();
		// delete from pre_order_to_order
		$o = new PreOrderToOrder();
		$o->where('order_id', '=', $nOrderId);
		$o->delete();
		// delete self
		return( parent::delete($aKeys, $sTable) );
	}

	public function set_status($nStatus) {

		if (!$this->is_loaded())
			return;

		$this->set('status_id', $nStatus);
		$this->save();

		//TODO: Order Set Status. 
	}

	/**
	 *
	 * @return string The TMS order number which is prefixed with a T and left padded with 0s up to 7 total length
	 */
	public function getOrderIdDisplay() {
		return OrderBase::getOrderIdDisplayStatic($this->get('order_id'));
	}

	public static function getOrderIdDisplayStatic($orderId) {
		return 'T' . str_pad($orderId, 7, '0', STR_PAD_LEFT);
	}

	public function getLoadRow() {
		$query = "SELECT * FROM load_base WHERE order_id = {$this->get('order_id')}";
		$row = LP_Db::fetchRow($query);
		return $row;
	}

	public function getCarrierContact() {
		$loadRow = $this->getLoadRow();
		$contact = new ContactBase();
		if ($loadRow) {
			$contact->load($loadRow['contact_id']);
		}
		return $contact;
	}

	/**
	 *
	 * @return type array
	 */
	public function getCarrierInfo() {
		$defaults = array(
			'CarrID' => 0,
			'CarrName' => '',
			'city' => '',
			'state' => '',
			'zip' => '',
			'contact_id' => 0,
			'equipment_id' => 0,
			'contact_name' => ''
		);
		$query = "SELECT
				CarrierMaster.CarrName, CarrierMaster.CarrID, load_base.contact_id,
				(contact_base.first_name + ' ' + contact_base.last_name) as contact_name, load_base.equipment_id,
				carrier_base_extended.mc_no
			FROM load_base
			JOIN ContractManager.dbo.CarrierMaster ON load_base.carrier_id = CarrierMaster.CarrID
			LEFT JOIN contact_base ON contact_base.contact_id = load_base.contact_id
			LEFT JOIN carrier_base_extended ON carrier_base_extended.carrier_id = ContractManager.dbo.CarrierMaster.CarrID
			WHERE load_base.order_id = {$this->get('order_id')}";
		$carrierInfo = LP_Db::fetchRow($query);
		if (!$carrierInfo) {
			$carrierInfo = array();
		}
		if (isset($carrierInfo['contact_name']))
			$carrierInfo['contact_name'] = trim($carrierInfo['contact_name']);

		// try to get zip based on the location
		if (isset($carrierInfo['CarrID'])) {
			$query = "SELECT location_base.zip
				FROM location_to_carriers, location_base
				WHERE location_to_carriers.carrier_id = {$carrierInfo['CarrID']}
				AND location_to_carriers.location_id = location_base.location_id";
			$locationRow = LP_Db::fetchRow($query);

			if ($locationRow) {
				$carrierInfo = array_merge($locationRow, $carrierInfo);

				// look up city and state based on zip
				$zip = $carrierInfo['zip'];
				$cityRow = $this->getCityState($zip);
				$carrierInfo = array_merge($cityRow, $carrierInfo);
			}
		}
		$carrierInfo = array_merge($defaults, $carrierInfo);
		return $carrierInfo;
	}

	public function getCityState($zip) {
		$query = "SELECT City city, State state FROM ContractManager.dbo.ZipsPostalCodesUS WHERE Zip = '$zip'";
		$cityRow = LP_Db::fetchRow($query);
		if (!$cityRow) {
			$cityRow = array(
				'city' => '',
				'state' => ''
			);
		}
		return $cityRow;
	}

	/**
	 *
	 * @return array rows containing order_stops and location_base fields
	 */
	public function getStops() {
		$query = "SELECT 
				order_stops.*,
				location_base.*,
				contact_base.first_name,
				contact_base.last_name,
				(contact_base.first_name + ' ' + contact_base.last_name) name,
				uszip.City city,
				uszip.State state,
				uszip.Lat lat,
				uszip.Long lng
				FROM order_stops
				LEFT JOIN
					location_base
				ON
					location_base.location_id = order_stops.location_id
				LEFT JOIN 
					ContractManager.dbo.ZipsPostalCodesUS uszip 
				ON 
					(uszip.Zip = location_base.zip AND uszip.Seq = location_base.seq)
				LEFT JOIN 
					ContractManager.dbo.ZipsPostalCodesCAN canzip 
				ON 
					(canzip.Zip = location_base.zip AND canzip.Seq = location_base.seq)
				LEFT JOIN
					contact_base
				ON 
					contact_base.contact_id = order_stops.contact_id
				WHERE order_stops.order_id = {$this->get('order_id')}
				ORDER BY order_stops.stop_index";
		$rows = LP_Db::fetchAll($query);

		// get stop contacts to add them into the contact stop rows
		$stopContacts = $this->getStopContacts();

		$defaults = array(
			'first_name' => '',
			'last_name' => '',
			'phone' => '',
			'driver_load' => ''
		);
		for ($i = 0; $i < count($rows); $i++) {
			$stopIndex = $rows[$i]['stop_index'];
			if (isset($stopContacts[$stopIndex])) {
				$rows[$i] = array_merge($rows[$i], $stopContacts[$stopIndex]);
			}
			$rows[$i] = array_merge($defaults, $rows[$i]);

			$stopType = 'PU';
			if ($rows[$i]['stop_type'] == 'd') {
				$stopType = 'SO';
			}

			$rows[$i]['stopTypeDisplay'] = $stopType . ' ' . ($i + 1);

			$scheduleDate = strtotime($rows[$i]['schedule_date']);
			if ($scheduleDate) {
				$rows[$i]['date1'] = date('m/d/Y', $scheduleDate);
			}
			else {
				$rows[$i]['date1'] = '';
			}
			$appointmentTime = strtotime($rows[$i]['appt_time']);
			if ($appointmentTime && $scheduleDate) {
				$rows[$i]['date2'] = date('Hi', $appointmentTime);
			}
			else {
				$rows[$i]['date2'] = '';
			}
			$rows[$i]['dateDisplay'] = $rows[$i]['date1'] . ' ' . $rows[$i]['date2'];

			$cityRow = $this->getCityState($rows[$i]['zip']);
			if (strlen($cityRow['state'])) {
				$cityRow['state'] .= ', ';
			}
			$rows[$i]['address_2'] = $cityRow['city'] . ' ' . $cityRow['state'] . ' ' . $rows[$i]['zip'];
		}

		return $rows;
	}
	
	public function getDocumentsRequired() {
		$query = "SELECT document_type_id, quantity FROM order_document_requirements WHERE order_id = {$this->get('order_id')}";
		return LP_Db::fetchAll($query);
	}

	public function getDetails() {
		$query = "SELECT detail_value, detail_type_name
			FROM order_details, tools_detail_types
			WHERE order_id = {$this->get('order_id')}
			AND tools_detail_types.detail_type_id = order_details.detail_type
			ORDER BY detail_index";
		$rows = LP_Db::fetchAll($query);
		return $rows;
	}

	public function getStopContacts() {
		$contacts = array();
		$query = "SELECT stop_index, contact_id
			FROM order_stops
			WHERE order_id = {$this->get('order_id')}
			ORDER BY stop_index";
		$rows = LP_Db::fetchAll($query);
		for ($i = 0; $i < count($rows); $i++) {
			$row = $rows[$i];
			$stopIndex = $row['stop_index'];
			$contact = new ContactBase();
			$contact->load($row['contact_id']);
			$contactPhone = $contact->getPhone();

			$contacts[$stopIndex] = array(
				'first_name' => $contact->get('first_name'),
				'last_name' => $contact->get('last_name'),
				'phone' => $contactPhone
			);
		}

		return $contacts;
	}

	/**
	 *
	 * @return int
	 */
	public function getBOL() {
		// bill of lading is type 14
		$query = "SELECT detail_value FROM order_details
			WHERE order_id = {$this->get('order_id')}
			AND detail_type = 14";
		$row = LP_Db::fetchRow($query);
		if ($row) {
			return $row['detail_value'];
		}
		return false;
	}

	public function getOrderWeight() {
		// load weight order goods weight_value
		$query = "SELECT weight_value FROM order_goods WHERE order_id = {$this->get('order_id')}";
		$weight = 0;
		$row = LP_Db::fetchRow($query);
		if ($row) {
			$weight = $row['weight_value'];
		}
		return $weight;
	}

	/**
	 *
	 * @return string
	 */
	public function getTrailerType() {
		// order_to_movement with movement_to_load with load_base to get equipment_id
		// then that joins with contractmanager availableequipment equipmentid
		$query = "SELECT load_base.equipment_id
			FROM load_base
			WHERE load_base.order_id = {$this->get('order_id')}";
		$row = LP_Db::fetchRow($query);
		$trailerType = '';
		if ($row) {
			$equipmentId = $row['equipment_id'];
			if ($equipmentId) {
				$query = "SELECT CarrEquipDesc FROM ContractManager.dbo.AvailableEquipment
					WHERE CarrEquipId = $equipmentId";
				$row = LP_Db::fetchRow($query);
				if ($row) {
					$trailerType = $row['CarrEquipDesc'];
				}
			}
		}
		return $trailerType;
	}

	/**
	 *
	 * @return array array of strings, one instruction per index
	 */
	public function getInstructions() {
		// from order_instructions table
		$instructions = array();
		$query = "SELECT instruction
			FROM order_instructions
			WHERE order_id = {$this->get('order_id')}
			ORDER BY instruction_index";
		$rows = LP_Db::fetchAll($query);
		for ($i = 0; $i < count($rows); $i++) {
			$instructions[] = $rows[$i]['instruction'];
		}

		return $instructions;
	}

	/**
	 *
	 * @return array array with keys of stop_index => array of strings (instructions)
	 */
	public function getStopInstructions() {
		$instructions = array();
		$query = "SELECT stop_index, instruction
			FROM order_stop_instructions
			WHERE order_id = {$this->get('order_id')}
			ORDER BY stop_index, instruction_index";
		$rows = LP_Db::fetchAll($query);
		for ($i = 0; $i < count($rows); $i++) {
			$stopIndex = $rows[$i]['stop_index'];
			if (!isset($instructions[$stopIndex])) {
				$instructions[$stopIndex] = array();
			}
			$instructions[$stopIndex][] = $rows[$i]['instruction'];
		}

		return $instructions;
	}

	/**
	 *
	 * @return array array with keys of stop_index => array of strings (instructions)
	 */
	public function getStopDetails() {
		$details = array();
		$query = "SELECT order_stop_details_id detail_id, stop_index, detail_value, detail_type_name, detail_type detail_type_id
			FROM order_stop_details, tools_detail_types
			WHERE order_id = {$this->get('order_id')}
			AND order_stop_details.detail_type = tools_detail_types.detail_type_id
			ORDER BY stop_index, detail_index";
		$rows = LP_Db::fetchAll($query);
		for ($i = 0; $i < count($rows); $i++) {
			$detailIndex = $rows[$i]['stop_index'];
			if (!isset($details[$detailIndex])) {
				$details[$detailIndex] = array();
			}
			$details[$detailIndex][] = $rows[$i];
		}

		return $details;
	}

	/**
	 *
	 * @return array order_charge row array
	 */
	public function getOrderCharges() {
		// get order charges
		$query = "SELECT * FROM order_charge WHERE order_id = {$this->get('order_id')}";
		$row = LP_Db::fetchRow($query);
		return $row;
	}

	public function getRateConfirmationFileName() {
		$fileName = 'Order-' . $this->getOrderIdDisplay() . '-Rate-Confirmation.pdf';
		return $fileName;
	}

	public function getCarrierId() {
		$query = "SELECT carrier_id FROM load_base WHERE order_id = {$this->get('order_id')}";
		$row = LP_Db::fetchRow($query);
		$carrierId = 0;
		if ($row) {
			$carrierId = $row['carrier_id'];
		}
		return $carrierId;
	}
	
	public function copyDocumentRequirements($contactId) {
		$contactId = intval($contactId);
		$query = "SELECT document_type_id, quantity FROM contact_document_requirements WHERE contact_id = $contactId";
		$rows = LP_Db::fetchAll($query);
		$numRows = count($rows);
		
		// Remove order document requirements
		$query = "DELETE FROM order_document_requirements WHERE order_id = {$this->get('order_id')}";
		LP_Db::execute($query);
		
		$myId = get_user_id();
		for ($i = 0; $i < $numRows; $i++) {
			$documentTypeId = $rows[$i]['document_type_id'];
			$quantity = $rows[$i]['quantity'];
			$orderDocumentRequirements = new OrderDocumentRequirements();
			$orderDocumentRequirements->create($this->get('order_id'), $documentTypeId, $quantity, $myId);
		}
	}

	public function checkTasks() {
		$this->checkStopLocationTask();
		$this->checkFindCarrier();
		$this->checkStatusBrokerTasks();
		$this->checkStatusCorpTasks();
	}

	public function checkFindCarrier() {
		$createdById = $this->get('created_by_id');
		$taskDetails = array(
			'order_id' => $this->get('order_id')
		);
		$myUserId = get_user_id();
		$taskName = 'Find Carrier';
		$taskTypes = new TaskTypes();
		$taskTypes->load(array(
			'task_name' => $taskName
		));
		$taskTypeId = $taskTypes->get('task_type_id');

		// find any existing task rows for this task
		$taskRow = TaskBase::findTask($createdById, $taskTypeId, $taskDetails);

		// check if this order has a carrier assigned to it
		$carrierId = $this->getCarrierId();
		$task = new TaskBase();

		// check if there is already a task
		if ($taskRow) {
			// complete the task if there is a carrier assigned to this order
			if ($carrierId) {
				$task->load($taskRow['task_id']);
				$task->set('completed_at', time());
				$task->save();
			}
		}
		else {
			// create a task to assign a carrier to this order if it doesn't have a carrier
			if (!$carrierId) {
				$task->create($taskTypeId, $createdById, time(), $taskDetails, $myUserId);
			}
		}
	}

	public function checkStopLocationTask() {
		$createdById = $this->get('created_by_id');
		$taskDetails = array(
			'order_id' => $this->get('order_id')
		);
		$myUserId = get_user_id();
		$taskName = 'Update order stops';
		$taskTypes = new TaskTypes();
		$taskTypes->load(array(
			'task_name' => $taskName
		));
		$taskTypeId = $taskTypes->get('task_type_id');

		// find any existing task rows for this task
		$taskRow = TaskBase::findTask($createdById, $taskTypeId, $taskDetails);

		// check if all stops for this order have a location
		$missingLocations = false;
		$query = "SELECT location_id FROM order_stops WHERE order_id = {$this->get('order_id')}";
		$rows = LP_Db::fetchAll($query);
		$numRows = count($rows);
		for ($i = 0; $i < $numRows; $i++) {
			if (!$rows[$i]['location_id']) {
				$missingLocations = true;
			}
		}

		$task = new TaskBase();

		// if there is a task for this already, complete it if there are no missing locations
		if ($taskRow) {
			if (!$missingLocations) {
				$task->load($taskRow['task_id']);
				$task->set('completed_at', time());
				$task->save();
			}
		}
		else {
			// there is not a task for this yet, make one if there are missing locations
			if ($missingLocations) {
				$task->create($taskTypeId, $createdById, time(), $taskDetails, $myUserId);
			}
		}
	}

	public function checkStatusBrokerTasks() {
		$statusId = $this->get('status_id');

		$createdById = $this->get('created_by_id');
		$taskDetails = array(
			'order_id' => $this->get('order_id')
		);
		$myUserId = get_user_id();
		$taskTypes = new TaskTypes();

		$taskTypes->load(array(
			'task_name' => 'Check call for pickup'
		));
		$checkCallForPickupId = $taskTypes->get('task_type_id');

		$checkCallForPickupTaskRow = TaskBase::findTask($createdById, $checkCallForPickupId, $taskDetails);

		$taskTypes->load(array(
			'task_name' => 'Check call for delivery'
		));
		$checkCallForDeliveryId = $taskTypes->get('task_type_id');
		$checkCallForDeliveryTaskRow = TaskBase::findTask($createdById, $checkCallForDeliveryId, $taskDetails);

		// Get the carrier contact id
		$loadBase = new LoadBase(array(
				'order_id' => $this->get('order_id')
			));
		$taskDetails['contact_id'] = $loadBase->get('contact_id');
		$taskDetails['carrier_id'] = $loadBase->get('carrier_id');

		// Get stops to check dates and times
		$stops = $this->getStops();
		$checkPickupTs = time();
		$checkDeliveryTs = time();
		if (count($stops)) {
			$date = $stops[0]['schedule_date'];
			$time = $stops[0]['appt_time'];
			$timeToAdd = '';
			if (strlen($time)) {
				$time = strtotime($time);
				if ($time > 0) {
					$timeToAdd = date('H:i', $time);
				}
			}
			if (strlen($date)) {
				// Explode the string to get only the date portion
				$date = strtotime($date);
				if ($date > 0) {
					$date = date('n/j/y', $date);
					$checkPickupTs = strtotime($date . ' ' . $timeToAdd);
				}
			}
		}
		if (count($stops) > 1) {
			$date = $stops[1]['schedule_date'];
			$time = $stops[1]['appt_time'];
			$timeToAdd = '';
			if (strlen($time)) {
				$time = strtotime($time);
				if ($time > 0) {
					$timeToAdd = date('H:i', $time);
				}
			}
			if (strlen($date)) {
				// Explode the string to get only the date portion
				$date = strtotime($date);
				if ($date > 0) {
					$date = date('n/j/y', $date);
					$checkDeliveryTs = strtotime($date . ' ' . $timeToAdd);
				}
			}
		}

		$task = new TaskBase();

		// check if there is a task for check call for pickup
		if ($checkCallForPickupTaskRow) {
			// check if the status is farther down the line than this one
			if ($statusId == ToolsStatusTypes::OrderInProgress || $statusId == ToolsStatusTypes::OrderDelivered) {
				// complete the task because it has already been picked up
				$task->load($checkCallForPickupTaskRow['task_id']);
				$task->set('completed_at', time());
				$task->save();
			}
		}
		else {
			// no task for check call for pickup, so make a task if the status is covered
			if ($statusId == ToolsStatusTypes::OrderCovered) {
				$task->create($checkCallForPickupId, $createdById, $checkPickupTs, $taskDetails, $myUserId);
			}
		}

		// check if there is a task for check call for delivery
		if ($checkCallForDeliveryTaskRow) {
			// check if the status is farther down the line than this one
			if ($statusId == ToolsStatusTypes::OrderDelivered) {
				// complete the task because it has already been delivered
				$task->load($checkCallForDeliveryTaskRow['task_id']);
				$task->set('completed_at', time());
				$task->save();
			}
		}
		else {
			// no task for check call for delivery, so make a task if the status is in progress
			if ($statusId == ToolsStatusTypes::OrderInProgress) {
				$task->create($checkCallForDeliveryId, $createdById, $checkDeliveryTs, $taskDetails, $myUserId);
			}
		}
	}
	
	public function hasDocumentsRequired() {
		$orderId = $this->get('order_id');
		if (!$orderId) {
			return false;
		}
		// Get list of requirements and the quantity
		$requirements = array();
		$query = "SELECT document_type_id, quantity FROM order_document_requirements WHERE order_id = $orderId";
		$rows = LP_Db::fetchAll($query);
		$numRows = count($rows);
		for ($i = 0; $i < $numRows; $i++) {
			$requirements[$rows[$i]['document_type_id']] = $rows[$i]['quantity'];
		}

		$received = array();
		$query = "SELECT COUNT(*) quantity, order_document_requirements.document_type_id FROM order_document_requirements
			LEFT JOIN document_relation ON document_relation.relation_table_key = order_document_requirements.order_id
			LEFT JOIN document_base ON document_base.document_id = document_relation.document_id
			LEFT JOIN document_to_type ON document_to_type.document_id = document_base.document_id
			LEFT JOIN document_types ON document_types.document_type_id = document_to_type.document_type_id
			WHERE
				order_document_requirements.order_id = $orderId
				AND document_relation.relation_table_name = 'order_base'
				AND document_to_type.document_type_id = order_document_requirements.document_type_id
			GROUP BY order_document_requirements.document_type_id";
		$rows = LP_Db::fetchAll($query);
		$numRows = count($rows);
		for ($i = 0; $i < $numRows; $i++) {
			$received[$rows[$i]['document_type_id']] = $rows[$i]['quantity'];
		}

		// Compare required to received
		$requirementsMet = true;
		foreach ($requirements as $documentTypeId => $quantity) {
			if (isset($received[$documentTypeId]) && $received[$documentTypeId] >= $quantity) {

			}
			else {
				$requirementsMet = false;
			}
		}
		return $requirementsMet;
	}
	
	public function hasDocuments() {
		$query = "SELECT COUNT(*) num FROM document_relation WHERE relation_table_name = 'order_base' AND relation_table_key = {$this->get('order_id')}";
		$row = LP_Db::fetchRow($query);
		if ($row) {
			return $row['num'];
		}
		return false;
	}

	public function checkStatusCorpTasks() {
		$myUserId = get_user_id();
		$statusId = $this->get('accounting_status_id');
		
		// check if this order has at least one document required
		$hasDocuments = $this->hasDocuments();
		
		// check if order has all documents required
		$hasDocumentsRequired = $this->hasDocumentsRequired();
		
		$taskDetails = array(
			'order_id' => $this->get('order_id')
		);
		
		$taskTypes = new TaskTypes();
		$taskTypes->load(array(
			'task_name' => 'Audit Order'
		));
		$auditingId = UserRoles::Auditing;
		$auditOrderTypeId = $taskTypes->get('task_type_id');
		$auditOrderTaskRow = TaskBase::findTask($auditingId, $auditOrderTypeId, $taskDetails, 'role_id');
		
		$taskTypes->load(array(
			'task_name' => 'Missing Documents'
		));
		$missingDocumentsId = $taskTypes->get('task_type_id');
		$missingDocumentsTaskRow = TaskBase::findTask($auditingId, $missingDocumentsId, $taskDetails, 'role_id');
		
		// If the order has been audited and marked as processed - clear any tasks
		// for auditing or missing documents
		if ($statusId > 0 && $statusId != ToolsStatusTypes::OrderInAudit) {
			if ($auditOrderTaskRow) {
				$task = new TaskBase();
				$task->load($auditOrderTaskRow['task_id']);
				$task->complete();
			}
			
			if ($missingDocumentsTaskRow) {
				$task = new TaskBase();
				$task->load($missingDocumentsTaskRow['task_id']);
				$task->complete();
			}
		}
		
		// Check if the order has not started the auditing process
		if ($statusId == 0 || $statusId == ToolsStatusTypes::OrderInAudit) {
			// Check if this order has a document to put up the task to claim for auditing
			if ($hasDocuments && !$hasDocumentsRequired) {
				// Make the auditing task
				if (!$auditOrderTaskRow) {
					$task = new TaskBase();
					$task->create($auditOrderTypeId, 0, time(), $taskDetails, $myUserId, $auditingId);
				}

				// make a task to get all documents required - missing documents
				if (!$missingDocumentsTaskRow) {
					// Complete task if it exists
					$task = new TaskBase();
					$task->create($missingDocumentsId, 0, time(), $taskDetails, $myUserId, $auditingId);
				}
			}

			// Make sure this order has documents required
			if ($hasDocumentsRequired) {

				if ($missingDocumentsTaskRow) {
					$task = new TaskBase();
					$task->load($missingDocumentsTaskRow['task_id']);
					$task->complete();
				}
			}

		}
		
		switch ($statusId) {

			// If status changes to Processed / Ready for Billing (6) create task for invoice
			case ToolsStatusTypes::OrderProcessed:
				$taskTypes->load(array(
					'task_name' => 'Invoice'
				));
				$creditAndCollectionsId = UserRoles::CreditAndCollections;
				$invoiceTypeId = $taskTypes->get('task_type_id');
				$invoiceTaskRow = TaskBase::findTask($creditAndCollectionsId, $invoiceTypeId, $taskDetails, 'role_id');
				
				if (!$invoiceTaskRow) {
					// Create the task
					$task = new TaskBase();
					$task->create($invoiceTypeId, 0, time(), $taskDetails, $myUserId, $creditAndCollectionsId);
				}
				
				break;

			// If status changes to Billed (7) create task to make collection call - keep calling until they apply check
			case ToolsStatusTypes::OrderBilled:
				// Complete the invoice task if it exists
				$taskTypes->load(array(
					'task_name' => 'Invoice'
				));
				$creditAndCollectionsId = UserRoles::CreditAndCollections;
				$invoiceTypeId = $taskTypes->get('task_type_id');
				$invoiceTaskRow = TaskBase::findTask($creditAndCollectionsId, $invoiceTypeId, $taskDetails, 'role_id');
				if ($invoiceTaskRow) {
					// Complete task if it exists
					$task = new TaskBase();
					$task->load($invoiceTaskRow['task_id']);
					$task->complete();
				}
				break;

			// If status changes to Collected (8), no new task
			case ToolsStatusTypes::OrderCollected:
				// Complete male collection call task
				$taskTypes->load(array(
					'task_name' => 'Make Collection Call'
				));
				$creditAndCollectionsId = UserRoles::CreditAndCollections;
				$makeCollectionCallTypeId = $taskTypes->get('task_type_id');
				$makeCollectionCallRow = TaskBase::findTask($creditAndCollectionsId, $makeCollectionCallTypeId, $taskDetails, 'role_id');
				if ($makeCollectionCallRow) {
					// Complete task if it exists
					$task = new TaskBase();
					$task->load($makeCollectionCallRow['task_id']);
					$task->complete();
				}
				break;

			default:
				break;
		}
	}
	
	public function createCollectionTask() {
		$taskTypes = new TaskTypes();
		$taskTypes->load(array(
			'task_name' => 'Make Collection Call'
		));
		$taskDetails = array(
			'order_id' => $this->get('order_id')
		);
		
		$creditAndCollectionsId = UserRoles::CreditAndCollections;
		$makeCollectionCallTypeId = $taskTypes->get('task_type_id');
		$makeCollectionCallRow = TaskBase::findTask($creditAndCollectionsId, $makeCollectionCallTypeId, $taskDetails, 'role_id');

		if (!$makeCollectionCallRow) {
			// Get the contact id at the billing location
			$billToLocationId = $this->get('bill_to_id');
			$locationBase = new LocationBase($billToLocationId);
			$taskDetails['contact_id'] = $locationBase->getBillingContactId();
			if ($taskDetails['contact_id']) {
				// Create the task
				$task = new TaskBase();
				$task->create($makeCollectionCallTypeId, 0, time(), $taskDetails, $this->get('broker_id'), $creditAndCollectionsId);
			}
		}
	}

	public function doOrder($nId, $nCustomerId, $nOrderedById, $nUserId, $vIsQuote, $vIsContractedRate, $vIsPost, $vTeamRequired, $nFuelCharge, $nLineHaulCharge, $aAccessorials, $nBillToId, $sOrderComment, $aOrderDetails, $aEquipmentAllowed, $aModesAllowed, $aStops, $nStatusId) {
		// This doesn't get used anymore
		if ($nId) {
			$this->load($nId);
		}
		if (!$this->create($nCustomerId, $nBillToId, $nOrderedById, $nUserId, $nUserId, $vTeamRequired)) {
			add_error('Error Creating new Order');
			return;
		}
		$this->update_charges($nFuelCharge, $nLineHaulCharge, $aAccessorials);
		$this->add_comment($sOrderComment);
		$this->update_details($aOrderDetails);
		$this->set_status($nStatusId);
		$this->update_equipments($aEquipmentAllowed);
		$this->update_modes($aModesAllowed);
		$this->update_stops($aStops);
	}

	/**
	 *
	 * @param array $orderIds 
	 */
	public static function getCarrierNames($orderIds) {
		$orderIdsSql = implode(',', $orderIds);
		$query = "SELECT CarrID, CarrName, load_base.load_id
			FROM ContractManager.dbo.CarrierMaster
			LEFT JOIN load_base ON load_base.carrier_id = CarrID
			LEFT JOIN order_base ON order_base.order_id = load_base.order_id
			WHERE order_base.order_id IN ($orderIdsSql)";
		$rows = LP_Db::fetchAll($query);
		$numRows = count($rows);
		$records = array();
		for ($i = 0; $i < $numRows; $i++) {
			$records[$rows[$i]['load_id']] = array(
				'carrier_id' => $rows[$i]['CarrID'],
				'carrier_name' => $rows[$i]['CarrName']
			);
		}
		return $records;
	}

	public function getOrderDetails() {
		if (!$this->get('order_id')) {
			return false;
		}
		$query = "SELECT
				detail_type AS detail_type_id, detail_value
			FROM
				order_details
			WHERE order_id = {$this->get('order_id')}
			ORDER BY detail_index";
		$rows = LP_Db::fetchAll($query);
		return $rows;
	}

	public function updateCharges($revenue) {
		$charges = $revenue['charges'];
		$costs = $revenue['costs'];
		$myUserId = get_user_id();
		$orderId = $this->get('order_id');

		// Calculate accessorial totals
		$accessorialCharge = 0;
		$accessorialCost = 0;
		foreach ($charges['accessorials'] as $accessorial) {
			$accessorialCharge += floatval($accessorial['quantity']) * floatval($accessorial['amount']);
		}

		foreach ($costs['accessorials'] as $accessorial) {
			$accessorialCost += floatval($accessorial['quantity']) * floatval($accessorial['amount']);
		}

		$charges['fuel'] = floatval($charges['fuel']);
		$charges['linehaul'] = floatval($charges['linehaul']);
		$costs['fuel'] = floatval($costs['fuel']);
		$costs['linehaul'] = floatval($costs['linehaul']);

		// Create/update the order charge row
		$orderCharge = new OrderCharge();
		$orderCharge->load(array(
			'order_id' => $orderId
		));
		$orderCharge->create($orderId, $charges['fuel'], $charges['linehaul'], $accessorialCharge, $costs['fuel'], $costs['linehaul'], $accessorialCost, $myUserId);

		// Get load id for this order
		$loadId = 0;
		$query = "SELECT load_id FROM load_base WHERE order_id = $orderId";
		$row = LP_Db::fetchRow($query);
		$loadId = $row['load_id'];

		// Delete old accessorials
		$query = "DELETE FROM order_accessorials WHERE order_id = $orderId";
		LP_Db::execute($query);
		$query = "DELETE FROM load_accessorials WHERE load_id = $loadId";
		LP_Db::execute($query);

		// Insert new rows for accessorials
		$numAccessorials = count($charges['accessorials']);
		for ($i = 0; $i < $numAccessorials; $i++) {
			$accessorial = $charges['accessorials'][$i];
			$accessorial['billToId'] = intval($accessorial['billToId']);
			if (!$accessorial['billToId']) {
				$accessorial['billToId'] = $this->get('bill_to_id');
			}
			$orderAccessorial = new OrderAccessorials();
			$orderAccessorial->create($orderId, $accessorial['type'], $accessorial['quantity'], $accessorial['amount'], 0, $i, $accessorial['billToId'], $myUserId);
		}

		// Insert new rows for cost accessorials
		$numAccessorials = count($costs['accessorials']);
		for ($i = 0; $i < $numAccessorials; $i++) {
			$accessorial = $costs['accessorials'][$i];
			$accessorial['billToId'] = intval($accessorial['billToId']);
			if (!$accessorial['billToId']) {
				$accessorial['billToId'] = $this->get('bill_to_id');
			}
			$orderAccessorial = new LoadAccessorials();
			$orderAccessorial->create(array(
				'load_id' => $loadId,
				'accessorial_type_id' => $accessorial['type'],
				'accessorial_qty' => $accessorial['quantity'],
				'accessorial_per_unit' => $accessorial['amount'],
				'pay_to' => $accessorial['billToId'],
				'accessorial_index' => $i,
				'unit_id' => 0
			));
		}
	}

	public function updateCosts($costs) {
		$linehaul = $costs['linehaul'];
		$fuel = $costs['fuel'];
		$accessorials = $costs['accessorials'];
	}

	public function getLoadIds($nId=0) {
		$nId = intval($nId);
		if ($nId == 0)
			$nId = intval($this->get('order_id'));
		if (empty($nId))
			return array();
	}
	
	public function approveAudit() {
		$this->set('accounting_status_id', ToolsStatusTypes::OrderProcessed);
		$this->save();
		$this->checkStatusCorpTasks();
	}
	
	public function denyAudit() {
		// Make a task for the broker to fix order details
		$myUserId = get_user_id();
		$statusId = $this->get('accounting_status_id');
		$brokerId = $this->get('broker_id');
		
		$taskDetails = array(
			'order_id' => $this->get('order_id')
		);
		
		$taskTypes = new TaskTypes();
		$taskTypes->load(array(
			'task_name' => 'Fix Order Details'
		));
		$taskTypeId = $taskTypes->get('task_type_id');
		$taskRow = TaskBase::findTask(-1, $taskTypeId, $taskDetails);
		if (!$taskRow) {
			$task = new TaskBase();
			$task->create($taskTypeId, $brokerId, time(), $taskDetails, $myUserId);
		}
		
		$this->checkStatusCorpTasks();
	}
	
	public function fixOrderDetails() {
		$myUserId = get_user_id();
		$statusId = $this->get('accounting_status_id');
		$brokerId = $this->get('broker_id');
		
		$taskDetails = array(
			'order_id' => $this->get('order_id')
		);
		
		$taskTypes = new TaskTypes();
		$taskTypes->load(array(
			'task_name' => 'Fix Order Details'
		));
		$taskTypeId = $taskTypes->get('task_type_id');
		$taskRow = TaskBase::findTask(-1, $taskTypeId, $taskDetails);
		if ($taskRow) {
			$task = new TaskBase();
			$task->load($taskRow['task_id']);
			$task->complete();
		}
		
		$this->checkStatusCorpTasks();
	}
	
	public function completeInvoice() {
		$this->set('accounting_status_id', ToolsStatusTypes::OrderBilled);
		$this->save();
		$this->checkStatusCorpTasks();
	}
	
	public function markAsCollected() {
		$this->set('accounting_status_id', ToolsStatusTypes::OrderCollected);
		$this->save();
		$this->checkStatusCorpTasks();
	}

}