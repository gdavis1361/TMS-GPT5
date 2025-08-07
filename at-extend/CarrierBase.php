<?php 
/**
 * Carrier Base -- Class ALIAS for Contract Manager's `CarrierMaster` table
 *
 * @author Reid Workman
 */
 
class CarrierBase extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sDatabase = 'ContractManager';
	var $m_sTableName = 'CarrierMaster';
	public $fireEvents = true;

	public function create(	$sName, $sMcNumber, $sSafetyRating, $sSafetyRatingDate, $sCommonAuthority, 
							$sContractAuthority, $sBrokerAuthority, $nCreatedById ) {
		
		$key = __CLASS__ . '::' . __METHOD__;
		// Validate Data
		if ( !is_string($sName) || !strlen($sName) ) {
			add_error("Missing String - $sName", $key);
			$this->addError("Name is required");
		}
		if ( !is_string($sMcNumber) || !strlen($sMcNumber) ) {
			add_error('Missing String - $sMcNumber', $key);
			$this->addError("MC Number is required");
		}
		if ( !is_string($sSafetyRating) ) {
			add_error('missing string - ' . $sSafetyRating, $key);
			return FALSE;
		}
		if ( !is_string($sSafetyRatingDate) ) {
			add_error('Missing String - '.var_dump($sSafetyRatingDate), $key);
			return FALSE;
		}
		if ( !is_string($sCommonAuthority) ) {
			add_error('missing string - $nCommonAuthority', $key);
			return FALSE;
		}
		if ( !is_string($sContractAuthority) ) {
			add_error('missing string - $nContractAuthority', $key);
			return FALSE;
		}
		if ( !is_string($sBrokerAuthority) ) {
			add_error('missing string - $nBrokerAuthority', $key);
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('missing numeric - $nCreatedById', $key);
			return FALSE;
		}
		
		//Check if this mc already exists
		$ext = new CarrierBaseExtended();
		$ext->load(array(
			"mc_no" => $sMcNumber
		));
		if($ext->get('carrier_id')){
			$this->addError("This carrier is already in the system");
		}
		
		if($this->anyErrors()){
			return false;
		}
		
		// Save Data
		$sName = LP_Db::escape($sName);
		$createdByName ='';
		if(get_user()){
			$createdByName = get_user()->get_Contact()->get_FirstLastName();
		}
		$this->connect();
		$s = "
		INSERT INTO [ContractManager].[dbo].[CarrierMaster]
			(CarrInsEnforce,CarrHazmat,CarrCWT,CarrHazmatCont,CarrCreatedBy,CarrDateCreated,CarrDateLastEdit,CarrMode,CarrName) 
			VALUES ('0' , '0' , '0' , '0' , '$createdByName' , '". date('Y-m-d')."' , '". date('Y-m-d')."' , '1' , '". $sName ."');
			
			SELECT @@IDENTITY AS ID;";
		$oRes = $this->query($s);
		
		if ( $oRes ) {
			$oRow = $this->db->fetch_object($oRes);
			$nCarrierId = $oRow->ID;
		}
		if ( !$nCarrierId || !is_numeric($nCarrierId) ) {
			add_error('Invalid Insert ID from CarrierMaster', $key);
			return FALSE;
		}
		$o = new CarrierBaseExtended();
		
		$nCommonAuthority = $sCommonAuthority == 'A' ? 1 : 0;
		$nContractAuthority = $sContractAuthority == "A" ? 1 : 0;
		$nBrokerAuthority = $sBrokerAuthority == "A" ? 1 : 0;
		
		$this->set('carrier_id', $nCarrierId);
		return $o->create( $nCarrierId, $sMcNumber, $sSafetyRating, $sSafetyRatingDate, $nCommonAuthority,
							$nContractAuthority, $nBrokerAuthority,	$nCreatedById );
	}

    function get_carrier_id($sName) {
        $sSql = "
            SELECT
                cm.CarrID
            FROM
                [ContractManager].[dbo].[CarrierMaster] cm
            WHERE
                cm.CarrName = '".$sName."'
            ";
        $this->connect();
        $oRes = $this->db->query( $sSql );
        
        while ( $oRow = $this->db->fetch_object( $oRes ) ) {
        	
            return $nCarrierId = $oRow->CarrID;
            
        }               
    }

    function list_carriers() {
        $aCarrierIds = array();

        $sSql = "
            SELECT
                cm.CarrID
            FROM
                [ContractManager].[dbo].[CarrierMaster] cm
            WHERE
                1 = 1
            ";
        $this->connect();
        $oRes = $this->db->query( $sSql );

        while ( $oRow = $this->db->fetch_object( $oRes ) ) {
            $aCarrierIds[] = $oRow->CarrID;
        }

        return $aCarrierIds;
    }

    function get_carrier_by_id( $nId ) {

        if ( !is_numeric($nId) ) return FALSE;

        $sSql = "
            SELECT
                cm.*
            FROM
                [ContractManager].[dbo].[CarrierMaster] cm
			LEFT JOIN [TMS].[dbo].[carrier_base_extended] cex ON ( cex.carrier_id = cm.CarrID )
            WHERE
                cm.CarrID = ".$nId."
            ";

        $this->connect();
        $oRes = $this->db->query( $sSql );

        if ( $this->db->num_rows($oRes) > 0 ) {
			$oCarrierBaseExtended = new CarrierBaseExtended();
			$oCarrierBaseExtended->load( $nId );
            return (object) array_merge( $this->db->fetch_array( $oRes ), $oCarrierBaseExtended->get() );
        }

        return FALSE;
    }

	function get_locations_by_carrier_id( $nId ) {

        if ( !is_numeric($nId) ) return FALSE;

		$aResult = array();

		$oLocationToCarriers = new LocationToCarriers;
		$oLocationToCarriers->where( 'carrier_id', '=', $nId );
		$oResult = $oLocationToCarriers->list();
		$aRows = $oResult->rows;
		
		if ( count($aRows) ) {
			$oLocationBase = new LocationBase;

			foreach ( $aRows as $oCarrierLocation ) {
				$oLocationBase->load($oCarrierLocation->location_id);
				$aResult[] = $oLocationBase->get();
			}
		}

		return $aResult;
	}
	function get_contacts_by_carrier_id( $nId ) {

        if ( !is_numeric($nId) ) return FALSE;

		$aResult = array();
		
		$aLocations = $this->get_locations_by_carrier_id( $nId );

		$oContactBase = new ContactBase;
		$oContactMethods = new ContactMethods;
		$oLocationToContact = new LocationToContact;
		foreach ( $aLocations as $aLocation ) {
			$oLocationToContact->where( 'location_id', '=', $aLocation->location_id );
			$oResult = $oLocationToContact->list();
			$aRows = $oResult->rows;

			foreach ( $aRows as $oLocationContactId ) {
				$oContactBase->load( $oLocationContactId->contact_id );
				$oResultData = $oContactBase->get_contact( $oLocationContactId->contact_id );
				$aResult[] = $oResultData;
			}
		}
		if ( count($aLocations) ) {
			$oLocationBase = new LocationBase;

			foreach ( $aRows as $oCarrierLocation ) {
				$oLocationBase->load($oCarrierLocation->location_id);
				$aResult[] = $oLocationBase->get();
			}
		}

		return $aResult;
	}
	
	function find_carriers_by_zip($aZips){
		if (!is_array($aZips)) $aZips = array((int)$aZips);
		
		$this->connect();
		
		$s = "
			SELECT rel.carrier_id, loc.*, geo.*
			FROM TMS.dbo.location_to_carriers rel
			LEFT JOIN TMS.dbo.location_base loc ON loc.location_id = rel.location_id
			LEFT JOIN ContractManager.dbo.ZipsPostalCodesUS geo ON geo.Zip = loc.zip
			WHERE 
				loc.zip IN ( " . implode(", ", $aZips) . ")
			";
		$res = $this->query($s);
		$aLocations = array();
		$aCarrierIds = array();
		$aLocationIds = array();
		while ($row = $this->db->fetch_object($res)) {
			if (!in_array($row->location_id, $aLocationIds) ) {
				$aLocations[$row->carrier_id][] = $row;
				$aLocationIds[] = $row->location_id;
			}
			if (!in_array($row->carrier_id, $aCarrierIds) ) $aCarrierIds[] = $row->carrier_id;
		}
		
		if (empty($aCarrierIds)) return array(); 
		
		$s = "
			SELECT master.CarrName as carrier_name, master.CarrSCAC as scac,
					carrier.*
			FROM ContractManager.dbo.CarrierMaster master 
			LEFT JOIN TMS.dbo.carrier_base_extended carrier ON carrier.carrier_id = master.CarrID
			WHERE master.CarrID IN (" . implode(", ", $aCarrierIds) . ")";
		$res = $this->query($s);
		$a = array();
		while ($row = $this->db->fetch_object($res)) {
			$o = new stdClass();
			
			$o->carrier = $row;
			$o->locations = empty($aLocations[$row->carrier_id]) ? array() : $aLocations[$row->carrier_id];
			$a[] = $o;
		}
		
		return $a;
	}

	/*
	 * arr SearchParams
	 *	NAME
	 *	PHONE
	 *	EMAIL
	 *	MCNUMBER
	 */
	function search_carriers( $aSearchParams ) {

		if ( !is_array($aSearchParams) ) {
			$aQuery = array();
			$aQuery['NAME']     = $aSearchParams;
			$aQuery['SCAC']     = $aSearchParams;
			$aQuery['PHONE']    = $aSearchParams;
			$aQuery['EMAIL']    = $aSearchParams;
			$aQuery['MCNUMBER'] = $aSearchParams;
			$aSearchParams = $aQuery;
		}

        $aCarrierIds = array();

		// Validate Name
		if ( !isset($aSearchParams['NAME']) ) {
			$aSearchParams['NAME'] = FALSE;
		} else {
			$aSearchParams['NAME'] = trim($aSearchParams['NAME']);
			if ( strlen($aSearchParams['NAME']) == 0 || is_numeric( preg_replace('/[^A-Za-z0-9]/', '', $aSearchParams['NAME']) ) ) {
				$aSearchParams['NAME'] = FALSE;
			}
			if(!strlen($aSearchParams['NAME'])){
				$aSearchParams['NAME'] = false;
			}
		}
		// Validate SCAC (4 characters)
		if ( !isset($aSearchParams['SCAC']) ) {
			$aSearchParams['SCAC'] = FALSE;
		} else {
			$aSearchParams['SCAC'] = trim($aSearchParams['SCAC']);
			if ( strlen($aSearchParams['SCAC']) != 4 || is_numeric( preg_replace('/[^A-Za-z0-9]/', '', $aSearchParams['SCAC']) ) ) {
				$aSearchParams['SCAC'] = FALSE;
			}
		}

		// Validate Phone
		if ( !isset($aSearchParams['PHONE']) ) {
			$aSearchParams['PHONE'] = FALSE;
		} else {
			$aSearchParams['PHONE'] = trim($aSearchParams['PHONE']);
			if ( strlen($aSearchParams['PHONE']) == 0 || !is_numeric(preg_replace('/[^A-Za-z0-9]/', '', $aSearchParams['PHONE'])) || strlen(preg_replace('/[^0-9]/', '', $aSearchParams['PHONE'])) < 6 ) {
				$aSearchParams['PHONE'] = FALSE;
			}else{
				$aSearchParams['PHONE'] = preg_replace('/[^0-9]/', '', $aSearchParams['PHONE']);
			}
		}

		// Validate Email
		if ( !isset($aSearchParams['EMAIL']) ) {
			$aSearchParams['EMAIL'] = FALSE;
		} else {
			$aSearchParams['EMAIL'] = trim($aSearchParams['EMAIL']);
			if ( strlen($aSearchParams['EMAIL']) == 0 || strpos($aSearchParams['EMAIL'],' ') > 0 || !check_email( $aSearchParams['EMAIL'] ) ) {
				$aSearchParams['EMAIL'] = FALSE;
			}
		}

		// Validate MC Number
		if ( !isset($aSearchParams['MCNUMBER']) ) {
			$aSearchParams['MCNUMBER'] = FALSE;
		} else {
			$aSearchParams['MCNUMBER'] = trim($aSearchParams['MCNUMBER']);
			if(strtolower(substr($aSearchParams['MCNUMBER'], 0, 2)) == "mc"){
				$aSearchParams['MCNUMBER'] = substr($aSearchParams['MCNUMBER'], 2, -2);
			}
			if(!intval($aSearchParams['MCNUMBER'])){
				$aSearchParams['MCNUMBER'] = false;
			}
		}

		
		// Searches
		// Name Search
		if ( $aSearchParams['NAME'] || $aSearchParams['SCAC'] || $aSearchParams['MCNUMBER']) {
			$this->connect();


			//Search by name code
			$sWhere = '';
			if($aSearchParams['NAME']){
				$aWords = explode( ' ', $aSearchParams['NAME'] );
				foreach ( $aWords as $nKey => $sWord ) {
					$sWord = strtolower( $sWord );
					$aWords[$nKey] = " ( lower(CarrName) LIKE '%". $this->db->escape( $sWord ) ."%' ) ";
				}
				$sWhere = implode( ' AND ', $aWords );
			}

			
			//Search by scac
			if ( $aSearchParams['SCAC'] && strlen($aSearchParams['SCAC']) ) {
				if ( strlen( $sWhere ) > 0 ) {
					$sWhere .= ' OR ';
				}
				$sWhere .= " lower(CarrSCAC) = '". $this->db->escape( $aSearchParams['SCAC'] ) ."' ";
			}
			
			//Search by mc number
			if ( $aSearchParams['MCNUMBER'] ) {
				if ( strlen( $sWhere ) > 0 ) {
					$sWhere .= ' OR ';
				}
				$sWhere .= " cbe.mc_no LIKE '". $this->db->escape($aSearchParams['MCNUMBER'] ) ."%' ";
			}

			$sSql = "
				SELECT
					cm.CarrID
				FROM
					[ContractManager].[dbo].[CarrierMaster] cm
				LEFT JOIN
					[TMS].[dbo].[carrier_base_extended] cbe
				ON 
					cbe.carrier_id = cm.CarrId
				WHERE
					". $sWhere ;
			$oRes = $this->db->query( $sSql );
			//echo $sSql; die();
			// Set Found Carrier Ids
			while ( $oRow = $this->db->fetch_object( $oRes ) ) {
				$aCarrierIds[$oRow->CarrID] = $oRow->CarrID;
			}

		}
		
		// Phone and Email Search based on Contact Data
		/*
		if ( $aSearchParams['PHONE'] || $aSearchParams['EMAIL'] ) {
			$oCarrierExtended = new CarrierBaseExtended;
			$oCarrierExtended->where( 'contact_value_1', '=', array($aSearchParams['PHONE'], $aSearchParams['EMAIL']) );
			$oCarriers = $oCarrierExtended->list()->rows;
			foreach( $oCarriers as $oCarrier ) {
				$aCarrier = $oCarrier->get();
				$aCarrierIds[$aCarrier['carrier_id']] = $aCarrier['carrier_id'];
			}
		}
		*/
		// MC Number based on extended carrier data
		if ( $aSearchParams['MCNUMBER'] ) {
			$oCarrierExtended = new CarrierBaseExtended;
			$oCarrierExtended->where( 'mc_no', '=', $aSearchParams['MCNUMBER'] );
			$oCarriers = $oCarrierExtended->list()->rows;
			foreach( $oCarriers as $oCarrier ) {
				$aCarrier = $oCarrier->get();
				$aCarrierIds[$aCarrier['carrier_id']] = $aCarrier['carrier_id'];
			}
		}

        return $aCarrierIds;
    }
	
	public function toXML(){
		if ( !$this->is_loaded() ) return false;
		
		$sXML = '
				<Vendor>
					<Addr1></Addr1>
					<Addr2></Addr2>
					<Attention></Attention>
					<City></City>
					<CorrectionNotice></CorrectionNotice>
					<Country></Country>
					<Box1099></Box1099>
					<Email></Email>
					<Fax></Fax>
					<VendorName></VendorName>
					<Phone></Phone>
					<RemitToAddr1></RemitToAddr1>
					<RemitToAddr2></RemitToAddr2>
					<RemitToAttention></RemitToAttention>
					<RemitToCity></RemitToCity>
					<RemitToCountry></RemitToCountry>
					<RemitToFax></RemitToFax>
					<RemitToName></RemitToName>
					<RemitToPhone></RemitToPhone>
					<RemitToSalutation></RemitToSalutation>
					<RemitToState></RemitToState>
					<RemitToZip></RemitToZip>
					<Salutation></Salutation>
					<State></State>
					<Status></Status>
					<Terms></Terms>
					<TaxIDNumber></TaxIDNumber>
					<Vendor1099></Vendor1099>
					<VendorID></VendorID>
					<Zip></Zip>
					<tstamp></tstamp>
				</Vendor>';
		return $sXML;
	}
    
}