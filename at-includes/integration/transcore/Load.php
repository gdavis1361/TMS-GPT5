<?php
class Integration_Transcore_Load_Commands {
	const NewEquipmentPosting = "EP";
	const NewLoadPosting = "LP";
	const UpdateEquipment = "EU";
	const UpdateLoad = "LU";
}


class Integration_Transcore_Load {
	public $MessageType = '';
	const MessageVersion = "03";
	const PostToDatabase = "L";
	public $PostingId = '';
	public $OrderId = '';
	public $DispatcherId = '';
	public $EquipmentType = '';
	public $FromCity = '';
	public $FromState = '';
	public $FromPostalCode = '';
	public $ToCity = '';
	public $ToState = '';
	public $ToPostalCode = '';
	public $CallbackPhoneNumber = '';
	public $AvailableDate = '';	//YYMMDD
	public $Enhancments = '';
	public $Count = 1;
	public $DeckLength = '';
	public $LoadWeight = '';
	public $CubicFeet = '';
	public $NumberIntermediateStops = '';
	public $Rate = '';
	public $RatePer = "F";
	public $FromLatitude = '';
	public $FromLongitude = '';
	public $ToLatitude = '';
	public $ToLongitude = '';
	public $LocationsList = '';
	public $CommentOne = '';
	public $CommentTwo = '';
	
	public function format($command){
		$this->MessageType = $command;
		
		//Populate the command segments
		$commandSegments = array(
			$this->ensureLength($this->MessageType, 2),
			$this->ensureLength(self::MessageVersion, 2),
			$this->ensureLength(self::PostToDatabase, 1),
			$this->ensureLength($this->PostingId, 8),
			$this->ensureLength($this->OrderId, 8),
			$this->ensureLength($this->DispatcherId, 10),
			$this->ensureLength($this->EquipmentType, 2),
			$this->ensureLength($this->FromCity, 14),
			$this->ensureLength($this->FromState, 2),
			$this->ensureLength($this->FromPostalCode, 9),
			$this->ensureLength($this->ToCity, 14),
			$this->ensureLength($this->ToState, 2),
			$this->ensureLength($this->ToPostalCode, 9),
			$this->ensureLength($this->CallbackPhoneNumber, 10),
			$this->ensureLength($this->AvailableDate, 6),
			$this->ensureLength($this->Enhancments, 4),
			$this->ensureLength($this->Count, 2),
			$this->ensureLength($this->DeckLength, 3),
			$this->ensureLength($this->LoadWeight, 6),
			$this->ensureLength($this->CubicFeet, 4),
			$this->ensureLength($this->NumberIntermediateStops, 2),
			$this->ensureLength($this->Rate, 5),
			$this->ensureLength($this->RatePer, 1),
			$this->ensureLength($this->FromLatitude, 4),
			$this->ensureLength($this->FromLongitude, 5),
			$this->ensureLength($this->ToLatitude, 4),
			$this->ensureLength($this->ToLongitude, 5),
			$this->ensureLength($this->LocationsList, 70),
			$this->ensureLength($this->CommentOne, 70),
			$this->ensureLength($this->CommentTwo, 70),
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