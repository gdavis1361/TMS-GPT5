<?
$nId = request('role_id', request('id') );


$aVars['role_name'] = request('role_name', '');
$aVars['landing_page'] = request('landing_page', '');	
$aVars['mode_id'] = request('mode_id', '');	


$oRole = new UserRoles();
switch($sAction) {
	case 'edit':
		if ( empty($nId) || !$oRole->load($nId)) {
			echo "Error loading";
			$sDisplay = 'list';
			break;
		}
		
	case 'add':
		
		
		$sName = $aVars['role_name'];
		$sLandingPage = $aVars['landing_page'];
		$nModeId = $aVars['mode_id'];
		$nCreatedById = get_user_id();
		
		$oRole->create( $aVars  );
		
		$sDisplay = 'list';
			
		break;
}

print_errors();

switch( $sDisplay ) {
	case 'edit':
		if ( empty($nId) ) break;
		
		$oRole->load($nId);
		$aVars['role_name'] = $oRole->get('role_name');
		$aVars['landing_page'] = $oRole->get('landing_page');	
		$aVars['mode_id'] = $oRole->get('mode_id');	
	case 'add':
		require_once('_add.php');
		break;
		
	case "list":
	default:
		require_once('_list.php');

}