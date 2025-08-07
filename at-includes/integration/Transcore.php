<?php
require_once dirname(__FILE__) . '/Integration.php';
require_once dirname(__FILE__) . '/Abstract.php';
require_once dirname(__FILE__) . '/transcore/Load.php';
require_once dirname(__FILE__) . "/transcore/SignOnRecord.php";
require_once dirname(__FILE__) . "/transcore/SignOffRecord.php";
require_once $_SERVER['DOCUMENT_ROOT'] . '/at-extend/GeoData.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/at-includes/framework/Ftp.class.php';

class Integration_Transcore_Credentials{
	const Url = "na-ftp.dat.com";
	const UserName = 'acamthq';
	const Password = 'v4shsdl7';
}

class Integration_Transcore extends Integration_Abstract {
	
	protected static $ServiceName = "Transcore";
	
	public function add($preOrderId){
		//Convert the pre order to a load
		$load = $this->convert($preOrderId);
		
		//Add test data
		/*
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
		*/
		
		//Create the sign on command
		$signOnCommand = new Integration_Transcore_SignOnRecord();
		$signOffCommand = new Integration_Transcore_SignOffRecord();
		$postCommands = array(
			$signOnCommand->format(),
			$load->format(Integration_Transcore_Load_Commands::NewLoadPosting),
			$signOffCommand->format()
		);
		
		//Create the load command
		$loadString = implode("\n", $postCommands);
		pre($loadString); die();
		
		//Upload to the ftp
		$ftp = new Ftp();
		$ftp->connect(Integration_Transcore_Credentials::Url);
		$ftp->login(Integration_Transcore_Credentials::UserName, Integration_Transcore_Credentials::Password);
		$ftp->upload($loadString, Integration_Transcore_Credentials::UserName . ".txt", Ftp::ASCII);
		
		$errorList = new Integration_ErrorList();
		return $errorList;
	}
	
	public function delete($preOrderId){
		return $errorList;
	}
	
	public function convert($preOrderId){
		/*
		 * 
		 * 	public $MessageType;
			public $MessageVersion;
			public $PostToDatabase;
			public $PostingId;
			public $OrderId = '';
			public $DispatcherId;
			public $EquipmentType;
			public $FromCity;
			public $FromState;
			public $FromPostalCode;
			public $ToCity;
			public $ToState;
			public $ToPostalCode;
			public $CallbackPhoneNumber;
			public $AvailableDate;	//YYMMDD
			public $Enhancments;
			public $Count;
			public $DeckLength;
			public $LoadWeight;
			public $NumberIntermediateStops;
			public $Rate;
			public $RatePer;
			public $FromLatitude;
			public $FromLongitude;
			public $ToLatitude;
			public $ToLongitude;
			public $LocationsList;
			public $CommentOne;
			public $CommentTwo;
		 */
		
		//Load the posting service
		$postingService = new PostingServices();
		$postingService->load(array(
			PostingServices_Fields::Name => self::$ServiceName
		));
		
		//Create the load
		$load = new Integration_Transcore_Load();
		
		//Get all the pre-order information so we can map it to the load
		$preOrderBase = new PreOrderBase();
		$preOrderBase->load($preOrderId);
		
		//Add the dispatcherId
		$load->DispatcherId = $preOrderBase->get('created_by_id');
		
		//Set the posting id to the preOrderId
		$load->PostingId = $preOrderBase->get('pre_order_id');
		
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
		/*
		 * 	public $FromCity;
			public $FromState;
			public $FromPostalCode;
			public $ToCity;
			public $ToState;
			public $ToPostalCode;
		 */
		$load->FromState = $startLocation->State;
		$load->FromCity = $startLocation->City;
		$load->FromPostalCode = $startLocation->Zip;
		$load->ToState = $endLocation->State;
		$load->ToCity = $endLocation->City;
		$load->ToPostalCode = $endLocation->Zip;
		
		//Set the pickup date to the date of the first stop
		$load->AvailableDate = date('ymd', strtotime($startStop->get('schedule_date')));		//YYMMDD
		
		//Set the delivery date to be the date of the last stop
		//$load->DeliveryStartDate = date('n/j/Y', strtotime($endStop->get('schedule_date')));
		
		
		//Add the charge of the order
		$load->Rate = $charge->get('total_charge');
		$load->RatePer = "F";
		
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
		
		//Get the users phone number
		$userBase = new UserBase();
		$userBase->load($preOrderBase->get('created_by_id'));
		$contactBase = new ContactBase();
		$contactBase->load($userBase->get('contact_id'));
		$methodGroup = new ToolsMethodGroups();
		$methodGroup->load(array(
			"group_name" => "Phone"
		));
		$methodGroupId = $methodGroup->get('groups_id');
		$contactMethodType = new ContactMethodTypes();
		$contactMethodType->where("method_group_id", "=", $methodGroupId);
		$contectMethodTypeResult = $contactMethodType->list();
		$contactMethodIds = array();
		foreach($contectMethodTypeResult->rows as $row) {
			$contactMethodIds[] = $row->get('method_id');
		}
		$contactMethodIdsSql = "'" . implode("','", $contactMethodIds) . "'";
		$db = new DBModel();
		$db->connect();
		$query = "SELECT TOP 1 * FROM contact_methods 
					WHERE method_type_id IN ($contactMethodIdsSql)
					AND contact_id = '{$contactBase->get('contact_id')}'
					ORDER BY method_index ASC";
		$result = $db->query($query);
		if($db->db->num_rows($result)){
			$row = $db->db->fetch_assoc($result);
			$load->CallbackPhoneNumber = preg_replace('[\D]', '', $row['contact_value_1']);
		}

		//Return the load
		return $load;
	}
}