<?
$nId = request('point_id', request('id') );

$aVars['team_name'] = request('team_name');
$aVars['team_pic'] = request('team_pic');
$aVars['captain_id'] = request('captain_id');


$aFilter['group_id'] = request('filter_group_id');
$aFilter['team_name'] = request('filter_name');

$oTeam = new LeagueTeams();
switch($sAction) {
	case 'edit':
		if ( empty($nId) || !$oTeam->load($nId)) {
			echo "Error loading";
			$sDisplay = 'list';
			break;
		}
		
	case 'add':
		
		
		$sName = request('team_name');
		$nCaptainId = request('captain_id');
		$nCreatedById = get_user_id();
		
		$oTeam->create( $sName, $nCaptainId, $nCreatedById );
		
		
		$sDisplay = 'list';
			
		break;
}

print_errors();

switch( $sDisplay ) {
	case 'edit':
		if ( empty($nId) ) break;
		
		$oTeam = new LeagueTeams();
		$oTeam->load($nId);
		
		$aVars['team_name'] = $oTeam->get('team_name');
		$aVars['captain_id'] = $oTeam->get('captain_id');
	case 'add':
		require_once('_add.php');
		break;
		
	case "list":
	default:
		require_once('_list.php');

}