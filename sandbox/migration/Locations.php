<?php
require_once 'Abstract.php';
/*
 * [company_id] => TMS 
    [address1] => 
    [address2] => 
    [appt_required] => N
    [assigned_to] => 
    [category] => 
    [city_id] => 145184
    [city_name] => NASHVILLE                                         
    [comments] => 
    [customer_id] => 
    [days_between_calls] => 
    [def_commodity_desc] => 
    [def_commodity_id] => 
    [directions] => 
    [friday_close] => 
    [friday_open] => 
    [fuel_price_region] => 
    [id] => 1000TN01
    [insur_amt_rqrd] => 
    [insur_amt_rqrd_c] => 
    [insur_amt_rqrd_d] => 
    [insur_amt_rqrd_n] => 
    [insur_amt_rqrd_r] => 
    [is_consignee] => 
    [is_customer] => N
    [is_dist_center] => 
    [is_drop_yard] => 
    [is_shipper] => 
    [is_steamship] => N
    [is_terminal] => 
    [is_trailer_pool] => N
    [latitude] => 36.1594
    [layover] => 
    [load_unload_count] => 
    [load_unload_excl] => N
    [load_unload_param] => A
    [loading_instructs] => 
    [loading_time] => 
    [longitude] => 86.7906
    [max_pallet_balance] => 
    [monday_close] => 
    [monday_open] => 
    [name] => 1000 Apex St.
    [next_call_date] => 
    [pallet_balance] => 
    [pallets_required] => 
    [regulated] => 
    [salesperson] => 
    [saturday_close] => 
    [saturday_open] => 
    [state] => TN
    [sunday_close] => 
    [sunday_open] => 
    [thursday_close] => 
    [thursday_open] => 
    [trailer_pool_min] => 
    [trailer_pool_size] => 
    [tuesday_close] => 
    [tuesday_open] => 
    [unload_instructs] => 
    [unloading_time] => 
    [wednesday_close] => 
    [wednesday_open] => 
    [zip_code] => 37202     
    [trip_starter] => 
    [is_geocoded] => 
 */
class Migration_Locations extends Migration_Abstract {
	public $table = "location";
	public $tmsTable = "location_base";
	public $limit = 100;
	public $locationBase = false;
	
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
			 Starting Locations Migration<br />
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
		
		/**********************************************************
		 * Check to see if this row has already been processed,
		 * If it has just skip and continue on to the next row
		 *********************************************************/
		LP_Timer::start('Location process');
		$lmeToTms = new LmeToTms();
		if($lmeToTms->exists($this->table, $row['id'], $this->tmsTable)){
			//Add message
			Migration::getInstance()->addMessage("Location already existed in {$this->tmsTable} - {$row['id']}");
			LP_Timer::stop();
			return false;
		}
		
		/**********************************************************
		 * Create the location_base
		 *********************************************************/
		
		$locationBase = new LocationBase();
		
		//Try to find this location
		$locationBase->load(array(
			"address_1" => $row['address1'],
			"address_2" => $row['address2'],
			"zip" => $row['zip_code']
		));
		
		//If this location is not found, create it
		if(!$locationBase->get("location_id")){
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
		}
		
		//Create the migration row
		$lmeToTms->create($this->table, $row['id'], $this->tmsTable, $locationBase->get('location_id'));
		
		//Add message
		Migration::getInstance()->addMessage("Added row to {$this->tmsTable} - {$row['id']}");
		LP_Timer::stop();
		
		$this->locationBase = $locationBase;
	}
	
	/**
	 *
	 * @param type $id
	 * @return LocationBase 
	 */
	public function getMigratedRow($id) {
		//Query to see if we can find this location in the lme database
		$this->locationBase = false;
		$base = new LocationBase();
		$row = array();
		$query = "SELECT * FROM $this->table WHERE id = '".LP_Db::escape($id)."'";
		$result = mssql_query($query, Migration::getInstance()->getConnection());
		if(!mssql_num_rows($result)){
			Migration::getInstance()->addMessage("Location did not exist in the lme database - $id");
			return $base;
		}
		else{
			$row = mssql_fetch_assoc($result);
			$this->process($row);
		}
		
		//Get the id of the tms user
		if(!$this->locationBase){
			$lmeToTms = new LmeToTms();
			$row = $lmeToTms->find(array(
				"lme_table" => $this->table,
				"lme_key" => $row['id'],
				"tms_table" => $this->tmsTable
			));
			if($row){
				$base->load($row->tms_key);
			}
			$this->locationBase = $base;
		}
		else{
			$base = $this->locationBase;
		}
		
		return $base;
	}
	
	public function getLmeRow($id){
		$query = "SELECT * FROM $this->table WHERE id = '".LP_Db::escape($id)."'";
		$result = mssql_query($query, Migration::getInstance()->getConnection());
		if(mssql_num_rows($result)){
			$row = mssql_fetch_assoc($result);
			return $row;
		}
		return false;
	}
}