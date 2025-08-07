<?php 
/**
 * Document Relation
 *
 * @author Steve Keylon
 */
 
class DocumentRelation extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'document_relation';

	public function create(	$aVars ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		
		if ( !isset($aVars['document_id']) ) {
			add_error('Must provide a document id', $key);
			return false;
		}
		if ( !isset($aVars['relation_table_name']) ) {
			add_error('Must provide a table name for the relation', $key);
			return false;
		}
		if ( !isset($aVars['relation_table_key']) ) {
			add_error('Must provide a key value for the relation', $key);
			return false;
		}
		foreach($aVars as $k => $v) {
			$this->set($k, $v);
		}
		
		$this->save();
		
		return true;
	}
	
	public static $map = array(
		'order_base' => 'Order',
		'carrier_base' => 'Carrier',
		'customer_base' => 'Customer',
		
		'Order' => 'order_base',
		'Carrier' => 'carrier_base',
		'Customer' => 'customer_base'
		
	);
}