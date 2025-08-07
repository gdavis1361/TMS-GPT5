<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

//Setup the return array
$returnArray = array(
	"good" => true,
	"errors" => array(),
	"message" => ""
);

//get the user that was posted
$user = post("user", "");
$emailDomain = "accessamericatransport.com";

if(strlen($user)){
	//Check and see if this user exists
	$userBase = new UserBase();
	if(!$userBase->username_exists($user)){
		$returnArray["errors"][] = "Username was not found, Please try again.";
	}
	
	if(!count($returnArray["errors"])){
		//Create the reset password hash
		$userBase->load(array(
			"user_name" => $user
		));
		$resetPasswordHash = $userBase->get_reset_password_hash();
		
		//Build the body of the message
		$resetUrl = "http://" . $_SERVER['HTTP_HOST'] . "/user/reset-password.php?code=" . $resetPasswordHash;
		$body = "You have requested to reset your password, to complete this process please follow the link below. 
		 Your password reset code will only be valid until the end of the day you requested it. If you do not reset your password
		 in time you will need to repeat the forgot password process.<br /><br />
		 <a href=\"$resetUrl\">Click Here to reset your password</a>";
		
		//Send reset password email	
		require_once SITE_ROOT . '/at-includes/swift/lib/swift_required.php';

		//Create the Transport
		$transport = Swift_MailTransport::newInstance();
		
		//Create the Mailer using your created Transport
		$mailer = Swift_Mailer::newInstance($transport);
		
		//Create a message
		$message = Swift_Message::newInstance('TMS: Reset Password')
		  ->setFrom(array('admin@tms.com' => 'Access America Transport TMS'))
		  ->setTo(array($userBase->get('user_name') . "@" . $emailDomain))
		  ->setBody($body);
		  
		//Send the message
		$message->setContentType("text/html");
		$result = $mailer->send($message);
		
		//Add message
		$returnArray["message"] = "An email has been sent to you with instructions on how to reset your password.
		 <a href=\"/\">Return Home</a>";
	}
}

//Return the data
if(count($returnArray['errors'])) {
	$returnArray['good'] = false;
}
echo json_encode($returnArray);