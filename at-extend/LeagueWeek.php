<?php 
class LeagueWeek extends DBModel {
	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'league_week';
	
	public function insert($aData, $sTable = false) {
		
		//Ensure correct dates
		$aData['start_date'] = date('Y-m-d 00:00:00', strtotime($aData['start_date']));
		$aData['end_date'] = date('Y-m-d 00:00:00', strtotime($aData['end_date']));
		
		//Call the parent function
		return parent::insert($aData, $sTable);
	}
	
	public function loadActiveWeek(){
		//Try to load the active week
		$today = date('Y-m-d 00:00:00');
		$query = "SELECT * FROM league_week WHERE start_date <= '$today' AND end_date >= '$today'";
		$row = LP_Db::fetchRow($query);
		$this->setArray($row);
	}
}
?>