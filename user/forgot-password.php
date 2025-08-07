<?php 
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

if ( get_user_id() ) {
	redirect('/dashboard.php');
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> 
<html xmlns="http://www.w3.org/1999/xhtml"> 
<head> 
	<title>Access America Transport</title> 
	<link type="text/css" rel="stylesheet" href="/resources/css/style.css" /> 
	<link type="text/css" rel="stylesheet" href="/user/css/User.css" /> 
	
	<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" /> 
	
	<script src="/resources/js/jquery-1.4.3.min.js" type="text/javascript"></script>
	
	<script src="/resources/js/cufon-yui.js" type="text/javascript"></script>
	<script src="/resources/js/Delicious.font.js" type="text/javascript"></script>
	<script src="/user/js/ForgotPassword.js" type="text/javascript"></script>
	
	<script type="text/javascript">
		Cufon.replace('.Delicious', { fontFamily: 'Delicious',hover: true });
	</script>
	<!--[if IE 6]>
		<style type="text/css">
		html { overflow-y: hidden; }
		body { overflow-y: auto; }
		#bg { position:absolute; z-index:-1; }
		</style>
	<![endif]-->
</head> 
<body>
	<img src="/resources/background/themilkywaygalaxy.jpg" id="bg" />
	
	<table width="100%" cellpadding="0" cellspacing="0" id="header">
		<tr>
			<td id="header_brand" style="text-align: left; padding-left: 20px;">
				<a href="/"><img src="/resources/access_america_logo.jpg" /></a>
			</td>
		</tr>
	</table>
	
	<div align="center">
		<div style="width:600px;padding-top:150px;" align="left">
			<div class="contentBox2 form_normal">
				<div class="header_text Delicious">Forgot Password</div>
				<div class="contentBox2_body">
					<div id="forgot-password-container" class="forgot-password-container">
						<div style="font-style: italic; padding-bottom: 10px;">
							Before we can reset your password, you need to enter the information below to help identify your account:
						</div>
						
						<div style="font-weight: bold; padding: 5px 0px 5px 0px;">
							Username or email address associated with your account
						</div>
						<div>
							<div class="input-container">
								<input id="forgot-password-username" type="text" />
							</div>
							<div id="forgot-password-submit" class="submit-button">
								Submit
							</div>
							<div class="clear"></div>
						</div>
						<div id="forgot-password-feedback"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<script type="text/javascript">
	$(document).ready(function(){
		User.ForgotPassword.init({
			containerId: "forgot-password-container",
			inputId: "forgot-password-username",
			submitId: "forgot-password-submit",
			feedbackId: "forgot-password-feedback"
		});
	});
	</script>
</body>
</html>
