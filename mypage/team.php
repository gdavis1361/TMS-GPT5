<?php
$sSection = 'my page';
$sPage    = 'team';
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/header.php');
$nUserId = get_user_id();

$sAction = request('a', request('action', '') ) ;
$sDisplay = request('d', request('display') ) ;
$nId = request('id');

switch($sAction) {
	case "edit":
		if ( !$nId ) break;
	case "add":
		break;
	default:
	break;
}

print_errors();

switch($sDisplay) {
	case "edit":
		if ( !$nId ) break;
		//set some vars?
	case "add":
		break;
	default:
		require_once('_team_view.php');
	break;
}

require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/footer.php');
?>