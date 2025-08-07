<?
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
if ($oSession->session_var('role_id') !== 1) die(); // Admins Only!

$aFilter['group_id'] = request('filter_group_id');
$aFilter['name'] = request('filter_name');

$o = new DBModel();
$o->connect();

foreach ($aFilter as $k => $val) {
	if ( !empty($val) ) 
		$aFilter[$k] = $o->db->sql_escape($val);
}

$aFilter['name'] = trim($aFilter['name'], "'");

$s = 
"SELECT type.point_type_id, type.point_type_name, value.effective_date, value.point_value, point_group.group_name, unit.unit_name FROM tms.dbo.league_point_types type
	LEFT JOIN tms.dbo.league_point_values value ON value.point_type_id = type.point_type_id
	LEFT JOIN tms.dbo.league_point_groups point_group ON point_group.group_id = type.point_type_group_id
	LEFT JOIN tms.dbo.tools_units unit ON unit.unit_id = type.unit_type_id
	WHERE value.active = '1' 
	" .( !empty($aFilter['name']) ? "AND type.point_type_name LIKE '%" . $aFilter['name'] . "%' " : "" ) .
	( !empty($aFilter['group_id']) ? "AND point_group.group_id = " . $aFilter['group_id'] . " " : "" ) . "
	ORDER BY point_group.group_name DESC";

$res = $o->query($s);

$aReturn = array();
while ($row = $o->db->fetch_object($res) ) {
	if ( isset($row->hire_date) && !empty($row->hire_date) ) {
		$row->hire_date = date('M d, Y', strtotime($row->hire_date) );
	}
	$aReturn[] = $row;
}
if ( empty($aReturn) ) 
	die();
echo json_encode($aReturn);

?>