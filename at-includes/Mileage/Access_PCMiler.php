<?php

class Access_PCMiler {

	public $url = "http://192.168.10.100:8080/pcmiler1.php";

	public function sendRequest($params){

		   $ch = curl_init($this->url);
		   curl_setopt($ch, CURLOPT_POST, 1);
		   curl_setopt($ch, CURLOPT_POSTFIELDS, "json=".$params);
		   curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
		   curl_setopt($ch, CURLOPT_HEADER, 0);  // DO NOT RETURN HTTP HEADERS
		   curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);  // RETURN THE CONTENTS OF THE CALL
		   curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
		   $response = curl_exec($ch);
		   curl_close($ch);

		   return $response;
   }
}