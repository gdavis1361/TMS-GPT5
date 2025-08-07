<?php

class Util_SessionController extends AjaxController {
	public function getAction(){
		$this->setParam('sessionId', session_id());
	}
	
	public function getUserAction(){
		$this->setParam('sessionId', get_user_id());
	}
}