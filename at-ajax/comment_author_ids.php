<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');

$nId = request('id', '');

$o = new DBModel();
$o->connect();

$s = "SELECT DISTINCT comment.created_by_id as user_id, (contact.first_name + ' ' + contact.last_name) as name FROM tms.dbo.contact_comments comment
		LEFT JOIN tms.dbo.user_base ON comment.created_by_id = user_base.user_id
		LEFT JOIN tms.dbo.contact_base contact ON contact.contact_id = user_base.contact_id
		WHERE comment.contact_id = " . $nId ;

$res = $o->query($s);

$a = array();
while ( $row = $o->db->fetch_object($res) ) {
	$a[] = $row;
}

echo json_encode($a);
?>