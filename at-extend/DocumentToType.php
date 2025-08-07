<?php 
/**
 * Document to Type
 *
 * @author Steve Keylon
 */
 
class DocumentToType extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'document_to_type';

	public function create(	$aVars ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		
		if ( !isset($aVars['document_id']) ) {
			add_error('Must provide a document id', $key);
			return false;
		}
		
		if ( !isset($aVars['document_type_id']) ) {
			add_error('Must provide a type id', $key);
			return false;
		}
		
		foreach($aVars as $k => $v) {
			$this->set($k, $v);
		}
		
		$this->save();
		
		return true;
	}
}
?>