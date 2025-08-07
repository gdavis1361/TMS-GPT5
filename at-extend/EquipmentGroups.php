<?php
class EquipmentGroups_Fields {
	const Id = 'group_id';
	const Name = 'group_name';
	const CreatedBy = 'created_by_id';
	const CreatedAt = 'created_at';
	const UpdatedBy = 'updated_by_id';
	const UpdatedAt = 'updated_at';
}


/**
 * @author Reid Workman
 */
class EquipmentGroups extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'equipment_groups';

	public function create(	$sGroupName, $nCreatedById ) {
		
		// Prep Variables (trim and substr)
		$sGroupName = prep_var( $sGroupName, 50 );
		
		// Validate Data
		if ( !string( $sGroupName, TRUE ) ) die('You must provide a Group Name');
		
		if ( !number( $nCreatedById, TRUE ) ) die('You must specify a Created By User Id');
		
		// Save Data
		$this->set( 'group_name', $sGroupName );

		$this->set( 'created_by_id', $nCreatedById );
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
	
	public function get_group_id_by_equipment($aEquipmentIds){
		//Get the total count of equipment ids
		$equipmentCount = count($aEquipmentIds);
		
		//Build the query
		$sSql = "
            SELECT
                etg.*
            FROM
                [TMS].[dbo].[equipment_to_groups] etg
            WHERE";
		
		for($i = 0; $i < count($aEquipmentIds); $i++){
			if($i){
				$sSql .= " OR";
			}
			$equipmentId = $aEquipmentIds[$i];
			$sSql .= " etg.equipment_id = '$equipmentId'";
		}
		
		
		//Run the query and get the result
		$groups = array();
        $this->connect();
        $oRes = $this->db->query( $sSql );
        while ( $oRow = $this->db->fetch_object( $oRes ) ) {
            if(!isset($groups[$oRow->group_id])){
            	$groups[$oRow->group_id] = array();
            }
            $groups[$oRow->group_id][] = $oRow->equipment_id;
        } 
        
        //Find the group that matches the correct count
        foreach ($groups as $groupId => $equipmentArray){
        	if(count($equipmentArray) == $equipmentCount){
        		return $groupId;
        	}
        }
        
        //No group was found
        return 0;
	}
}
?>