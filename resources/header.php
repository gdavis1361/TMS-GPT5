<?php
$nPageRenderBegin = microtime(TRUE);
$vDisplayRenderTime = false;
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

if (!get_user_id()) {
	redirect('/logout.php');
}
$nUserId = get_user_id();
$s = "
	SELECT 
		contact.*,
		user_base.*,
		user_roles.*
	FROM 
		user_base
		LEFT JOIN 
			contact_base contact 
		ON 
			contact.contact_id = user_base.contact_id
		LEFT JOIN user_roles ON user_roles.role_id = user_base.role_id
	WHERE 
		user_base.user_id = " . $nUserId;
$res = $oDB->query($s);
if ($row = $oDB->db->fetch_object($res)) {
	$userdata = array($row->first_name . " " . $row->last_name, $row->image, $nUserId, $row->role_name);
}

if (!isset($sSection)) {
	$sSection = '';
}
if (!isset($sPage)) {
	$sPage = '';
}

$resourceManager = LP_ResourceManager::getInstance();
$resourceManager->addResources(array(
	'js' => array(
		'/lib/min/g=js',
		'http://maps.google.com/maps/api/js?sensor=false'
	),
	'css' => array(
		'/lib/min/g=css'
	),
	'icon' => '/resources/icon.ico'
), false);

include SITE_ROOT . '/templates/navigation/navigation.php';
$navigation = new LP_Navigation($navigationItems, $sSection, $sPage);

?><!DOCTYPE html> 
<html> 
	<head>
		<title>Access America Transport</title> 
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
		<?php
		// Output all js, css, anything else managed by resource manager that was added before html output
		LP_ResourceManager::getInstance()->outputAll();
		?>
	</head> 
	<body>
		<?php
		$sBackground = "/resources/background/dustyroad.jpg";
		if ($sSection == 'admin') {
			$sBackground = "/resources/background/neonleaf.jpg";
		}
		?>
		<img src="<?php echo $sBackground; ?>" id="bg" />
		<div id="header" class="header <?= $sSection == 'admin' ? 'admin' : ''; ?>">
			<div class="header-logo">
				<a href="/">
					<img src="/resources/img/aat-logo.png" />
				</a>
				<div class="tms-version">
					v<?php echo TMS_VERSION; ?>
				</div>
			</div>

			<div class="header-divider boxleft"></div>

			<div class="header-navigation">
				<div class="header-main-nav-container">
					<?php
					echo $navigation->getTopLevelHtml('header-main-nav', 'header-main-nav');
					?>
				</div>
				<div class="clear"></div>
				<div class="header-sub-nav-container">
					
				</div>
				<div class="clear"></div>
			</div>

			<div class="header-notify">
				<?php
				// Make sure there is an image file, otherwise it is making an unnecessary request for an image that doesn't exist
				if (strlen($userdata[1])) {
					?>
					<img id="userImage" src="/resources/<?php echo $userdata[1]; ?>" />
					<?php
				}
				else {
					?>
					<img id="userNoImage" src="/resources/noimage.png" />
					<?php
				}
				// get my contact id
				$myUserId = get_user_id();
				$myContactId = 0;
				$query = "SELECT contact_id FROM user_base WHERE user_id = $myUserId";
				$row = LP_Db::fetchRow($query);
				if ($row) {
					$myContactId = $row['contact_id'];
				}
				?>
				<div class="notify_title Corbel"><a href="/contacts/?d=contacts&a=view&id=<?php echo $myContactId; ?>"><?php echo $userdata[0]; ?></a></div>
				<div class="notify_subtitle Corbel"><?php echo end($userdata); ?></div>
				<div class="notify_copy Corbel">
					<a href="javascript:void(0)" style="display: none;">My Settings</a><br />
					<a href="/logout.php">Logout</a>
				</div>
			</div>
			<div class="header-divider-right boxright"></div>

			<div class="clear"></div>
		</div>
		<div align="center" id="content"> 
			<div id="contentWrap">
