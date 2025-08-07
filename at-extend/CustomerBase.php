<?php

/**
 * Customer Base
 *
 * @author Steve Keylon
 */
class CustomerBase extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = 'customer_base';
	public $fireEvents = true;

	public function create($aVars) {

		$sName = isset($aVars['customer_name']) ? $aVars['customer_name'] : '';
		$nIndustryId = isset($aVars['industry_id']) ? $aVars['industry_id'] : 0;
		$nManagedById = isset($aVars['managed_by_id']) ? $aVars['managed_by_id'] : 0;
		$nCreatedById = isset($aVars['created_by_id']) ? $aVars['created_by_id'] : get_user_id();
		$statusId = isset($aVars['status_id']) ? $aVars['status_id'] : 1;


		$key = __CLASS__ . '::' . __METHOD__;
		// Validate Data
		if (!is_string($sName) || !strlen($sName)) {
			$this->addError('Please enter a customer name', 'customer_name');
//			add_error('Customer Name requires a string', $key);
			return false;
		}
		if (!is_numeric($nIndustryId)) {
			add_error('Industry ID requires a number', $key);
			return false;
		}
		if (!is_numeric($nManagedById)) {
			add_error('Managed By Id requires a number', $key);
			return false;
		}
		if (!is_numeric($nCreatedById)) {
			add_error('CREATED BY ID requires a number', $key);
			return false;
		}

		// Save Data
		$this->set_customer_name($sName);
		$this->set_industry_id($nIndustryId);
		$this->set_managed_by_id($nManagedById);
		$this->set_created_by_id($nCreatedById);
		$this->set_active(1);
		$this->set_status_id($statusId);
		
		// see if we already have this customer by name
		// assume that $sName has already been sanitized for sql injections
		/*
		  $sQuery = "SELECT * FROM customer_base WHERE customer_name LIKE '$sName%' AND industry_id = $nIndustryId";
		  $res = $this->query( $sQuery );
		  if( $row = $this->db->fetch_object($res) ){ // this customer name already exists, load that instead of saving
		  $this->load( $row['customer_id'] );
		  $s = true;
		  }else
		  $s = $this->save();
		 */
		$success = $this->save();
		
		if ($success && isset($aVars['location_id'])) {
			//echo "<br>Customer Saved. Adding location now!";
			if (!empty($aVars['location_id'])) {
				$this->add_location($aVars['location_id']);
			}
		}
		
		$this->checkTasks();
		
		// Report
		return $success;
	}

	public function make_list($sName, $sClass='', $nDefault = 0) {
		$this->clear_filters();
		$o = $this->list();
		$sHtml = '<select name="' . $sName . '" class="' . $sClass . '">
					<option value=""> -- </option>';
		foreach ($o->rows as $row) {
			$sHtml .= "\n<option value=\"" . $row->customer_id . '" ' . ( ($nDefault == $row->customer_id) ? ' selected="selected"' : '' ) . '>' . $row->customer_name . '</option>';
		}
		$sHtml .= '</select>';
		return $sHtml;
	}

	public function get_industry_name() {
		$o = new IndustryBase();
		if ($o->load($this->get_industry_id())) {
			return $o->get_industry_name();
		}
		return false;
	}

	public function get_associated_contacts($nCustomerId = '') {
		$aResult = array();
		if (empty($nCustomerId))
			$nCustomerId = $this->get('customer_id');
		if (empty($nCustomerId))
			return $aResult;

		$sQuery = "SELECT contact.contact_id, contact.first_name, contact.last_name,
						location.location_id, location.location_abbr, location.location_name_1, 
						location.location_name_2, location.address_1, location.address_2, 
						location.address_3, location.zip
					
					FROM contact_base contact
					
					INNER JOIN customer_to_location c2l
					ON c2l.customer_id = $nCustomerId
					
					INNER JOIN location_to_contact l2c
					ON c2l.location_id = l2c.location_id
					
					INNER JOIN location_base location
					ON location.location_id = l2c.location_id
					
					WHERE contact.contact_id = l2c.contact_id";
		$res = $this->query($sQuery);
		while ($row = $this->db->fetch_object($res))
			$aResult[] = $row;
		return $aResult;
	}

	public function get_associated_locations($nCustomerId = 0) {
		$aResult = array();
		if (empty($nCustomerId))
			$nCustomerId = $this->get('customer_id');
		if (empty($nCustomerId))
			return $aResult;

		$this->connect();
		$s = "
			SELECT 
				location_base.*, geo.City, geo.State
			FROM 
				tms.dbo.customer_to_location rel
				LEFT JOIN tms.dbo.location_base ON location_base.location_id = rel.location_id
				LEFT JOIN (SELECT City, State, Zip, Seq FROM ContractManager.dbo.ZipsPostalCodesUS) geo ON geo.Zip = location_base.zip
			WHERE
				rel.customer_id = " . $this->db->escape($nCustomerId) . "
				AND geo.Seq = location_base.seq";
		$res = $this->query($s);
		while ($row = $this->db->fetch_object($res))
			$aResult[] = $row;
		return $aResult;
	}

	public function add_location($locationId) {
		$locationId = intval($locationId);
		$customerId = $this->get('customer_id');
		$data = array(
			'customer_id' => $customerId,
			'location_id' => $locationId
		);
		
		$customerToLocation = new CustomerToLocation();
		$customerToLocation->load($data);
		$success = $customerToLocation->create($data);
		
		return $success;
	}

	public function get_required_documents() {
		$nCustomerId = $this->get('customer_id');
		$oDocRequired = new CustomerDocumentRequirements();
		$oDocRequired->where('customer_id', '=', $nCustomerId);
		$aDocs = $oDocRequired->list()->rows;
		foreach ($aDocs as $k => $v) {
			$aDocs[$k] = $v->get();
		}

		return $aDocs;
	}

	public function getDocumentsRequired() {
		$query = "SELECT document_type_id, quantity FROM customer_document_requirements WHERE customer_id = {$this->get('customer_id')}";
		return LP_Db::fetchAll($query);
	}

	public function updateDocumentsRequired($documentsRequired) {
		$customerId = $this->get('customer_id');

		// delete existing requirements
		$query = "DELETE FROM customer_document_requirements WHERE customer_id = $customerId";
		LP_Db::execute($query);

		// insert submitted requirements
		$myUserId = get_user_id();
		$typesInserted = array();
		for ($i = 0; $i < count($documentsRequired); $i++) {
			if (!in_array($documentsRequired[$i]['document_type_id'], $typesInserted)) {
				$document = new CustomerDocumentRequirements();
				$document->create($customerId, $documentsRequired[$i]['document_type_id'], $documentsRequired[$i]['quantity'], $myUserId);
				$typesInserted[] = $documentsRequired[$i]['document_type_id'];
			}
		}
	}

	public function get_next_billing_id() {
		$this->connect();

		$nTypeId = 12;
		$s = "
		SELECT TOP 1
			*
		FROM
			user_base 
			LEFT OUTER JOIN (SELECT created_at, employee_id FROM task_base WHERE task_type_id = '" . $nTypeId . "') as task ON task.employee_id = user_base.user_id
			LEFT OUTER JOIN (SELECT COUNT(task_id) total, employee_id FROM task_base WHERE task_type_id = '" . $nTypeId . "' AND completed_at = null GROUP BY employee_id) c ON c.employee_id = user_base.user_id
		WHERE 
			user_base.role_id = '2'
		ORDER BY
			task.created_at ASC";
		$res = $this->query($s);
		$a = $this->db->fetch_array($res);
		//pre($a);
		return $a['user_id'];
	}
	
	public function getContacts($statusId = 0) {
		$rows = array();
		if ($this->get('customer_id')) {
			$extraSql = '';
			if ($statusId) {
				$extraSql = " AND contact_customer_detail.status_id = $statusId ";
			}
			$query = "SELECT
					contact_base.*,
					(contact_base.first_name + ' ' + contact_base.last_name) AS name,
					(contact_base2.first_name + ' ' + contact_base2.last_name) AS owner_name
				FROM contact_base
				LEFT JOIN location_to_contact ON location_to_contact.contact_id = contact_base.contact_id
				LEFT JOIN customer_to_location ON customer_to_location.location_id = location_to_contact.location_id
				LEFT JOIN contact_customer_detail ON contact_customer_detail.contact_id = contact_base.contact_id
				
				LEFT JOIN contact_owners ON contact_owners.contact_id = contact_base.contact_id
				LEFT JOIN user_base ON user_base.user_id = contact_owners.owner_id
				LEFT JOIN contact_base AS contact_base2 ON contact_base2.contact_id = user_base.contact_id
				
				WHERE customer_to_location.customer_id = {$this->get('customer_id')}
				$extraSql
				ORDER BY first_name, last_name";

			$rows = LP_Db::fetchAll($query);
		}
		return $rows;
	}
	
	public function markDuplicate($nCustomerId, $aDuplicateIds){
		if (!is_array($aDuplicateIds)) $aDuplicateIds = array( intval($aDuplicateIds) );
		foreach($aDuplicateIds as $k => $v){
			$new = intval($v);
			if (empty($new)) unset($aDuplicateIds[$k]);
			else $aDuplicateIds[$k] = $new;
		}
		
		$o = new CustomerDuplicates();
		foreach($aDuplicateIds as $nOldId){
			$o->unload();
			$this->load($nOldId);
			$this->set('active', 0);
			$this->save();
			
			@$o->create(array('customer_id'=> $nCustomerId, 'duplicate_id' => $nOldId));
		}
		
		
		$o = new CustomertoBillTo();
		$o->where('customer_id', '=', $aDuplicateIds);
		foreach($o->list()->rows as $row) {
			$o->unload();
			@$o->create( $nCustomerId, $row['accounting_id'], get_user_id() );
		}
		$o = new CustomerToLocation();
		$o->where('customer_id', '=', $aDuplicateIds);
		foreach($o->list()->rows as $row) {
			$o->unload();
			$aData = $row->get();
			$aData['customer_id'] = $nCustomerId;
			@$o->create( $aData );
		}
	}
	
	public static function getDuplicates($nCustomerId){
		$s = "SELECT base.customer_id, base.customer_name 
			FROM customer_duplicates
			JOIN customer_base base ON base.customer_id = customer_duplicates.duplicate_id
			WHERE customer_duplicates.customer_id = '". intval($nCustomerId) . "'";
		
		return LP_Db::fetchAll($s);
	}
	
	public function toXML($docType){
		if ( !$this->is_loaded() ) return false;
		
		$sXML = '
				<customer>
					<Addr1>123 Test Street</Addr1>
					<Addr2></Addr2>
					<Attention>DO NOT USE</Attention>
					<BillToAddr1>123 Test Street</BillToAddr1>
					<BillToAddr2></BillToAddr2>
					<BillToAttention>DO NOT USE</BillToAttention>
					<BillToCity>Chattanooga</BillToCity>
					<BillToCountry></BillToCountry>
					<BillToFax></BillToFax>
					<BillToName></BillToName>
					<BillToPhone></BillToPhone>
					<BillToSalutation></BillToSalutation>
					<BillToState></BillToState>
					<BillToZip></BillToZip>
					<City></City>
					<CustomerClass></CustomerClass>
					<Country></Country>
					<CustomerID></CustomerID>
					<Email></Email>
					<Fax></Fax>
					<Name></Name>
					<Phone></Phone>
					<Salutation></Salutation>
					<State></State>
					<Status></Status>
					<Terms></Terms>
					<Zip></Zip>
					<tstamp></tstamp>
				</customer>';
		return $sXML;
	}
	
	public function getBillToRecord() {
		$query = "SELECT
					customer_base.customer_name bill_to_customer_name,
					customer_base.customer_id bill_to_customer_id,
					location_base.location_id AS bill_to_location_id,
					location_base.location_name_1 AS bill_to_location_name
				FROM
					customer_base
				LEFT JOIN customer_to_location ON customer_to_location.customer_id = customer_base.customer_id
				LEFT JOIN location_base ON location_base.location_id = customer_to_location.location_id
				LEFT JOIN location_types ON location_types.location_type_id = location_base.type
				WHERE customer_base.customer_id = {$this->get('customer_id')}
				AND location_types.name IN ('Billing', 'Shipping/Billing')";
		$row = LP_Db::fetchRow($query);
		return $row;
	}
	
	public function checkTasks() {
		$this->checkBillToTask();
	}
	
	public function checkBillToTask() {
		$myUserId = get_user_id();
		$billToRecord = $this->getBillToRecord();
		$creditAndCollectionsId = UserRoles::CreditAndCollections;
		
		$taskTypes = new TaskTypes();
		$taskTypes->load(array(
			'task_name' => 'Assign Customer Bill To'
		));
		$billToTaskTypeId = $taskTypes->get('task_type_id');
		$billToTaskDetails = array(
			'customer_id' => $this->get('customer_id')
		);

		// find any existing task rows for this task
		$billToTaskRow = TaskBase::findTask($creditAndCollectionsId, $billToTaskTypeId, $billToTaskDetails, 'role_id');
		
		$billToRecord = $this->getBillToRecord();
		if ($billToRecord) {
			if ($billToTaskRow) {
				$task = new TaskBase();
				$task->load($billToTaskRow['task_id']);
				$task->complete();
			}
		}
		else {
			if (!$billToTaskRow) {
				$task = new TaskBase();
				$task->create($billToTaskTypeId, 0, time(), $billToTaskDetails, $myUserId, $creditAndCollectionsId);
			}
		}
		
	}

}