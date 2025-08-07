<?
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
if ($oSession->session_var('role_id') !== 1) die(); // Admins Only!

$sDirectory = request('dir');

if ( !$sDirectory ) die();
$oDoc = new DocumentBase();

echo json_encode($oDoc->list_scanned_files($sDirectory));