<?php
require_once EXTEND_DIR . '/GeoData.php';
class Util_DataController extends AjaxController {
	public function statesAction(){
		$geoData = new GeoData();
		$states = $geoData->get_state_list();
		$records = array();
		foreach ($states as $value => $display){
			$records[] = array(
				"value" => $value,
				"display" => $display
			);
		}
		$this->setParam('records', $records);
	}
	
	public function zipAction(){
		$zip = LP_Db::escape(getParam("zip", 0));
		if(!$zip){
			return false;
		}
		
		$geoData = new GeoData();
		$zipData = $geoData->lookup_zip($zip);
		if (!empty($zipData)){
			$record = array(
				"city" => $zipData->City,
				"state" => $zipData->State,
				"seq" => $zipData->Seq,
				"zip" => $zipData->Zip
			);
			$this->setParam("record", $record);
		}	
	}
}