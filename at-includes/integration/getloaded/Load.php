<?php
class Integration_GetLoaded_Load {
	
	const Add = 'LP';
	const Update = 'LU';
	const Delete = 'LC';
	
	public function format($command){
		/*
		 * LP|1234|member1|boston|ma|dallas|tx|F|04/20/10|444-222-1234|44000|300|Call for directions.
		 * LP|accessamerica|478141|5/27/2011|cross city|fl|tawas city|mi|V|1|F|0||44000| | |van with driver assist|866-902-8815        |403 |Penny Sewell|N
			LP|accessamerica|478142|5/27/2011|Fredonia|PA|North Warren|PA|F|1|F|0|| | | |Call Amy 866-532-3971 EXT. 160|866-532-3971        |160 |Amy Smith|N
			LP|accessamerica|478143|5/27/2011|Florence|KY|Laredo|TX|V|1|F|0||42000| | | |866-329-9141        |505 |Eric Backus|N
			LC|access06|477689
			LP|accessamerica|477833|5/27/2011|Savannah|GA|Pendergrass|GA||1|F|0|| | | | |866-272-2057        |168 |Asa Shirley|N
			LP|access06|477834|5/31/2011|Rock Island|IL|Milwaukee|WI|F|1|F|0||19000| | | |866-202-5042        |339 |Shawn Thissen|N
			LU|accessamerica|477059|5/27/2011|Nashville|IL|Kansas City|MO|V|1|F|0||44000| | | |866-329-9141        |524 |Shane McCool|N
			LU|accessamerica|477400|5/27/2011|Austin|TX|Suwanee|GA|V|1|F|0||40000| | | |866-329-9141        |524 |Shane McCool|N
			LU|accessamerica|477404|5/27/2011|Austin|TX|Charlotte|NC|V|1|F|0||40000| | | |866-329-9141        |524 |Shane McCool|N
			LU|accessamerica|477407|5/27/2011|Austin|TX|Chattanooga|TN|V|1|F|0||40000| | | |866-329-9141        |524 |Shane McCool|N
			LU|accessamerica|477699|5/27/2011|greenville|sc|granite falls|nc|V|1|F|0||44000| | | |866-329-9141        |524 |Shane McCool|N
			LU|accessamerica|477700|5/27/2011|Nashville|IL|Des Moines|IA|V|1|F|0||44000| | | |866-329-9141        |524 |Shane McCool|N
		 */
		$fullLoad = "F";
		if(!$fullLoad){
			$fullLoad = "P";
		}
		$postItems = array(
			$command,
			self::Name,
			$this->LoadId,
			$this->PickupStartDate,
			$this->StartingCity,
			$this->StartingState,
			$this->DestinationCity,
			$this->DestinationState,
			$this->TrailerType, //V
			$this->Quantity, //1
			$fullLoad, //F or P
			$this->Amount, //0
			"", //
			$this->Weight,
			"",
			"",
			$this->Comments,
			$this->ContactPhone,
			$this->ContactExtension,
			$this->ContactName,
			"N", //N
		);
		return implode('|', $postItems);
	}
}