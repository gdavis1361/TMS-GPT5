<?php 
/**
 * Customer Duplicates
 *
 * @author Steve Keylon
 */
 
class CustomerDuplicates extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'customer_duplicates';

	public function create(	$aVars ) {
		
		if (!is_array($aVars)) {
			add_error('Error. Create requires an array');
			return false;
		}
		// Validate Data
		$aRequiredKeys = array('customer_id', 'duplicate_id');
		$aOptionalKeys = array();
		
		$errors = false;
		foreach ($aRequiredKeys as $key) {
			if (!isset($aVars[$key])) {
				$errors = true;
				add_error($key . " must be passed to " . __CLASS__ . "::" . __METHOD__);
			}else{
				$this->set($key, $aVars[$key]);
				unset($aVars[$key]);
			}
		}
		if ($errors) return false;
		
		
		// Save Data
		
		foreach($aOptionalKeys as $key){
			if ( isset($aVars[$key]) ) $this->set($key, $aVars[$key]);
		}
		
		$this->set('created_at', time());
		
		return $this->save();
		
		// Report
		return ;
	}
}

?>