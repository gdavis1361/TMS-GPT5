<?php

require_once dirname(__FILE__) . '/Integration.php';

class Integration_Factory{
	
	/**
	 * Returns an instance of the passed integration type
	 * @param string $type
	 * @return Integration_Abstract
	 * @throws Exception
	 */
	public static function factory($type){
		if (include_once dirname(__FILE__) .'/' . ucfirst($type) . '.php') {
            $classname = 'Integration_' . ucfirst($type);
            return new $classname;
        } else {
            throw new Exception('Integration object not found');
        }
	}
}