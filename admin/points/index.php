<?
$nId = request('point_id', request('id') );

/*
$aVars['task_name'] = request('task_name', '');
$aVars['task_description'] = request('task_description', '');
$aVars['task_url'] = request('task_url', '');
$aVars['task_priority_weight'] = request('task_priority_weight', '');	
*/

$aVars['point_type_name'] = request('point_type_name');
$aVars['point_type_group_id'] = request('point_type_group_id');
$aVars['unit_type_id'] = request('unit_type_id');
$aVars['effective_date'] = request('effective_date');
$aVars['point_value'] = request('point_value');

$aFilter['group_id'] = request('filter_group_id');
$aFilter['name'] = request('filter_name');

$oType = new LeaguePointTypes();
$oValue = new LeaguePointValues();

switch($sAction) {
	case 'edit':
		if ( empty($nId) || !$oType->load($nId)) {
			echo "Error loading";
			$sDisplay = 'list';
			break;
		}
		if ( strtotime($aVars['effective_date']) < strtotime(date('Y-m-d', strtotime('+1 day')) ) ) {
			$sDisplay = 'edit';
			?><div style="background-color: #6f0000; border: 1px solid red; color: white; padding: 10px; margin-bottom: 15px;">
			Effective Date cannot be today or in the past</div><?
			break;
		}		
		/*$aType = array(
				'point_type_name' => $aVars['point_type_name'],
				'point_type_group_id' => $aVars['point_type_group_id'],
				'unit_type_id' => $aVars['unit_type_id'],
				'created_by_id' => get_user_id()
			);
		//$oType->create($aType);
		*/
		
		$nPointTypeId = $nId;
		$aValue = array(
				'point_type_id' => $nPointTypeId,
				'effective_date' => $aVars['effective_date'],
				'point_value' => $aVars['point_value'],
				'created_by_id' => get_user_id()
			);
		$oValue->create($aValue);
		
		$sDisplay = 'list';
			
		break;
}

print_errors();

switch( $sDisplay ) {
	case 'edit':
		if ( empty($nId) ) break;
		
		$oType->load($nId);
		
		$aValue = $oType->get_active_value();
		
		$aVars['point_type_name'] = $oType->get('point_type_name');
		$aVars['point_type_group_id'] = $oType->get('point_type_group_id');
		$aVars['unit_type_id'] = $oType->get('unit_type_id');
		
		$aVars['effective_date'] = $aValue['effective_date'];
		$aVars['point_value'] = $aValue['point_value'];
	case 'add':
		require_once('_add.php');
		break;
		
	case "list":
	default:
		require_once('_list.php');

}