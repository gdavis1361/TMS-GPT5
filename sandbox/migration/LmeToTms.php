<?php 
class LmeToTms extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = '';
	
	public function create($lmeTable, $lmeKey, $tmsTable, $tmsKey){
		//Run the insert query
		$this->connect();
		$lmeKey = LP_Db::escape(trim($lmeKey));
		$query = "INSERT INTO lme_to_tms.dbo.migrate
					(lme_table, lme_key, tms_table, tms_key)
					VALUES
					('$lmeTable', '$lmeKey', '$tmsTable', '$tmsKey')";
		$this->db->query($query);
	}
	
	public function find($fieldValueArray){
		$this->connect();
		$query = "SELECT * FROM lme_to_tms.dbo.migrate WHERE 1=1";
		foreach ($fieldValueArray as $field => $value){
			$query .= " AND $field = '$value'";
		}
		$result = $this->db->query($query);
		if ($this->db->num_rows($result) > 0 ) {
			$row = $this->db->fetch_object($result);
			return $row;
		}
		
		return false;
	}

	public function exists($lmeTable, $lmeKey, $tmsTable){
		$this->connect();
		$lmeKey = LP_Db::escape(trim($lmeKey));
		
		$query = "SELECT COUNT(*) count
					FROM lme_to_tms.dbo.migrate migrate
					WHERE migrate.lme_table = '$lmeTable'
					AND migrate.lme_key = '$lmeKey'
					AND migrate.tms_table = '$tmsTable'";
		$result = $this->db->query($query);
		
		if ($this->db->num_rows($result) > 0 ) {
			$row = $this->db->fetch_object($result);
			if($row->count){
				return true;
			}
		}
		
		return false;
	}
}