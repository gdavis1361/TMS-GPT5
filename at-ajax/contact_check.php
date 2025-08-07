<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');


$sName = request('name', '');
$aParts = explode_name($sName);


$o = new DBModel();
$o->connect();


$s = "SELECT (contact.first_name + ' ' + contact.last_name) as contact_name, (owner.first_name + ' ' + owner.last_name) as owner_name FROM contact_base contact
		LEFT JOIN contact_owners owners ON owners.contact_id = contact.contact_id
		LEFT JOIN user_base ON user_base.user_id = owners.owner_id
		LEFT JOIN contact_base owner ON user_base.contact_id = owner.contact_id
		WHERE contact.first_name LIKE '%" . $aParts['first_name'] . "%'
			AND contact.last_name LIKE '%" . $aParts['last_name'] . "%'";
			
$res = $o->query($s);

$a = array();

while( $row = $o->db->fetch_object($res) ) {
	$a[] = $row;
}

echo json_encode( $a );