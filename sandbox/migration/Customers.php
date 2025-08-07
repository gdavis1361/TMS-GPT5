<?php
require_once 'Abstract.php';
////////////////////////////////////////////////////////////
//	Customer
////////////////////////////////////////////////////////////
/*	-----------------------------
 * 	- lme_customer
 * ------------------------------
 * 	? company_id
 * 	? add_finance_charge - skip
 * 	x address_1
 * 	x address_2
 * 	? auto_rate - skip
 * 	? average_bill - skip
 * 	? average_bill_c ( currency)
 * 	? average_bill_d
 * 	? average_bill_n
 * 	? average_bill_r
 * 	? average_pay_days
 * 	? balance
 * 	? balance_c
 * 	? balance_d
 * 	? balance_n
 * 	? balance_r
 * 	? bill_due_days 
 * 	? bill_format_flag
 * 	? bill_template
 * 	? billed_loads
 * 	? bridge_id
 * 	? business_hours
 * 	? category - not implemented yet but will have
 * 	? cert_of_ins_date
 * 	x city
 * 	? city_id
 * 	? collections_id
 * 	? collections_ok
 * 	? credit_application
 * 	? credit_check_date
 * 	? credit_limit
 * 	? credit_limit_c
 * 	? credit_limit_n
 * 	? credit_limit_r
 * 	? credit_status
 * 	? credit_warning_pct
 *  ? currency_type
 *  ? entered_date
 *  ? high_balance
 *  ? high_balance_c
 *  ? high_balance_d
 *  ? high_balance_n
 *  ? high_balance_r
 *  ? id
 *  ? is_active
 *  ? last_bill_date
 *  ? last_pay_date
 *  ? last_ship_date
 *  x name
 *  ? paid_loads
 *  ? pay_days_date
 *  ? pay_days_orders
 *  ? remarks
 *  ? salesperson_id
 *  ? website_url
 *  x zip_code
 *  ? prebill
 *  ? print_logo
 */
class Migration_Customers extends Migration_Abstract {
	public $table = "customer";
	public $tmsTable = "customer_base";
	public $limit = 100;
	public $locationBase = false;
	public $customerBase = false;
	
	public function migrate($page, $perPage){
		//Get the connection
		$connection = Migration::getInstance()->getConnection();
		
		//Get the rows to migrate
		$query = "SELECT * FROM {$this->table}";
		$query = LP_Util::buildQueryPage($query, '', $page, $perPage);
		$result = mssql_query($query, $connection);
		$numRows = mssql_num_rows($result);
		if (!$numRows) {
			return $numRows;
		}
		
		
		//Add a message
		Migration::getInstance()->addMessage(
			"------------------------------------------------------------<br />
			 Starting Customers Migration<br />
			------------------------------------------------------------<br />"
		);
		
		//Migrate all rows to tms database
		while($row = mssql_fetch_assoc($result)){
			$this->process($row);
		}
		
		return $numRows;
	}
	
	public function process($row){
		//Trim all the data
		foreach ($row as $key => $value){
			$row[$key] = trim($value);
		}
		
		$lmeToTms = new LmeToTms();
		if($lmeToTms->exists($this->table, $row['id'], $this->tmsTable)){
			return false;
		}
		
		LP_Timer::start('Process Customer Base');
		$customerBase = $this->processCustomerBase($row);
		LP_Timer::stop();
		
		/**********************************************************
		 * Map the addresses to a location
		 *  - location_base, customer_to_location
		 *********************************************************/
		LP_Timer::start('Process Customer Location');
		$this->addLocation($customerBase, $row);
		LP_Timer::stop();
		
		return true;
	}
	
	/**
	 *
	 * @param type $id
	 * @return CustomerBase 
	 */
	public function getMigratedRow($id) {
		LP_Timer::start('Customer get migrated row');
		//Query to see if we can find this user in the lme database
		$this->locationBase = false;
		$this->customerBase = false;
		$base = new CustomerBase();
		$row = array();
		$query = "SELECT * FROM $this->table WHERE id = '".LP_Db::escape($id)."'";
		$result = mssql_query($query, Migration::getInstance()->getConnection());
		if(!mssql_num_rows($result)){
			Migration::getInstance()->addMessage("Customer did not exist in the lme database - $id");
			LP_Timer::stop();
			return $base;
		}
		else{
			$row = mssql_fetch_assoc($result);
			$this->process($row);
		}
		LP_Timer::stop();
		
		return $this->getCustomerBase($id);
	}
	
	public function getLmeRow($id){
		LP_Timer::start('Customer get lme row');
		$query = "SELECT * FROM $this->table WHERE id = '".LP_Db::escape($id)."'";
		$result = mssql_query($query, Migration::getInstance()->getConnection());
		LP_Timer::stop();
		if(mssql_num_rows($result)){
			$row = mssql_fetch_assoc($result);
			return $row;
		}
		return false;
	}
	
	/**
	 * This function will get the sales/contact person for the passed row
	 * If the contact has not been added to the system it will attempt to 
	 * add them. This will be associated with users
	 */
	public function getContact($row){
		//TODO: As far as i can tell, no customers have a real salesperson associated with them
	}
	
	public function processCustomerBase($row){
		//Create the customer base object
		$customerBase = new CustomerBase();
		
		/**********************************************************
		 * Check to see if this row has already been processed,
		 * If it has just skip and continue on to the next row
		 *********************************************************/
		$lmeToTms = new LmeToTms();
		
		/**********************************************************
		 * Create the basic customer,
		 * with the 1-1 info - customer_base
		 *********************************************************/
		//name => customer_name
		//$this->getContact();
		$customerBase->create(array(
			"customer_name" => $row['name'],
			"industry_id" => 0,
			"managed_by_id" => 0,
			"status_id" => 1,
			"created_by_id" => 0
		));
		
		/**********************************************************
		 * Create a migration Row
		 *********************************************************/
		$lmeToTms->create($this->table, $row['id'], $this->tmsTable, $customerBase->get('customer_id'));
		
		//Add message
		Migration::getInstance()->addMessage("Added row to {$this->tmsTable} - {$row['id']}");
		
		//Return the customer base
		$this->customerBase = $customerBase;
		return $customerBase;
	}
	
	/**
	 * 
	 * Add location to the customer
	 * @param CustomerBase $customerBase
	 * @param array $row
	 */
	public function addLocation($customerBase, $row){
		//Do not even run this if there is no address_1
		if(!strlen($row['address1'])){
			return false;
		}
		
		$locationBase = new LocationBase();
		LP_Timer::start('Check lme to tms');
		//Check if the migration row already exists
		$lmeToTms = new LmeToTms();
		if($lmeToTms->exists($this->table, $row['id'], "location_base")){
			$locationRow = $lmeToTms->find(array(
				"lme_table" => $this->table,
				"lme_key" => $row['id'],
				"tms_table" => "location_base"
			));
			
			$locationBase->load($locationRow->tms_key);
			
			//Add a message
			Migration::getInstance()->addMessage("!Warning migration row already existed for location_base - {$row['id']}");
			
			//Return the location base
			$this->locationBase = $locationBase;
			LP_Timer::stop();
			return $locationBase;
		}
		LP_Timer::stop();
		
		LP_Timer::start('Try to load location');
		//Try to find this location
		$locationBase->load(array(
			"address_1" => $row['address1'],
			"address_2" => $row['address2'],
			"zip" => $row['zip_code']
		));
		LP_Timer::stop();
		
		//If this location is not found, create it
		if(!$locationBase->get("location_id")){
			LP_Timer::start('Location create');
			$created = $locationBase->create(
				$row['name'],
				'',
				$row['address1'],
				$row['address2'],
				'',
				intval($row['zip_code']),
				1,
				0
			);
			LP_Timer::stop();
		}
		
		LP_Timer::start('Associate location with customer');
		//Associate the location with the customer
		$customerToLocation = new CustomerToLocation();
		$customerToLocation->create(array(
			"customer_id" => $customerBase->get('customer_id'),
			"location_id" => $locationBase->get('location_id'),
			"created_by_id" => 0
		));
		LP_Timer::stop();
		
		LP_Timer::start('Create migration row');
		//Create a migration row
		$lmeToTms = new LmeToTms();
		$lmeToTms->create($this->table, $row['id'], 'location_base', $locationBase->get('location_id'));
		LP_Timer::stop();
		
		//Add a message
		Migration::getInstance()->addMessage("Added row to location_base - {$row['id']}");
		
		//return the location base
		$this->locationBase = $locationBase;
		return $locationBase;
	}
	
	public function getCustomerBase($id){
		//Get the id of the tms user
		if(!$this->customerBase){
			$lmeToTms = new LmeToTms();
			$row = $lmeToTms->find(array(
				"lme_table" => $this->table,
				"lme_key" => $id,
				"tms_table" => $this->tmsTable
			));
			$customerBase = new CustomerBase();
			if($row){
				$customerBase->load($row->tms_key);
			}
			$this->customerBase = $customerBase;
			return $customerBase;
		}
		else{
			return $this->customerBase;
		}
		
	}
	
	public function getLocationBase($id){
		//Get the id of the tms user
		LP_Timer::start('Get location base ' . $id);
		if(!$this->locationBase){
			$lmeToTms = new LmeToTms();
			$row = $lmeToTms->find(array(
				"lme_table" => $this->table,
				"lme_key" => $id,
				"tms_table" => 'location_base'
			));
			$locationBase = new LocationBase();
			if($row){
				$locationBase->load($row->tms_key);
			}
			$this->locationBase = $locationBase;
			LP_Timer::stop();
			return $locationBase;
		}
		else{
			LP_Timer::stop();
			return $this->locationBase;
		}
	}
}