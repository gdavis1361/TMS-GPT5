<?
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
if ($oSession->session_var('role_id') !== 1) die(); // Admins Only!

$aVars = $_POST;

$sDateStart = !empty($aVars['date_start']) ? date('Y-m-d', strtotime($aVars['date_start']) ) : '';
$sTimeStart = !empty($aVars['time_start']) ? date('H:i:s', strtotime($aVars['time_start']) ) : '';

$sDateEnd = !empty($aVars['date_end']) ? date('Y-m-d', strtotime($aVars['date_end']) ) : '';
$sTimeEnd = !empty($aVars['time_end']) ? date('H:i:s', strtotime($aVars['time_end']) ) : '';

if ( empty($sDateStart) && empty($sTimeStart) ) {
	$sDateTimeStart = '';
} else if ( empty($sDateStart) ) {
	$sDateTimeStart = date('Y-m-d') . " " . $sTimeStart;
} else if ( empty($sTimeStart) ) {
	$sDateTimeStart = $sDateStart . ' 00:00:00.000';
}else{
	$sDateTimeStart = $sDateStart . ' ' . $sTimeStart;
}
if ( empty($sDateEnd) && empty($sTimeEnd) ) {
	$sDateTimeEnd = '';
} else if ( empty($sDateEnd) ) {
	$sDateTimeEnd = date('Y-m-d') . " " . $sTimeEnd;
} else if ( empty($sTimeEnd) ) {
	$sDateTimeEnd = $sDateEnd . ' 23:59:59.999';
}else{
	$sDateTimeEnd = $sDateEnd . ' ' . $sTimeEnd;
}

if ( empty($sDateTimeStart) ) {
	$sDateOperator = '<=';
} else if ( empty($sDateTimeEnd) ) {
	$sDateOperator = '>=';
}

$o = new DBModel();
$o->connect();

$aVars = array_map(function ($value) { global $o; return empty($value) ? '' : $o->db->sql_escape($value); }, $aVars);
$sDateTimeEnd = !empty($sDateTimeEnd) ? $o->db->sql_escape($sDateTimeEnd) : '';
$sDateTimeStart = !empty($sDateTimeStart) ? $o->db->sql_escape($sDateTimeStart) : '';

$aWhere = array();

if ( isset($sDateOperator) && (!empty($sDateTimeStart) || !empty($sDateTimeEnd) ) ) {
	$aWhere[] = "doc.created_at " . $sDateOperator . " " . (empty($sDateTimeStart) ? $sDateTimeEnd : $sDateTimeStart);
}else if ( !empty($sDateTimeEnd) && !empty($sDateTimeStart) ) {
	$aWhere[] = "(doc.created_at >= " . $sDateTimeStart . " AND doc.created_at <= " . $sDateTimeEnd . ")";
}

if (!empty($aVars['document_type']) ) {
	$aWhere[] = "type.document_type_id = " . $aVars['document_type'];
}

if (!empty($aVars['file_type']) ) { 
	$aWhere[] = "doc.file_type = " . $aVars['file_type'];
}

$s = 
"SELECT doc.document_id, type.document_type_name, doc.file_type, doc.description FROM tms.dbo.document_base doc
	LEFT JOIN tms.dbo.document_to_type ON document_to_type.document_id = doc.document_id
	LEFT JOIN tms.dbo.document_types type ON type.document_type_id = document_to_type.document_type_id
	" . (!empty($aWhere) ? "WHERE " . implode($aWhere, " AND ") : '');

$res = $o->query($s);

$aReturn = array();
while ($row = $o->db->fetch_object($res) ) {
	$aReturn[] = $row;
}

echo json_encode($aReturn);

?>