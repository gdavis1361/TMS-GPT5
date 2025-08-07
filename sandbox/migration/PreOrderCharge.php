<?php
require_once 'Abstract.php';

class Migration_PreOrderCharge extends Migration_Abstract {
	public $table = "";
	public $tmsTable = "pre_order_charge";
	public $limit = 25;
	public function migrate(){
		//Get the connection
		$connection = Migration::getInstance()->getConnection();
		
		//Get the rows to migrate
		$query = "SELECT * FROM {$this->table}";
		if($this->limit){
			$query = "SELECT TOP $this->limit * FROM {$this->table}";
		}
		$result = mssql_query($query, $connection);
		
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
	}
	
	public function process($row){
		/**********************************************************
		 * Check to see if this row has already been processed,
		 * If it has just skip and continue on to the next row
		 *********************************************************/
		$lmeToTms = new LmeToTms();
		if($lmeToTms->exists($this->table, $row['id'], $this->tmsTable)){
			//Add message
			Migration::getInstance()->addMessage("Location already existed in {$this->tmsTable} - {$row['id']}");
			
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
	}
	
	/**
	 *
	 * @param type $id
	 * @return LocationBase 
	 */
	public function getMigratedRow($id) {
		//Query to see if we can find this user in the lme database
		$base = new LocationBase();
		$row = array();
		$query = "SELECT * FROM $this->table WHERE id = '$id'";
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
}