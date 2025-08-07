<?php
/****************************************
	Name:		Rapid Development System
	Author:		Reid Workman - workman@internetfaction.com
	Company:	Internet Faction
	Version:	2.0.3
	Modified:	15SEPT2010
	
	Please see engine/engine.php for more details.
	
****************************************/
// Start the Engine
require_once('../at-includes/engine.php');

$oSession->session_var( 'user_id',   '1' );
$oSession->session_var( 'user_name', 'Test' );
$oSession->session_save();

echo 'Hello '.$oSession->session_var('user_name').'!<br/>';
echo 'User Id: '.$oSession->session_var('user_id');

info();
?>