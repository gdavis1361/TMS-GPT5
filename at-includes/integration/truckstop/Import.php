<?php
class LoadImportFullService {
	public $myImport; // ImportFullLoadsRequest
	
	public function __construct(ImportFullLoadsRequest $request){
		$this->myImport = $request;
	}
}

class ImportFullLoadsRequest {
	public $UserName; // string
	public $Password; // string
	public $Imports; // ArrayOfLoadImportFull
	
	public function __construct($imports = array()){
		$this->UserName = Integration_Truckstop_Credentials::UserName;
		$this->Password = Integration_Truckstop_Credentials::Password;
		$this->Imports = $imports;
	}
}

class LoadImportFull {
	public $IntegrationID; // int
	public $Loads; // ArrayOfImportLoad
	
	public function __construct($loads = array()){
		$this->IntegrationID = Integration_Truckstop_Credentials::IntegrationId;
		$this->Loads = $loads;
	}
}

class ImportLoad {
	public $OriginCity = ''; // string
	public $OriginState = ''; // string
	public $OriginZip = ''; // string
	public $DestinationCity = ''; // string
	public $DestinationState = ''; // string
	public $DestinationZip = ''; // string
	public $Distance = 0; // int
	public $Weight = 0; // int
	public $Length = 0; // int
	public $Stops = 0; // int
	public $PaymentAmount = 0.0; // double
	public $PickupDate = 0; // dateTime
	public $PickUpTime = ''; // string
	public $DeliveryDate = 0; // dateTime
	public $DeliveryTime = ''; // string
	public $EquipmentType = ''; // string
	public $EquipmentOptions = array(); // ArrayOfString
	public $SpecialInformation = ''; // string
	public $IsFullLoad = true; // boolean
	public $PointOfContact = ''; // string
	public $Quantity = 0; // int
	public $LoadNumber = ''; // string
	
	public function __construct($properties = array()){
		foreach ($properties as $key => $value){
			if(property_exists(__CLASS__, $key)){
				$this->$key = $value;
			}
		}
	}
}

class LoadImportFullServiceResponse {
	public $LoadImportFullServiceResult; // ImportLoadsResponse
}

class ImportLoadsResponse {
	public $RequestErrors; // ArrayOfError
	public $RequestReport; // ArrayOfImportReport
}

class Error {
	public $ErrorMessage; // string
}

class ImportReport {
	public $IntegrationID; // int
	public $Success; // boolean
	public $ImportErrors; // ArrayOfError
	public $UpdateLoadsReports; // ArrayOfLoadReport
	public $AddLoadReports; // ArrayOfLoadReport
	public $DeleteLoadReports; // ArrayOfLoadReport
}

class LoadReport {
	public $Success; // boolean
	public $LoadErrors; // ArrayOfError
	public $LoadID; // string
}

class LoadImportPartialService {
	public $myImport; // ImportLoadsRequest
	
	public function __construct(ImportLoadsRequest $request){
		$this->myImport = $request;
	}
}

class ImportLoadsRequest {
	public $UserName; // string
	public $Password; // string
	public $Imports; // ArrayOfLoadImportPartial
	
	public function __construct($imports = array()){
		$this->UserName = Integration_Truckstop_Credentials::UserName;
		$this->Password = Integration_Truckstop_Credentials::Password;
		$this->Imports = $imports;
	}
}

class LoadImportPartial {
	public $IntegrationID = 0; // int
	public $UpdateLoads = array(); // ArrayOfImportLoad
	public $AddLoads = array(); // ArrayOfImportLoad
	public $DeleteLoads = array(); // ArrayOfString
	
	public function __construct($added = array(), $updated = array(), $deleted = array()){
		$this->IntegrationID = Integration_Truckstop_Credentials::IntegrationId;
		$this->AddLoads = $added;
		$this->UpdateLoads = $updated;
		$this->DeleteLoads = $deleted;
	}
	
	public function addLoad(ImportLoad $load){
		$this->AddLoads[] = $load;
	}
}

class LoadImportPartialServiceResponse {
	public $LoadImportPartialServiceResult; // ImportLoadsResponse
}

class GetImportedLoadsService {
	public $myLoadsRequest; // ImportedLoadsRequest

	public function __construct(ImportedLoadsRequest $request){
		$this->myLoadsRequest = $request;
	}
}

class ImportedLoadsRequest {
	public $IntegrationIDs; // ArrayOfInt
	public $UserName; // string
	public $Password; // string
	
	public function __construct(){
		$this->IntegrationIDs = array(Integration_Truckstop_Credentials::IntegrationId);
		$this->UserName = Integration_Truckstop_Credentials::UserName;
		$this->Password = Integration_Truckstop_Credentials::Password;
	}
}

class GetImportedLoadsServiceResponse {
	public $GetImportedLoadsServiceResult; // ImportedLoadsResponse
}

class ImportedLoadsResponse {
	public $RequestErrors; // ArrayOfError
	public $ImportedLoads; // ArrayOfImportedLoads
}

class ImportedLoads {
	public $Errors; // ArrayOfError
}


/**
 * ImportsWS class
 *
 * The Imports Web Service provides a SOAP interface for importing loads and trucks.
 *
 * @author    {author}
 * @copyright {copyright}
 * @package   {package}
 */
class ImportsWS extends SoapClient {

	private static $classmap = array(
                                    'LoadImportFullService' => 'LoadImportFullService',
                                    'ImportFullLoadsRequest' => 'ImportFullLoadsRequest',
                                    'LoadImportFull' => 'LoadImportFull',
                                    'ImportLoad' => 'ImportLoad',
                                    'LoadImportFullServiceResponse' => 'LoadImportFullServiceResponse',
                                    'ImportLoadsResponse' => 'ImportLoadsResponse',
                                    'Error' => 'Error',
                                    'ImportReport' => 'ImportReport',
                                    'LoadReport' => 'LoadReport',
                                    'LoadImportPartialService' => 'LoadImportPartialService',
                                    'ImportLoadsRequest' => 'ImportLoadsRequest',
                                    'LoadImportPartial' => 'LoadImportPartial',
                                    'LoadImportPartialServiceResponse' => 'LoadImportPartialServiceResponse',
                                    'GetImportedLoadsService' => 'GetImportedLoadsService',
                                    'ImportedLoadsRequest' => 'ImportedLoadsRequest',
                                    'GetImportedLoadsServiceResponse' => 'GetImportedLoadsServiceResponse',
                                    'ImportedLoadsResponse' => 'ImportedLoadsResponse',
                                    'ImportedLoads' => 'ImportedLoads',
	);

	public function ImportsWS($wsdl = "http://importsws.truckstop.com/LoadsImportsWS.asmx?wsdl", $options = array()) {
		foreach(self::$classmap as $key => $value) {
			if(!isset($options['classmap'][$key])) {
				$options['classmap'][$key] = $value;
			}
		}
		parent::__construct($wsdl, $options);
	}

	/**
	 * Updates all of the Importer's Loads in the system
	 *
	 * @param LoadImportFullService $parameters
	 * @return LoadImportFullServiceResponse
	 */
	public function LoadImportFullService(LoadImportFullService $parameters) {
		return $this->__soapCall('LoadImportFullService', array($parameters),       array(
            'uri' => 'http://Truckstop.com/webservices',
            'soapaction' => ''
            )
            );
	}

	/**
	 * Add, Update, and Delete specific loads in the system
	 *
	 * @param LoadImportPartialService $parameters
	 * @return LoadImportPartialServiceResponse
	 */
	public function LoadImportPartialService(LoadImportPartialService $parameters) {
		return $this->__soapCall('LoadImportPartialService', array($parameters),       array(
            'uri' => 'http://Truckstop.com/webservices',
            'soapaction' => ''
            )
            );
	}

	/**
	 * Get Imported loads by Integration ID
	 *
	 * @param GetImportedLoadsService $parameters
	 * @return GetImportedLoadsServiceResponse
	 */
	public function GetImportedLoadsService(GetImportedLoadsService $parameters) {
		return $this->__soapCall('GetImportedLoadsService', array($parameters),       array(
            'uri' => 'http://Truckstop.com/webservices',
            'soapaction' => ''
            )
            );
	}

}

?>
