<?php
require_once 'config.php';

/*
$connection = Migration::getInstance()->getConnection();
$query = "SELECT * FROM lme76.dbo.contact WHERE parent_row_type = 'P'";
$rows = LP_Db::fetchAll($query);
foreach ($rows as $row){
	//Get the migrated row
	$query = "SELECT TOP 1 * FROM lme_to_tms.dbo.migrate WHERE lme_table = 'contact' AND lme_key = '{$row['id']}' AND tms_table = 'contact_base'";
	$migrateRow = LP_Db::fetchRow($query);
	if($migrateRow){
		$contactBase = new ContactBase();
		$contactBase->load($migrateRow['tms_key']);
		if($contactBase->get('contact_id')){
			$query = "SELECT * FROM payee WHERE id = '{$row['parent_row_id']}'";
			$payeeRow = LP_Db::fetchRow($query);
			if($payeeRow){
				$name = LP_Db::escape($payeeRow['name']);
				$query = "SELECT TOP 1 * FROM ContractManager.dbo.CarrierMaster WHERE CarrName = '$name'";
				$carrierRow = LP_Db::fetchRow($query);
				if($carrierRow){
					$carrierBaseExtended = new CarrierBaseExtended();
					$carrierBaseExtended->load(array(
						"carrier_id" => $carrierRow['CarrID']
					));
					if($carrierBaseExtended->get('carrier_id')){
						$locationToCarriers = new LocationToCarriers();
						$locationToCarriers->load(array(
							"carrier_id" => $carrierBaseExtended->get('carrier_id')
						));
						if($locationToCarriers->get('location_id')){
							$locationBase = new LocationBase();
							$locationBase->load($locationToCarriers->get('location_id'));

							$locationToContact = new LocationToContact();
							$locationToContact->create($locationBase->get('location_id'), $contactBase->get('contact_id'), 1, 0);
							pre("created location to contact");
						}
					}
				}
			}
		}
	}
}
 * 
 */

/*
$lmeToTms = new LmeToTms();
$date = "2011-06-24";
$query = "SELECT * FROM ContractManager.dbo.CarrierMaster WHERE CarrDateCreated = '$date'";
$rows = LP_Db::fetchAll($query);
foreach ($rows as $row){
	$cleanName = LP_Db::escape($row['CarrName']);
	$query = "SELECT * FROM lme76.dbo.payee WHERE name = '$cleanName'";
	$payeeRow = LP_Db::fetchRow($query);
	if($payeeRow){
		if (preg_match('/^\d{6}$/', trim($payeeRow['id']))) {
			//Try to load the extended row
			$extended = new CarrierBaseExtended();
			$extended->load($row['CarrID']);
			if(!$extended->get('carrier_id')){
				$extended->create(
					$row['CarrID'],
					$payeeRow['id'],
					'',
					date('Y-m-d'),
					0,
					0,
					0,
					0
				);
			}
			
			//Create a migration row
			$lmeToTms->create('payee', $payeeRow['id'], "CarrierBase", $extended->get('carrier_id'));
			
			pre($payeeRow);
			
			//Check to see if there is a location associated with this carrier
			$locationBase = new LocationBase();
			$locationBase->load(array(
				"location_name_1" => $payeeRow['name'],
				"address_1" => $payeeRow['address1'],
				"zip" => $payeeRow['zip_code']
			));
			
			
			if(!$locationBase->get('location_id')){
				$locationBase->create(
					$payeeRow['name'],
					'',
					$payeeRow['address1'],
					$payeeRow['address2'],
					'',
					trim($payeeRow['zip_code']),	//lol
					1,
					0
				);
			}
			
			//Create a location_to_carriers connection
			$locationToCarriers = new LocationToCarriers();
			$locationToCarriers->load(array(
				"location_id" => $locationBase->get('location_id'),
				"carrier_id" => $extended->get('carrier_id')
			));
			if(!$locationToCarriers->get('location_id')){
				$locationToCarriers->create($locationBase->get('location_id'), $extended->get('carrier_id'), 0);
			}
		}
	}
}
*/
die();
