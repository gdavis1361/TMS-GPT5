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
	<script src="/user/js/ResetPassword.js" type="text/javascript"></script>
	
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
				<div class="header_text Delicious">Reset Password</div>
				<div class="contentBox2_body">
					<div id="reset-password-container" class="reset-password-container">
						<?php 
						//Get the reset hash
						$resetHash = get("code", '');
						
						//Load the user based on this hash
						$userBase = new UserBase();
						$userBase->load_from_reset_password_hash($resetHash);
						if(!$userBase->get('user_id')){
							echo "You have requested an invalid code, or your code has expired. Please try again.";
						}
						else{
						?>
						<table cellpadding="5" cellspacing="0" width="85%" align="center">
							<tbody>
								<tr>
									<td>
										<span class="label">New Password</span>
									</td>
									<td align="right">
										<input id="reset-password-input" type="password" name="password" />
									</td>
								</tr>
								<tr>
									<td>
										<span class="label">Confirm Password</span>
									</td>
									<td align="right"> 
										<input id="reset-password2-input" type="password" name="password2" />
									</td>
								</tr>
								<tr>
									<td colspan="2" align="right">
										<div id="reset-password-submit" class="submit-button">
											Submit
										</div>
									</td>
								</tr>
								<tr>
									<td colspan="2">
										<div id="reset-password-feedback"></div>
									</td>
								</tr>
							</tbody>
						</table>
						<script type="text/javascript">
							$(document).ready(function(){
								User.ResetPassword.init({
									passwordId: 'reset-password-input',
									passwordConfirmId: 'reset-password2-input',
									submitId: 'reset-password-submit',
									feedbackId: 'reset-password-feedback',
									resetHash: '<?php echo $resetHash; ?>'
								});
							});
						</script>
						<?php } ?>
					</div>
				</div>
			</div>
		</div>
	</div>
</body>
</html>
