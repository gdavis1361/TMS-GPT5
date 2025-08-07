<?php 
/**
 * @author Reid Workman
 */

class GeoData extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = '';

	public function lookup_zip( $nZipCode ) {
		
		if ( empty($nZipCode) ) return false;
		
		$this->connect();
		$oRes = $this->db->query("
			SELECT * 
			FROM [ContractManager].[dbo].[ZipsPostalCodes" . (strlen($nZipCode) == 5 ? "US" : "CAN") . "] info 
			WHERE
				info.Zip = '".$nZipCode."'
			ORDER BY
				info.Seq ASC
		");
		
		if ( $this->db->num_rows($oRes) > 0 ) {
			$oRow = $this->db->fetch_object( $oRes );
			return $oRow;
		}
		
		return false;
	}
	
	public function lookup_zip_by_city( $sCity, $sState, $obj=false ) {
		
		if ( empty($sCity ) ) return false;
		if ( empty($sState) ) return false;
		
		$sCity  = strtoupper($sCity);
		$sState = strtoupper($sState);
		
		$aCanada = array("AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "PQ", "SK", "YT");
		$aUSA = array("AA", "AE", "AK", "AL", "AP", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MP", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "PW", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY");
		
		$sTable = "ZipsPostalCodes";
		if ( in_array($sState, $aUSA) ) $sTable .= "US";
		else if ( in_array($sState, $aCanada) ) $sTable .= "CAN";
		$this->connect();
		$s = "
			SELECT us.Zip, us.Seq, us.State, us.City
			FROM [ContractManager].[dbo].[" . $sTable ."] us 
			WHERE
					UPPER(us.City) LIKE '".$this->db->escape($sCity)."%'
				AND UPPER(us.State) = '".$this->db->escape($sState)."'
			ORDER BY
				us.Seq ASC
		";
		$oRes = $this->db->query($s);
		
		if ( $this->db->num_rows($oRes) > 0 ) {
			$oRow = $this->db->fetch_object( $oRes );
			return $obj ? $oRow : $oRow->Zip;
		}
		
		return false;
	}

	public function make_state_list($sName, $sDefault='', $sId=''){
		
		$sql = "SELECT [StateCode] FROM [ContractManager].[dbo].[StateTable]";
		$this->connect();
		$oRes = $this->db->query($sql);
		$sReturn = "<select id='" . $sId . "' name='" . $sName . "' >\n<option value=''>--</option>";
		if ( $this->db->num_rows($oRes) > 0 ) {
			while( $oRow = $this->db->fetch_object( $oRes ) ) {
				$sReturn .= "\t<option value='". $oRow->StateCode . "'>$oRow->StateCode</option>\n";
			}
		}
		return $sReturn . "</select>";
	}
	
	/**
	 * Returns an associative array of stateCode => stateName for US states, Canada, and Mexico
	 * @return array 
	 */
	public static function getStateList() {
		$states = array(
			'AL'=>"Alabama",
			'AK'=>"Alaska",  
			'AZ'=>"Arizona",  
			'AR'=>"Arkansas",  
			'CA'=>"California",  
			'CO'=>"Colorado",  
			'CT'=>"Connecticut",  
			'DE'=>"Delaware",  
			'DC'=>"District Of Columbia",  
			'FL'=>"Florida",  
			'GA'=>"Georgia",  
			'HI'=>"Hawaii",  
			'ID'=>"Idaho",  
			'IL'=>"Illinois",  
			'IN'=>"Indiana",  
			'IA'=>"Iowa",  
			'KS'=>"Kansas",  
			'KY'=>"Kentucky",  
			'LA'=>"Louisiana",  
			'ME'=>"Maine",  
			'MD'=>"Maryland",  
			'MA'=>"Massachusetts",  
			'MI'=>"Michigan",  
			'MN'=>"Minnesota",  
			'MS'=>"Mississippi",  
			'MO'=>"Missouri",  
			'MT'=>"Montana",
			'NE'=>"Nebraska",
			'NV'=>"Nevada",
			'NH'=>"New Hampshire",
			'NJ'=>"New Jersey",
			'NM'=>"New Mexico",
			'NY'=>"New York",
			'NC'=>"North Carolina",
			'ND'=>"North Dakota",
			'OH'=>"Ohio",  
			'OK'=>"Oklahoma",  
			'OR'=>"Oregon",  
			'PA'=>"Pennsylvania",  
			'RI'=>"Rhode Island",  
			'SC'=>"South Carolina",  
			'SD'=>"South Dakota",
			'TN'=>"Tennessee",  
			'TX'=>"Texas",  
			'UT'=>"Utah",  
			'VT'=>"Vermont",  
			'VA'=>"Virginia",  
			'WA'=>"Washington",  
			'WV'=>"West Virginia",  
			'WI'=>"Wisconsin",  
			'WY'=>"Wyoming",
			'AB'=>"Alberta",
			'BC'=>"British Columbia",
			'MB'=>"Manitoba",
			'NB'=>"New Brunswick",
			'NL'=>"Newfoundland and Labrador",
			'NT'=>"Northwest Territories",
			'NS'=>"Nova Scotia",
			'NU'=>"Nunavut",
			'PE'=>"Prince Edward Island",
			'SK'=>"Saskatchewan",
			'ON'=>"Ontario",
			'QC'=>"Quebec",
			'YT'=>"Yukon",
			'MX'=>"Mexico"
		);
		$stateArray = array();
		foreach ($states as $stateCode => $stateName) {
			$stateArray[] = array(
				'stateCode' => $stateCode,
				'stateName' => $stateName
			);
		}
		return $stateArray;
	}
	
	public function get_state_list(){
		return array('AL'=>"Alabama",
                'AK'=>"Alaska",  
                'AZ'=>"Arizona",  
                'AR'=>"Arkansas",  
                'CA'=>"California",  
                'CO'=>"Colorado",  
                'CT'=>"Connecticut",  
                'DE'=>"Delaware",  
                'DC'=>"District Of Columbia",  
                'FL'=>"Florida",  
                'GA'=>"Georgia",  
                'HI'=>"Hawaii",  
                'ID'=>"Idaho",  
                'IL'=>"Illinois",  
                'IN'=>"Indiana",  
                'IA'=>"Iowa",  
                'KS'=>"Kansas",  
                'KY'=>"Kentucky",  
                'LA'=>"Louisiana",  
                'ME'=>"Maine",  
                'MD'=>"Maryland",  
                'MA'=>"Massachusetts",  
                'MI'=>"Michigan",  
                'MN'=>"Minnesota",  
                'MS'=>"Mississippi",  
                'MO'=>"Missouri",  
                'MT'=>"Montana",
                'NE'=>"Nebraska",
                'NV'=>"Nevada",
                'NH'=>"New Hampshire",
                'NJ'=>"New Jersey",
                'NM'=>"New Mexico",
                'NY'=>"New York",
                'NC'=>"North Carolina",
                'ND'=>"North Dakota",
                'OH'=>"Ohio",  
                'OK'=>"Oklahoma",  
                'OR'=>"Oregon",  
                'PA'=>"Pennsylvania",  
                'RI'=>"Rhode Island",  
                'SC'=>"South Carolina",  
                'SD'=>"South Dakota",
                'TN'=>"Tennessee",  
                'TX'=>"Texas",  
                'UT'=>"Utah",  
                'VT'=>"Vermont",  
                'VA'=>"Virginia",  
                'WA'=>"Washington",  
                'WV'=>"West Virginia",  
                'WI'=>"Wisconsin",  
                'WY'=>"Wyoming",
				'AB'=>"Alberta",
				'BC'=>"British Columbia",
				'MB'=>"Manitoba",
				'NB'=>"New Brunswick",
				'NL'=>"Newfoundland and Labrador",
				'NT'=>"Northwest Territories",
				'NS'=>"Nova Scotia",
				'NU'=>"Nunavut",
				'PE'=>"Prince Edward Island",
				'SK'=>"Saskatchewan",
				'ON'=>"Ontario",
				'QC'=>"Quebec",
				'YT'=>"Yukon",
				'MX'=>"Mexico"
		);
	}
	
	function make_state_list_full($sName, $sDefault = '', $sId = ''){
		$aStateList = $this->get_state_list();
		$sReturn = "<select id='" . $sId . "' name='" . $sName . "' >\n<option value=''>--</option>";
		foreach ($aStateList as $key => $value){
			$sReturn .= "\t<option value='". $key . "'>$value</option>\n";
		}
		return $sReturn . "</select>";
	}
	
	public function get_lat_lon($nZipCode) {
		$this->connect();
		$oRes = $this->db->query('
			SELECT us.Lat, us.Long
			FROM [ContractManager].[dbo].[ZipsPostalCodesUS] us 
			WHERE
					us.Zip = ' . $this->db->escape($nZipCode) . '
		');
		
		if ( $this->db->num_rows($oRes) > 0 ) {
			$oRow = $this->db->fetch_object( $oRes );
			return $oRow;
		}
		
		return false;
	}
	
	public function radius_search($nZipCode, $nRadius) {
		$oLatLon = $this->get_lat_lon($nZipCode);
		
		$lat = $oLatLon->Lat;  // latitude of centre of bounding circle in degrees
		$lon = $oLatLon->Long;  // longitude of centre of bounding circle in degrees
		$rad = $nRadius;  // radius of bounding circle in miles

		$R = 3959;  // earth's radius, miles

		// first-cut bounding box (in degrees)
		$maxLat = $lat + rad2deg($rad/$R);
		$minLat = $lat - rad2deg($rad/$R);
		// compensate for degrees longitude getting smaller with increasing latitude
		$maxLon = $lon + rad2deg($rad/$R/cos(deg2rad($lat)));
		$minLon = $lon - rad2deg($rad/$R/cos(deg2rad($lat)));

		// convert origin of filter circle to radians
		$lat = deg2rad($lat);
		$lon = deg2rad($lon);

		$sql = "SELECT FirstCut.*, 
				acos(sin($lat)*sin(radians(Lat)) + cos($lat)*cos(radians(Lat))*cos(radians(Long) - ($lon) ))*$R as D
				FROM (
					Select Zip, Lat, Long, City, State
					FROM [ContractManager].dbo.ZipsPostalCodesUS
					WHERE Lat>$minLat AND Lat<$maxLat
					AND Long>$minLon AND Long<$maxLon
				) As FirstCut 
				WHERE acos(sin($lat)*sin(radians(Lat)) + cos($lat)*cos(radians(Lat))*cos(radians(Long) - ($lon) ))*$R < $rad
				ORDER by D";

		$res = $this->query($sql);
		
		$a = array();
		while ($row = $this->db->fetch_object($res) ){
			$a[] = $row;
		}
		
		return $a;
	}
}
