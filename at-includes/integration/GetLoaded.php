<?php
require_once dirname(__FILE__) . '/Integration.php';
require_once dirname(__FILE__) . '/Abstract.php';
require_once dirname(__FILE__) . '/getloaded/Load.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/at-extend/GeoData.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/at-includes/framework/Ftp.class.php';

class Integration_GetLoaded_Credentials{
	const Url = "post-loads.getloaded.com";
	const UserName = 'accessloader';
	const Password = 'accessftp';
}

class Integration_GetLoaded extends Integration_Abstract {
	
	protected static $ServiceName = "GetLoaded";
	
	public function add($preOrderId){
		//Convert the pre order to a load
		$load = $this->convert($preOrderId);
		
		//Add test data
		$load = new Integration_GetLoaded_Load();
		$load->LoadId = 999999;
		$load->StartingCity = "Chattanooga";
		$load->StartingState = "TN";
		$load->DestinationCity = "Knoxville";
		$load->DestinationState = "TN";
		$load->PickupStartDate = date('n/j/Y', strtotime("+1 year"));
		$load->ContactName = "Randy Johnson";
		$load->ContactPhone = "423-555-5555";
		$load->Comments = 'this is a test';
		$load->TrailerType = "V";
		
		$loadString = $load->format(Integration_GetLoaded_Load::Add);
		
		//Upload to the ftp
		$ftp = new Ftp();
		$ftp->connect(Integration_GetLoaded_Credentials::Url);
		$ftp->login(Integration_GetLoaded_Credentials::UserName, Integration_GetLoaded_Credentials::Password);
		$ftp->upload($loadString, md5(microtime()) . ".txt", Ftp::ASCII);
		
		$errorList = new Integration_ErrorList();
		return $errorList;
	}
	
	public function delete($preOrderId){
		return $errorList;
	}
	
	public function convert($preOrderId){
		/**
		 *	
		Load ID* - Must be unique within the account the load is being posted to.
		Username Ğ Required if load is being posted to an account other than the account submitting the file.
		Pickup Start Date* - We can accommodate many date formats.
		Starting City*
		Starting State*
		Destination City*
		Destination State*
		Trailer Type Ğ Not required. If not provided we will set a default type and all loads will be of that type.
		Trailer Attributes
		Contact Name Ğ If not provided the load will use name on Getloaded account.
		Contact Phone - If not provided the load will use phone number on Getloaded account.
		Contact Extension
		Full or Partial
		Number of loads
		Pay Amount
		Loaded Miles Ğ We will calculate this if not provided
		Comments
		Weight
		Miles Ğ Loaded miles of the load
		Quantity
		Delivery Start Date
		Team
		 */
		//Load the posting service
		$postingService = new PostingServices();
		$postingService->load(array(
			PostingServices_Fields::Name => self::$ServiceName
		));
		
		//Create the load array
		$load = new Integration_GetLoaded_Load();
		
		//Get all the pre-order information so we can map it to the truckstop details
		$preOrderBase = new PreOrderBase();
		$preOrderBase->load($preOrderId);
		
		//Set the load id to the preOrderId
		$load->LoadId = $preOrderBase->get('pre_order_id');
		
		//Get all the pre order details
		$stops = $preOrderBase->get_stops();
		$charge = $preOrderBase->get_charge();
		$equipment = $preOrderBase->list_equipment();
		$details = $preOrderBase->list_details();
		
		//Lets get the geodata for the first and last stop
		$geoData = new GeoData();
		$startStop = $stops[0];	//First Stop
		$endStop = $stops[count($stops) - 1];	//Last Stop
		$startLocation = $geoData->lookup_zip($startStop->get('zip_code'));
		$endLocation = $geoData->lookup_zip($endStop->get('zip_code'));
		$load->StartingState = $startLocation->State;
		$load->StartingCity = $startLocation->City;
		$load->DestinationState = $endLocation->State;
		$load->DestinationCity = $endLocation->City;
		
		//Set the pickup date to the date of the first stop
		$load->PickupStartDate = date('n/j/Y', strtotime($startStop->get('schedule_date')));
		
		//Set the delivery date to be the date of the last stop
		$load->DeliveryStartDate = date('n/j/Y', strtotime($endStop->get('schedule_date')));
		
		
		//Add the charge of the order
		$load->Amount = $charge->get('total_charge');
		
		//Handle the equipment types
		//This is in no way the best way to do this, if anyone looking at this has a better solution
		//Please, please, please apply it
		if(count($equipment) > 1){
			
			//Try to find the group for these equipment ids
			$equipmentIds = array();
			foreach ($equipment as $e){
				$equipmentIds[] = $e->equipment_id;
			}
			$equipmentGroup = new EquipmentGroups();
			$groupId = $equipmentGroup->get_group_id_by_equipment($equipmentIds);
			
			//If we found a group lets try to match it to this service
			$equipmentGroupToPosting = new EquipmentGroupToPostingCode();
			$equipmentGroupToPosting->load($groupId);
			$load->TrailerType = $equipmentGroupToPosting->get(EquipmentGroupToPostingCode_Fields::Code);
		}
		
		//If equipment type still has no value, lets just use the first one we find
		if(!strlen($load->TrailerType)){
			$equipmentToPosting = new EquipmentToPostingCode();
			$equipmentToPosting->load(array(
				EquipmentToPostingCode_Fields::EquipmentId => $equipment[0]->equipment_id
			));
			$load->TrailerType = $equipmentToPosting->get(EquipmentToPostingCode_Fields::PostingCode);
		}
		
		//If there is still no equipment type at this point just set a default value
		if(!strlen($load->TrailerType)){
			$load->TrailerType = "V";
		}
		
		//Return the load
		return $load;
	}
}