<?php
require_once  dirname(__FILE__) .  '/Error.php';

abstract class Integration_Abstract {
	protected static $ServiceName;
	
	//abstract protected function search($params);
	
	/**
	 * Adds a post to a service, returns an error list
	 * @param integer $preOrderId
	 * @return Integration_ErrorList errors
	 */
	abstract protected function add($preOrderId);
	
	/**
	 * Deletes a post from this service with specified preOrderId
	 * @param integer $preOrderId
	 * @return Integration_ErrorList errors
	 */
	abstract protected function delete($preOrderId);
}