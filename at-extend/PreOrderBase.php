<?php

/**
 * Pre Order Base
 *
 * @author Steve Keylon
 */
class PreOrderBase extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = 'pre_order_base';
	public $fireEvents = true;

	public function create($nCustomerId, $nOrderedById, $nCreatedById, $nBrokerId, $vIsQuote, $vIsContractedRate, $vIsPost, $sExpirationDate, $vTeamRequired = FALSE) {
		// Validate input
		$key = __CLASS__ . '::' . __METHOD__;
		if (!is_numeric($nCustomerId)) {
			add_error('Customer id: ' . $nCustomerId, $key);
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
		if (!is_bool($vTeamRequired)) {
			add_error('Team Required: ' . $vTeamRequired, $key);
			return FALSE;
		}
		if (!is_bool($vIsQuote)) {
			add_error('Is Quote: ' . $vIsQuote, $key);
			return FALSE;
		}
		if (!is_bool($vIsContractedRate)) {
			add_error('Is Contracted Rate: ' . $vIsContractedRate, $key);
			return FALSE;
		}
		if (!is_bool($vIsPost)) {
			add_error('Is Post: ' . var_dump($vIsPost), $key);
			return FALSE;
		}
		
		// Save Input
		$this->set_customer_id($nCustomerId);
		$this->set_ordered_by_id($nOrderedById);
		$this->set_active(1);
		$this->set_team_required($vTeamRequired);
		$this->set_is_quote($vIsQuote);
		$this->set_is_post($vIsPost);
		$this->set_is_contracted_rate($vIsContractedRate);
		$this->set_broker_id($nBrokerId);
		$this->set('expiration_date', strtotime($sExpirationDate) );

		if (!$this->is_loaded())
			$this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}


		$this->save();
		
		// Report
		return true;
	}

	public function set_inactive() { //new
		$nId = $this->get_pre_order_id();
		if (empty($nId))
			return;
		$this->load($nId);
		$this->set_active(0);
		$this->save();
		return true;
	}

	public function get_customer() {
		$nCustomerId = $this->get_Customer_Id();
		$o = new CustomerBase();

		if (!empty($nCustomerId)) {
			$o->load($nCustomerId);
			return $o;
		}
		return $o;
	}

	/**
	 * Add Stop
	 *
	 * Wrapper Function for adding a stop while only working with this object.
	 * parameters are the same as Pre-Order Stop's create function.
	 */
	public function add_stop($aStop) {
		$o = new PreOrderStops();

		$o->load($aStop['id']);
		$vCreate = $o->create($this->get_pre_order_id(), $aStop['index'], $aStop['type'], $aStop['date'], $aStop['time'], $this->get_created_by_id(), $aStop['zip'], $aStop['seq']);
		return $vCreate ? $o : false;
	}

	/**
	 * eizzn: modified function to return the stops in order of their stop_index
	 */
	public function get_stops() {
		$nId = $this->get_pre_order_id();
		if (!$nId) {
			return array();
		}
		$o = new PreOrderStops();
		$o->where('pre_order_id', '=', $nId);
		$o->order('stop_index', 'ASC');

		return $o->list()->rows;
	}

	public function get_stops_ids() {
		$aStops = $this->get_stops();
		$aReturn = array();
		foreach ($aStops as $aStop) {
			$aReturn[$aStop->get('pre_order_stops_id')] = $aStop->get('pre_order_stops_id');
		}
		return $aReturn;
	}

	public function get_posting_id() {
		$nId = $this->get_pre_order_id();
		if (empty($nId))
			return false;
		$o = new PreOrderToPosting();
		$o->where('pre_order_id', '=', $nId);
		$aPosting = $o->list()->rows;
		if (isset($aPosting[0]))
			return $aPosting[0]->get('posting_id');
		return false;
	}

	public function get_bill_to_id() {
		$nId = $this->get_pre_order_id();
		if (empty($nId))
			return false;
		$o = new PreOrderToBillTo();
		$o->where('pre_order_id', '=', $nId);
		$aBillTo = $o->list()->rows;
		if (isset($aBillTo[0]))
			return $aBillTo[0]->bill_to_id;
		return false;
	}

	public function get_bill_to() {
		$nId = $this->get_bill_to_id();
		if (empty($nId))
			return false;
		$o = new CustomerBase();

		return $o->load($nId) ? $o : false;
	}

	public function list_comments() {
		$nId = $this->get_pre_order_id();
		if (empty($nId))
			return false;
		$o = new PreOrderComments();
		$o->where('pre_order_id', '=', $nId);
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

	public function get_charge() {
		$nId = $this->get_pre_order_id();
		if (empty($nId))
			return false;
		$o = new PreOrderCharge();
		$o->where('pre_order_id', '=', $nId);
		$a = $o->list()->rows;

		if (isset($a[0]))
			return $a[0];

		return false;
	}

	public function list_details($sOrder = 'ASC') {
		$nId = $this->get_pre_order_id();
		if (empty($nId))
			return false;
		$s = "SELECT 
				detail.*, type.detail_type_name as name 
			FROM 
				pre_order_details detail
			LEFT JOIN tools_detail_types type ON type.detail_type_id = detail.detail_type
			WHERE detail.pre_order_id = " . $nId . "
			ORDER BY detail.detail_index $sOrder";

		$res = $this->query($s);
		$a = array();
		while ($row = $this->db->fetch_object($res)) {
			$a[] = $row;
		}

		return $a;
	}

	public function list_modes() {
		$nId = $this->get_pre_order_id();
		if (empty($nId))
			return false;

		$s = "SELECT
				allowed.*, modes.mode_name
			FROM 
				pre_order_modes_allowed allowed
			LEFT JOIN modes ON modes.mode_id = allowed.mode_id
			WHERE 
				allowed.pre_order_id = " . $nId;


		$res = $this->query($s);
		$a = array();
		while ($row = $this->db->fetch_object($res)) {
			$a[] = $row;
		}

		return $a;
	}

	public function list_equipment() {
		$nId = $this->get_pre_order_id();
		if (empty($nId))
			return array();

		$s = "SELECT allowed.*, equip.CarrEquipDesc as name FROM TMS.dbo.pre_order_equipment_allowed allowed
				LEFT JOIN ContractManager.dbo.AvailableEquipment equip ON equip.CarrEquipId = allowed.equipment_id
				WHERE allowed.pre_order_id = " . $nId;

		$res = $this->query($s);
		$a = array();
		while ($row = $this->db->fetch_object($res)) {
			$a[] = $row;
		}

		return $a;
	}

	/**
	 * create/update/delete this pre_order's stops
	 * @param array $aStops an array of stops and it's related data
	 * 				[index]			=> the stop's index
	 * 				[type]			=> the stop's type; either 'p' or 'd'
	 * 				[date]			=> the date of the stop
	 * 				[time]			=> the time of the stop
	 * 				[zip]			=> the zip code of the stop
	 * 				[seq]			=> additional zip code info
	 * 				[location_id]	=> the location_id for this stop
	 * 				[instructions]	=> an array of this stop's instructions
	 * 					[id]					=> the instruction_type_id
	 * 					[stop_instruction_id]	=> the instruction's id
	 * 					[value]					=> the instructions value
	 * 				[contacts]		=> an array of contacts at this stop
	 * 					[]						=> contact_id
	 * 				[details]		=> an array of this stop's details
	 * 					[id]					=> the detail_type_id
	 * 					[value]					=> the value for this detail
	 * @return bool (true = success false = failure)
	 */
	/*
	public function update_stops($aStops) {
		$nPOId = $this->get_pre_order_id();
		if (!$nPOId) {
			return false;
		}
		$nUserId = get_user_id();
		$vSuccess = true;
		$oStops = new PreOrderStops();
		$oStops->where('pre_order_id', '=', $nPOId);
		$aA = $oStops->list()->rows;
		$aStops = reindex_by_array_element($aStops, 'id');

		foreach ($aA as $a) {
			$oStop = new PreOrderStops();
			$nStopId = $a->get_pre_order_stops_id();
			$oStop->load($nStopId);
			if (array_key_exists($nStopId, $aStops)) { // if the stored is in the sent
				$oStop->create($nPOId, $aStops[$nStopId]['index'], $aStops[$nStopId]['type'], $aStops[$nStopId]['date'], $aStops[$nStopId]['time'], $nUserId, $aStops[$nStopId]['zip'], $aStops[$nStopId]['seq']);
				// do stop_instructions
				$oStop->update_instructions($aStops[$nStopId]['instructions']);
				// do stop_details
				$oStop->update_details($aStops[$nStopId]['details']);
				// do stop_contacts
				$oStop->update_contacts($aStops[$nStopId]['contacts']);
				unset($aStops[$nStopId]); // removed this sent stop
			}
			else { // this stored stop wasn't sent, delete it
				$oStop->delete();
			}
		}
		// create any remaining sent stops
		foreach ($aStops as $aStop) {
			$oStop = new PreOrderStops();
			$oStop->create($nPOId, $aStop['index'], $aStop['type'], $aStop['date'], $aStop['time'], $nUserId, $aStop['zip'], $aStop['seq']);
			$oStop->update_instructions($aStop['instructions']);
			$oStop->update_details($aStop['details']);
			$oStop->update_contacts($aStop['contacts']);
			if (!empty($aStop['location_id'])) {
				$oPreOrderStopToLocation = new PreOrderStopToLocation();
				$oPreOrderStopToLocation->create($oStop->get_pre_order_stops_id(), $aStop['location_id']);
			}
		}
		return true;
	}
	 */

	/**
	 * create/update/delete this pre_order's modes allowed
	 * @param array $aModes an array of mode_id
	 * 					[]	=> mode_id
	 *
	 * @return bool (true = success false = failure)
	 */
	public function update_modes($aModes) {
		$nPOId = $this->get_pre_order_id();
		if (empty($nPOId))
			return false;
		$nUserId = get_user_id();
		$vSuccess = true;
		$aUpdateIndex = array();
		$oModes = new PreOrderModesAllowed();
		$oModes->where('pre_order_id', '=', $nPOId);
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
			$oModes = new PreOrderModesAllowed();
			$oModes->where('pre_order_id', '=', $nPOId);
			$oModes->where('mode_id', '=', $aModeDeleteIds);
			$oModes->delete();
		}
		// update the index of any stored modes that need updating
		foreach ($aUpdateIndex as $a) { // because there is no unique id, we must update manually
			$o = new DBModel();
			$o->connect();
			$sQuery = "UPDATE pre_order_modes_allowed SET mode_index = " . $a['index'] . ", updated_by_id = $nUserId, updated_at = '" . date('M j Y H:i:s:000 A') . "' WHERE pre_order_id = $nPOId AND mode_id = " . $a['mode'];
			$o->query($sQuery);
		}
		// create any remaining sent modes
		foreach ($aModes as $nModeId) {
			$oModes = new PreOrderModesAllowed();
			$vSuccess = $oModes->create($nPOId, $nModeId, $nUserId);
			if (!$vSuccess)
				return false;
		}
		return true;
	}

	/**
	 * create/update/delete this pre_order's equipment_allowed
	 * @param array $aEquipments an array of equipment_ids
	 * 					[] => equipment_id
	 *
	 * @return bool (true = success false = failure)
	 */
	public function update_equipment($aEquipments) {
		$nPOId = $this->get_pre_order_id();
		if (empty($nPOId))
			return false;
		$vSuccess = true;
		$oEquip = new PreOrderEquipmentAllowed();
		$oEquip->where('pre_order_id', '=', $nPOId);
		$aA = $oEquip->list()->rows;
		$aEquipments = array_unique($aEquipments); // prevent duplicate entries

		$nSize = count($aA); // when unset, changes count, so get count before
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
			$oEquip = new PreOrderEquipmentAllowed();
			$oEquip->where('pre_order_id', '=', $nPOId);
			$oEquip->where('equipment_id', '=', $aEquipDeleteIds);
			$oEquip->delete();
		}
		// create any remaining sent equipments
		foreach ($aEquipments as $nEId) {
			$oEquip = new PreOrderEquipmentAllowed();
			$vSuccess = $oEquip->create($nPOId, $nEId);
			if (!$vSuccess)
				return false;
		}
		return true;
	}

	/**
	 * create/update/delete this pre_order's details
	 * @param array $aDetails the sent details
	 * 					[type] 	=> the detail_type
	 * 					[value]	=> the detail_value
	 *
	 * @return bool (true = success false = failure)
	 */
	public function update_details($aDetails) {
		$nPOId = $this->get_pre_order_id();
		if (empty($nPOId))
			return false;
		$nUserId = get_user_id();
		$oDetails = new PreOrderDetails();
		$oDetails->where('pre_order_id', '=', $nPOId);
		$oDetails->order('detail_index', 'ASC');
		$aA = $oDetails->list()->rows;
		$loop_limit = min(count($aA), count($aDetails));
		for ($i = 0; $i < $loop_limit; $i++) { // loop through and update detail_type and value in order sent
			if (( $aA[$i]->get_detail_type() != $aDetails[$i]['type'] ||
					$aA[$i]->get_detail_value() != $aDetails[$i]['value'] ) &&
					is_numeric($aDetails[$i]['type'])) { // dosen't match
				// because the PreOrderDetails object will increment the index to next largest in db, we must update manually
				$sQuery = "UPDATE pre_order_details SET 
								detail_type = " . $aDetails[$i]['type'] . ", 
								detail_value = '" . $aDetails[$i]['value'] . "'
							WHERE pre_order_id = $nPOId 
							AND detail_index = " . $aA[$i]->get_detail_index();
				$o = new DBModel();
				$o->connect();
				$o->query($sQuery);
			}
			if (is_numeric($aDetails[$i]['type'])) // save for deletion if this sent is not the blank
				unset($aA[$i]);
			unset($aDetails[$i]);
		}
		// delete any remaining stored details
		foreach ($aA as $a) {
			$sQuery = "DELETE FROM pre_order_details 
						WHERE pre_order_id = $nPOId AND detail_index = " . $a->get_detail_index();
			$o = new DBModel();
			$o->connect();
			$o->query($sQuery);
		}
		// create any remaining sent details
		foreach ($aDetails as $aDetail) {
			if (!is_numeric($aDetail['type']))
				continue; // skip empty details
			$oOrderDetail = new PreOrderDetails();
			$vSuccess = $oOrderDetail->create($nPOId, $aDetail['type'], $aDetail['value'], $nUserId);
			if (!$vSuccess)
				return false;
		}
		return true;
	}

	/**
	 * add a comment to this pre_order
	 * @param string $sComment the comment text
	 *
	 * @return bool (true = success false = failure)
	 */
	public function add_comments($sComment) {
		$nPOId = $this->get_pre_order_id();
		if (empty($nPOId))
			return false;
		if (empty($sComment) || $sComment == "")
			return true;
		$nUserId = get_user_id();
		$oPOComment = new PreOrderComments();
		return $oPOComment->create($nPOId, $sComment, $nUserId);
	}

	/**
	 * update/create this pre_order's bill_to_id
	 * @param int $nBillToId the customer_id to bill to
	 *
	 * @return bool (true = success false = failure)
	 */
	public function update_bill_to($nBillToId) {
		$nPreOrderId = $this->get_pre_order_id();
		if (empty($nPreOrderId))
			return false;
		$oPOBill2 = new PreOrderToBillTo();
		$vLoaded = $oPOBill2->load($nPreOrderId);
		// if we already have a pre_order_bill_to record and the bill_to_id is the same as sent
		if ($vLoaded && ( $oPOBill2->get_bill_to_id() === $nBillToId ))
			return true; // no need to update since there is no change
		return $oPOBill2->create($nPreOrderId, $nBillToId);
	}

	/**
	 * update the various charges for this pre_order
	 * @param int $nFuelCharge the fuel charge for this pre_order
	 * @param int $nLineHaulCharge the linehaul charge for this pre_order
	 * @param array $aAccessorials an array of accessorials for this pre_order
	 * 					[id] 			=> the pre_order_accessorial_id of this accessorial
	 * 					[type_id]		=> accessorial_type_id
	 * 					[pre_unit]		=> accessorial_per_unit
	 * 					[unit_count]	=> accessorial_qty
	 * 					[bill_to_id]	=> contact id if should bill differently from pre_order
	 * 					[bill_separate]	=> bool if bill separatly
	 * @param bool $vIsContractedRate is this pre_order a contracted rate
	 *
	 * @return bool (true = success false = failure)
	 */
	public function update_charges($nFuelCharge, $nLineHaulCharge, $aAccessorials, $vIsContractedRate) {
		$nPreOrderId = $this->get_pre_order_id();
		
		if (empty($nPreOrderId))
			return false;
		$vSuccess = true;
		$nUserId = get_user_id();
		$nTotalAccessorialCharge = 0;
		$oPreOrderCharge = new PreOrderCharge();
		$oPreOrderCharge->load($nPreOrderId);
		if ($vIsContractedRate) {
			// linehaul and fuel cannot be changed on contracted_rates
			if ($oPreOrderCharge->get_fuel_charge() > 0) // unless there is currently nothing saved
				$nFuelCharge = $oPreOrderCharge->get_fuel_charge();
			if ($oPreOrderCharge->get_linehaul_charge() > 0) // unless there is currently nothing saved
				$nLineHaulCharge = $oPreOrderCharge->get_linehaul_charge();
		}elseif (time() - strtotime($this->get_created_at()) > 432000) {
			// linehaul cannot be changed after 5 days
			if ($oPreOrderCharge->get_linehaul_charge() > 0) // unless there is currently nothing saved
				$nLineHaulCharge = $oPreOrderCharge->get_linehaul_charge();
		}
		
		
		if ($nFuelCharge < 0)
			$nFuelCharge = 0;
		if ($nLineHaulCharge < 0)
			$nLineHaulCharge = 0;
		$aAccessorials = reindex_by_array_element($aAccessorials, 'id');
		// get the existing accessorials from the db
		$oAccessorials = new PreOrderAccessorials();
		$oAccessorials->where('pre_order_id', '=', $nPreOrderId);
		// delete accessorials missing from sent
		foreach ($oAccessorials->list()->rows as $a) {
			if (!array_key_exists($a->get_pre_order_accessorial_id(), $aAccessorials))
				$oAccessorials->delete($a->get_order_accessorial_id());
		}
		// update the remaining existing accessorials
		foreach ($aAccessorials as $nIndex => $a) {
			$oAccessorials = new PreOrderAccessorials();
			if ($a['id'] > 0)
				$oAccessorials->load($a['id']);
			if ($a['bill_separate'] == 0) // don't bill separte
				$nBillTo = $this->get_bill_to_id();
			else // bill separate if have an id to bill to
				$nBillTo = (empty($a['bill_to_id']) || !is_numeric($a['bill_to_id']) ) ? $this->get_bill_to_id() : $a['bill_to_id'];
			$nCharge = $a['per_unit'] * $a['unit_count'];
			$nTotalAccessorialCharge += $nCharge;
			
			$nBillTo = intval($nBillTo);
			$oAccessorials->create($nPreOrderId, $a['type_id'], $a['unit_count'], $a['per_unit'], $nCharge, $nIndex, $nBillTo, $nUserId);
		}
		// update my order_charge
		return $oPreOrderCharge->create($nPreOrderId, $nFuelCharge, $nLineHaulCharge, $nTotalAccessorialCharge, $nUserId);
	}

	public function list_accessorials($sOrder = 'ASC') {
		$nId = $this->get_pre_order_id();
		if (empty($nId))
			return false;

		$s = "SELECT rel.*, code.*, bill.*, customer.customer_name as bill_name, code.AccCodeDesc as accessorial_name
			FROM tms.dbo.pre_order_accessorials rel
			LEFT JOIN ContractManager.dbo.AccessorialCodes code ON code.AccCodeId = rel.accessorial_type_id
			LEFT JOIN tms.dbo.pre_order_accessorial_to_bill_to bill ON bill.pre_order_accessorial_id = rel.pre_order_accessorial_id
			LEFT JOIN tms.dbo.customer_base customer ON customer.customer_id = bill.bill_to_id
			WHERE rel.pre_order_id = " . $nId . "
			ORDER BY rel.created_at $sOrder";

		$res = $this->query($s);
		$a = array();
		while ($row = $this->db->fetch_object($res)) {
			$a[] = $row;
		}

		return $a;
	}

	public function get_orderer() {
		$nId = $this->get_pre_order_id();
		if (empty($nId))
			return false;

		$sQuery = "SELECT contact.contact_id, contact.first_name, contact.last_name
					FROM contact_base contact
					
					INNER JOIN pre_order_base pre_order
					ON pre_order.pre_order_id = $nId
					
					WHERE pre_order.ordered_by_id = contact.contact_id";
		$res = $this->query($sQuery);
		return $this->db->fetch_object($res); // should only get one result
	}

	/**
	 * convert this preorder into an order
	 * @param none
	 * @return an OrderBase object
	 */
	public function convert_to_order() {
		$nPreOrderId = $this->get_pre_order_id();
		if (empty($nPreOrderId)) {
			error_log("Empty Preorder Id");
			return false;
		}
		$nCreatedById = get_user_id();
		$oOrder = new OrderBase();
		$v = $oOrder->create($this->get_customer_id(), $this->get_bill_to_id(), $this->get_ordered_by_id(), $nCreatedById, $this->get_broker_id(), ($this->get_team_required() ? true : false));
		if (!$v) {
			error_log("Order Creation Failed");
			return false;
		}
		$nOrderId = $oOrder->get_order_id();
		
		// preorder to order association
		$oPreOrderToOrder = new PreOrderToOrder();
		$oPreOrderToOrder->create($nPreOrderId, $nOrderId);
		
		// convert accessorials
		$aPreAccessorials = $this->list_accessorials();
		$aAccessorials = array();
		if (!empty($aPreAccessorials)) {
			foreach ($aPreAccessorials as $pre) {
				$oPreAccessorial = new PreOrderAccessorials();
				$oPreAccessorial->load($pre->pre_order_accessorial_id);
				$nAccessorialToBillTo = $oPreAccessorial->getBillToId();
				if (!is_numeric($nAccessorialToBillTo)) {
					$nAccessorialToBillTo = $oOrder->get('bill_to_id');
				}
				$oAccessorial = new OrderAccessorials();
				$v = $oAccessorial->create($nOrderId, $pre->accessorial_type_id, $pre->accessorial_qty, $pre->accessorial_per_unit, $pre->accessorial_total_charge, $pre->accessorial_index, $nAccessorialToBillTo, $nCreatedById);
				if (!$v) {
					$oOrder->delete();
					error_log("Accessorial Failure");
					return false;
				}
			}
		}
		
		// convert charges
		$oPreCharge = $this->get_charge();
		if (!empty($oPreCharge)) {
			$oOrderCharge = new OrderCharge();
			$nFuelCharge = $oPreCharge->get_fuel_charge();
			$nLineHaulCharge = $oPreCharge->get_linehaul_charge();
			$nAccessorialCharge = $oPreCharge->get_accessorial_charge();
			$nFuelCost = 0; // Default. When there's no carrier, there's no charge set. 
			$nLineHaulCost = 0;
			$nAccessorialCost = 0;
			$v = $oOrderCharge->create($nOrderId, $nFuelCharge, $nLineHaulCharge, $nAccessorialCharge, $nFuelCost, $nLineHaulCost, $nAccessorialCost, $nCreatedById);
			if (!$v) {
				$oOrder->delete();
				error_log("Order Charge Failure");
				return false;
			}
		}
		
		// convert comments
		$aPreComments = $this->list_comments();
		if (!empty($aPreComments))
			foreach ($aPreComments as $comment)
				$oOrder->add_comment($comment->get_comment());
		
		// convert details
		$aPreDetails = $this->list_details();
		foreach ($aPreDetails as $detail) {
			$o = new OrderDetails();
			$v = $o->create($nOrderId, $detail->detail_type, $detail->detail_value, $nCreatedById);
			if (!$v) {
				$oOrder->delete();
				error_log("Detail Failure");
				return false;
			}
		}
		
		// convert equipment allowed
		$aPreEquipment = $this->list_equipment();
		foreach ($aPreEquipment as $equipment) {
			$o = new OrderEquipmentAllowed();
			$v = $o->create($nOrderId, $equipment->equipment_id);
			if (!$v) {
				$oOrder->delete();
				error_log("Equip Allowed Failure");
				return false;
			}
		}
		
		// convert modes allowed
		$aPreModes = $this->list_modes();
		foreach ($aPreModes as $mode) {
			$o = new OrderModesAllowed();
			$v = $o->create($nOrderId, $mode->mode_id, $nCreatedById);
			if (!$v) {
				$oOrder->delete();
				error_log("Modes Allowed");
				return false;
			}
		}
		
		// Order to posting
		if ($this->get_posting_id()) {
			$o = new OrderToPosting();
			$v = $o->create($nOrderId, $this->get_posting_id());
			if (!$v) {
				$oOrder->delete();
				error_log("Posting Failure");
				return false;
			}
		}
		
		// convert stops
		$a = array();
		$aPreStops = $this->get_stops();
		foreach ($aPreStops as $stop) {
			$oOrderStop = new OrderStops();
			$oPreOrderStop = new PreOrderStops();
			
			$nPreOrderStopId = $stop->get_pre_order_stops_id();
			$oPreOrderStop->load($nPreOrderStopId);
			
			$oStopToLocation = new PreOrderStopToLocation();
			$oStopToLocation->load($nPreOrderStopId);
			
			$nStopIndex = $stop->get_stop_index();
			$nLocationId = intval($stop->get('location_id'));
			$nContactId = intval($stop->get('contact_id'));
			$sStopType = $stop->get_stop_type();
			$sScheduleDate = $stop->get_schedule_date();
			$sApptTime = $stop->get_appt_time();
			$v = $oOrderStop->create($nOrderId, $nStopIndex, $nLocationId, $sStopType, $sScheduleDate, $sApptTime, $nCreatedById, $nContactId);
			if (!$v) {
				$oOrder->delete();
				error_log("Stop Failure");
				return false;
			}
			$nOrderStopId = $oOrderStop->get_order_stops_id();
			// Order stop_contacts
			$nStopContact = $oPreOrderStop->get_contact_id();
			if ($nStopContact > 0) {
				$oContact = new OrderStopContacts();
				$v = $oContact->create($nOrderId, $nStopIndex, $nStopContact, $nCreatedById);
				if (!$v) {
					$oOrder->delete();
					error_log("Stop Contact Failure");
					return false;
				}
			}
			// Order stop_details
			$aStopDetails = $oPreOrderStop->list_details();
			foreach ($aStopDetails as $detail) {
				$oPreStopDetail = new PreOrderStopDetails();
				$nPreOrderStopDetailId = $detail->get_pre_order_stop_details_id();

				$oPreStopDetail->load($nPreOrderStopDetailId);

				$nDetailIndex = $oPreStopDetail->get_detail_index();
				$nDetailType = $oPreStopDetail->get_detail_type();
				$sDetailValue = $oPreStopDetail->get_detail_value();

				$oStopDetail = new OrderStopDetails();
				$v = $oStopDetail->create($nOrderId, $nStopIndex, $nDetailIndex, $nDetailType, $sDetailValue);
				if (!$v) {
					$oOrder->delete();
					error_log("Stop Detail Failure");
					return false;
				}
			}
			// Order stop_instructions
			$aStopInstructions = $oPreOrderStop->list_instructions();
			foreach ($aStopInstructions as $instruction) {
				$nInstructionIndex = $instruction['instruction_index'];
				$nInstructionType = $instruction['instruction_type_id'];
				$sInstructionValue = $instruction['instruction'];
				$oStopInstruction = new OrderStopInstructions();
				$v = $oStopInstruction->create($nOrderId, $nStopIndex, $nInstructionIndex, $nInstructionType, $sInstructionValue, $nCreatedById);
				if (!$v) {
					$oOrder->delete();
					error_log("Stop Instruction Failure");
					return false;
				}
			}
		}
		// Order to movement
		foreach ($aPreStops as $k => $stop) {
			if (!isset($aPreStops[$k - 1]))
				continue;
			$nOriginIndex = $aPreStops[$k - 1]->get_stop_index();
			$nDestinationIndex = $aPreStops[$k]->get_stop_index();
			$oMovement = new MovementBase();
			$v = $oMovement->create($nOriginIndex, $nDestinationIndex, $nOrderId, $nCreatedById);
			if (!$v) {
				$oOrder->delete();
				error_log("Movement Failure");
				return false;
			}
			$oLoad = new LoadBase();
			$oLoad->create(0, $oOrder->get('team_required'), 0, 0, 0, $oMovement->get('movement_id'), $nCreatedById, $nOrderId);
			break;
		}
		// Order documents_required
		$oOrder->copyDocumentRequirements($this->get('ordered_by_id'));

		if ($this->fireEvents) {
			$eventName = $this->m_sClassName . '.' . end(explode('::', __METHOD__));
			LP_EventManager::fireEvent($eventName, $this, $oOrder);
		}

		$oOrder->checkTasks();

		return $oOrder;
	}

	/**
	 * override the parent delete function to also delete all related db data
	 */
	public function delete($aKeys = FALSE, $sTable = FALSE) {
		$nPreOrderId = $this->get_pre_order_id();
		if (empty($nPreOrderId))
			return false;
		// delete from pre_order_accessorials
		$o = new PreOrderAccessorials();
		$o->where('pre_order_id', '=', $nPreOrderId);
		$aA = $o->list()->rows;
		foreach ($aA as $a) { // load each so a PreOrderAccessorial can delete it's related db items
			$o = new PreOrderAccessorials();
			$o->load($a->get_pre_order_accessorial_id());
			$o->delete();
		}
		// delete from pre_order_charge
		$o = new PreOrderCharge();
		$o->where('pre_order_id', '=', $nPreOrderId);
		$o->delete();
		// delete from pre_order_comments
		$o = new PreOrderComments();
		$o->where('pre_order_id', '=', $nPreOrderId);
		$o->delete();
		// delete from pre_order_details
		$o = new PreOrderDetails();
		$o->where('pre_order_id', '=', $nPreOrderId);
		$o->delete();
		// delete from pre_order_equipment_allowed
		$o = new PreOrderEquipmentAllowed();
		$o->where('pre_order_id', '=', $nPreOrderId);
		$o->delete();
		// delete from pre_order_instructions
		$o = new PreOrderInstructions();
		$o->where('pre_order_id', '=', $nPreOrderId);
		$o->delete();
		// delete from pre_order_modes_allowed
		$o = new PreOrderModesAllowed();
		$o->where('pre_order_id', '=', $nPreOrderId);
		$o->delete();
		// delete from pre_order_stops
		$o = new PreOrderStops();
		$o->where('pre_order_id', '=', $nPreOrderId);
		$aA = $o->list()->rows;
		foreach ($aA as $a) { // load each so a stop can delete it's related db items
			$o = new PreOrderStops();
			$o->load($a->get_pre_order_stops_id());
			$o->delete();
		}
		// delete from pre_order_to_bill_to
		$o = new PreOrderToBillTo();
		$o->where('pre_order_id', '=', $nPreOrderId);
		$o->delete();
		// delete from pre_order_to_posting
		$o = new PreOrderToPosting();
		$o->where('pre_order_id', '=', $nPreOrderId);
		$o->delete();
		// delete self
		$this->where('order_stops_id', '=', $nOrderStopId);
		return( parent::delete($aKeys, $sTable) );
	}

	/**
	 * gets the orders and their relevant data from db.  Allows for paging of the list
	 * @param $nPageNum the page number of the lists page
	 * @param $nNumItems the number of items per page
	 * @return an array of orders with an array of their relevant data objects
	 */
	public static function get_order_list($nPageNum = 1, $nNumItems = 50) {
		$nInnerLimit = $nPageNum * $nNumItems;
		global $oSession;
		$aReturn = array();
		$sOrderIds = '';
		$aOrderIds = array();
		$sQuery = "SELECT * FROM (
						SELECT TOP $nNumItems * FROM (
							SELECT TOP $nInnerLimit 
									o.*, c.total_charge, c.fuel_charge, c.linehaul_charge, 
									c.accessorial_charge, 
									c.created_by_id as charge_created_by_id, 
									c.created_at as charge_created_at, 
									c.updated_by_id as charge_updated_by_id, 
									c.updated_at as charge_updated_at,
									(cb.first_name + ' ' + cb.last_name) as broker_name,
									customer.customer_name
							FROM pre_order_base o
							LEFT JOIN pre_order_charge c ON c.pre_order_id = o.pre_order_id
							LEFT JOIN user_base ub ON ub.user_id = o.broker_id
							LEFT JOIN contact_base cb ON cb.contact_id = ub.contact_id
							LEFT JOIN customer_base customer ON customer.customer_id = o.customer_id
							WHERE o.active = 1 
							" .
				//o.broker_id IN (" . implode(", ", $oSession->session_var( 'user_scope' ) ) . ") 
				"ORDER BY o.pre_order_id DESC
						) as tb1 
						ORDER BY pre_order_id ASC
					) as tb2 
					ORDER BY pre_order_id DESC";
		$o = new DBModel();
		$o->connect();
		$res = $o->query($sQuery);
		$loop_count = 0;
		while ($row = $o->db->fetch_object($res)) {
			if ($sOrderIds != "")
				$sOrderIds .= ', ';
			$sOrderIds .= $row->pre_order_id;
			$aOrderIds[] = $row->pre_order_id;
			$oOrder = new PreOrderBase();
			$oCharge = new PreOrderCharge();
			$aO = array('pre_order_id' => $row->pre_order_id, 'customer_id' => $row->customer_id,
				'ordered_by_id' => $row->ordered_by_id,
				'team_required' => $row->team_required, 'broker_id' => $row->broker_id,
				'created_by_id' => $row->created_by_id, 'created_at' => $row->created_at,
				'updated_by_id' => $row->updated_by_id, 'updated_at' => $row->updated_at,
				'active' => $row->active);
			$aC = array('pre_order_id' => $row->pre_order_id,
				'total_charge' => $row->total_charge, 'fuel_charge' => $row->fuel_charge,
				'linehaul_charge' => $row->linehaul_charge,
				'accessorial_charge' => $row->accessorial_charge,
				'created_by_id' => $row->charge_created_by_id,
				'created_at' => $row->charge_created_at,
				'updated_by_id' => $row->charge_updated_by_id,
				'updated_at' => $row->charge_updated_at);
			$oOrder->preload_data($aO);
			$oCharge->preload_data($aC);

			$aReturn[$row->pre_order_id]['order'] = $oOrder->get();
			$aReturn[$row->pre_order_id]['order']['broker_name'] = $row->broker_name;
			$aReturn[$row->pre_order_id]['order']['customer_name'] = $row->customer_name;
			$aReturn[$row->pre_order_id]['charge'] = $oCharge->get();
		}
		/*
		 * Query for Equipment list
		 */
		$s = "SELECT e.pre_order_id, equip.CarrEquipDesc as name FROM tms.dbo.pre_order_equipment_allowed e
				LEFT JOIN ContractManager.dbo.AvailableEquipment equip ON e.equipment_id = equip.CarrEquipId
				WHERE e.pre_order_id IN (" . implode(", ", $aOrderIds) . ")";
		$res = $o->query($s);
		$aEquipment = array();
		while ($row = $o->db->fetch_object($res)) {
			$aEquipment[$row->pre_order_id][] = $row->name;
		}
		foreach ($aEquipment as $nOrderId => $aEquip) {

			$aReturn[$nOrderId]['equipment'] = $aEquip;
		}

		/*
		 * Query for stop list
		 */
		$s = "SELECT stop.* FROM pre_order_stops stop
				WHERE stop.pre_order_id IN (" . implode(", ", $aOrderIds) . ")
				ORDER BY stop.stop_index ASC";
		$res = $o->query($s);
		$aStops = array();
		$aUSZips = array();
		$aCANZips = array();
		while ($row = $o->db->fetch_object($res)) {
			$aStops[$row->pre_order_id][] = (array) $row;
			$sZip = $row->zip_code;
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
				if (!is_numeric($stop['zip_code']))
					continue;
				$aStop[$k]['city'] = $aCityState[$stop['zip_code']]->City;
				$aStop[$k]['state'] = $aCityState[$stop['zip_code']]->State;
			}
			$aReturn[$nOrderId]['stops'] = $aStop;
		}

		/*
		 * Query for city/state names
		 */

		return $aReturn;
	}

	public function doPreOrder($nId, $nCustomerId, $nOrderedById, $nUserId, $vIsQuote, $vIsContractedRate, $vIsPost, $vTeamRequired, $nFuelCharge, $nLineHaulCharge, $aAccessorials, $nBillToId, $sOrderComment, $aOrderDetails, $aEquipmentAllowed, $aModesAllowed, $aStops) {
		if ($nId > 0) {
			$this->load($nId);
		}
		if (!$this->create($nCustomerId, $nOrderedById, $nUserId, $nUserId, $vIsQuote, $vIsContractedRate, $vIsPost, $vTeamRequired)) {
			add_error('Error Creating new Pre Order');
			return;
		}
		$this->update_charges($nFuelCharge, $nLineHaulCharge, $aAccessorials, $vIsContractedRate);
		$this->update_bill_to($nBillToId);
		$this->add_comments($sOrderComment);
		$this->update_details($aOrderDetails);
		$this->update_equipment($aEquipmentAllowed);
		$this->update_modes($aModesAllowed);
		$this->update_stops($aStops);
	}
	
	public function updateCharges($charges) {
		$myUserId = get_user_id();
		$preOrderId = $this->get('pre_order_id');
		
		// Calculate accessorial totals
		$accessorialCharge = 0;
		$accessorialCost = 0;
		foreach($charges['accessorials'] as $accessorial) {
			$accessorialCharge += $accessorial['quantity'] * $accessorial['amount'];
		}
		
		// Create/update the order charge row
		$preOrderCharge = new PreOrderCharge();
		$preOrderCharge->load(array(
			'pre_order_id' => $preOrderId
		));
		$preOrderCharge->create($preOrderId, $charges['fuel'], $charges['linehaul'], $accessorialCharge, $myUserId);
		
		// Delete old accessorials
		$query = "DELETE FROM pre_order_accessorials WHERE pre_order_id = $preOrderId";
		LP_Db::execute($query);
		
		// Insert new rows for accessorials
		$numAccessorials = count($charges['accessorials']);
		for ($i = 0; $i < $numAccessorials; $i++) {
			$accessorial = $charges['accessorials'][$i];
			$accessorial['billToId'] = intval($accessorial['billToId']);
			if (!$accessorial['billToId']) {
				$accessorial['billToId'] = $this->get('bill_to_id');
			}
			$preOrderAccessorial = new PreOrderAccessorials();
			$preOrderAccessorial->create($preOrderId, $accessorial['type'], $accessorial['quantity'], $accessorial['amount'], 0, $i, $accessorial['billToId'], $myUserId);
		}
	}
	
	public function update_stops($stops){
		if(!$this->get('pre_order_id')){
			return false;
		}
		
		//Get the current stops, so we can remove any that were deleted
		$currentStops = $this->getStops();
		$currentStopIds = array();
		foreach($currentStops as $currentStop){
			$currentStopIds[] = $currentStop['pre_order_stops_id'];
		}
		//Loop through stops
		$stopIds = array();
		for($i = 0; $i < count($stops); $i++){
			
			$stop = $stops[$i];
			$stopIndex = $i;
			$orderStops = new PreOrderStops();
			$orderStops->load($stop['stop_id']);
			
			//Process the stop data
			if (isset($stop['date'])) {
				$stop['date'] = date('Y-m-d', strtotime($stop['date']));
			}
			else {
				$stop['date'] = null;
			}
			if (isset($stop['time'])) {
				$stop['time'] = date('g:i a', strtotime($stop['time']));
			}
			else {
				$stop['time'] = null;
			}
			
			if(!isset($stop['location_id'])){
				$stop['location_id'] = 0;
			}
			if(!isset($stop['contact_id'])){
				$stop['contact_id'] = 0;
			}
			
			//If there is no stop_id create the stop
			if(!$orderStops->get('order_stops_id')){
				$orderStops->create($this->get('pre_order_id'), $stopIndex, $stop['stop_type'], $stop['date'], $stop['time'], get_user_id(), $stop['zip'], $stop['location_id'], $stop['contact_id']);
			}
			
			//Else this is an existing stop and we just need to update some infor
			else{
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
			$stopIds[] = $orderStops->get('pre_order_stops_id');
		}
		
		//Delete any stops that existed in the current stops but were not submitted
		foreach ($currentStopIds as $currentStopId){
			if(!in_array($currentStopId, $stopIds)){
				$deleteStop = new PreOrderStops();
				$deleteStop->load($currentStopId);
				$deleteStop->delete();
			}
		}
		
		return true;
	}
	
	/**
	 *
	 * @return array rows containing order_stops and location_base fields
	 */
	public function getStops() {
		$query = "SELECT 
				pre_order_stops.*,
				location_base.*,
				contact_base.first_name,
				contact_base.last_name,
				(contact_base.first_name + ' ' + contact_base.last_name) name,
				uszip.City city,
				uszip.State state,
				uszip.Lat lat,
				uszip.Long lng
				FROM pre_order_stops
				LEFT JOIN
					location_base
				ON
					location_base.location_id = pre_order_stops.location_id
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
					contact_base.contact_id = pre_order_stops.contact_id
				WHERE pre_order_stops.pre_order_id = {$this->get('pre_order_id')}
				ORDER BY pre_order_stops.stop_index";
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
			$rows[$i]['address_2'] = $cityRow['city'] . ' ' . $cityRow['state'] . ' ' .  $rows[$i]['zip'];
		}
		
		return $rows;
	}
	
	public function getDetails() {
		$query = "SELECT detail_value, detail_type_name
			FROM pre_order_details, tools_detail_types
			WHERE pre_order_id = {$this->get('pre_order_id')}
			AND tools_detail_types.detail_type_id = pre_order_details.detail_type
			ORDER BY detail_index";
		$rows = LP_Db::fetchAll($query);
		return $rows;
	}
	
	public function getStopContacts() {
		$contacts = array();
		$query = "SELECT stop_index, contact_id
			FROM pre_order_stops
			WHERE pre_order_id = {$this->get('pre_order_id')}
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
	
	public function getPreOrderDetails() {
		if (!$this->get('pre_order_id')) {
			return false;
		}
		$query = "SELECT
				detail_type AS detail_type_id, detail_value
			FROM
				pre_order_details
			WHERE pre_order_id = {$this->get('pre_order_id')}
			ORDER BY detail_index";
		$rows = LP_Db::fetchAll($query);
		return $rows;
	}
	
	/**
	 *
	 * @return array array with keys of stop_index => array of strings (instructions)
	 */
	public function getStopDetails() {
		$details = array();
		$query = "SELECT pre_order_stop_details_id detail_id, stop_index, detail_value, detail_type_name, detail_type detail_type_id
			FROM pre_order_stop_details, tools_detail_types
			WHERE pre_order_id = {$this->get('pre_order_id')}
			AND pre_order_stop_details.detail_type = tools_detail_types.detail_type_id
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

}