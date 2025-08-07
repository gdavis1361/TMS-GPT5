<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');

$sName = request('term');

$o = new ContactTypes();
$o->where('type_name', 'like', $sName);

$aTypes = $o->list()->rows;

$a = array();
foreach($aTypes as $type) {

	$type->set('label', $type->get('type_name') );
	$a[] = $type->get();
}
if (!empty($a)) echo json_encode($a);

?>
