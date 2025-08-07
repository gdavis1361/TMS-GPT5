<?php
require_once 'Abstract.php';

////////////////////////////////////////////////////////////
//	Contacts
////////////////////////////////////////////////////////////
/*	-----------------------------
 * 	- lme_contact
 * ------------------------------
 * 	? company_id - only looking for TMS
 * 	x contact_name
 * 	x email
 * 	x fax
 * 	? id
 * 	x name
 * 	? parent_row_id - keys pointing to tables
 * 	? parent_row_type - A,C,D,L,P,S,V (customer, location, payee)
 * 	? payable_contact - contact_type
 * 	x phone
 * 	? sequence - order
 * 	x title
 * 	? main_contact - ignore
 * 	? bill_rec_type - ignore
 */
class Migration_Contacts extends Migration_Abstract{
	public $table = "contact";
	public $tmsTable = "contact_base";
	public $limit = 100;
	public $emailMethodId = false;
	public $phoneMethodId = false;
	public $faxMethodId = false;
	
	public function migrate($page = false, $perPage = false){
		//Get the connection
		$connection = Migration::getInstance()->getConnection();
		
		LP_Timer::start('Getting rows to migrate');
		
		//Get the rows to migrate
		$query = "SELECT * FROM {$this->table} WHERE parent_row_type = 'C' OR parent_row_type = 'L' OR parent_row_type = 'P'";
		if($page && $perPage){
			$query = LP_Util::buildQueryPage($query, '', $page, $perPage);
		}
		else if($this->limit){
			$query = "SELECT TOP $this->limit * FROM {$this->table} WHERE parent_row_type = 'C' OR parent_row_type = 'L' OR parent_row_type = 'P'";
		}
		
		$result = mssql_query($query, $connection);
		$numRows = mssql_num_rows($result);
		LP_Timer::stop();
		
		if (!$numRows) {
			return $numRows;
		}
		
		//Add a message
		Migration::getInstance()->addMessage(
			"------------------------------------------------------------<br />
			 Starting Contacts Migration<br />
			------------------------------------------------------------<br />"
		);
		
		//Migrate all rows to tms database
		while($row = mssql_fetch_assoc($result)){
			LP_Timer::start('Process ' . $row['id']);
			$this->process($row);
			LP_Timer::stop();
		}
		
		return $numRows;
	}
	
	public function process($row){
		//Trim all the data
		foreach ($row as $key => $value){
			$row[$key] = trim($value);
		}
		
		LP_Timer::start('Check lme to tms');
		$lmeToTms = new LmeToTms();
		if($lmeToTms->exists($this->table, $row['id'], $this->tmsTable)){
			//Add a message
			Migration::getInstance()->addMessage("Contact already existed in {$this->tmsTable} - {$row['id']}");
			LP_Timer::stop();
			return false;
		}
		LP_Timer::stop();
		
		/**********************************************************
		 * Process the contact base
		 *********************************************************/
		LP_Timer::start('Processing Contact Base - ' . $row['id']);
		$contactBase = $this->processContactBase($row);
		LP_Timer::stop();
		
		/**********************************************************
		 * Process the parent type of this row
		 *********************************************************/
		LP_Timer::start('Processing Contact Parent - ' . $row['id']);
		$this->processParent($contactBase, $row);
		LP_Timer::stop();
		
		/**********************************************************
		 * Convert the contact methods
		 *********************************************************/
		LP_Timer::start('Processing Contact Methods - ' . $row['id']);
		$this->processContactMethods($contactBase, $row);
		LP_Timer::stop();
		
	}
	
	/**
	 *
	 * @param type $id
	 * @return ContactBase 
	 */
	public function getMigratedRow($id) {
		//Query to see if we can find this user in the lme database
		$base = new ContactBase();
		$row = array();
		$query = "SELECT * FROM $this->table WHERE id = '".  LP_Db::escape($id)."'";
		$result = mssql_query($query, Migration::getInstance()->getConnection());
		if(!mssql_num_rows($result)){
			Migration::getInstance()->addMessage("Contact did not exist in the lme database - $id");
			return $base;
		}
		else{
			$row = mssql_fetch_assoc($result);
			$this->process($row);
		}
		
		//Get the id of the tms user
		$lmeToTms = new LmeToTms();
		if($lmeToTms->exists($this->table, $row['id'], $this->tmsTable)){
			$row = $lmeToTms->find(array(
				"lme_table" => $this->table,
				"lme_key" => $row['id'],
				"tms_table" => $this->tmsTable
			));
			
			$base->load($row->tms_key);
		}
		
		return $base;
	}
	
	public function processContactBase($row){
		//Create the contact base object
		$contactBase = new ContactBase();
		
		/**********************************************************
		 * Lets do the 1-1 conversions first - contact_base
		 *********************************************************/
		//name => first_name, last_name, middle_name, preferred_name
		//title => title
		$name = explode_name($row['name']);
		LP_Timer::start('Create contact base row');
		//Create the contact_base row
		$contactTypeId = ContactTypes::Customer;
		switch (strtolower($row['parent_row_type'])){
			case "c":
				$contactTypeId = ContactTypes::Customer;
			break;
		
			case "p":
				$contactTypeId = ContactTypes::Carrier;
			break;
		}
		
		$contactBase->create(
			$contactTypeId,
			$name['first_name'],
			$name['last_name'],
			$name['middle_name'],
			$name['preferred_name'],
			$row['title'],
			0
		);
		LP_Timer::stop();
		
		//Insert a migration row
		LP_Timer::start('Create migration row');
		$lmeToTms = new LmeToTms();
		$lmeToTms->create($this->table, $row['id'], $this->tmsTable, $contactBase->get('contact_id'));
		LP_Timer::stop();
		
		//Add a message
		Migration::getInstance()->addMessage("Added row to {$this->tmsTable} - {$row['id']}");
		
		//Return the contact base
		return $contactBase;
	}
	
	public function getEmailMethodId(){
		if($this->emailMethodId){
			return $this->emailMethodId;
		}
		//Email Method
		$contactMethodTypes = new ContactMethodTypes();
		$contactMethodTypes->load(array(
			"method_type" => "Email"
		));
		
		//If this type doesnt exist create it
		if(!$contactMethodTypes->get('method_id')){
			
			//Try to get the method group Email
			$contactMethodGroup = new ToolsMethodGroups();
			$contactMethodGroup->load(array(
				"group_name" => "Email"
			));
			
			//If there is no group for email make one
			if(!$contactMethodGroup->get('groups_id')){
				$contactMethodGroup->create("Email");
			}
			
			//Create a method type
			$contactMethodTypes->create(
				"Email",
				$contactMethodGroup->get("groups_id"),
				0
			);
		}
		
		$this->emailMethodId = $contactMethodTypes->get('method_id');
		return $this->emailMethodId;
	}
	
	public function getPhoneMethodId(){
		if($this->phoneMethodId){
			return $this->phoneMethodId;
		}
		//Phone Method
		$contactMethodTypes = new ContactMethodTypes();
		$contactMethodTypes->load(array(
			"method_type" => "Phone"
		));
		
		//If this type doesnt exist create it
		if(!$contactMethodTypes->get('method_id')){
			
			//Try to get the method group Phone
			$contactMethodGroup = new ToolsMethodGroups();
			$contactMethodGroup->load(array(
				"group_name" => "Phone"
			));
			
			//If there is no group for phone make one
			if(!$contactMethodGroup->get('groups_id')){
				$contactMethodGroup->create("Phone");
			}
			
			//Create a method type
			$contactMethodTypes->create(
				"Phone",
				$contactMethodGroup->get("groups_id"),
				0
			);
		}
		
		$this->phoneMethodId = $contactMethodTypes->get('method_id');
		return $this->phoneMethodId;
	}
	
	public function getFaxMethodId(){
		if($this->faxMethodId){
			return $this->faxMethodId;
		}
		//Fax Method
		$contactMethodTypes = new ContactMethodTypes();
		$contactMethodTypes->load(array(
			"method_type" => "Fax"
		));
		
		//If this type doesnt exist create it
		if(!$contactMethodTypes->get('method_id')){
			
			//Create a method type
			$contactMethodTypes->create(
				"Fax",
				0,
				0
			);
		}
		
		$this->faxMethodId = $contactMethodTypes->get('method_id');
		return $this->faxMethodId;
	}
	
	public function processContactMethods($contactBase, $row){
		/**********************************************************
		 * Convert the email address - contact_methods
		 *********************************************************/
		
		//Create the email contact method for this contact
		$emailContactMethod = new ContactMethods();
		$emailContactMethod->create(
			$contactBase->get('contact_id'),
			$this->getEmailMethodId(),
			$row['email'],
			'',
			0
		);
		
		//Add a message
		Migration::getInstance()->addMessage("Added row to contact_method for email - {$row['id']}");
		
		/**********************************************************
		 * Convert the phone number - contact_methods
		 *********************************************************/
		//Select from contact_method_types where method_type = Home Phone / Work phone
		//phone => contact_methods where contact_value_1 = phone and method_type_id = phone type
		
		
		//Create the phone contact method for this contact
		$phoneContactMethod = new ContactMethods();
		$phoneContactMethod->create(
			$contactBase->get('contact_id'),
			$this->getPhoneMethodId(),
			$row['phone'],
			'',
			0
		);
		
		//Add a message
		Migration::getInstance()->addMessage("Added row to contact_method for phone - {$row['id']}");
		
		/**********************************************************
		 * Convert the fax number - contact_methods
		 *********************************************************/
		//Select from contact_method_types where method_type = Fax
		//fax => contact_methods where contact_value_1 = fax and method_type_id = fax type
		
		
		//Create the fax contact method for this contact
		$faxContactMethod = new ContactMethods();
		$faxContactMethod->create(
			$contactBase->get('contact_id'),
			$this->getFaxMethodId(),
			$row['fax'],
			'',
			0
		);
		
		//Add a message
		Migration::getInstance()->addMessage("Added row to contact_method for fax - {$row['id']}");
	}
	
	public function processParent($contactBase, $row){
		//Handle the contact type, parent_row_id and parent_row_type		
		switch (strtolower($row['parent_row_type'])) {
			case "c":
				LP_Timer::start('Processing Contact Parent Customer');
				$result = $this->processParentCustomer($contactBase, $row);
				LP_Timer::stop();
				return $result;
			break;
			
			case "l":
				LP_Timer::start('Processing Contact Parent Location');
				$result = $this->processParentLocation($contactBase, $row);
				LP_Timer::stop();
				return $result;
			break;
			
			case "p":
				LP_Timer::start('Processing Contact Parent Payee');
				$result = $this->processParentPayee($contactBase, $row);
				LP_Timer::stop();
				return $result;
			break;
			
			default:
			break;
		}
	}
	
	public function processParentCustomer($contactBase, $row){
		//When a customer gets created, it is associated with a location,
		//contacts can then be associated with locations
		//so we need to get the location of the customer and associate this contact with that location
		//To find the location for this we check the migration table for ->
		//lme_table => customer, lme_key => customerid
		//First we need to make sure the customer has been created
		LP_Timer::start('Process Parent Customer Get Migrated Row');
		require_once 'Customers.php';
		$connection = Migration::getInstance()->getConnection();
		$customer = new Migration_Customers();
		$customerBase = $customer->getMigratedRow($row['parent_row_id']);
		if(!$customerBase->get('customer_id')){
			LP_Timer::stop();
			return false;
		}
		$locationBase = $customer->getLocationBase($row['parent_row_id']);
		LP_Timer::stop();
		
		LP_Timer::start('Process Parent Customer location to contact');
		//Create the location_to_contact link
		$locationToContact = new LocationToContact();
		$locationToContact->create(
			$locationBase->get('location_id'),
			$contactBase->get('contact_id'),
			1,
			0
		);
		LP_Timer::stop();
		
		//Create contact customer details
		$contactCustomerDetail = new ContactCustomerDetail();
		$contactCustomerDetail->create(
			$contactBase->get('contact_id'),
			9,
			0,
			14,
			14,
			14,
			0
		);
		
		//Create a migration row
		$lmeToTms = new LmeToTms();
		$lmeToTms->create($this->table, $row['id'], 'location_to_contact', $locationToContact->get('location_id'));
		
		
	}
	
	public function processParentLocation($contactBase, $row){
		require_once 'Locations.php';
		$connection = Migration::getInstance()->getConnection();
		$location = new Migration_Locations();
		$locationBase = $location->getMigratedRow($row['parent_row_id']);
		if(!$locationBase->get('location_id')){
			return false;
		}
		
		//Create a customer
		$customerBase = new CustomerBase();
		$customerBase->load(array(
			'customer_name' => $locationBase->get('location_name_1')
		));
		if(!$customerBase->get('customer_id')){
			$customerBase->create(array(
				"customer_name" => $locationBase->get('location_name_1'),
				"industry_id" => 0,
				"managed_by_id" => 0,
				"status_id" => 1,
				"created_by_id" => 0
			));	
		}
		
		//Create contact customer details
		$contactCustomerDetail = new ContactCustomerDetail();
		$contactCustomerDetail->create(
			$contactBase->get('contact_id'),
			9,
			0,
			14,
			14,
			14,
			0
		);

		//Create the customer to location
		$customerToLocation = new CustomerToLocation();
		@$customerToLocation->create(array(
			"customer_id" => $customerBase->get('customer_id'),
			"location_id" => $locationBase->get('location_id'),
			"created_by_id" => 0
		));

		//Create the contact to location link
		$locationToContact = new LocationToContact();
		@$locationToContact->create($locationBase->get('location_id'), $contactBase->get('contact_id'), 1, 0);
		
		//Create a migration row
		$lmeToTms = new LmeToTms();
		$lmeToTms->create($this->table, $row['id'], 'location_to_contact', $locationToContact->get('location_id'));
		
		//get the location row
		$locationLmeRow = $location->getLmeRow($row['parent_row_id']);
		
		//Create the contact comments
		if(strlen($locationLmeRow['comments'])){
			$commentTypeId = 2;
			$contactComments = new ContactComments();
			$contactComments->create(
				$contactBase->get('contact_id'),
				$locationLmeRow['comments'],
				$commentTypeId,
				0
			);
		}
		
		
		//Try to assign a user to this location
		if(strlen($locationLmeRow['assigned_to'])){
			require_once 'Users.php';
			$userMigration = new Migration_Users();
			$userBase = $userMigration->getMigratedRow($locationLmeRow['assigned_to']);
			if($userBase->get('user_id')){
				//Associate this contact to the user
				$contactOwner = new ContactOwners();
				$contactOwner->load(array(
					'owner_id' => $userBase->get('user_id'),
					'contact_id' => $contactBase->get('contact_id')
				));
				if(!$contactOwner->get('contact_owners_id')){
					$contactOwner->create(
						$contactBase->get('contact_id'),
						$userBase->get('user_id'),
						date('Y-m-d 00:00:00'),
						1,
						$userBase->get('user_id')
					);
				}
			}
		}
	}
	
	public function processParentPayee($contactBase, $row){
		require_once 'Payees.php';
		
		$connection = Migration::getInstance()->getConnection();
		$payee = new Migration_Payees();
		$query = "SELECT * FROM $payee->table WHERE id = '".LP_Db::escape($row['parent_row_id'])."'";
		$result = mssql_query($query, $connection);
		if(!mssql_num_rows($result)){
			//Add Message
			Migration::getInstance()->addMessage("?Warning payee/carrier row not found - {$row['id']}");
			return false;	
		}
		$payeeRow = mssql_fetch_assoc($result);
		
		//Ensure this location has been processed
		$payee->process($payeeRow);
		
		//Get the location_id
		$lmeToTms = new LmeToTms();
		
		//Make sure this migration row exists
		if(!$lmeToTms->exists($payee->table, $payeeRow['id'], 'location_base')){
			//Add Error message
			Migration::getInstance()->addMessage("!Error no migration row exists - {$row['id']}");
			return false;
		}
		
		$migrationRow = $lmeToTms->find(array(
			"lme_table" => $payee->table,
			"lme_key" => $payeeRow['id'],
			"tms_table" => "location_base"
		));
		
		if($migrationRow === false){
			//Add Error message
			Migration::getInstance()->addMessage("!Error parent contact migration row not found - {$row['id']}");
			return false;
		}
		
		$locationId = $migrationRow->tms_key;
		
		//Get the location
		$locationBase = new LocationBase();
		$locationBase->lookupZip = false;
		$locationBase->load($locationId);
		
		if(!$locationBase->get('location_id')){
			return false;
		}
		
		//See if this migration has already been done
		if($lmeToTms->exists($this->table, $row['id'], "location_to_contact")){
			//Add message
			Migration::getInstance()->addMessage("?Warning location_to_contact migration has already been done - {$row['id']}");
			return false;
		}
		
		//Create the location_to_contact link
		$locationToContact = new LocationToContact();
		$locationToContact->create(
			$locationBase->get('location_id'),
			$contactBase->get('contact_id'),
			1,
			0
		);
		
		//Create a migration row
		$lmeToTms->create($this->table, $row['id'], 'location_to_contact', $locationToContact->get('location_id'));
	}
}