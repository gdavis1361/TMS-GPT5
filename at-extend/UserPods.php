<?php

/**
 * Pod Teams
 *
 * @author Steve Keylon
 */

class UserPods extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'user_pods';

	public function create( $nCaptainId, $nParentPodId = 0 ) {
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nCaptainId) ) {
			add_error('Captain Id: ' . $nCaptainId, $key);
			return false;
		}
		
		if ($nParentPodId !== 0 && !is_numeric($nParentPodId) ) {
			add_error('Parent Pod Id: ' . $nParentPodId, $key);
			return false;
		}

		$this->set('pod_captain_id', $nCaptainId);
		$this->set('parent_pod_id', $nParentPodId);
		$this->set('start_date', time() );


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

}

?>