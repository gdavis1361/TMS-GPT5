<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');

$nOrderId = request('id', "");

$nCarrierId = request('cid', '');

if (empty($nOrderId) || empty($nCarrierId)) header('Location: /orders/');

$s = "UPDATE load_base SET carrier_id = '" . (int)$nCarrierId . "' WHERE order_id = '" . $nOrderId . "'";

echo $s;
$o = new DBModel();
$o->connect();
$o->query($s);

header('Location: /orders/?d=orders&a=show&id=' . $nOrderId);

?>
