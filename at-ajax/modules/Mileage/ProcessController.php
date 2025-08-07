<?php
class Mileage_ProcessController extends AjaxController {
	
	public function calculateMilesAction() {
		$stops = json_decode(getParam('stops', '[]'), true);
		$numStops = count($stops);
		
		$pcMiler = new Mileage_PCMiler();
		$google = new Mileage_Google();
		
		$results = array(
			'google' => $google->getStopDistances($stops),
			'pcmiler' => $pcMiler->getStopDistances($stops)
		);
		
		$this->setParam('stops', $stops);
		$this->setParam('results', $results);
	}
	
}