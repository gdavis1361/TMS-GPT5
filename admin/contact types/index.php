<?
$nId = request('type_id', request('id') );


$aVars['type_name'] = request('type_name', '');
$aVars['type_desc'] = request('type_desc', '');


$oType = new ContactTypes();
switch($sAction) {
	case 'edit':
		if ( empty($nId) || !$oType->load($nId)) {
			echo "Error loading";
			$sDisplay = 'list';
			break;
		}
		
	case 'add':
		
		$sTypeName = request('type_name');
		$sTypeDescription = request('type_desc');
		$nCreatedById = get_user_id();
		
		$oType->create( $sTypeName, $sTypeDescription, $nCreatedById );
		
		
		$sDisplay = 'list';
			
		break;
}

print_errors();

switch( $sDisplay ) {
	case 'edit':
		if ( empty($nId) ) break;
		$oType->load($nId);
		
		$aVars['type_name'] = $oType->get('type_name');
		$aVars['type_desc'] = $oType->get('type_desc');
	case 'add':
		require_once('_add.php');
		break;
		
	case "list":
	default:
		require_once('_list.php');

}