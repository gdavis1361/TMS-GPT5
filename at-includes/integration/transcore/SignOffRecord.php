<?php
class Integration_Transcore_SignOffRecord {
	const MessageType = "OF";
	const MessageTypeLength = 2;
	
	public function format(){
		return self::MessageType;
	}
}