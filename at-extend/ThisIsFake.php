<?php
class ThisIsFake {
	public function test($str){
		return "In the " . __CLASS__ . " class. Received $str";
	}
	
	public function test2($arg){
		return "Hey you passed $arg";
	}
	
	public function getRow(){
		return array(
			"one" => "1",
			"two" => "2",
		);
	}
}