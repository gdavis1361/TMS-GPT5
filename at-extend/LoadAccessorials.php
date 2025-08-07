<?php

class LoadAccessorials extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = 'load_accessorials';
	
	/**
	 *
	 * @param array $params load_id, accessorial_type_id, accessorial_qty, accessorial_per_unit, pay_to, acessorial_index
	 * @return type 
	 */
	public function create($params) {
		foreach ($params as $key => $value) {
			$this->set($key, $value);
		}

		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;

		if (!is_numeric($this->get('load_id'))) {
			add_error('Load Id: ' . $this->get('load_id'), $key);
			return FALSE;
		}
		if (!is_numeric($this->get('accessorial_type_id'))) {
			add_error('Accessorial Type Id: ' . $this->get('accessorial_type_id'), $key);
			return FALSE;
		}
		if (!is_numeric($this->get('accessorial_qty'))) {
			add_error('Accessorial Quantity: ' . $this->get('accessorial_qty'), $key);
			return FALSE;
		}
		if (!is_numeric($this->get('accessorial_per_unit'))) {
			add_error('Per Unit price: ' . $this->get('accessorial_per_unit'), $key);
			return FALSE;
		}

		$this->set('accessorial_total_charge', $this->get('accessorial_qty') * $this->get('accessorial_per_unit'));

		if (!is_numeric($this->get('accessorial_total_charge'))) {
			add_error('Accessorial Charge: ' . $this->get('accessorial_total_charge'), $key);
			return FALSE;
		}
		if (!is_numeric($this->get('pay_to'))) {
			add_error('Pay To Id: ' . $this->get('pay_to'), $key);
			return FALSE;
		}
		if (!is_numeric($this->get('created_by_id'))) {
			$this->set('created_by_id', get_user_id());
		}

		$success = $this->save();
		
		return $success;
	}

}