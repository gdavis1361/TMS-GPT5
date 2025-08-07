<?php
require_once dirname(__FILE__) . '/Integration.php';
require_once dirname(__FILE__) . '/Abstract.php';
require_once dirname(__FILE__) . '/truckstop/LoadSearch.php';
require_once dirname(__FILE__) . '/truckstop/Import.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/at-extend/GeoData.php';

class Integration_Truckstop_Credentials{
	const IntegrationId = '1426';
	const Password = '7@j018fs';
	const UserName = 'WS8w33AA';
	const Url = 'http://webservices.truckstop.com/V7/Searching/LoadSearch.svc?wsdl';
	const Domain = 'http://webservices.truckstop.com/v7';
}

class Integration_Truckstop extends Integration_Abstract {
	
	protected static $ServiceName = "Internet Truckstop";
	
	public function search($params){
		$search = new Integration_Truckstop_LoadSearch();
		return $search->GetLoadSearchResults(
			new Integration_Truckstop_GetLoadSearchResults(
				new Integration_Truckstop_LoadSearchRequest(
					new Integration_Truckstop_LoadSearchCriteria($params)
				)
			)
		);
	}
	
	public function add($preOrderId){
		//Convert the pre order to a load
		$load = $this->convert($preOrderId);
		
		//Try to add the load
		$import = new ImportsWS();
		$result = $import->LoadImportPartialService(
			new LoadImportPartialService(
				new ImportLoadsRequest(
					array(
						new LoadImportPartial(
							array(
								$load
							)
						)
					)
				)
			)
		);
		
		//Check to see if any errors occured while adding this load
		$errorList = new Integration_ErrorList();
		$errorContainer = $result
			->LoadImportPartialServiceResult
			->RequestReport
			->ImportReport
			->AddLoadReports
			->LoadReport
			->LoadErrors;
				
		if(isset($errorContainer->Error)){
			$errors = $errorContainer->Error;
			//If the errors are not in array form, lets convert them to an array to be consistent
			if(!is_array($errors)){
				$errors = array($errors);
			}
			
			//Convert these errors into Integration_Error objects
			foreach ($errors as $error){
				$iError = new Integration_Error($error->ErrorMessage);
				$errorList->addError($iError);
			}
		}
		
		return $errorList;
	}
	
	public function delete($preOrderId){
		$import = new ImportsWS();
		$result = $import->LoadImportPartialService(
			new LoadImportPartialService(
				new ImportLoadsRequest(array(
					new LoadImportPartial(
						array(),
						array(),
						array(intval($preOrderId))
					)
				))
			)
		);
		
		//Check to see if any errors occured while deleting this load
		$errorList = new Integration_ErrorList();
		$errorContainer = $result
			->LoadImportPartialServiceResult
			->RequestReport
			->ImportReport
			->DeleteLoadReports
			->LoadReport
			->LoadErrors;
				
		if(isset($errorContainer->Error)){
			$errors = $errorContainer->Error;
			//If the errors are not in array form, lets convert them to an array to be consistent
			if(!is_array($errors)){
				$errors = array($errors);
			}
			
			//Convert these errors into Integration_Error objects
			foreach ($errors as $error){
				$iError = new Integration_Error($error->ErrorMessage);
				$errorList->addError($iError);
			}
		}
		
		return $errorList;
	}
	
	public function convert($preOrderId){
		/**
		 *	
		-	public $OriginCity = ''; // string
		-	public $OriginState = ''; // string
		-	public $OriginZip = ''; // string
		-	public $DestinationCity = ''; // string
		-	public $DestinationState = ''; // string
		-	public $DestinationZip = ''; // string
			public $Distance = 0; // int
			public $Weight = 0; // int
			public $Length = 0; // int
		-	public $Stops = 0; // int
		-	public $PaymentAmount = 0.0; // double
		-	public $PickupDate = 0; // dateTime
		-	public $PickUpTime = ''; // string
		-	public $DeliveryDate = 0; // dateTime
		-	public $DeliveryTime = ''; // string
		-	public $EquipmentType = ''; // string
			public $EquipmentOptions = array(); // ArrayOfString
			public $SpecialInformation = ''; // string
			public $IsFullLoad = true; // boolean
			public $PointOfContact = ''; // string
			public $Quantity = 0; // int
		-	public $LoadNumber = ''; // string
		 */
		//Load the posting service
		$postingService = new PostingServices();
		$postingService->load(array(
			PostingServices_Fields::Name => self::$ServiceName
		));
		
		//Create the load object
		$load = new ImportLoad();
		
		//Get all the pre-order information so we can map it to the truckstop details
		$preOrderBase = new PreOrderBase();
		$preOrderBase->load($preOrderId);
		
		//Set the load number to the preOrderId
		$load->LoadNumber = $preOrderBase->get('pre_order_id');
		
		//Get all the pre order details
		$stops = $preOrderBase->get_stops();
		$charge = $preOrderBase->get_charge();
		$equipment = $preOrderBase->list_equipment();
		$details = $preOrderBase->list_details();
		
		//If the stop count is > 2 we need to inform the load that it has additional stops
		if(count($stops) > 2){
			$load->Stops = count($stops) - 2;
		}
		
		//Lets get the geodata for the first and last stop
		$geoData = new GeoData();
		$startStop = $stops[0];	//First Stop
		$endStop = $stops[count($stops) - 1];	//Last Stop
		$startLocation = $geoData->lookup_zip($startStop->get('zip_code'));
		$endLocation = $geoData->lookup_zip($endStop->get('zip_code'));
		$load->OriginState = $startLocation->State;
		$load->OriginCity = $startLocation->City;
		$load->OriginZip = $startLocation->Zip;
		$load->DestinationState = $endLocation->State;
		$load->DestinationCity = $endLocation->City;
		$load->DestinationZip = $endLocation->Zip;
		
		//Set the pickup date to the date of the first stop
		$load->PickupDate = strtotime($startStop->get('schedule_date'));
		$load->PickUpTime = $startStop->get('appt_time');
		
		//Set the delivery date to be the date of the last stop
		$load->DeliveryDate = strtotime($endStop->get('schedule_date'));
		$load->DeliveryTime = $endStop->get('appt_time');
		
		
		//Add the charge of the order
		$load->PaymentAmount = $charge->get('total_charge');
		
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
			$load->EquipmentType = $equipmentGroupToPosting->get(EquipmentGroupToPostingCode_Fields::Code);
		}
		
		//If equipment type still has no value, lets just use the first one we find
		if(!strlen($load->EquipmentType)){
			$equipmentToPosting = new EquipmentToPostingCode();
			$equipmentToPosting->load(array(
				EquipmentToPostingCode_Fields::EquipmentId => $equipment[0]->equipment_id
			));
			$load->EquipmentType = $equipmentToPosting->get(EquipmentToPostingCode_Fields::PostingCode);
		}
		
		//If there is still no equipment type at this point just set a default value
		if(!strlen($load->EquipmentType)){
			$load->EquipmentType = "V";
		}
		
		//TODO: Add the quantity of the load?
		$load->Quantity = 1;
		
		//Return the load
		return $load;
	}
	
	public function getLoads(){
		$import = new ImportsWS();
		return $import->GetImportedLoadsService(
			new GetImportedLoadsService(
				new ImportedLoadsRequest()
			)
		);
	}
}