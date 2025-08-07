<?php

class Carrier_LookupController extends AjaxController {

	public function carrierAction(){
		//Setup the db model
		$db = new DBModel();
		$db->connect();
		
		//Setup the filtering and query variables
		$searchQuery = request("query", "");
		$carrierId = intval(request('carrier_id', 0));
		$start = request("start", 0);
		$limit = request("limit", 10);
		$sort = array(
			'carrier_name ASC'
		);
		$where = "1=1";
		$filter = json_decode(request("filter", json_encode(array())), true);
		
		//Create all the fields
		$fields = array(
			'cm.CarrId carrier_id',
			'cm.CarrSCAC carrier_scac',
			'cm.CarrName carrier_name',
			'cbe.mc_no carrier_mc_no',
			'zips.Zip location_zip',
			'zips.City location_city',
			'zips.State location_state'
		);
		$distinctFields = array(
			'carrier_scac',
			'carrier_name',
			'carrier_mc_no',
			'location_zip',
			'location_city',
			'location_state'
		);
		$fields = implode(', ', $fields);
		$distinctFields = implode(', ', $distinctFields);

		
		//create the from
		$from = "ContractManager.dbo.CarrierMaster cm
			LEFT JOIN
				TMS.dbo.carrier_base_extended cbe
			ON 
				cbe.carrier_id = cm.CarrId
			LEFT JOIN
				location_to_carriers ltc
			ON
				ltc.carrier_id = cbe.carrier_id
			LEFT JOIN
				location_base lb
			ON
				lb.location_id = ltc.location_id
			LEFT JOIN
				[ContractManager].[dbo].[ZipsPostalCodesUS] zips
			ON
				zips.Zip = lb.zip";
		
		//Process the sort
		if(isset($_REQUEST['sort'])){
			$sort = array();
			$sortArray = json_decode($_REQUEST['sort'], true);
			foreach ($sortArray as $sortItem){
				$property = $sortItem['property'];
				$direction = $sortItem['direction'];
				switch($property){
					default:
						$sort[] = $sortItem['property'] . " " . $sortItem['direction'];
					break;
				}
			}
		}
		
		//Build the order/sort
		if(count($sort)){
			$sort = implode(",\n", $sort);
		}
		else{
			$sort = 'carrier_name ASC';
		}
		
		//Build the where
		if($carrierId){
			$where .= " AND cm.CarrId = '$carrierId'";
		}
		if(strlen($searchQuery)){
			$where .= $this->getSearchQueryWhere($searchQuery);
		}
		
		//Radius search
		if(isset($filter['radiusDistance']) && isset($filter['radiusZip'])){
			require_once EXTEND_DIR . '/GeoData.php';
			$geoData = new GeoData();
			$locations = $geoData->radius_search(intval($filter['radiusZip']), $filter['radiusDistance']);
			$zipCodes = array();
			foreach ($locations as $location){
				$zipCodes[] = $location->Zip;
			}
			$zipCodes = implode(', ', $zipCodes);
			$where .= " AND zips.Zip IN ($zipCodes)";
		}
		
		//Process any filters
		foreach ($filter as $key => $value) {
			if (!strlen($value)) {
				continue;
			}

			$cleanValue = LP_Db::escape($value);
			switch ($key) {
				case "state":
					$where .= " AND zips.State = '$cleanValue'";
				break;
				case "city":
					$where .= " AND zips.City LIKE '$cleanValue%'";
				break;
				case "zip":
					$where .= " AND zips.Zip LIKE '$cleanValue%'";
				break;
				case "name":
					$where .= " AND cm.CarrName LIKE '$cleanValue%'";
				break;
				case "mc":
					$where .= " AND cbe.mc_no LIKE '$cleanValue%'";
				break;
				case "scac":
					$where .= " AND cm.CarrSCAC LIKE '$cleanValue%'";
				break;
			}
		}
		
		//Get the total
		$query = "SELECT COUNT(*) total FROM $from WHERE $where";
		$result = $db->db->query($query);
		$records = array();
		while($row = $db->db->fetch_assoc($result) ) {
			$this->setParam("total", $row['total']);
		}

		//Run the query and get the results
		$query = "WITH AllCarriers AS (
						SELECT $fields 
							FROM $from
							WHERE $where
					),
					DistinctCarriers AS (
						SELECT DISTINCT carrier_id, $distinctFields FROM AllCarriers
					),
					Carriers AS (
						SELECT ROW_NUMBER() OVER (ORDER BY $sort) AS ZEND_DB_ROWNUM, * FROM DistinctCarriers
					)";
		
		//If there is a start and limit
		$startRow = $start;
		$stopRow = $startRow + $limit - 1;
		$query .= " SELECT * FROM Carriers WHERE ZEND_DB_ROWNUM BETWEEN $startRow AND $stopRow";
	
		$this->setParam('query', $query);
		$result = $db->db->query($query);
		$records = array();
		$order = new OrderBase();
		while($row = $db->db->fetch_assoc($result) ) {
			//Add the row to the records
			$records[] = $row;
		}
		
		//Add the records to the response
		$this->setParam("records", $records);
	}
	
	public function getSearchQueryWhere($searchQuery){
		$wheres = array();
		$where = '';
		
		//Search by carrier name
		$wheres[] = "cm.CarrName LIKE '$searchQuery%'";
		
		//Search by mc no
		$wheres[] = "cbe.mc_no LIKE '$searchQuery%'";
		
		if(count($wheres)){
			$where .= " AND " . $wheres[0];
			array_shift($wheres);
		}
		
		if(count($wheres) > 1){
			$where .= " OR " . implode(" OR ", $wheres);
		}
		else if(count($wheres) == 1){
			$where .= " OR " . array_shift($wheres);
		}
		
		return $where;
	}
	
	public function carrier411Action(){
		$carrier411 = new Carrier411();
		$sessionId = $carrier411->session_id();
		$mcNumber = request('mc', '');

		$carrier = new CarrierBaseExtended();

		$carrier->where('mc_no', '=', $mcNumber);
		$rows = $carrier->list()->rows;
		if (count($rows)){
			$this->addError("This MC Number has already been entered in our system.");
			return;
		}

		$docketNum = 'MC' . $mcNumber;
		$record = $carrier411->get_company($docketNum, $sessionId);
		$record['insurance'] = array();
		if(!isset($record['FAULTCODE'])){
			$recordIns = $carrier411->get_ins_pol($docketNum, $sessionId);
			if (isset($recordIns['FAULTCODE'])){
				$this->addMessage($recordIns['FAULTMESSAGE']);
			}else{
				$i = 0;
				foreach($recordIns as $insurance){
					$a = array();
					foreach($insurance as $k => $v){
						$a[ucfirst($k)] = $v;
					}
					$record['insurance'][] = $a;
				}
			}
			
			$this->setParam('record', $record);
		}
		else{
			$this->addError($record['FAULTMESSAGE']);
		}
	}
}