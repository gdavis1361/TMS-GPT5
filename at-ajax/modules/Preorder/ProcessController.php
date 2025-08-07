<?php

class Preorder_ProcessController extends AjaxController {

	public function saveAction() {
		$this->setParam('post', $_POST);
		
		/////////////////////////////////////////////////////
		//	Customer Information
		/////////////////////////////////////////////////////
		
		// Clean post variables
		$preOrderId = intval(getPostParam('pre_order_id', 0));
		$customerId = intval(getPostParam('customer_id', 0));
		$orderedById = getPostParam('ordered_by_id', 0);
		$myUserId = get_user_id();
		$doConvert = intval(getParam('doConvert', 0));
		
		// Validation
		// Make sure there is a customer
		if (!$customerId) {
			$this->addError('Please select a customer', 'customer_id');
		}
		
		// Check ordered by contact
		if (!$orderedById) {
			$this->addError('Please select a contact for the Customer', 'ordered_by_id');
		}
		
		if($this->anyErrors()){
			return;
		}

		$customerBase = new CustomerBase($customerId);
		$contactBase = new ContactBase($orderedById);
		
		$billToId = intval(getPostParam('bill_to_location_id', 0));
		if (!$billToId) {
			$billToRecord = $customerBase->getBillToRecord();
			if ($billToRecord && $billToRecord['bill_to_location_id']) {
				$billToId = $billToRecord['bill_to_location_id'];
			}
			else {
				$billToRecord = $contactBase->getBillToRecord();
				if ($billToRecord && $billToRecord['bill_to_location_id']) {
					$billToId = $billToRecord['bill_to_location_id'];
				}
			}
		}
		
		// Make sure there is a bill to for this order
		if (!$billToId) {
			$this->addError('Please select a Bill To ', 'bill_to_customer');
		}
		
		/////////////////////////////////////////////////////
		//	Create the preorder
		/////////////////////////////////////////////////////
		$preorder = new PreOrderBase();
		$preorder->load($preOrderId);
		
		/////////////////////////////////////////////////////
		//	Expiration Date
		/////////////////////////////////////////////////////
		$sExpiration = strtotime("+60 days");
		if($preorder->get('pre_order_id')){
			$sExpiration = $preorder->get('expiration_date');
		}
		if(isset($_REQUEST['expiration_date'])){
			$sExpiration = request('expiration_date', strtotime('+60 days'));
		}
		
		/////////////////////////////////////////////////////
		//	Order Details
		/////////////////////////////////////////////////////
		// Get rid of last item in each array because it should be ignored
		$aOrderDetails = false;
		if(isset($_REQUEST['order_detail_type_id'])){
			$aOrderDetailsType = json_decode(request('order_detail_type_id', '[]'), true);
			$aOrderDetailsValue = json_decode(request('order_detail_value', '[]'), true);
			array_pop($aOrderDetailsType);
			array_pop($aOrderDetailsValue);

			$aOrderDetails = array();
			foreach ($aOrderDetailsType as $k => $v) {
				$aOrderDetails[] = array(
					"type" => $v,
					"value" => $aOrderDetailsValue[$k]
				);
			}
		}

		/////////////////////////////////////////////////////
		//	Modes Allowed
		/////////////////////////////////////////////////////
		$aModesAllowed = false;
		if (isset($_POST['modesAllowed']) && count($_POST['modesAllowed'])) {
			$aModesAllowed = json_decode($_POST['modesAllowed'], true);
		}

		/////////////////////////////////////////////////////
		//	Equipment Allowed
		/////////////////////////////////////////////////////
		$aEquipmentAllowed = false;
		if (isset($_POST['equipmentAllowed']) && count($_POST['equipmentAllowed'])) {
			$aEquipmentAllowed = json_decode($_POST['equipmentAllowed'], true);
		}

		
		/////////////////////////////////////////////////////
		//	Stops
		/////////////////////////////////////////////////////
		$aStops = false;
		if (isset($_POST['stops'])) {
			$aStops = json_decode(urldecode($_POST['stops']), true);
			$this->setParam('stops', $aStops);
		}
		
		//Validate stops
		if($aStops){
			$orderStop = new OrderStops();
			for($i = 0; $i < count($aStops); $i++){
				$stop = $aStops[$i];
				$errors = $orderStop->validate($stop);
				//Add any errors to the main errors
				foreach($errors as $field => $message){
					$this->addError("Stop " . ($i+1) . " - " . $message, "stop-" . $field . "-" . $i);
				}
			}
		}
		
		/////////////////////////////////////////////////////
		//	Charges
		/////////////////////////////////////////////////////
		$charges = false;
		if(isset($_REQUEST['charges'])){
			$charges = json_decode(getPostParam('charges', '[]'), true);
		}
		$this->setParam('charges', $charges);
		
		
		
		/////////////////////////////////////////////////////
		//	Check that the order saves
		/////////////////////////////////////////////////////
		$success = $preorder->create($customerId, $orderedById, $myUserId, $myUserId, true, false, false, $sExpiration);
		if (!$success) {
			$this->addError('Error saving quote');
		}


		/////////////////////////////////////////////////////
		//	If there are no errors, do the processing
		/////////////////////////////////////////////////////
		if(!$this->anyErrors()) {
			// set the bill to
			if($billToId){
				$preOrderToBillTo = new PreOrderToBillTo();
				$preOrderToBillTo->load(array(
					'pre_order_id' => $preorder->get('pre_order_id')
				));
				$preOrderToBillTo->create($preorder->get('pre_order_id'), $billToId);
			}
			
			//Update the order details
			if($aOrderDetails){
				$preorder->update_details($aOrderDetails);
			}
			
			//Update the modes and equipment
			if($aEquipmentAllowed){
				$preorder->update_equipment($aEquipmentAllowed);
			}
			if($aModesAllowed){
				$preorder->update_modes($aModesAllowed);
			}
			
			//Update the stops
			if($aStops){
				$preorder->update_stops($aStops);
			}
			
			// Update charge/cost/accessorials
			if($charges){
				$preorder->updateCharges($charges);
			}
			
			if ($doConvert) {
				$orderBase = $preorder->convert_to_order();
				if ($orderBase) {
					$this->setParam('order_id', $orderBase->get('order_id'));
				}
			}
			
			if(!$preOrderId){
				$this->addMessage("Quote has been created, you will be redirected");
				$this->setRedirect('/orders/?d=quotes');
			}
			else{
				$this->addMessage("Quote has been saved.");
			}
		}
	}
	
	public function getCustomerInformationAction() {
		$preOrderId = intval(getPostParam('pre_order_id', 0));
		if ($preOrderId) {
			$query = "SELECT
					pre_order_base.customer_id,
					pre_order_base.ordered_by_id,
					pre_order_to_bill_to.bill_to_id AS bill_to_location_id,
					
					customer_base.customer_name,
					customer_base2.customer_name bill_to_customer_name,
					customer_base2.customer_id bill_to_customer_id,
					
					location_base.location_name_1 AS bill_to_location_name,
					
					contact_base.contact_id,
					contact_base.first_name,
					contact_base.last_name,
					(contact_base.first_name + ' ' + contact_base.last_name) AS contact_name
				FROM
					pre_order_base
				LEFT JOIN customer_base ON customer_base.customer_id = pre_order_base.customer_id
				LEFT JOIN pre_order_to_bill_to ON pre_order_to_bill_to.pre_order_id = pre_order_base.pre_order_id
				
				LEFT JOIN location_base ON location_base.location_id = pre_order_to_bill_to.bill_to_id
				LEFT JOIN customer_to_location ON customer_to_location.location_id = location_base.location_id
				LEFT JOIN customer_base customer_base2 ON customer_base2.customer_id = customer_to_location.customer_id
				
				LEFT JOIN contact_base ON contact_base.contact_id = pre_order_base.ordered_by_id
				WHERE pre_order_base.pre_order_id = $preOrderId";
			$row = LP_Db::fetchRow($query);
			$this->setParam('record', $row);
		}
	}
	
	public function getCustomerHotContactsAction() {
		$customerId = intval(getParam('customer_id', 0));
		$statusId = ToolsStatusTypes::Hot;
		$customer = new CustomerBase();
		$customer->load($customerId);
		$this->setParam('records', $customer->getContacts($statusId));
	}
	
	public function getOrderDetailsListAction() {
		$orderTypeId = ToolsInstructionTypes::Orders;
		$query = "SELECT
				tools_detail_types.*
			FROM
				tools_detail_types
			WHERE detail_group_id = $orderTypeId
			ORDER BY detail_type_name";
		$rows = LP_Db::fetchAll($query);
		$this->setParam('records', $rows);
	}
	
	public function getOrderDetailsDataAction() {
		$preOrderId = intval(request('pre_order_id', 0));
		$preOrderBase = new PreOrderBase();
		$preOrderBase->load($preOrderId);
		$rows = $preOrderBase->getPreOrderDetails();
		$this->setParam('records', $rows);
	}
	
	public function getChargeInformationAction() {
		$preOrderId = intval(getPostParam('pre_order_id', 0));
		$record = array();
		if ($preOrderId) {
			// Get order bill to info
			$query = "SELECT pre_order_to_bill_to.bill_to_id FROM pre_order_to_bill_to WHERE pre_order_id = $preOrderId";
			$row = LP_Db::fetchRow($query);
			$record['bill_to_id'] = 0;
			if ($row) {
				$record['bill_to_id'] = $row['bill_to_id'];
			}
			
			// Get linehaul and fuel charges and costs
			$query = "SELECT * FROM pre_order_charge WHERE pre_order_id = $preOrderId";
			$rows = LP_Db::fetchAll($query);
			if (count($rows)) {
				$record = array_merge($record, $rows[0]);
				
				// Get accessorial charges
				$query = "SELECT
						pre_order_accessorials.*,
						pre_order_accessorial_to_bill_to.bill_to_id AS bill_to,
						customer_base.customer_name AS bill_to_name,
						ContractManager.dbo.AccessorialCodes.AccCodeDesc AS accessorial_type_name
					FROM pre_order_accessorials
					LEFT JOIN pre_order_accessorial_to_bill_to ON pre_order_accessorial_to_bill_to.pre_order_accessorial_id = pre_order_accessorials.pre_order_accessorial_id
					LEFT JOIN customer_base ON customer_base.customer_id = pre_order_accessorial_to_bill_to.bill_to_id
					LEFT JOIN ContractManager.dbo.AccessorialCodes ON ContractManager.dbo.AccessorialCodes.AccCodeID = pre_order_accessorials.accessorial_type_id
					WHERE pre_order_id = $preOrderId";
				$rows = LP_Db::fetchAll($query);
				if (count($rows)) {
					for ($i = 0; $i < count($rows); $i++) {
						$rows[$i]['bill_to_id'] = $record['bill_to_id'];
					}
				}
				$record['accessorialCharges'] = $rows;
			}
		}
		$this->setParam('record', $record);
	}
	
	public function convertToOrderAction() {
		$this->setParam('post', $_POST);
		$preOrderIds = json_decode(getPostParam('preOrderIds', array()), true);
		$quantity = intval(getPostParam('quantity', 1));
		$numItems = count($preOrderIds);
		for ($i = 0; $i < $numItems; $i++) {
			$preOrderId = intval($preOrderIds[$i]);
			$preOrderBase = new PreOrderBase($preOrderId);
			if ($preOrderBase->get('pre_order_id')) {
				for ($j = 0; $j < $quantity; $j++) {
					$preOrderBase->convert_to_order();
				}
			}
		}
		
	}
}