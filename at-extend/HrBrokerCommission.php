<?php 
/**
 * @author Reid Workman
 */
 
class HrBrokerCommission extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'hr_broker_commission';

	public function create(	$nUserId, $nEffectiveDate, $nMaxPercent, 
							$nMaxMargin, $nCreatedById ) {
		
		// Validate Data
		if ( !number( $nUserId, TRUE ) ) die('You must provide an User Id to associate with');
		if ( !number( $nEffectiveDate, TRUE ) ) die('You must provide an Effective Date');
		if ( !number( $nMaxPercent, TRUE ) ) die('You must provide a Maximum Percent');
		if ( !number( $nMaxMargin, TRUE ) ) die('You must provide a Maxiumum Margin (x.xx)');
		
		if ( !number( $nCreatedById, TRUE ) ) die('You must specify a Created By User Id');
		
		// Save Data
		$this->set( 'goal_type_name', $sGoalTypeName );
		$this->set( 'goal_type_group_id', $nGoalTypeGroupId );
		$this->set( 'unit_id', $nUnitId );

		$this->set( 'created_by_id', $nCreatedById );
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
	
	public function current_index( $nUserId ) {
		$this->clear_filters();
		//**************************
		$sIndexColumn = 'commission_index';
		$this->where('user_id', '=', $nUserId);
		//**************************
		$this->select( array('LASTID'=>'MAX('.$sIndexColumn.')') );
		$o = $this->list()->rows;
		if ( $this->list()->returned_rows > 0 ) {
			return $o->LAST_ID;
		}
		else {
			return 0;
		}
	}
	
}
?>