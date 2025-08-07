<?php

class Cron_RunController extends AjaxController {
	
	public function dayAction() {
		LP_EventManager::fireEvent('Cron.day');
	}
	
	public function hourAction() {
		LP_EventManager::fireEvent('Cron.hour');
	}
	
	public function minuteAction() {
		LP_EventManager::fireEvent('Cron.minute');
	}
	
}