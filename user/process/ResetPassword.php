<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

//Setup the return array
$returnArray = array(
	"good" => true,
	"errors" => array(),
	"message" => ""
);

//Load Variables
$resetHash = post("resetHash", '');
$password = post("password", '');
$passwordConfirm = post("password2", '');

//Load the user based on this hash
$userBase = new UserBase();
$userBase->load_from_reset_password_hash($resetHash);

//Do some error checking
if($userBase->get('user_id')){
	if(!strlen($password)){
		$returnArray['errors'][] = "Please choose a new password.";
	}
	if($password != $passwordConfirm){
		$returnArray['errors'][] = "Your passwords do not match, please try again.";
	}
}
else{
	$returnArray['errors'][] = "You are not authorized to make this change, or your reset code has expired. Please try again";
}

//reset the users password
if(!count($returnArray['errors'])){
	if($userBase->set_password($userBase->get('user_id'), $password)){
		$returnArray['message'] = "Your password has been reset, you will be redirected to the login page...";
	}
	else{
		$returnArray['errors'][] = "An error occured please try again.";
	}
}

//Return the data
if(count($returnArray['errors'])) {
	$returnArray['good'] = false;
}
echo json_encode($returnArray);