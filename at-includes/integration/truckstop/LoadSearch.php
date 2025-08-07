<?php
class Integration_Truckstop_LoadTypes {
	const All = "All";
	const Full = "Full";
	const Partial = "Partial";
}

class Integration_Truckstop_LoadType {
}

class Integration_Truckstop_Error {
	public $ErrorMessage; // string
	public $Suggestions; // ArrayOfstring
}

class Integration_Truckstop_RequestBase {
	public $IntegrationId = 0; // int
	public $Password = ''; // string
	public $UserName = ''; // string
	
	public function __construct(){
		$this->IntegrationId = Integration_Truckstop_Credentials::IntegrationId;
		$this->UserName = Integration_Truckstop_Credentials::UserName;
		$this->Password = Integration_Truckstop_Credentials::Password;
	}
}

class Integration_Truckstop_ReturnBase {
	public $Errors; // ArrayOfError
}

class Integration_Truckstop_LoadSearchRequest extends Integration_Truckstop_RequestBase {
	public $Criteria; // LoadSearchCriteria
	
	public function __construct(Integration_Truckstop_LoadSearchCriteria $criteria){
		$this->Criteria = $criteria;
		parent::__construct();
	}
}

class Integration_Truckstop_LoadSearchCriteria {
	public $DestinationCity = ""; // string
	public $DestinationCountry = ""; // string
	public $DestinationRange = 0; // int
	public $DestinationState = ""; // string
	public $EquipmentType = ""; // string
	public $HoursOld = 0; // int
	public $LoadType = ""; // LoadType
	public $OriginCity = ""; // string
	public $OriginCountry = ""; // string
	public $OriginLatitude = 0; // int
	public $OriginLongitude = 0; // int
	public $OriginRange = 0; // int
	public $OriginState = ""; // string
	public $PickupDate = 0; // dateTime

	public function __construct($properties = array()){
		foreach ($properties as $key => $value){
			if(property_exists(__CLASS__, $key)){
				$this->$key = $value;
			}
		}
		
		//Check the pickup date
		if(!intval($this->PickupDate)){
			$this->PickupDate = strtotime("+7 days");
		}
	}
}

class Integration_Truckstop_LoadDetailRequest {
	public $LoadId; // int
}

class Integration_Truckstop_LoadSearchReturn {
	public $SearchResults; // ArrayOfLoadSearchItem
}

class Integration_Truckstop_LoadSearchItem {
	public $Age; // string
	public $Bond; // int
	public $BondEnabled; // boolean
	public $BondTypeID; // int
	public $CompanyName; // string
	public $Days2Pay; // string
	public $DestinationCity; // string
	public $DestinationCountry; // string
	public $DestinationDistance; // int
	public $DestinationState; // string
	public $Equipment; // string
	public $ExperienceFactor; // string
	public $FuelCost; // string
	public $ID; // int
	public $IsFriend; // boolean
	public $Length; // string
	public $LoadType; // LoadType
	public $Miles; // string
	public $OriginCity; // string
	public $OriginCountry; // string
	public $OriginDistance; // int
	public $OriginState; // string
	public $Payment; // string
	public $PickUpDate; // string
	public $PointOfContactPhone; // string
	public $PricePerGall; // decimal
	public $Weight; // string
}

class Integration_Truckstop_LoadDetailReturn {
	public $LoadDetail; // LoadDetailResult
}

class Integration_Truckstop_LoadDetailResult {
	public $Bond; // int
	public $BondTypeID; // int
	public $Credit; // string
	public $DOTNumber; // string
	public $DeliveryDate; // string
	public $DeliveryTime; // string
	public $DestinationCity; // string
	public $DestinationState; // string
	public $DestinationZip; // string
	public $Distance; // string
	public $Entered; // dateTime
	public $Equipment; // string
	public $FuelCost; // string
	public $HasBonding; // boolean
	public $ID; // int
	public $Length; // string
	public $LoadType; // LoadType
	public $MCNumber; // string
	public $Mileage; // string
	public $OriginCity; // string
	public $OriginState; // string
	public $OriginZip; // string
	public $PaymentAmount; // string
	public $PickupDate; // string
	public $PickupTime; // string
	public $PointOfContact; // string
	public $PointOfContactPhone; // string
	public $Quantity; // string
	public $SpecInfo; // string
	public $Stops; // string
	public $TMCNumber; // string
	public $TruckCompanyCity; // string
	public $TruckCompanyEmail; // string
	public $TruckCompanyFax; // string
	public $TruckCompanyName; // string
	public $TruckCompanyPhone; // string
	public $TruckCompanyState; // string
	public $Weight; // string
	public $Width; // string
}

class Integration_Truckstop_GetLoadSearchResults {
	public $searchRequest; // LoadSearchRequest
	
	public function __construct(Integration_Truckstop_LoadSearchRequest $request){
		$this->searchRequest = $request;
	}
}

class Integration_Truckstop_GetLoadSearchResultsResponse {
	public $GetLoadSearchResultsResult; // LoadSearchReturn
}

class Integration_Truckstop_GetLoadSearchDetailResult {
	public $detailRequest; // LoadDetailRequest
}

class Integration_Truckstop_GetLoadSearchDetailResultResponse {
	public $GetLoadSearchDetailResultResult; // LoadDetailReturn
}

class Integration_Truckstop_char {
}

class Integration_Truckstop_duration {
}

class Integration_Truckstop_guid {
}


/**
 * LoadSearch class
 *
 *
 *
 * @author    {author}
 * @copyright {copyright}
 * @package   {package}
 */
class Integration_Truckstop_LoadSearch extends SoapClient {

	private static $classmap = array(
                                    'LoadType' => 'Integration_Truckstop_LoadType',
                                    'Error' => 'Integration_Truckstop_Error',
                                    'RequestBase' => 'Integration_Truckstop_RequestBase',
                                    'ReturnBase' => 'Integration_Truckstop_ReturnBase',
                                    'LoadSearchRequest' => 'Integration_Truckstop_LoadSearchRequest',
                                    'LoadSearchCriteria' => 'Integration_Truckstop_LoadSearchCriteria',
                                    'LoadDetailRequest' => 'Integration_Truckstop_LoadDetailRequest',
                                    'LoadSearchReturn' => 'Integration_Truckstop_LoadSearchReturn',
                                    'LoadSearchItem' => 'Integration_Truckstop_LoadSearchItem',
                                    'LoadDetailReturn' => 'Integration_Truckstop_LoadDetailReturn',
                                    'LoadDetailResult' => 'Integration_Truckstop_LoadDetailResult',
                                    'GetLoadSearchResults' => 'Integration_Truckstop_GetLoadSearchResults',
                                    'GetLoadSearchResultsResponse' => 'Integration_Truckstop_GetLoadSearchResultsResponse',
                                    'GetLoadSearchDetailResult' => 'Integration_Truckstop_GetLoadSearchDetailResult',
                                    'GetLoadSearchDetailResultResponse' => 'Integration_Truckstop_GetLoadSearchDetailResultResponse',
                                    'char' => 'Integration_Truckstop_char',
                                    'duration' => 'Integration_Truckstop_duration',
                                    'guid' => 'Integration_Truckstop_guid',
	);

	public function __construct($options = array()) {
		foreach(self::$classmap as $key => $value) {
			if(!isset($options['classmap'][$key])) {
				$options['classmap'][$key] = $value;
			}
		}
		parent::__construct(Integration_Truckstop_Credentials::Url, $options);
	}

	/**
	 *
	 *
	 * @param GetLoadSearchResults $parameters
	 * @return GetLoadSearchResultsResponse
	 */
	public function GetLoadSearchResults(Integration_Truckstop_GetLoadSearchResults $parameters) {
		return $this->__soapCall('GetLoadSearchResults', array($parameters),       array(
            'uri' => Integration_Truckstop_Credentials::Domain,
            'soapaction' => ''
            )
            );
	}

	/**
	 *
	 *
	 * @param GetLoadSearchDetailResult $parameters
	 * @return GetLoadSearchDetailResultResponse
	 */
	public function GetLoadSearchDetailResult(GetLoadSearchDetailResult $parameters) {
		return $this->__soapCall('GetLoadSearchDetailResult', array($parameters),       array(
            'uri' => Integration_Truckstop_Credentials::Domain,
            'soapaction' => ''
            )
            );
	}

}

?>
