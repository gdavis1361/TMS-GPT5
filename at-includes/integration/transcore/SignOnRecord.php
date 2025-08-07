<?php
class Integration_Transcore_SignOnRecord {
	const MessageType = "SO";
	const MessageTypeLength = 2;
	
	const CustomerIdentifier = '567948.002.00002';
	const CustomerIdentifierLength = 16;
	
	const CustomerPassword = 'v4shsdl7';
	const CustomerPasswordLength = 16;
	
	const RecordFormat = "F";
	const RecordFormatLength = 1;
	
	const GeoDataFormat = "M";
	const GeoDataFormatLength = 1;
	
	public function format(){
		//Populate the command segments
		$commandSegments = array(
			$this->ensureLength(self::MessageType, self::MessageTypeLength),
			$this->ensureLength(self::CustomerIdentifier, self::CustomerIdentifierLength),
			$this->ensureLength(self::CustomerPassword, self::CustomerPasswordLength),
			$this->ensureLength(self::RecordFormat, self::RecordFormatLength),
			$this->ensureLength(self::GeoDataFormat, self::GeoDataFormatLength),
		);
		
		return implode("", $commandSegments);
	}
	
	public function ensureLength($str, $length){
		//Check that the string is not longer than the length
		if(strlen($str) > $length){
			$str = substr($str, 0, $length);
		}
		$str = str_pad($str, $length, " ", STR_PAD_RIGHT);
		return $str;
	}
}