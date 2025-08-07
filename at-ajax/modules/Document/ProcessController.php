<?php

class Document_ProcessController extends AjaxController {

	public function getRelationTypesAction() {
		$query = "SELECT DISTINCT relation_table_name FROM document_relation";
		$rows = LP_Db::fetchAll($query);
		for ($i = 0; $i < count($rows); $i++) {
			if (isset(DocumentRelation::$map[$rows[$i]['relation_table_name']])) {
				$rows[$i]['relation_table_display'] = DocumentRelation::$map[$rows[$i]['relation_table_name']];
			}
		}
		$this->setParam('records', $rows);
	}
	
	public function getGridRecordsAction() {
		// get submitted params
		$type = getParam('type', 'contact');
		$contact_id = intval(getParam('contact_id', 0));
		$carrier_id = intval(getParam('carrier_id', 0));
		$customer_id = intval(getParam('customer_id', 0));
		$order_id = intval(getParam('order_id', 0));

		// get submitted params
		$sortBy = getParam('sort', false);
		$filter = json_decode(getParam('filter', '{}'), true);

		// Setup the filtering and query variables
		$start = intval(request('start', 0));
		$limit = intval(request('limit', 10));

		// build query data
		$fields = array(
			'document_base.document_id',
			'document_base.file_type',
			'document_base.description',
			'document_types.document_type_name',
			'document_base.created_at',
			'document_relation.relation_table_name',
			'document_relation.relation_table_key'
		);
		$from = array(
			'document_base'
		);
		$join = array(
			'LEFT JOIN document_to_type ON document_to_type.document_id = document_base.document_id',
			'LEFT JOIN document_types ON document_types.document_type_id = document_to_type.document_type_id',
			'LEFT JOIN document_relation ON document_relation.document_id = document_base.document_id'
		);
		$where = array();
		$sort = array(
			'created_at DESC'
		);
		if ($sortBy) {
			$sortArray = json_decode($sortBy, true);
			$numSorters = count($sortArray);
			$sort = array();
			for ($i = 0; $i < $numSorters; $i++) {
				$sort[] = $sortArray[$i]['property'] . ' ' . $sortArray[$i]['direction'];
			}
		}

		//Process any filters
		foreach ($filter as $key => $value) {
			if (strlen($value)) {
				$cleanValue = LP_Db::escape($value);
				switch ($key) {
					case 'contact_id':
						$where[] = "document_relation.relation_table_name = 'contact_base'";
						$where[] = "document_relation.relation_table_key = '$cleanValue'";
						break;

					case 'carrier_id':
						$where[] = "document_relation.relation_table_name = 'carrier_base'";
						$where[] = "document_relation.relation_table_key = '$cleanValue'";
						break;

					case 'customer_id':
						$where[] = "document_relation.relation_table_name = 'customer_base'";
						$where[] = "document_relation.relation_table_key = '$cleanValue'";
						break;

					case 'order_id':
						$where[] = "document_relation.relation_table_name = 'order_base'";
						$where[] = "document_relation.relation_table_key = '$cleanValue'";
						break;
				}
			}
		}

		// convert query data to sql
		$fieldsSql = implode(',', $fields);
		$fromSql = ' FROM ' . implode(',', $from);
		$joinSql = implode(' ', $join);
		$whereSql = 'WHERE ' . implode(' AND ', $where);
		if (!count($where)) {
			$whereSql = '';
		}
		$sortSql = implode(',', $sort);

		// get total count
		$total = 0;
		$totalQuery = "SELECT COUNT(*) total $fromSql $joinSql $whereSql ";
		$row = LP_Db::fetchRow($totalQuery);
		if ($row) {
			$total = $row['total'];
		}
		$this->setParam('total', $total);

		// get records
		$query = "SELECT $fieldsSql $fromSql $joinSql $whereSql ";
		$this->setParam('query', $query);
		$query = LP_Util::buildQuery($query, $sortSql, $limit, $start);
		$this->setParam('query2', $query);
		$rows = LP_Db::fetchAll($query);

		$numRows = count($rows);
		for ($i = 0; $i < $numRows; $i++) {
			if (isset(DocumentRelation::$map[$rows[$i]['relation_table_name']])) {
				$rows[$i]['relation_table_display'] = DocumentRelation::$map[$rows[$i]['relation_table_name']];
			}
			$rows[$i]['created_at'] = strtotime($rows[$i]['created_at']);
			$rows[$i]['downloadUrl'] = DocumentBase::DocumentPath . '/' . $rows[$i]['document_id'] . '.' . $rows[$i]['file_type'];
		}

		$this->setParam('records', $rows);
	}

	public function updateRecordAction() {
		$documentId = intval(getParam('documentId', 0));
		$field = getParam('field');
		$value = getParam('value');
		$document = new DocumentBase($documentId);
		
		// document type will be passed as a name because combobox is awful
		if ($field == 'document_type_name') {
			// look up type id
			$documentType = new DocumentTypes();
			$documentType->load(array(
				'document_type_name' => $value
			));
			$typeId = $documentType->get('document_type_id');
			$documentToType = new DocumentToType();
			$documentToType->load(array(
				'document_id' => $documentId
			));
			$documentToType->setArray(array(
				'document_id' => $documentId,
				'document_type_id' => $typeId
			));
			$documentToType->save();
		}
		else if ($field == 'relation_table_display') {
			$tableName = DocumentRelation::$map[$value];
			$documentRelation = new DocumentRelation();
			$documentRelation->load(array(
				'document_id' => $documentId
			));
			$documentRelation->set('relation_table_name', $tableName);
			$documentRelation->save();
		}
		else if ($field == 'relation_table_key') {
			$value = intval($value);
			$documentRelation = new DocumentRelation();
			$documentRelation->load(array(
				'document_id' => $documentId
			));
			$documentRelation->set('relation_table_key', $value);
			$documentRelation->save();
		}
		else {
			$document->set($field, $value);
		}
		
		// Something HAS to be set on the document before calling save, otherwise it messed up
		// somewhere in the update query
		$document->set('active', 1);
		$document->save();
		
		$document->checkTasks();
		
		// check if this updated info was for an order
		// get the relation
		$documentRelation = new DocumentRelation();
		$documentRelation->load(array(
			'document_id' => $document->get('document_id')
		));
		if ($documentRelation->get('relation_table_name') == 'order_base') {
			$orderBase = new OrderBase($documentRelation->get('relation_table_key'));
			$orderBase->checkTasks();
		}
	}

	public function uploadFileAction() {
		$this->setParam('files', $_FILES);
		$this->setParam('post', $_POST);
		$extraParams = json_decode(getParam('extraParams', '{}'), true);
		$file = $_FILES['file'];
		foreach ($extraParams as $key => $value) {
			if (strlen($value)) {
				$cleanValue = LP_Db::escape($value);
				$tableKey = intval($value);

				switch ($key) {
					case 'contact_id':
						$tableName = 'contact_base';
						$extraParams['relation_table_name'] = $tableName;
						$extraParams['relation_table_key'] = $tableKey;
						$documentBase = new DocumentBase();
						$documentBase->uploadFile($file, $extraParams);
						break;

					case 'carrier_id':
						$tableName = 'carrier_base';
						$extraParams['relation_table_name'] = $tableName;
						$extraParams['relation_table_key'] = $tableKey;
						$documentBase = new DocumentBase();
						$documentBase->uploadFile($file, $extraParams);
						break;

					case 'customer_id':
						$tableName = 'customer_base';
						$extraParams['relation_table_name'] = $tableName;
						$extraParams['relation_table_key'] = $tableKey;
						$documentBase = new DocumentBase();
						$documentBase->uploadFile($file, $extraParams);
						break;

					case 'order_id':
						$tableName = 'order_base';
						$extraParams['relation_table_name'] = $tableName;
						$extraParams['relation_table_key'] = $tableKey;
						$documentBase = new DocumentBase();
						$documentBase->uploadFile($file, $extraParams);

						$order = new OrderBase($tableKey);
						$order->checkTasks();

						break;
					
					case 'allDocuments':
						$extraParams['relation_table_name'] = '';
						$extraParams['relation_table_key'] = 0;
						$documentBase = new DocumentBase();
						$documentBase->uploadFile($file, $extraParams);
						break;
				}
			}
		}
	}
	
	public function getScannerListAction() {
		$documentBase = new DocumentBase();
		$fileCount = $documentBase->getScannedFileCount();
		$records = array();
		foreach($fileCount as $dir => $num) {
			$records[] = array(
				'scannerName' => end(explode('/', $dir)),
				'scannerDisplay' => ucfirst(end(explode('/', $dir))) . " ($num)"
			);
		}
		sort($records);
		$this->setParam('records', $records);
	}
	
	public function importDocumentsAction() {
		$scannerName = getParam('scannerName');
		$limit = getParam('limit', 0);
		if ($scannerName && $limit) {
			$documentBase = new DocumentBase();
			$scannedDir = $documentBase->m_sScannerPath . $scannerName;
			if ($handle = opendir($scannedDir)) {
				$i = 0;
				while(($i < $limit || $limit == -1) && (false !== ($file = readdir($handle)))) {
					if (substr($file, 0, 1) != '.') {
						$path = $scannedDir . '/' . $file;
						if (is_file($path)) {
							// Import file
							$pathInfo = pathinfo($path);
							$data = array(
								'file_type' => $pathInfo['extension'],
								'scanner_name' => $scannerName
							);
							$documentBase = new DocumentBase();
							$documentBase->create($data);
							$newPath = $documentBase->m_sDocumentPath . '/' . $documentBase->get('document_id') . '.' . $data['file_type'];

							rename($path, $newPath);
							
							$documentRelation = new DocumentRelation();
							$documentRelation->create(array(
								'document_id' => $documentBase->get('document_id'),
								'relation_table_name' => '',
								'relation_table_key' => 0
							));
						}
						$i++;
					}
				}
				closedir($handle);
			}
			$documentBase->checkTasks();
		}
	}

}