<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

$nContactId = request('contact_id');
$sComment = request('comment');
$nTypeId = request('comment_type');
$nCreatedById = get_user_id();

$o = new ContactComments();

$o->create($nContactId, $sComment, $nTypeId, $nCreatedById);




?>