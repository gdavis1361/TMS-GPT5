<?php 
class Tms_ApplicationController extends AjaxController {
	
	public function requestAction(){
		$requests = getPostParam('requests', '[]');
		$requests = json_decode($requests, true);
		//pre($requests); die();
		$results = array();
		foreach ($requests as $request){
			//Set params
			$_REQUEST = $_POST = $_GET = array();
			if(strtolower($request['method']) == 'post'){
				$_POST = $request['params'];
			}
			if(strtolower($request['method']) == 'get'){
				$_GET = $request['params'];
			}
			$_REQUEST = array_merge($_POST, $_GET);
			
			$ajax = new AjaxController();
			$ajax->parseRequest($request['url']);
			$controllerClass = $ajax->run();
			$controllerClass->setHeaderData();
			$result = $controllerClass->getReturnCode();
			$result['transactionId'] = $request['transactionId'];
			$results[] = $result;
		}
		$results = array_reverse($results);
		$this->setParam('results', $results);
	}
}
