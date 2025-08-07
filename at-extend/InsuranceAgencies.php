<?php 
/**
 * Customer Base
 *
 * @author Steve Keylon
 */
 
class InsuranceAgencies extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'insurance_agencies';

	public function create( $aVars ) {
	
		$nCreatedById = isset($aVars['created_by_id']) ? $aVars['created_by_id'] : get_user_id();
		$sName = isset($aVars['agency_name']) ? $aVars['agency_name'] : (isset($aVars['name']) ? $aVars['name'] : '');

		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_string($sName) || empty($sName) ) {
			add_error('Agency Name requires a string', $key);
			return false;
		}
		
		$this->set('agency_name', $sName);
		
		$created_by = $this->get('created_by_id');
		if ( empty($created_by) ) $this->set('created_by_id', $nCreatedById);
		else{
			$this->set('updated_by_id', $nCreatedById);
			$this->set('updated_at', time());
		}
		
		return $this->save();
	}
	
	public static function find( $sName ) {
		$sName = strtolower($sName);
		$s = "SELECT * FROM insurance_agencies WHERE LOWER(agency_name) = '" . $sName . "'";
		$aRows = LP_Db::fetchRow($s);
		if ( !empty($aRows) && is_array($aRows) ) return $aRows;
		else{
			$o = new InsuranceAgencies();
			$o->create(array('agency_name' => $sName));
			return $o->get();
		}
	}
}