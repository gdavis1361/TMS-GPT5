<?php
require_once 'Abstract.php';
/*
 * [company_id] => TMS 
    [add_fed_to_wh] => 
    [add_fed_to_wh_c] => 
    [add_fed_to_wh_d] => 
    [add_fed_to_wh_n] => 
    [add_fed_to_wh_r] => 
    [addl_st_to_whold] => 
    [addl_st_to_whold_c] => 
    [addl_st_to_whold_d] => 
    [addl_st_to_whold_n] => 
    [addl_st_to_whold_r] => 
    [address1] => PO Box 60765
    [address2] => 
    [adp_co_code] => 
    [adp_e_no] => 
    [birth_date] => 
    [check_address] => PO Box 60765
    [check_address2] => 
    [check_city] => BAKERSFIELD                 
    [check_city_st_zip] => 
    [check_date] => 
    [check_name] => Micko Tranport              
    [check_number] => 
    [check_st] => CA
    [check_stub_comment] => 
    [check_zip] => 93386     
    [city] => BAKERSFIELD                                       
    [city_tax_code] => 
    [county_tax_code] => 
    [fed_amt_to_whold] => 
    [fed_amt_to_whold_c] => 
    [fed_amt_to_whold_d] => 
    [fed_amt_to_whold_n] => 
    [fed_amt_to_whold_r] => 
    [fed_exemptions] => 
    [fed_marital_status] => 
    [freeze_pay] => 
    [hire_date] => 
    [holiday_hours_pd] => 
    [id] => 057392  
    [last_raise_date] => 
    [name] => Micko Tranport              
    [non_office_emp] => Y
    [office_employee] => N
    [overtime_hours_pd] => 
    [payment_method] => C
    [phone_number] => 661-387-0234        
    [regular_hours_pd] => 
    [remarks] => 
    [settlement_status] => 
    [sick_hours_pd] => 
    [social_security_no] => 
    [st_amt_to_whold] => 
    [st_amt_to_whold_c] => 
    [st_amt_to_whold_d] => 
    [st_amt_to_whold_n] => 
    [st_amt_to_whold_r] => 
    [st_marital_status] => 
    [state] => CA
    [state_exemptions] => 
    [state_tax_code] => 
    [status] => A
    [termination_date] => 
    [vacation_hours_pd] => 
    [ytd_holiday_hrs] => 
    [ytd_overtime_hrs] => 
    [ytd_reg_hrs_paid] => 
    [ytd_sick_hrs_paid] => 
    [ytd_vacation_hrs] => 
    [zip_code] => 93386     
    [email_summary] => 
    [email] => 
    [legal_name] => Micko Tranport 
 */
class Migration_Payees extends Migration_Abstract {
	public $table = "payee";
	public $limit = 100;
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
		
		Migration::getInstance()->addMessage(
			"------------------------------------------------------------<br />
			 Starting Payees/Carriers Migration<br />
			------------------------------------------------------------<br />"
		);
		
		//Migrate all rows to tms database
		while($row = mssql_fetch_assoc($result)){
			$this->process($row);
		}
		
		return $numRows;
	}
	
	public function process($row){
		//Trim the entire row
		foreach ($row as $key =>$value){
			$row[$key] = trim($value);
		}
		
		$lmeToTms = new LmeToTms();
		if($lmeToTms->exists($this->table, $row['id'], "CarrierBase")){
			return false;
		}
		if (!preg_match('/^\d{6}$/', $row['id'])) {
			return false;
		}
		$carrierBase = $this->processCarrierBase($row);
		$this->processLocation($carrierBase, $row);
	}
	
	/**
	 * 
	 * @return CarrierBase
	 */
	public function getMigratedRow($id) {
		$base = new CarrierBase();
		$row = array();
		$query = "SELECT * FROM $this->table WHERE id = '".LP_Db::escape($id)."'";
		$result = mssql_query($query, Migration::getInstance()->getConnection());
		if(!mssql_num_rows($result)){
			Migration::getInstance()->addMessage("Payee did not exist in the lme database - $id");
			return $base;
		}
		else{
			$row = mssql_fetch_assoc($result);
			$this->process($row);
		}
		
		//Get the id
		$lmeToTms = new LmeToTms();
		if($lmeToTms->exists($this->table, $id, "CarrierBase")){
			$mRow = $lmeToTms->find(array(
				"lme_table" => $this->table,
				"lme_key" => $id,
				"tms_table" => "CarrierBase"
			));
			
			$base->load($mRow->tms_key);
		}
		
		return $base;
	}
	
	public function processCarrierBase($row){
		$carrierBase = new CarrierBase();
		$lmeToTms = new LmeToTms();
		
		//Create the carrierbase entry
		$carrierBase->create(
			$row['name'],		//name
			$row['id'], 				//mcnumber
			'',					//safety rating
			date('Y-m-d'),					//safety rating date
			'',					//common authority
			'',					//contract authority
			'',					//broker authority
			0					//Created by id
		);
		
		//Create a migration row
		$lmeToTms->create($this->table, $row['id'], "CarrierBase", $carrierBase->get('carrier_id'));
		
		//Add message
		Migration::getInstance()->addMessage("Added row to CarierBase - {$row['id']}");
		
		return $carrierBase;
	}
	
	public function processLocation($carrierBase, $row){
		$carrierId = $carrierBase->get('CarrId');
		$carrierBaseExtended = new CarrierBaseExtended();
		$carrierBaseExtended->load($carrierId);
		$locationBase = new LocationBase();
	
		//Create the location
		$locationBase->create(
			$row['name'],
			'',
			$row['address1'],
			$row['address2'],
			'',
			trim($row['zip_code']),
			1,
			0
		);
		
		//Add migration row
		$lmeToTms = new LmeToTms();
		$lmeToTms->create(
			$this->table,
			$row['id'],
			"location_base",
			$locationBase->get('location_id')
		);
		
		//Add message
		Migration::getInstance()->addMessage("Added row to location_base - {$row['id']}");
		
		//Create a location_to_carriers connection
		$locationToCarriers = new LocationToCarriers();
		$locationToCarriers->create($locationBase->get('location_id'), $carrierBaseExtended->get('carrier_id'), 0);
		
	}
}