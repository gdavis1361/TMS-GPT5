<?php 
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

$sUser = request('aat_useridentifier');
$sPass = request('aat_passcode');

if ( $sUser && $sPass ) {
	$oUserBase = new UserBase();
	if ( $oUserInfo = $oUserBase->authenticate_by_username($sUser, $sPass) ) {
		$oSession->set( 'user_id', $oUserInfo->user_id );
		$oSession->session_var( 'user_id', $oUserInfo->user_id );
		$oSession->session_var( 'user_name', $oUserInfo->user_name );
		$oSession->session_var( 'role_id', $oUserInfo->role_id );
		$oSession->session_var( 'pod_structure', $oUserInfo->pod_structure );
		
		
		$aUserScope = UserEmployees::getSupervisees($oUserInfo->user_id);
		$aContactScope = ContactBase::getContactIds($aUserScope);
		$oSession->session_var( 'user_scope', $aUserScope );
		$oSession->session_var( 'contact_scope', $aContactScope );
		$oSession->session_save();
	}else { 
		$sError = 'Failed to Login. Invalid Username or password';
	}
}

if ( get_user_id() ) {
	redirect('dashboard.php');
}
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> 
<html xmlns="http://www.w3.org/1999/xhtml"> 
<head> 
	<title>Access America Transport</title> 
	<link type="text/css" rel="stylesheet" href="/resources/css/style.css" /> 
	<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" /> 
	
	<script src="/resources/js/jquery-1.4.3.min.js" type="text/javascript"></script>
	
	<script src="/resources/js/cufon-yui.js" type="text/javascript"></script>
	<script src="/resources/js/Delicious.font.js" type="text/javascript"></script>
	
	<script type="text/javascript">
		Cufon.replace('.Delicious', { fontFamily: 'Delicious',hover: true });
	</script>
</head> 
<body>
	<img src="/resources/background/themilkywaygalaxy.jpg" id="bg" />
	
	<div class="content-container" style="margin: 0px auto; width: 300px; position: relative; top: 150px;">
		<form action="?" method="post">
		<div class="contentBox2 form_normal content-container"><div class="header_text Delicious">Sign In</div>
			<div class="contentBox2_body" style="font-size:13px;font-family:'Trebuchet MS',Arial;">
				<table width="100%">
					<tr>
						<td valign="top">
							<div style="text-align: center; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #bbb;">
								<img src="/resources/access_america_logo.jpg" style="width: 180px;" />
							</div>
							<div class="Delicious" style="font-size:15px;"><strong>Login / Email Address</strong></div>
							<input name="aat_useridentifier" id="aat_useridentifier" type="text" value="<?=post('aat_useridentifier')?>" style="width: 95%; margin:4px 0 10px 0;" />

							<div class="Delicious" style="font-size:15px;"><strong>Password</strong></div>
							<input name="aat_passcode" id="aat_passcode" type="password" autocomplete="off" style="width: 95%; margin:4px 0 10px 0;" />
							<div style="font-size: 11px;">
								<a href="/user/forgot-password.php">Forgot your password?</a>
							</div>

							<div align="right" style="margin-bottom:15px;">
								<input type="submit" value="Sign in" style="margin:0; cursor: pointer;" />
							</div>

							<?php if( isset($sError) ) { ?>
							<div>
								<div style="padding:5px; -moz-border-radius: 4px;border-radius: 4px;background:#fff;font-family: 'Trebuchet MS',Arial;font-size:11px; margin-bottom: 10px;">
									<img src="/resources/stop.png" height="32" width="32" style="float:left;padding-right:15px;" /><?=$sError?>
									<div style="clear:both;"></div>
								</div>
							</div>
							<?php } ?>
							
						</td>
					</tr>
				</table>
			</div>
		</div>
		</form>
		<script>
		$(document).ready(function(){
			if( $('#aat_useridentifier').val().length > 0 ) {
				$('#aat_passcode').focus();
			} else {
				$('#aat_useridentifier').focus();
			}
		});
		</script>
	</div>
</body>
</html>
