<?php 
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

//Load stats info / create row for todays date
$nUserId = request('user', get_user_id() );
$nContactId = get_user()->get('contact_id');
//$oEmployee = new UserEmployees();
$aEmployeeIds = UserEmployees::getSupervisees( get_user_id() );

if ( !in_array($nUserId, $aEmployeeIds) ) {
	// Permission Denied
	$nUserId = get_user_id();
}
$oUserBase = new UserBase();
$oUserBase->load($nUserId);
$oLeagueStats = new LeagueStats();
$vLoaded = $oLeagueStats->load_by_user($nUserId);

//Setup the view, section, page
$view = "home.php";
$sSection = 'my page';
$sPage    = 'home';
$section = get("section", "home");
$action = get("action", "");

//Add required resources
LP_ResourceManager::getInstance()->addResources(array(
	'css' => array(
		'/mypage/css/mypage.css'
	)
));

//Switch on section
switch ($section){
	case "leaderboard":
		$sPage = "leaderboard";
		$view = "leaderboard.php";
	break;

	case "stats":
		$sPage = "stats";
		switch ($action) {
			default:
				$view = "stats.php";
			break;
		}
	break;

	case "scores":
		$sPage = "scores";
		$view = "scores.php";
	break;

	case "teams":
		$sPage = "teams";
		$view = "teams.php";
	break;

	case "standings":
		$sPage = "standings";
		$view = "standings.php";
	break;

	case "branch":
		$sPage = "branch";
		$view = "branch.php";
	break;	
}


//Buffer the content
ob_start();
include_once dirname(__FILE__) . '/view/' . $view;
$content = ob_get_clean();

//Display the content
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/header.php');
echo $content;
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/footer.php');

?>