<?php

/**
 * Carrier 411
 *
 * @author Kelvin White
 */

class Carrier411 extends DBModel {

    var $m_sClassName = __CLASS__;
    var $m_sTableName = 'carrier_411';
    var $client = null;
    var $sBaseUrl = 'http://65.97.168.10/';
    var $sLoginUrl = 'wsLogin.cfc?wsdl';
    var $sCompanyUrl = 'wsGetCompany.cfc?wsdl';
    var $sInsAuthUrl = 'wsGetInsAuth.cfc?wsdl';
    var $sSafetyDateUrl = 'wsSafetyDate.cfc?wsdl';
    var $sSafetyUpdatesUrl = 'wsGetSafetyUpdates.cfc?wsdl';
    var $sAllSafetyUrl = 'wsGetAllSafety.cfc?wsdl';
    var $sSmsDateUrl = 'wsSMSDate.cfc?wsdl';
    var $sAllSmsUrl = 'wsGetAllSMS.cfc?wsdl';
    var $sStartMonUrl = 'wsStartMonitoring.cfc?wsdl';
    var $sStopMonUrl = 'wsStopMonitoring.cfc?wsdl';
    var $sGetInsPolUrl = 'wsGetInsPols.cfc?wsdl';
    var $sGetStatusUrl = 'wsGet411Status.cfc?wsdl';
    var $sGetDocketUrl = 'wsGetDocketList.cfc?wsdl';
    var $sGetAuthUrl = 'wsGetAllAuth.cfc?wsdl';
    var $sInsAuthDateTimeUrl = 'wsInsAuthDateTime.cfc?wsdl';
    var $aOptions = array("trace" => 1, "exceptions" => 0);
	
	const SessionType = 1;
	const InsuranceType = 2;
	const SafetyRatingType = 3;
	const SMSType = 4;
	
	var $sUsername = "testpost";
	var $sPassword = "lamppost";

    public function create($sSessionId=false) { 		
		if (!$sSessionId) $sSessionId = $this->session_id();
		$this->unload();

        $key = __CLASS__ . '::' . __METHOD__;

        //Validate
        if ( !isset($sSessionId) ) return false;
        
        //Save
        $this->set_value($sSessionId);
		$this->set("type", Carrier411::SessionType);
        $this->save();
        
        return true;
    }

    public function __construct() {
        $url = $this->sBaseUrl . $this->sLoginUrl;
        $this->client = new soapclient($url, $this->aOptions);
    }

    public function login($sUser, $sPass) {
        $aParam = array('param1' => $sUser, 'param2' => $sPass);
        try {
            $funcRet = $this->client->__call("Login", $aParam);
//			error_log(print_r($funcRet, 1));
			return $funcRet;
        } catch (SoapFault $e) {
            error_log( '(login) SOAP Error: - ' . $e->getMessage() );
        }
    }

    public function get_company($nDocketNum, $sSessionId=false) { 		
		if (!$sSessionId) $sSessionId = $this->session_id();
        $url = $this->sBaseUrl . $this->sCompanyUrl;
        $this->client = new soapclient($url, $this->aOptions);
        $aParams = array($nDocketNum, $sSessionId);
        return $this->client->__call("checkcompany", $aParams);
    }

    public function get_ins_auth($nDays, $sSessionId=false) { 		
		if (!$sSessionId) $sSessionId = $this->session_id();
        $url = $this->sBaseUrl . $this->sInsAuthUrl;
        $this->client = new soapclient($url, $this->aOptions);
        $aParams = array($nDays, $sSessionId);
        return $this->client->__call("insuranceauthority", $aParams);
    }

    public function get_safety_date($sSessionId=false) { 		
		if (!$sSessionId) $sSessionId = $this->session_id();
        $url = $this->sBaseUrl . $this->sSafetyDateUrl;
        $this->client = new soapclient($url, $this->aOptions);
        $aParams = array($sSessionId);
        return $this->client->__call("safetydate", $aParams);
    }

    public function get_safety_updates($sSessionId=false) { 		
		if (!$sSessionId) $sSessionId = $this->session_id();
        $url = $this->sBaseUrl . $this->sSafetyUpdatesUrl;
        $this->client = new soapclient($url, $this->aOptions);
        $aParams = array($sSessionId);
        return $this->client->__call("checksafetyupdates", $aParams);
    }

    public function get_all_safety($sSessionId=false) {
		if (!$sSessionId) $sSessionId = $this->session_id();
        $url = $this->sBaseUrl . $this->sAllSafetyUrl;
        $this->client = new soapclient($url, $this->aOptions);
        $aParams = array($sSessionId);
        return $this->client->__call("checkallsafety", $aParams);
    }

    public function get_sms_date($sSessionId=false) { 		
		if (!$sSessionId) $sSessionId = $this->session_id();
        $url = $this->sBaseUrl . $this->sSmsDateUrl;
        $this->client = new soapclient($url, $this->aOptions);
        $aParams = array($sSessionId);
        return $this->client->__call("smsdate", $aParams);
    }

    public function get_all_sms($sSessionId=false) { 		
		if (!$sSessionId) $sSessionId = $this->session_id();
        $url = $this->sBaseUrl . $this->sAllSmsUrl;
        $this->client = new soapclient($url, $this->aOptions);
        $aParams = array($sSessionId);
        return $this->client->__call("checkallsms", $aParams);
    }

    public function start_monitoring($nDocketNum, $sSessionId=false) {
		if (!$sSessionId) $sSessionId = $this->session_id ();
		
        $url = $this->sBaseUrl . $this->sStartMonUrl;
        $this->client = new soapclient($url, $this->aOptions);
        $aParams = array($nDocketNum, $sSessionId);
        return $this->client->__call("startmonitoring", $aParams);
    }

    public function stop_monitoring($nDocketNum, $sSessionId=false) { 		
		if (!$sSessionId) $sSessionId = $this->session_id();
        $url = $this->sBaseUrl . $this->sStopMonUrl;
        $this->client = new soapclient($url, $this->aOptions);
        $aParams = array($nDocketNum, $sSessionId);
        return $this->client->__call("stopmonitoring", $aParams);
    }

    public function get_ins_pol($nDocketNum, $sSessionId=false) { 		
		if (!$sSessionId) $sSessionId = $this->session_id();
        $url = $this->sBaseUrl . $this->sGetInsPolUrl;
        $this->client = new soapclient($url, $this->aOptions);
        $aParams = array($nDocketNum, $sSessionId);
        return $this->client->__call("activeinsurance", $aParams);
    }

    public function get_411_status($nDocketNum, $sSessionId=false) { 		
		if (!$sSessionId) $sSessionId = $this->session_id();
        $url = $this->sBaseUrl . $this->sGetStatusUrl;
        $this->client = new soapclient($url, $this->aOptions);
        $aParams = array($nDocketNum, $sSessionId);
        return $this->client->__call("checkmonitoring", $aParams);
    }
    
    public function get_docket_list($sSessionId=false) {
		if (!$sSessionId) $sSessionId = $this->session_id();
        $url = $this->sBaseUrl . $this->sGetDocketUrl;
        $this->client = new soapclient($url, $this->aOptions);
        $aParams = array($sSessionId);
        return $this->client->__call("getlist", $aParams);
    }

    public function get_all_auth($sSessionId=false) { 		
		if (!$sSessionId) $sSessionId = $this->session_id();
        $url = $this->sBaseUrl . $this->sGetAuthUrl;
        $this->client = new soapclient($url, $this->aOptions);
        $aParams = array($sSessionId);
        return $this->client->__call("getallauthority", $aParams);
    }

    public function get_ins_auth_date_time($sSessionId=false) { 		
		if (!$sSessionId) $sSessionId = $this->session_id();
        $url = $this->sBaseUrl . $this->sInsAuthDateTimeUrl;
        $this->client = new soapclient($url, $this->aOptions);
        $aParams = array($sSessionId);
        return $this->client->__call("insauthdatetime", $aParams);
    }

    public function get_session_uuid($aSessionId) {
        $sSessionId = explode(' ', $aSessionId, 32);
        $aSplit = preg_split("/((\r(?!\n))|((?<!\r)\n)|(\r\n))/", $sSessionId[31]);
        return substr($aSplit[0], 33, -8);
    }

    public function last_response() {
        $aResponse = $this->client->__last_response;
        return $aResponse;
    }

	public function session_id(){
		$s = "SELECT TOP 1 * FROM carrier_411
				WHERE type = '" . Carrier411::SessionType . "'
				ORDER BY created_at DESC";

		$o = (object)LP_Db::fetchRow($s);
		
		if ( date('Y-m-d', strtotime($o->created_at)) !== date('Y-m-d') ) {
			$a = $this->login($this->sUsername, $this->sPassword);
			if (isset($a['SESSIONUUID']) && !empty($a['SESSIONUUID'])){
				$this->create($a['SESSIONUUID']);
				return $a['SESSIONUUID'];
			}else{
				// BAD SESSION ID, FAILED TO LOGIN
				error_log('Carrier411 session is bad. and login seems to have failed. Login returned: ');
				error_log(var_dump($a,1));
			}
		}
		return $o->value;
	}

    public function __destruct(){
        unset($this->client);
    }
	
	public function insertRecord($nType){
		$this->unload();
		$this->set('type', $nType);
		$this->save();
	}
	
	public function getLastUpdate($nType) {
		$s = "SELECT TOP 1 * FROM carrier_411
				WHERE type = '" . $nType . "'
				ORDER BY created_at DESC";

		$o = (object)LP_Db::fetchRow($s);
		return $o->created_at ;
	}
	
	private function calcInsuranceDays(){
		$a = $this->get_ins_auth_date_time( $this->session_id() );
		
		$c411Date = new DateTime($a['INSAUTHDATELASTUPDATED']);
		$ourDate = new DateTime( $this->getLastUpdate(self::InsuranceType) );
		if ( $c411Date > $ourDate ) {
			$nDays = $c411Date->diff($ourDate)->d;
			return $nDays;
		}else{
			return 0;
		}
	}
	
	private function calcSMSDays() {
		$a = $this->get_sms_date( $this->session_id() );
		
		$c411Date = new DateTime( $a['SMSLASTUPDATED'] );
		$ourDate = new DateTime( $this->getLastUpdate(self::SMSType) );
		if ( $c411Date > $ourDate ) {
			$nDays = $c411Date->diff($ourDate)->d;
			return $nDays;
		}else{
			return 0;
		}
	}
	
	public function calcSafetyDays() {
		$a = $this->get_safety_date( $this->session_id() );
		
		$c411Date = new DateTime($a['SAFETYLASTUPDATED']);
		$ourDate = new DateTime( $this->getLastUpdate(self::SafetyRatingType) );
		if ( $c411Date > $ourDate ) {
			$nDays = $c411Date->diff($ourDate)->d;
			return $nDays;
		}else{
			// No days
			return 0;
		}
	}
	
	public function updateInsurance() {
		$nInsuranceDays = $this->calcInsuranceDays();
		$nSMSDays = $this->calcSMSDays();
		$nSafetyDays = $this->calcSafetyDays();
		
		$nDays = max( array($nInsuranceDays, $nSMSDays, $nSafetyDays) );
		if ($nDays > 7) $nDays = 7; //max allowed.
		if (!$nDays) return;
		
		$this->insertRecord(self::InsuranceType);
		$this->insertRecord(self::SMSType);
		$this->insertRecord(self::SafetyRatingType);
		return $this->get_ins_auth($nDays, $this->session_id());
		
	}
}
