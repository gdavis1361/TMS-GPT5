<?
$nId = request('type_id', request('id') );


$aVars['type_name'] = request('type_name', '');
$aVars['type_desc'] = request('type_desc', '');


switch($sAction) {
	case 'edit':
		if ( empty($nId) ) {
			echo "Error loading";
			$sDisplay = 'list';
			break;
		}
		
	case 'add':
		
		$sPostingServiceName = request('service_name');
		$sUrl = request('url');
		$nCreatedById = get_user_id();
		$o = new PostingServices();
		$o->create( $sPostingServiceName, $sUrl, $nCreatedById );
		
		
		$sDisplay = 'list';
			
		break;
}

print_errors();

switch( $sDisplay ) {
	case 'edit':
		if ( empty($nId) ) break;
		$o = new PostingServices;
		$o->load($nId);
		
		$oCreds = new PostingServiceCredentials();
		
		$aVars['service_name'] = $o->get('posting_service_name');
		$aVars['url'] = $o->get('url');
		$aVars['credentials'] = $oCreds->list_credentials_by_service($nId);
		
	case 'add':
		if ( !isset($aVars['service_name']) ) $aVars['service_name'] = '';
		if ( !isset($aVars['url']) ) $aVars['url'] = '';
		if ( !isset($aVars['credentials']) ) $aVars['credentials'] = array();
		require_once('_add.php');
		break;
		
	case "list":
	default:
		require_once('_list.php');

}