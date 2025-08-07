<?php

/**
 * Contact Methods
 *
 * @author Steve Keylon
 */
class ContactMethods extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = 'contact_methods';

	public function create($nContactId, $nMethodTypeId, $sContactValue1, $sContactValue2, $nCreatedById, $methodIndex = -1) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if (!is_string($sContactValue1)) {
			add_error('CONTACT VALUE 1', $key);
			return FALSE;
		}
		if (!is_numeric($nMethodTypeId)) {
			add_error('METHOD TYPE ID', $key);
			return FALSE;
		}
		if (!is_numeric($nContactId)) {
			add_error('CONTACT ID', $key);
			return FALSE;
		}
		if (!is_numeric($nCreatedById)) {
			add_error('CREATED BY ID', $key);
			return FALSE;
		}
		
		if ($methodIndex == -1) {
			$methodIndex = $this->get_NextIndex($nContactId);
		}
		
		// remove any whitespace
		$sContactValue1 = str_replace(' ', '', $sContactValue1);
		
		$s = "SELECT method_id FROM contact_method_types WHERE method_group_id = '" . ToolsMethodGroups::PhoneType . "'";
		$a = LP_Db::fetchAll($s);
		$a = array_map(function($b){ return $b['method_id']; }, $a);
		
		if ( in_array($nMethodTypeId, $a) ) { // This is a phone type
			// Clean
			$clean = $this->cleanPhoneNumber($sContactValue1);
			
			$sContactValue1 = $clean['number'];
			$sContactValue2 = $clean['extension'];
		}

		// Save Data
		$this->set_contact_id($nContactId);
		$this->set_method_type_id($nMethodTypeId);
		
		$this->set('method_index', $methodIndex);
		
		$this->set_contact_value_1($sContactValue1);
		$this->set_contact_value_2($sContactValue2);
		$this->set_created_by_id($nCreatedById);
		$this->set_created_at(time());

		$this->save();
		// Report
		return true;
	}

	public function get_NextIndex($nContactId, $nMethodTypeId = 0) {
		$query = "SELECT TOP 1 method_index FROM contact_methods WHERE contact_id = $nContactId ORDER BY method_index DESC";
		$row = LP_Db::fetchRow($query);
		$methodIndex = 0;
		if ($row) {
			$methodIndex = $row['method_index'] + 1;
		}
		
		return $methodIndex;
	}

	public function list_by_contact_id($nContactId, $nMethodGroup=0) {
		$this->connect();
		$q = 'SELECT * FROM dbo.' . $this->m_sTableName . ' methods
				INNER JOIN dbo.contact_method_types types 
				ON methods.method_type_id = types.method_id
				INNER JOIN tools_method_groups groups
				ON groups.groups_id = types.method_group_id
				WHERE 1 = 1 
				' . ($nMethodGroup != 0 ? 'AND types.method_group_id = ' . $nMethodGroup : '') . '
				AND methods.contact_id = ' . $nContactId;

		$rs = $this->db->query($q);
		$a = array();

		while ($o = $this->db->fetch_object($rs)) {
			if (strcasecmp($o->group_name, 'phone') == 0) {
				// This is killing the phone number and only showing the first 3 numbers, so it is commented until
				// format_phone_number is fixed
//				$sValue = format_phone_number( $o->contact_value_1 );
				$sValue = $o->contact_value_1;
			}
			else {
				$sValue = $o->contact_value_1;
			}
			$a[] = array("method_type_id" => $o->method_type_id,
				"method_index" => $o->method_index,
				"method_type" => $o->method_type,
				"group" => strtolower($o->group_name),
				"value_1" => $sValue
			);
		}
		return $a;
	}

	/**
	 * get this contact method's contact_method_type and method_group_name
	 * @return array{
	 * 				'method_id' => method_id
	 * 				'method_type' => method_type
	 * 				'method_group_id' => method_group_id
	 * 				'group_name' => group_name
	 * 			}
	 */
	public function get_method_type_and_group() {
		$nId = $this->get_method_type_id();
		if (empty($nId))
			return false;
		$sQuery = "SELECT types.method_id, types.method_type, types.method_group_id, group.group_name
					FROM contact_method_types types
					INNER JOIN tools_method_groups group
					ON group.groups_id = method_group_id
					WHERE method_id = $nId";
		$res = $this->query($sQuery);
		return $this->db->fetch_array($res);
	}

	/**
	 * update the contact's method of contact
	 * @param int nContactId the id of the contact
	 * @param array aMethods an array of contact methods for this contact
	 * 		each array element is indexed by it's method_type_id
	 * 				array = {
	 * 					[0] => array {
	 * 						[method_type_id] => array {
	 * 							[method_index] => array {
	 * 								[method_type] => method_type
	 * 								[method_index] => method_index
	 * 								[contact_value_1] => contact_value_1
	 * 							}
	 * 						}
	 * 					}
	 * 					[1] => array {
	 * 						[0] => method_type_id
	 * 						[1] => contact_value_1
	 * 					}
	 * 				}
	 */
	public static function update_all_methods_by_contact_id($nContactId, $aMethods) {
		if (empty($nContactId) || !is_numeric($nContactId))
			return false;
		$nUserId = get_user_id();
		$aReturn = array();
		$o = new DBModel();
		$o->connect();
		$sQuery = "SELECT contact_id, method_type_id, method_index, contact_value_1, contact_value_2 
					FROM contact_methods
					WHERE contact_id = $nContactId
					ORDER BY method_index ASC";
		$res = $o->query($sQuery);
		$aMethodTypes = ContactMethodTypes::get_list();
		$vHaveDeleted = false; // keep track if we have deleted a contact method
		$nDeletedCount = 0; // how many contact methods of the same method_type
		$nCurrentMethodType = 0; // keep track of which method_type we are looping through
		$nLoopCount = 0;
		while ($row = $o->db->fetch_array($res)) {
			if ($nLoopCount == 0)
				$nCurrentMethodType = $row['method_type_id'];
			// if the sent is in the stored
			if (array_key_exists($row['method_type_id'], $aMethods[0]) &&
					array_key_exists($row['method_index'], $aMethods[0][$row['method_type_id']])) {

				$nIndex = $row['method_index'];

				// if the value is a phone number, strip all '(', ')', '-'
				if (strcasecmp($aMethodTypes[$row['method_type_id']]['group_name'], 'phone') == 0) {
					$sValue = str_replace(array('(', ')', '-'), '', $aMethods[0][$row['method_type_id']][$row['method_index']]['contact_value_1']);
				}
				else {
					$sValue = $aMethods[0][$row['method_type_id']][$row['method_index']]['contact_value_1'];
				}
				// if the value are different
				if ($row['contact_value_1'] != $sValue) {
					$o = new DBModel();
					$o->connect();
					$sQuery = "UPDATE contact_methods 
								SET contact_value_1 = '" . $sValue . "', 
								updated_by_id = $nUserId, updated_at = '" . date('M d Y h:i A') . "'";
					if ($vHaveDeleted) {
						$sQuery .= ", method_index = " . ( $row['method_index'] - $nDeletedCount );
						$nIndex = $row['method_index'] - $nDeletedCount;
					}else
						$nIndex = $row['method_index'];
					$sQuery .= " WHERE contact_id = $nContactId 
									AND method_type_id = " . $row['method_type_id'] . "
									AND method_index = " . $row['method_index'];
					$o->query($sQuery);
				}
				else if ($vHaveDeleted) {
					// if have deleted an contact method with the same method_type_id
					// the index increments for methods with the same method_type_id
					// update the index
					$o = new DBModel();
					$o->connect();
					$sQuery = "UPDATE contact_methods
								SET method_index = " . ( $row['method_index'] - $nDeletedCount ) . "
								WHERE contact_id = $nContactId 
								AND method_type_id = " . $row['method_type_id'] . "
								AND method_index = " . $row['method_index'];
					$o->query($sQuery);
					$nIndex = $row['method_index'] - $nDeletedCount;
				}
				// if this is a phone number
				if (strcasecmp($aMethodTypes[$row['method_type_id']]['group_name'], 'phone') == 0)
					$sValue = format_phone_number($sValue);
				// store for returning
				$aReturn[] = array('method_type_id' => $row['method_type_id'],
					'method_index' => $nIndex,
					'method_type' => $aMethodTypes[$row['method_type_id']]['method_type'],
					'group' => $aMethodTypes[$row['method_type_id']]['group_name'],
					'value_1' => $sValue);
				unset($aMethods[0][$row['method_type_id']][$row['method_index']]);
			}else { // delete this row and set the deleted flag and deleted count
				$o = new DBModel();
				$o->connect();
				$sQuery = "DELETE FROM contact_methods 
							WHERE contact_id = $nContactId 
							AND method_type_id = " . $row['method_type_id'] . "
							AND method_index = " . $row['method_index'];
				$o->query($sQuery);
				$vHaveDeleted = true;
				$nDeletedCount++;
			}
			$nLoopCount++;
			if ($nCurrentMethodType != $row['method_type_id']) { // keep track of what method_type we are on
				$nCurrentMethodType = $row['method_type_id'];
				$vHaveDeleted = false;
				$nDeletedCount = 0;
			}
		}
		foreach ($aMethods[1] as $aMethod) { // create any remaining sent
			$o = new ContactMethods();
			// if this is a phone number
			if (strcasecmp($aMethodTypes[$aMethod[0]]['group_name'], 'phone') == 0)
				$aMethod[1] = str_replace(array('(', ')', '-'), '', $aMethod[1]);
			// if fail creation
			if ($o->create($nContactId, $aMethod[0], $aMethod[1], '', $nUserId) !== true)
				$aReturn['errors'][] = 'Error creating new contact method ' . $aMethod[0] . ' ' . $aMethod[1] . '  ' . $aMethod[2];
			else { // store for returning
				$aMethod[1] = format_phone_number($aMethod[1]);
				$aReturn[] = array(
					'method_type_id' => $o->get_method_type_id(),
					'method_index' => $o->get_method_index(),
					'method_type' => $aMethodTypes[$o->get_method_type_id()]['method_type'],
					'group' => strtolower($aMethodTypes[$o->get_method_type_id()]['group_name']),
					'value_1' => $aMethod[1]);
			}
		}
		return $aReturn;
	}
	
	public static function cleanPhoneNumber($number) {
		$aClean = array('number' => $number, 'extension' => '');
		
		$n = trim( strtolower( $number ) );
		$aParts = explode('x', $n, 2);
		if (empty($aParts[0])) return $aClean;

		$aClean['number'] = preg_replace('/[^0-9]/', '', $aParts[0]);
		$aClean['extension'] = isset($aParts[1]) ? preg_replace('/[^0-9]/', '', $aParts[1]) : '';

		return $aClean;
	}
	
	/**
	 * format a sting into a readable phone number
	 * If an extension is used, an 'x' must be in the 
	 * delimiter somewhere. (Extension 300, ext.300, 
	 * xt300, x300, ex300, etc)
	 * @param $sPhoneNumber a phone number string
	 */
	public static function formatPhoneNumber($sPhoneNumber) {
		$sExtension = '';
		// separate the phone number from the extension
		$number = self::cleanPhoneNumber($sPhoneNumber);
		$sPhoneNumber = $number['number'];
		$sExtension = $number['extension'];
		
		if (strlen($sPhoneNumber) == 11)
			$sValue = substr($sPhoneNumber, 0, 1) . '-' . '(' . substr($sPhoneNumber, 1, 3) . ') ' . substr($sPhoneNumber, 5, 3) . '-' . substr($sPhoneNumber, 8);
		elseif (strlen($sPhoneNumber) == 10) {
			$sValue = '(' . substr($sPhoneNumber, 0, 3) . ') ' . substr($sPhoneNumber, 3, 3) . '-' . substr($sPhoneNumber, 6);
		}
		elseif (strlen($sPhoneNumber) == 7)
			$sValue = substr($sPhoneNumber, 0, 3) . '-' . substr($sPhoneNumber, 4);
		else
			$sValue = $sPhoneNumber;
		if ($sExtension != "") {
			$sValue .= " Ext $sExtension";
		}
		return $sValue;
	}

}