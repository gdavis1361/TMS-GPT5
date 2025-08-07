<?php 

/**
 * League Teams
 *
 * @author Steve Keylon
 */

class LeagueTeams extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'league_teams';

	public function create( $sName, $nCaptainId, $nCreatedById ) {
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_string($sName) ) {
			add_error('Name: ' . $sName, $key);
			return false;
		}
		if ( !is_numeric($nCaptainId) ) {
			add_error('Captain Id: ' . $nCaptainId, $key);
			return false;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By Id: ' . $nCreatedById, $key);
			return false;
		}
		
		$this->set_team_name($sName);
		$this->set('captain_id', $nCaptainId);
		$this->set_created_by_id($nCreatedById);
		$this->set_created_at(time());
		
		return $this->save();
	}
	
	function find_id($sName){
		$this->clear_filters();
		$this->where('team_name', '=', $sName);
		$a = $this->list()->rows;
		if ( isset($a[0]) ) {
			return $a[0]->get('league_team_id');
		}
		return 0;
	}
	
	function make_list($sName, $sClass='', $nDefault = 0) { 
		$this->clear_filters();
		$o = $this->list();
		
		$sHtml = '<select name="'. $sName. '" class="'.$sClass.'">';
		$sHtml .= "<option value=''> -- </option>";
		foreach ($o->rows as $row) { 
			$sHtml .= "\n<option value=\"".$row->league_team_id.'"'.( ($nDefault == $row->league_team_id) ? ' selected="selected"' : '' ).'>'.$row->team_name.'</option>';
		}
		$sHtml .= '</select>';
		return $sHtml;
	}
	
	public function getMembers(){
		$query = "SELECT
					user_base.user_id,
					user_base.user_name,
					user_base.image,
					contact_base.*
					FROM
						user_employee_to_team
					LEFT JOIN
						user_base
					ON
						user_base.user_id = user_employee_to_team.user_id
					LEFT JOIN
						contact_base
					ON
						contact_base.contact_id = user_base.contact_id
					WHERE
						user_employee_to_team.team_id = '{$this->get('league_team_id')}'";
		return LP_Db::fetchAll($query);
	}
	
	public function getImage(){
		if(!$this->get('league_team_id') || !strlen($this->get('team_pic'))){
			return "/resources/img/no-team.jpg";
		}
		else{
			return "/resources/" . $this->get('team_pic');
		}
	}
}
?>