<?php
$nId = request('task_type_id', request('id') );

/*
$aVars['task_name'] = request('task_name', '');
$aVars['task_description'] = request('task_description', '');
$aVars['task_url'] = request('task_url', '');
$aVars['task_priority_weight'] = request('task_priority_weight', '');	
*/

$aVars['document_id'] = request('document_id');
$aVars['file_name'] = request('file_name');
$aVars['document_type_id'] = request('document_type_id');
$aVars['description'] = request('description');
$aVars['table_name'] = request('table_name');
$aVars['table_value'] = request('table_value');
$aVars['uploaded_file'] = isset($_FILES['uploaded_file']) ? $_FILES['uploaded_file'] : '';
$aVars['scanner_name'] = request('scanner_name');

switch($sAction) {
	case 'edit':
		//if (empty($nId) ) break;
	break;
	
	case 'add':
		$oDocument = new DocumentBase();
		$data['description'] = $aVars['description'];
		if ($aVars['uploaded_file']['size']) {
			$sFilename = $aVars['uploaded_file'];
			$aPath = pathinfo($sFilename['name']);
			$data['file_type'] = $aPath['extension'];
			$data['scanner_name'] = 'uploaded';
		}
		else {
			$sFilename = $aVars['scanner_name'] . '/' . $aVars['file_name'];
			$aPath = pathinfo($sFilename);
			$data['file_type'] = $aPath['extension']; 
			$data['scanner_name'] = $aVars['scanner_name'];
		}

		$oDocument->create($data);
		$nId = $oDocument->get('document_id');

		$sNewFile = $oDocument->m_sDocumentPath . '/' . $nId . '.' . $data['file_type'];

		if ($aVars['uploaded_file']['size']) {
			move_uploaded_file( $aVars['uploaded_file']['tmp_name'], $sNewFile );
		}
		else {
			rename( $oDocument->m_sScannerPath . $aVars['scanner_name'] . '/'  . $aVars['file_name'], $sNewFile );
		}

		$oDocType = new DocumentToType();

		$aDocToType = array(
			'document_id' => $nId,
			'document_type_id' => $aVars['document_type_id']
		);

		$oDocType->create($aDocToType);

		$oDocRelation = new DocumentRelation();

		$aDocRelData = array(
			'document_id' => $nId,
			'relation_table_name' => $aVars['table_name'],
			'relation_table_key' => $aVars['table_value']
		);

		$oDocRelation->create( $aDocRelData );
		
		if ($aVars['table_name'] == 'order_base') {
			$orderId = intval($aVars['table_value']);
			$orderBase = new OrderBase($orderId);
			$orderBase->checkTasks();
		}
		
		$oDocument->checkTasks();
		
		$sDisplay = 'list';

	break;
}

print_errors();

switch( $sDisplay ) {
	case 'edit':
	case 'add':
		require_once('_add.php');
	break;
		
	case "list":
	default:
		require_once('_list.php');
}