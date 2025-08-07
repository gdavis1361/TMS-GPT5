<?php

require_once 'Abstract.php';

class Migration_Orders extends Migration_Abstract {
	
	public $table = "orders";
	public $tmsTable = "pre_order_base";
	public $limit = 1000;
	public $connection;
	
	public function migrate(){
		//Get the connection
		$this->connection = Migration::getInstance()->getConnection();
				
		//Get the rows to migrate
		$query = "SELECT * FROM {$this->table}";
		if($this->limit){
			$query = "SELECT TOP $this->limit * FROM {$this->table}";
		}
		$result = mssql_query($query, $this->connection);
		
		//Add a message
		Migration::getInstance()->addMessage(
			"------------------------------------------------------------<br />
			 Starting Orders Migration<br />
			------------------------------------------------------------<br />"
		);
		
		//Migrate all rows to tms database
		while($row = mssql_fetch_assoc($result)){
//			$this->process($row);
			pre($row);
		}
	}
	
	public function process($row){
		/*
		 * Create a pre_order_base row based on the order row
		 */
		$preOrderBase = $this->processPreOrderBase($row);
		
		/*
		 * Process charges
		 */
		$this->processCharges($preOrderBase, $row);
		
		/**********************************************************
		 * Process preorder stops
		 *********************************************************/
		$this->processPreOrderStops($preOrderBase, $row);
		
	}
	
	/**
	 * @return PreOrderBase
	 */
	public function getMigratedRow($id) {
		$base = new PreOrderBase();
		$row = array();
		$query = "SELECT * FROM $this->table WHERE id = '$id'";
		$result = mssql_query($query, Migration::getInstance()->getConnection());
		if(!mssql_num_rows($result)){
			Migration::getInstance()->addMessage("Order did not exist in the lme database - $id");
			return $base;
		}
		else{
			$row = mssql_fetch_assoc($result);
			$this->process($row);
		}
		
		//Get the id
		$lmeToTms = new LmeToTms();
		if($lmeToTms->exists($this->table, $id, $this->tmsTable)){
			$mRow = $lmeToTms->find(array(
				"lme_table" => $this->table,
				"lme_key" => $id,
				"tms_table" => $this->tmsTable
			));
			
			$base->load($mRow->tms_key);
		}
		
		return $base;
	}
	
	public function processPreOrderBase($row) {
		//Create the preorder base object
		$preOrderBase = new PreOrderBase();
		
		/**********************************************************
		 * Check to see if this row has already been processed,
		 * If it has just skip and continue on to the next row
		 *********************************************************/
		$lmeToTms = new LmeToTms();
		if($lmeToTms->exists($this->table, $row['id'], $this->tmsTable)){
			$preOrderBaseRow = $lmeToTms->find(array(
				"lme_table" => $this->table,
				"lme_key" => $row['id'],
				"tms_table" => $this->tmsTable
			));
			
			$preOrderBase->load($preOrderBaseRow->tms_key);
			
			//Add a message
			Migration::getInstance()->addMessage("Pre-Order already existed in {$this->tmsTable} - {$row['id']}");
			
			//Return the contact base
			return $preOrderBase;
		}
		
		
		// Find the user associated with this order
		require_once 'Users.php';
		$migrationUsers = new Migration_Users();
		$userBase = $migrationUsers->getMigratedRow($row['entered_user_id']);
		$userBaseId = 0;
		if($userBase->get('user_id')){
			$userBaseId = $userBase->get('user_id');
		}
		
		// Get the migrated customer row
		require_once 'Customers.php';
		$migrationCustomers = new Migration_Customers();
		$customerBase = $migrationCustomers->getMigratedRow($row['customer_id']);
		$customerBaseId = 0;
		if($customerBase->get('customer_id')){
			$customerBaseId = $customerBase->get('customer_id');
		}
		
		// Create the pre_order_base row
		$preOrderBase->create(
			$customerBaseId,
			0,
			$userBaseId,
			$userBaseId,
			0,
			0,
			0
		);
		
		//Insert a migration row
		$lmeToTms->create($this->table, $row['id'], $this->tmsTable, $preOrderBase->get('pre_order_id'));
		
		//Add a message
		Migration::getInstance()->addMessage("Added row to {$this->tmsTable} - {$row['id']}");
		
		//Return the contact base
		return $preOrderBase;
	}
	
	public function processCharges($preOrderBase, $orderRow) {
		$lmeToTms = new LmeToTms();
		if($lmeToTms->exists($this->table, $orderRow['id'], 'pre_order_charge')){
			//Add message
			Migration::getInstance()->addMessage("Pre Order Charge already existed in pre_order_charge - {$orderRow['id']}");
			
			return false;
		}
		
		// Find the user associated with this charge
		require_once 'Users.php';
		$migrationUsers = new Migration_Users();
		$userBase = $migrationUsers->getMigratedRow($row['entered_user_id']);
		$userBaseId = 0;
		if($userBase->get('user_id')){
			$userBaseId = $userBase->get('user_id');
		}
		
		// create the pre order charge record
		$preOrderCharge = new PreOrderCharge();
		$preOrderCharge->create(
			$preOrderBase->get('pre_order_id'),
			$orderRow['dim_surcharge'],
			$orderRow['freight_charge'],
			$orderRow['otherchargetotal'],
			$preOrderBase->get('created_by_id'));
		
		//Create the migration row
		$lmeToTms->create($this->table, $orderRow['id'], 'pre_order_charge', $preOrderBase->get('pre_order_id'));
		
		//Add message
		Migration::getInstance()->addMessage("Added row to pre_order_charge - {$orderRow['id']}");
	}
	
	public function processPreOrderStops($preOrderBase, $orderRow) {
		// get all movements for this order
		$query = "SELECT movement.* FROM movement_order
			LEFT JOIN movement ON movement.id = movement_order.movement_id
			WHERE movement_order.order_id = {$orderRow['id']}";
		$result = mssql_query($query, $this->connection);
		
		// store all stop ids linked to this movement
		$stopIds = array();
		while($row = mssql_fetch_assoc($result)){
			$stopIds[] = $row['dest_stop_id'];
			$stopIds[] = $row['origin_stop_id'];
		}
		$stopIdsSql = "'" . implode("','", $stopIds) . "'";
		
		// get all stop rows based on the stop ids
		$query = "SELECT * FROM stop WHERE id IN ($stopIdsSql)";
		$result = mssql_query($query, $this->connection);
		while($row = mssql_fetch_assoc($result)){
			$preOrderStops = new PreOrderStops();
			
			//Get the id of the tms stop
			if($lmeToTms->exists($this->table, $row['id'], "pre_order_stops")){
				$preOrderStopsRow = $lmeToTms->find(array(
					"lme_table" => $this->table,
					"lme_key" => $row['id'],
					"tms_table" => "pre_order_stops"
				));

				$preOrderStops->load($preOrderStopsRow->tms_key);
			}
			
			//If this preorderstops does not exist create it
			if(!$preOrderStops->get('pre_order_stops_id')){
				$dateTime = explode(' ', $row['sched_arrive_early']);
				$date = false;
				$time = false;
				if (count($dateTime) == 2) {
					$date = $dateTime[0] . ' 00:00:00';
					$time = $dateTime[1] . '.0000000';
				}
				$stopType = 'd';
				if ($row['stop_type'] == 'PU') {
					$stopType = 'p';
				}
				
				$preOrderStops->create(
					$preOrderBase->get('pre_order_id'),
					$row['movement_sequence'],
					$stopType,
					$date,
					$time,
					$preOrderBase->get('created_by_id'),
					$row['zip_code']
				);
				
				//Insert a migration row
				$lmeToTms->create($this->table, $row['id'], 'pre_order_stops', $preOrderStops->get('pre_order_stops_id'));
				
				//Add a message
				Migration::getInstance()->addMessage("Added row to pre_order_stops - {$row['id']}");
			}
			
			//Create a location based on this stop
			require_once 'Locations.php';
			$migrationLocations = new Migration_Locations();
			$locationBase = $migrationLocations->getMigratedRow($row['location_id']);
			$locationBaseId = 0;
			if($locationBase->get('location_id')){
				$locationBaseId = $locationBase->get('location_id');
				
				// make relationship row
				$relationship = new PreOrderStopToLocation();
				$relationship->create($preOrderStops->get('pre_order_stops_id'), $locationBaseId);
				
				//Insert a migration row
				$lmeToTms->create($this->table, $row['id'], 'pre_order_stop_to_location', $preOrderStops->get('pre_order_stops_id'));
				
				//Add a message
				Migration::getInstance()->addMessage("Added row to pre_order_stop_to_location - {$preOrderStops->get('pre_order_stops_id')} {$row['location_id']}");
			}
		}
	}
	
}