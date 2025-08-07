<?php 
/**
 * Customer Base
 *
 * @author Steve Keylon
 */
 
class InsuranceTypes extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'insurance_types';

	public function create( $aVars ) {
	
		$nCreatedById = isset($aVars['created_by_id']) ? $aVars['created_by_id'] : get_user_id();
		$sName = isset($aVars['insurance_type']) ? $aVars['insurance_type'] : (isset($aVars['name']) ? $aVars['name'] : '');

		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_string($sName) || empty($sName) ) {
			add_error('Type Name requires a string', $key);
			return false;
		}
		
		$this->set('insurance_type', $sName);
		
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
		$s = "SELECT * FROM insurance_types WHERE LOWER(insurance_type) = '" . $sName . "'";
		$aRows = LP_Db::fetchRow($s);
		if ( !empty($aRows) && is_array($aRows) ) return $aRows;
		else{
			$o = new InsuranceTypes();
			$o->create(array('insurance_type' => $sName));
			return $o->get();
		}
	}
}