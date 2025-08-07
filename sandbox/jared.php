<?php
require_once('../at-includes/engine.php');
require_once('../resources/functions.php');

//Try to parse js file
die();

//Test the node system
$ch = curl_init("http://accessresults.com:8080/send/tasks/alert");
$params = array(
	"data" => json_encode(array(
		"title" => "Test",
		"message" => "Testing the notifier"
	)),
	"keys" => json_encode(array(
		"userId" => 2
	))
);
$paramsString = '';
foreach ($params as $key => $value){
	$paramsString .= urlencode($key).'='.urlencode($value).'&';
}

curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $paramsString);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_HEADER, 0);  // DO NOT RETURN HTTP HEADERS
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);  // RETURN THE CONTENTS OF THE CALL
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
$response = curl_exec($ch);
curl_close($ch);
die();

//Test the integration
require_once '../at-includes/integration/Factory.php';
$integration = Integration_Factory::factory(Integration_Types::Transcore);
$integration->add(123);
die();
/*
$truckstop = Integration_Factory::factory(Integration_Types::Truckstop);
$testPreOrderId = 123;
$errors = $truckstop->add($testPreOrderId);
if(!$errors->anyErrors()){
	echo "Successfull";
}
else{
	foreach ($errors->getErrors() as $error){
		echo $error->getMessage() . "<br />";
	}
}
pre($truckstop->delete($testPreOrderId));
pre($truckstop->delete($testPreOrderId + 1));


//Show the load
//pre($result);
//$results = $truckstop->getLoads();
//pre($results);

a
//Delete the load
$results = $truckstop->getLoads();
pre($results);
*/
