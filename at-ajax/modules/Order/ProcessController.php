<?php

class Order_ProcessController extends AjaxController {

	public function saveOrderAction() {
		$this->setParam('post', $_POST);
//		$this->addError('Fake Error');
//		return;
		
		/////////////////////////////////////////////////////
		//	Customer Information
		/////////////////////////////////////////////////////
		
		// Clean post variables
		$orderId = intval(getPostParam('order_id', 0));
		$customerId = intval(getPostParam('customer_id', 0));
		$orderedById = getPostParam('ordered_by_id', 0);
		$myUserId = get_user_id();
		$isContractedRate = intval(getParam('contracted_rate', 0));
		$isTeamRequired = intval(getParam('team_required', 0));
		
		$customerBase = new CustomerBase($customerId);
		$contactBase = new ContactBase($orderedById);
		
		$billToId = intval(getPostParam('bill_to_location_id', 0));
		/*
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
		*/
		
		// Validation
		// Make sure there is a customer
		if (!$customerId) {
			$this->addError('Please select a customer', 'customer_id');
		}

		// Check ordered by contact
		if (!$orderedById) {
			$this->addError('Please select a contact for the Customer', 'ordered_by_id');
		}

		// Make sure there is a bill to for this order
		if (!$billToId) {
			$this->addError('Please select a Bill To ', 'bill_to_location_id');
		}
		
		//Return if any errors
		if($this->anyErrors()){
			return;
		}
		
		$nEquipmentId = getPostParam('used_equipment_id', 0);
		
		
		
		/////////////////////////////////////////////////////
		//	Status
		/////////////////////////////////////////////////////
		$statusId = false;
		if(isset ($_REQUEST['status_id'])){
			$statusId = intval(getPostParam('status_id', ToolsStatusTypes::OrderAvailable));
		}
		
		/////////////////////////////////////////////////////
		//	Goods
		/////////////////////////////////////////////////////
		$nLoadWeight = false;
		if(isset ($_REQUEST['load_weight'])){
			$nLoadWeight = getPostParam('load_weight', 0);
		}
		
		/////////////////////////////////////////////////////
		//	Status
		/////////////////////////////////////////////////////
		$accountingStatusId = false;
		if(isset ($_REQUEST['accounting_status_id'])){
			$accountingStatusId = intval(getPostParam('accounting_status_id', 0));	//TODO: where to put this
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

		$sOrderComment = trim(request('order_comment'));

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
		//	Revenue
		/////////////////////////////////////////////////////
		$revenue = false;
		if(isset($_REQUEST['revenue'])){
			$revenue = json_decode(getPostParam('revenue', '{}'), true);
			$this->setParam('revenue', $revenue);
		}
		
		$nFuelCharge = getPostParam('fuel_charge', 0);
		$nLineHaulCharge = getPostParam('linehaul_charge', 0);
		
		/////////////////////////////////////////////////////
		//	Load and check the order, get load
		/////////////////////////////////////////////////////
		$order = new OrderBase();
		$order->load($orderId);
		if ($order->get('order_id')) {
			$oldStatusId = $order->get('status_id');
			$success = $order->create($customerId, $billToId, $orderedById, $myUserId, $myUserId, $isTeamRequired);
			if (!$success) {
				$this->addError('Error saving order');
			}
		}
		else {
			$this->addError('Invalid order');
		}
		$load = new LoadBase();
		$load->load(array(
			'order_id' => $order->get('order_id')
		));
		
		
		//Return if any errors
		if($this->anyErrors()){
			return;
		}
		
		/////////////////////////////////////////////////////
		//	Carrier
		/////////////////////////////////////////////////////
		$carrierInfo = $order->getCarrierInfo();
		$nCarrierId = $carrierInfo['CarrID'];
		if(isset($_REQUEST['carrier_id'])){
			$nCarrierId = intval(getPostParam('carrier_id', getPostParam('cid', 0)));
		}
		
		//Check if this carrier is approved
		if($nCarrierId){
			$carrierBaseExtended = new CarrierBaseExtended($nCarrierId);
			if($carrierBaseExtended->get('status_id') != 1){
				$this->addError('The carrier you have selected has not been verified yet, a task has been created to solve this issue. You will be notified when this task has been completed.', 'carrier_id');
				$carrierBaseExtended->checkTasks();
			}
		}
		
		/////////////////////////////////////////////////////
		//	Carrier Contact
		/////////////////////////////////////////////////////
		$nCarrierContactId = $load->get('contact_id');
		if(isset($_REQUEST['carrier_contact_id'])){
			$nCarrierContactId = getPostParam('carrier_contact_id', 0);
		}
		
		//Check if there is a carrier but no contact
		if($nCarrierId && !$nCarrierContactId){
			$this->addError('You must choose a contact for the carrier you have selected.', 'carrier_contact_id');
		}
		
		//Return if any errors
		if($this->anyErrors()){
			return;
		}
		
		
		/////////////////////////////////////////////////////
		//	If there are no errors, do the processing
		/////////////////////////////////////////////////////
		if (!$this->anyErrors()) {

			// Update the order document requirements based on the customer document requirements
			$order->copyDocumentRequirements($orderedById);
			
			// If there are no errors, do the processing
			$order->add_comment($sOrderComment);
			
			//Update order details
			if($aOrderDetails){
				$order->update_details($aOrderDetails);
			}
			
			//Set the status
			if ($statusId) {
				$order->set_status($statusId);
			}
			
			//Update equipment
			if($aEquipmentAllowed){
				$order->update_equipments($aEquipmentAllowed);
			}
			
			//Update modes
			if($aModesAllowed){
				$order->update_modes($aModesAllowed);
			}
			
			//Update stops
			if($aStops){
				$order->update_stops($aStops);
			}
			
			//Update the status
			if($accountingStatusId){
				$order->set('accounting_status_id', $accountingStatusId);
			}
			
			// Check if the order status has changed back to available
			if($statusId){
				if ($statusId == ToolsStatusTypes::OrderAvailable && $oldStatusId !== ToolsStatusTypes::OrderAvailable) {

					// Clear the carrier info
					$nCarrierId = 0;
					$nCarrierContactId = null;
					$nEquipmentId = 0;

					// Clear the cost info
					$revenue['costs'] = array(
						'linehaul' => 0,
						'fuel' => 0,
						'accessorials' => array()
					);
				}
			}
			
			// Update charge/cost/accessorials
			if($revenue){
				$order->updateCharges($revenue);
			}
			
			//Update the loads
			$oLoad = new LoadBase();
			$oLoad->load(array('order_id' => $orderId));
			$oLoad->create($nCarrierId, 0, 0, $nEquipmentId, 0, 0, get_user_id(), $orderId);
			$oLoad->set('contact_id', $nCarrierContactId);
			if ($oldStatusId == ToolsStatusTypes::OrderAvailable && $nCarrierId) {
				$order->set('status_id', ToolsStatusTypes::OrderCovered);
				$order->save();
			}
			$oLoad->save();
			
			//Update the goods
			if ($orderId && $nLoadWeight) {
				$oGoods = new OrderGoods();
				$oGoods->load(array('order_id' => $orderId));
				$oGoods->create(array(
					'order_id' => $orderId,
					'weight' => $nLoadWeight
				));
			}
			
			//Save the order
			$order->save();
			
			//Check tasks for this order
			$order = new OrderBase();
			$order->load($orderId);
			$order->checkTasks();
			
			// Check tasks for the carrier
			if ($nCarrierId) {
				$carrierBaseExtended = new CarrierBaseExtended($nCarrierId);
				$carrierBaseExtended->checkTasks();
			}
			
			//Set the time param
			$this->setParam('time', LP_Timer::showReport());
			
			//Add a message
			$this->addMessage('Order was successfully saved.');
		}
	}

	public $carrierContact = false;
	public $broker = false;

	public function outputConfirmationAction() {
		$orderId = intval(request('order_id', 0));
		$order = new OrderBase();
		$order->load($orderId);
		$fileName = $order->getRateConfirmationFileName();

		$html = $this->generateConfirmationData($orderId);

		require_once(INCLUDES_DIR . '/dompdf/dompdf_config.inc.php');
		$dompdf = new DOMPDF();
		$dompdf->load_html($html);
		$dompdf->render();

		$pdfOutput = $dompdf->output();
		header('Content-type: application/pdf');
		echo $pdfOutput;
		die();
	}

	public function downloadConfirmationAction() {
		$orderId = intval(request('order_id', 0));
		$order = new OrderBase();
		$order->load($orderId);
		$fileName = $order->getRateConfirmationFileName();

		$html = $this->generateConfirmationData($orderId);

		require_once(INCLUDES_DIR . '/dompdf/dompdf_config.inc.php');
		$dompdf = new DOMPDF();
		$dompdf->load_html($html);
		$dompdf->render();
		$dompdf->stream($fileName);
		die();
	}

	public function faxConfirmationAction() {
		$fax = request('fax', false);
		if ($fax) {
			$fax = preg_replace('/[^\d]/', '', $fax) . '@fax.com';
			$_POST['email'] = $fax;
			$this->emailConfirmationAction();
		}
	}

	public function emailConfirmationAction() {
		$orderId = intval(request('order_id', 0));
		$email = request('email', false);

		$order = new OrderBase();
		$order->load($orderId);
		$fileName = $order->getRateConfirmationFileName();

		$html = $this->generateConfirmationData($orderId);

		require_once(INCLUDES_DIR . '/dompdf/dompdf_config.inc.php');
		$dompdf = new DOMPDF();
		$dompdf->load_html($html);
		$dompdf->render();
		$pdfOutput = $dompdf->output();

		$broker = $this->broker;
		$brokerName = $broker->getName();
		$brokerEmail = $broker->getEmail();

		$carrierContactName = $this->carrierContact->getName();
		$carrierContactEmail = $this->carrierContact->getEmail();

		// Check if an email was specified in the post
		if ($email) {
			$carrierContactEmail = $email;
		}
		if (!$carrierContactEmail) {
			$carrierFax = $this->carrierContact->getFax();
			if ($carrierFax) {
				$carrierContactEmail = preg_replace('/[^\d]/', '', $carrierFax) . '@fax.com';
			}
		}

		if ($carrierContactEmail) {
			$from = $brokerEmail;
			$to = $carrierContactEmail;
			$text = '';
			$html = '';
			$mail = new Zend_Mail();
			$mail->setBodyText($text);
			$mail->setBodyHtml($html);
			$mail->setFrom($from, $brokerName);
			$mail->addTo($to, $carrierContactName);
			$mail->setSubject('Rate Confirmation for Order ' . $order->getOrderIdDisplay());

			// attach file
			$attachment = $mail->createAttachment($pdfOutput, 'application/pdf');
			$attachment->filename = $fileName;
			$mail->send();
			$this->addMessage("Email was sent to $carrierContactName $carrierContactEmail from $brokerName $brokerEmail");
		}
		else {
			$this->addError('Carrier Contact has no email');
		}
	}

	public function generateConfirmationData($orderId) {
		if ($orderId) {
			$order = new OrderBase();
			$order->load($orderId);

			// get contact id from user id
			$query = "SELECT contact_base.contact_id FROM contact_base, user_base
				WHERE user_base.contact_id = contact_base.contact_id
				AND user_base.user_id = {$order->get('broker_id')}";
			$row = LP_Db::fetchRow($query);
			$contactId = $row['contact_id'];

			// get broker info
			$this->brokerId = $contactId;
			$broker = new ContactBase();
			$broker->load($contactId);
			$this->broker = $broker;

			// get carrier info
			$carrierInfo = $order->getCarrierInfo();
			if (!isset($carrierInfo['mc_no'])) {
				return 'No Carrier is selected';
			}

			// get carrier contact info
			$carrierBaseExtended = new CarrierBaseExtended();
			$carrierBaseExtended->load($carrierInfo['CarrID']);

			$this->carrierContact = $order->getCarrierContact();

			// get customer info
			$customer = new CustomerBase();
			$customer->load($order->get('customer_id'));

			// get order charges
			$orderChargeRow = $order->getOrderCharges();
			$carrierFreightPay = $orderChargeRow['linehaul_cost'];
			$fuelPay = $orderChargeRow['fuel_cost'];

			// get stops
			$stops = $order->getStops();

			$view = new Zend_View();
			$view->setScriptPath(SITE_ROOT . '/templates/orders/');
			$params = array(
				'title' => 'Load Confirmation',
				'pageNumer' => 1,
				'documentTitle' => 'Load Confirmation',
				'documentSubtitle' => 'Load #: ' . $order->getOrderIdDisplay(),
				'carrierName' => $carrierInfo['CarrName'],
				'mcNumber' => $carrierInfo['mc_no'],
				'carrierAddress' => $carrierInfo['city'] . ', ' . $carrierInfo['state'] . ' ' . $carrierInfo['zip'],
				'carrierContactName' => $this->carrierContact->getName(),
				'carrierContactPhone' => $this->carrierContact->getPhone(),
				'carrierContactFax' => $this->carrierContact->getFax(),
				'date' => date('m/d/Y'),
				'loadNumber' => $order->getOrderIdDisplay(),
				'commodity' => '', // skip for now
				'weight' => $order->getOrderWeight(),
				'trailerType' => $order->getTrailerType(),
				'reference' => '', // blank for now
				'temp' => '', // blank for now
				'bol' => $order->getBOL(),
				'carrierFreightPay' => $carrierFreightPay,
				'fuelPay' => $fuelPay,
				'brokerName' => $broker->get('first_name') . ' ' . $broker->get('last_name'),
				'brokerPhone' => $broker->getPhone(),
				'brokerFax' => $broker->getFax(),
				'stops' => $stops,
				'stopInstructions' => $order->getStopInstructions(),
				'stopDetails' => $order->getStopDetails(),
				'instructions' => $order->getInstructions(),
				'details' => $order->getDetails()
			);
			foreach ($params as $key => $value) {
				$view->$key = $value;
			}

			$html = $view->render('confirmation.php');

			return $html;
		}

		return false;
	}

	public function getCarrierContactEmailListAction() {
		$orderId = intval(request('order_id', 0));
		$records = array();
		// get the contact id from the load for this order
		$query = "SELECT contact_id FROM load_base WHERE order_id = $orderId";
		$row = LP_Db::fetchRow($query);
		if ($row) {
			$contactId = $row['contact_id'];
			$contact = new ContactBase();
			$contact->load($contactId);
			$records = $contact->getEmails();
		}

		$this->setParam('records', $records);
	}

	public function getCarrierContactFaxListAction() {
		$orderId = intval(request('order_id', 0));
		$records = array();
		// get the contact id from the load for this order
		$query = "SELECT contact_id FROM load_base WHERE order_id = $orderId";
		$row = LP_Db::fetchRow($query);
		if ($row) {
			$contactId = $row['contact_id'];
			$contact = new ContactBase();
			$contact->load($contactId);
			$records = $contact->getFaxes();
		}

		$this->setParam('records', $records);
	}

	public function getCarrierContactAction() {
		$orderId = intval(request('order_id', 0));
		$records = array();
		// get the contact id from the load for this order
		$query = "SELECT contact_id FROM load_base WHERE order_id = $orderId";
		$row = LP_Db::fetchRow($query);
		$contactId = 0;
		$contactName = '';
		if ($row) {
			$contactId = $row['contact_id'];
			$contact = new ContactBase();
			$contact->load($contactId);
			$contactName = $contact->getName();
		}
		$this->setParam('contact_id', $contactId);
		$this->setParam('contactName', $contactName);
	}

	public function getPreOrderGridRecordsAction() {
		// get submitted params
		$type = getParam('type', 'contact');
		$contact_id = intval(getParam('contact_id', 0));
		$carrier_id = intval(getParam('carrier_id', 0));
		$customer_id = intval(getParam('customer_id', 0));

		// get submitted params
		$sortBy = getParam('sort', false);
		$filter = json_decode(getParam('filter', '{}'), true);

		// Setup the filtering and query variables
		$start = intval(request('start', 0));
		$limit = intval(request('limit', 10));

		// build query data
		$fields = array(
			'pre_order_base.pre_order_id',
			'pre_order_base.customer_id',
			'pre_order_to_bill_to.bill_to_id',
			'pre_order_base.broker_id',
			'customer_base.customer_name',
			'customer_base2.customer_name bill_to_name',
			'contact_base.contact_id broker_contact_id',
			'contact_base.first_name broker_first_name',
			'contact_base.last_name broker_last_name',
			'(contact_base.first_name + \' \' + contact_base.last_name) AS broker_name',
			'contact_base2.contact_id ordered_by_id',
			'contact_base2.first_name ordered_by_first_name',
			'contact_base2.last_name ordered_by_last_name',
			'(contact_base2.first_name + \' \' + contact_base2.last_name) AS ordered_by_name'
		);
		$from = array(
			'pre_order_base'
		);
		$join = array(
			'LEFT JOIN pre_order_to_bill_to ON pre_order_to_bill_to.pre_order_id = pre_order_base.pre_order_id',
			'LEFT JOIN customer_base ON customer_base.customer_id = pre_order_base.customer_id',
			'LEFT JOIN customer_base customer_base2 ON customer_base2.customer_id = pre_order_to_bill_to.bill_to_id',
			'LEFT JOIN user_base ON pre_order_base.broker_id = user_base.user_id',
			'LEFT JOIN contact_base ON contact_base.contact_id = user_base.contact_id',
			'LEFT JOIN contact_base contact_base2 ON contact_base2.contact_id = pre_order_base.ordered_by_id',
		);
		$where = array();
		$sort = array(
			'pre_order_id DESC'
		);
		if ($sortBy) {
			$sortArray = json_decode($sortBy, true);
			$numSorters = count($sortArray);
			$sort = array();
			for ($i = 0; $i < $numSorters; $i++) {
				$sort[] = $sortArray[$i]['property'] . ' ' . $sortArray[$i]['direction'];
			}
		}

		// apply filter based on type of order display
		switch ($type) {
			case 'contact':
				$contact = new ContactBase();
				$contact->load($contact_id);
				if ($contact->get('contact_type_id') == ContactTypes::Customer) {
					$where[] = "ordered_by_id = $contact_id";
				}
				else if ($contact->get('contact_type_id') == ContactTypes::AATEmployee) {
					$user = new UserBase();
					$user->load(array(
						'contact_id' => $contact->get('contact_id')
					));
					$where[] = "broker_id = {$user->get('user_id')}";
				}
				break;

			case 'carrier':
				$where[] = "load_base.carrier_id = $carrier_id";
				break;

			case 'customer':
				$where[] = "pre_order_base.customer_id = $customer_id";
				break;
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
						$where[] = "customer_base.customer_name LIKE '$cleanValue%'";
						break;

					case 'ordered_by':
						$where[] = "(contact_base2.first_name LIKE '$cleanValue%' OR contact_base2.last_name LIKE '$cleanValue%')";
						break;

					case 'bill_to':
						$where[] = "customer_base2.customer_name LIKE '$cleanValue%'";
						break;

					case 'owner':
						$where[] = "(contact_base.first_name LIKE '$cleanValue%' OR contact_base.last_name LIKE '$cleanValue%')";
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

		$this->setParam('records', $rows);
	}
	
	public function getCustomerInformationAction() {
		$orderId = intval(getPostParam('order_id', 0));
		if ($orderId) {
			$query = "SELECT
					order_base.customer_id,
					order_base.bill_to_id AS bill_to_location_id,
					order_base.ordered_by_id,
					
					customer_base.customer_name,
					customer_base2.customer_name AS bill_to_customer_name,
					customer_base2.customer_id AS bill_to_customer_id,
					
					location_base.location_name_1 AS bill_to_location_name,
					
					contact_base.contact_id,
					contact_base.first_name,
					contact_base.last_name,
					(contact_base.first_name + ' ' + contact_base.last_name) AS contact_name
				FROM
					order_base
				LEFT JOIN customer_base ON customer_base.customer_id = order_base.customer_id
				
				LEFT JOIN location_base ON location_base.location_id = order_base.bill_to_id
				LEFT JOIN customer_to_location ON customer_to_location.location_id = location_base.location_id
				LEFT JOIN customer_base customer_base2 ON customer_base2.customer_id = customer_to_location.customer_id
				
				LEFT JOIN contact_base ON contact_base.contact_id = order_base.ordered_by_id
				WHERE order_base.order_id = $orderId";
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
		$orderId = intval(request('order_id', 0));
		$orderBase = new OrderBase();
		$orderBase->load($orderId);
		$rows = $orderBase->getOrderDetails();
		$this->setParam('records', $rows);
	}
	
	public function setCarrierAction() {
		$orderId = intval(getParam('order_id', 0));
		$carrierContactId = intval(getParam('carrier_contact_id', 0));
		$equipmentId = intval(getParam('used_equipment_id', 0));
		
		$oldStatusId = 0;
		$order = new OrderBase();
		$order->load($orderId);
		if ($order->get('order_id')) {
			$oldStatusId = $order->get('status_id');
		}
		
		$carrierInfo = $order->getCarrierInfo();
		$carrierId = $carrierInfo['CarrID'];
		if(isset($_REQUEST['carrier_id'])){
			$carrierId = intval(getParam('carrier_id', getParam('cid', 0)));
		}
		
		//Check if this carrier is approved
		if($carrierId){
			$carrierBaseExtended = new CarrierBaseExtended($carrierId);
			if($carrierBaseExtended->get('status_id') != 1){
				$this->addError('The carrier you have selected has not been verified yet, a task has been created to solve this issue. You will be notified when this task has been completed.', 'carrier_id');
				$carrierBaseExtended->checkTasks();
			}
		}
		
		if($this->anyErrors()){
			return;
		}
		
		$loadBase = new LoadBase();
		$loadBase->load(array('order_id' => $orderId));
		$loadBase->create($carrierId, 0, 0, $equipmentId, 0, 0, get_user_id(), $orderId);
		$loadBase->set('contact_id', $carrierContactId);
		if ($oldStatusId == ToolsStatusTypes::OrderAvailable && $carrierId) {
			$order->set('status_id', ToolsStatusTypes::OrderCovered);
			$order->save();
		}
		$loadBase->save();
		$this->addMessage('Carrier information has been saved.');
	}
	
}