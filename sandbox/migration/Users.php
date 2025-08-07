<?php
require_once 'Abstract.php';
////////////////////////////////////////////////////////////
//	Users
////////////////////////////////////////////////////////////
/*	-----------------------------
 * 	- lme_users
 * ------------------------------
 * 	? company_id
 * 	? ap_division_id
 * 	? available
 * 	? confirm_record
 * 	? date_format
 * 	? driver_managers
 * 	? drivers_wo_manager
 * 	x email_address
 * 	? extension
 * 	x fax
 * 	? id
 * 	x name
 * 	x phone
 * 	? planning
 * 	? receive_alerts
 * 	? time_format
 * 	? toolbar_setting
 * 	x pword
 * 	? type_agents
 * 	? brokerage_planning
 * 	? type_owner_oper
 * 	? type_company_drs
 * 	? operations_user_id
 * 	? revenue_code_id
 * 	? type_carrier
 * 	? web_agent
 * 	? agent
 */
class Migration_Users extends Migration_Abstract {
	public $table = "users";
	public $limit = 25;
	public $userBase = false;
	public $contactBase = false;
	public $emailMethodId = false;
	public $phoneMethodId = false;
	public $faxMethodId = false;
	
	public function migrate($page = false, $perPage = false){
		//Get the connection
		$connection = Migration::getInstance()->getConnection();
		
		//Get the rows to migrate
		$query = "SELECT * FROM {$this->table}";
		
		if($page && $perPage){
			$query = LP_Util::buildQueryPage($query, '', $page, $perPage);
		}
		else if($this->limit){
			$query = "SELECT TOP $this->limit * FROM {$this->table}";
		}
		
		$result = mssql_query($query, $connection);
		$numRows = mssql_num_rows($result);
		if (!$numRows) {
			return $numRows;
		}
		
		//Add a message
		Migration::getInstance()->addMessage(
			"------------------------------------------------------------<br />
			 Starting Users Migration<br />
			------------------------------------------------------------<br />"
		);
		
		//Migrate all rows to tms database
		while($row = mssql_fetch_assoc($result)){
			$this->process($row);
		}
		
		return $numRows;
	}
	
	public function process($row){
		
		//Make sure this migration has not already been done
		$lmeToTms = new LmeToTms();
		if($lmeToTms->exists($this->table, $row['id'], "user_base")){
			//Add Message
			Migration::getInstance()->addMessage("User already existed in user_base - {$row['id']}");
			return false;
		}
		
		/**********************************************************
		 * We will need to make a contact first,
		 * before we can make a user - contact_base
		 *********************************************************/
		$contactBase = $this->processContactBase($row);
		
		/**********************************************************
		 * Create the user from the contact - user_base
		 *********************************************************/
		$this->processUserBase($contactBase, $row);
	}
	
	/**
	 *
	 * @param type $id 
	 * @return UserBase
	 */
	public function getMigratedRow($id) {
		//Query to see if we can find this user in the lme database
		$this->userBase = false;
		$this->contactBase = false;
		$base = new UserBase();
		$row = array();
		$query = "SELECT * FROM $this->table WHERE id = '".LP_Db::escape($id)."'";
		$result = mssql_query($query, Migration::getInstance()->getConnection());
		if(!mssql_num_rows($result)){
			Migration::getInstance()->addMessage("User did not exist in the lme database - $id");
			return $base;
		}
		else{
			$row = mssql_fetch_assoc($result);
			$this->process($row);
		}
		
		//Get the id of the tms user
		if(!$this->userBase){
			$lmeToTms = new LmeToTms();
			$mRow = $lmeToTms->find(array(
				"lme_table" => $this->table,
				"lme_key" => $id,
				"tms_table" => "user_base"
			));
			if($mRow){
				$base->load($mRow->tms_key);
				$this->userBase = $base;
			}
		}
		
		return $base;
	}
	
	public function processContactBase($row){
		//Check to see if a contact exists with this name
		require_once 'Contacts.php';
		
		$lmeToTms = new LmeToTms();
		$contact = new Migration_Contacts();
		$contactBase = new ContactBase();
		$connection = Migration::getInstance()->getConnection();
		$query = "SELECT TOP 1 * FROM $contact->table WHERE name = '".LP_Db::escape($row['name'])."'";
		$result = mssql_query($query, $connection);
		if(mssql_num_rows($result)){
			$contactRow = mssql_fetch_assoc($result);
			
			//Make sure this contact has already been processed
			$contact->process($contactRow);
			
			//Find the key for the contact_base
			$migrationRow = $lmeToTms->find(array(
				"lme_table" => $contact->table,
				"lme_key" => $contactRow['id'],
				"tms_table" => "contact_base"
			));
			
			if($migrationRow === false){
				//Add message
				Migration::getInstance()->addMessage("!Error migration row not found in contact_base - {$contactRow['id']}");
			}
			else{
				$contactBaseId = $migrationRow->tms_key;
				$contactBase->load($contactBaseId);
				return $contactBase;
			}
		}
		
		//Check if this contact already esists, if it does return it
		if($lmeToTms->exists($this->table, $row['id'], "contact_base")){
			$migrationRow = $lmeToTms->find(array(
				"lme_table" => $this->table,
				"lme_key" => $row['id'],
				"tms_table" => "contact_base"
			));
			
			if($migrationRow === false){
				//Add Error message
				Migration::getInstance()->addMessage("!Error migration row contact_base not found - {$row['id']}");
				return false;
			}
			
			$contactBase->load($migrationRow->tms_key);
			
			return $contactBase;
		}
	
		$name = explode_name($row['name']);
		
		//Create the contact_base row
		$contactBase->create(
			ContactTypes::AATEmployee,
			$name['first_name'],
			$name['last_name'],
			$name['middle_name'],
			$name['preferred_name'],
			'',
			0
		);
		
		//Create the migration row
		$lmeToTms = new LmeToTms();
		$lmeToTms->create($this->table, $row['id'], "contact_base", $contactBase->get('contact_id'));
		
		//Create contact methods
		$this->createContactMethods($contactBase, $row);
		
		//Return the contactBase
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
	
	public function createContactMethods($contactBase, $row){
		
		$lmeToTms = new LmeToTms();
		/**********************************************************
		 * Convert the email_address - contact_methods
		 *********************************************************/
		//Select from contact_method_types where method_type = Email
		//email_address => contact_methods where contact_value_1 = email_address and method_type_id = email method type
		
		//Create the email contact method for this contact
		$emailContactMethod = new ContactMethods();
		$emailContactMethod->create(
			$contactBase->get('contact_id'),
			$this->getEmailMethodId(),
			$row['email_address'],
			'',
			0
		);
		
		//Add Message
		Migration::getInstance()->addMessage("Added row to contact_method for email - {$row['id']}");
		
		/**********************************************************
		 * Convert the phone - contact_methods
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
		
		Migration::getInstance()->addMessage("Added row to contact_method for phone - {$row['id']}");
			
		/**********************************************************
		 * Convert the fax - contact_methods
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
		
		Migration::getInstance()->addMessage("Added row to contact_method for fax - {$row['id']}");
	}
	
	public function processUserBase($contactBase, $row){
		$userBase = new UserBase();
		$userBase->create(
			$contactBase->get('contact_id'),
			3,	//TODO: Configure roles
			trim($row['id']),	//For now password is just the username
			trim($row['id']),
			0
		);
		
		//Create the migration row
		$lmeToTms = new LmeToTms();
		$lmeToTms->create($this->table, $row['id'], "user_base", $userBase->get('user_id'));
		
		//Add Message
		Migration::getInstance()->addMessage("Added row to user_base - {$row['id']}");
	}
}