<?php

/**
 * Document Base
 *
 * @author Steve Keylon
 */
class DocumentBase extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'document_base';
	var $m_sScanned = '/resources/scanned/';
	var $m_sScannerPath = '/resources/scanned/';
	var $m_sDocumentPath = '/resources/docs';
	var $m_aFileTypes = array('pdf', 'tif');

	const ScannerPath = '/resources/scanned/';
	const DocumentPath = '/resources/docs';

	public function __construct($key = false) {
		parent::__construct($key);
		$this->m_sScannerPath = $_SERVER['DOCUMENT_ROOT'] . $this->m_sScannerPath;
		$this->m_sDocumentPath = $_SERVER['DOCUMENT_ROOT'] . $this->m_sDocumentPath;
	}

	public function create($aVars) {

		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;

		if (!isset($aVars['file_type']) || empty($aVars['file_type']) || !in_array($aVars['file_type'], $this->m_aFileTypes)) {
			add_error('Must provide a valid File Type', $key);
			return false;
		}

		if (!isset($aVars['description'])) {
			$aVars['description'] = '';
		}

		$nCreatedById = isset($aVars['created_by']) ? $aVars['created_by'] : get_user_id();
		if (!$this->is_loaded())
			$this->set('created_by', $nCreatedById);
		else {
			// Account for using this function as an edit function
//			$this->set_updated_by_id($nCreatedById);
//			$this->set_updated_at( time() );
		}

		foreach ($aVars as $k => $v) {
			$this->set($k, $v);
		}

		$this->save();

		return true;
	}

	function list_scanned_files($sDirectory = false) {
		$sDir = $this->m_sScannerPath;
		//echo "Looking for scanned files in: " . $sDir . "<br><br>";

		if ($sDirectory === false) {
			$oDir = dir($sDir);

			$aFiles = array();
			while ($sFile = $oDir->read()) {
				if (substr($sFile, 0, 1) == '.')
					continue;
				$oSubDir = dir($sDir . $sFile);
				while ($sSubFile = $oSubDir->read()) {
					if (substr($sSubFile, 0, 1) == '.')
						continue;

					$a = pathinfo($sSubFile);

					if (!in_array($a['extension'], $this->m_aFileTypes))
						continue;
					$aFiles[$sFile][] = $a;
				}
				$oSubDir->close();
			}

			$oDir->close();
			return $aFiles;
		}else {
			$oDir = dir($sDir . $sDirectory);

			$aFiles = array();
			while ($sSubFile = $oDir->read()) {
				if (substr($sSubFile, 0, 1) == '.')
					continue;

				$a = pathinfo($sSubFile);

				if (!in_array($a['extension'], $this->m_aFileTypes))
					continue;
				$aFiles[] = $a;
			}

			$oDir->close();
			return $aFiles;
		}
	}

	function list_scanners() {
		$sDir = $this->m_sScannerPath;
		//echo "Looking for scanned files in: " . $sDir . "<br><br>";
		$oDir = dir($sDir);

		$aFiles = array();
		while ($sFile = $oDir->read()) {
			if (substr($sFile, 0, 1) == '.')
				continue;
			$aFiles[] = $sFile;
		}

		$oDir->close();
		return $aFiles;
	}
	
	public function getScannedDirs() {
		$scannedDir = $this->m_sScannerPath;
		$dirs = array();
		// loop through each dir
		
		if ($handle = opendir($scannedDir)) {
			while (false !== ($file = readdir($handle))) {
				if ($file != '.' && $file != '..') {
					$path = $scannedDir . $file;
					if (is_dir($path)) {
						$dirs[] = $path;
					}
				}
			}
			closedir($handle);
		}
		return $dirs;
	}
	
	public function getScannedFileCount() {
		$dirs = $this->getScannedDirs();
		$dirInfo = array();
		
		// Loop through each dir and get a file list count
		for ($i = 0; $i < count($dirs); $i++) {
			$dirInfo[$dirs[$i]] = 0;
			
			if ($handle = opendir($dirs[$i])) {
				while (false !== ($file = readdir($handle))) {
					if ($file != '.' && $file != '..' && substr($file, 0, 1) != '.') {
						$path = $dirs[$i] . '/' . $file;
						if (is_file($path)) {
							$dirInfo[$dirs[$i]]++;
						}
					}
				}
				closedir($handle);
			}
		}
		
		return $dirInfo;
	}

	public static function file_types() {
		$o = new DocumentBase();
		return $o->m_aFileTypes;
	}

	public function uploadFile($file, $extraParams = array()) {
		if ($file['size']) {
			$pathinfo = pathinfo($file['name']);
			$data['file_type'] = $pathinfo['extension'];
			$data['original_file_name'] = $file['name'];
			$data['scanner_name'] = 'uploaded';
			$data['description'] = $file['name'];
			$this->create($data);
		}

		$documentId = $this->get('document_id');

		$sNewFile = $this->m_sDocumentPath . '/' . $documentId . '.' . $data['file_type'];
		if ($file['size']) {
//			move_uploaded_file($file['tmp_name'], $sNewFile);
		}

		$documentToType = new DocumentToType();
		$documentToType->create(array(
			'document_id' => $documentId,
			'document_type_id' => 0
		));

		$documentRelation = new DocumentRelation();
		$documentRelation->create(array(
			'document_id' => $documentId,
			'relation_table_name' => $extraParams['relation_table_name'],
			'relation_table_key' => $extraParams['relation_table_key']
		));

		if ($extraParams['relation_table_name'] == 'order_base') {
			$orderId = intval($extraParams['relation_table_key']);
			$orderBase = new OrderBase($orderId);
			$orderBase->checkTasks();
		}
	}
	
	public function getFileName() {
		return $this->m_sDocumentPath . '/' . $this->get('document_id') . '.' . $this->get('file_type');
	}
	
	public function checkTasks() {
		$this->checkScannedDocuments();
	}
	
	public function checkScannedDocuments() {
		$info = $this->getScannedFileCount();
		
		// get role id
		$auditingRoleId = UserRoles::Auditing;
		
		// get task type id
		$taskName = 'Annotate Documents';
		$taskType = new TaskTypes();
		$taskType->load(array(
			'task_name' => $taskName
		));
		$taskTypeId = $taskType->get('task_type_id');
		
		// get scanner_name type id
		$taskDetailsTypes = new TaskDetailsTypes();
		$taskDetailsTypes->load(array(
			'task_details_type_name' => 'scanner_name'
		));
		$scannerId = $taskDetailsTypes->get('task_details_type_id');
		
		// find open tasks related to scanner documents
		$query = "SELECT task_base.*, task_details.task_details_value
			FROM task_base
			LEFT JOIN task_details ON task_details.task_id = task_base.task_id
			WHERE task_type_id = $taskTypeId
			AND employee_id = 0
			AND completed_at IS NULL
			AND claimable = 0
			AND role_id = $auditingRoleId
			AND task_details_type_id = $scannerId";
		$rows = LP_Db::fetchAll($query);
		$tasks = array();
		for ($i = 0; $i < count($rows); $i++) {
			$tasks[$rows[$i]['task_details_value']] = $rows[$i]['task_id'];
		}
		
		// loop through document count info to see if we need to complete any tasks or make new ones
		foreach($info as $path => $quantity) {
			$scannerName = end(explode('/', $path));
			if ($quantity) {
				// make a task if it doesn't exist
				if (!isset($tasks[$scannerName])) {
					// no task for this scanner so make one
					$taskBase = new TaskBase();
					$taskDetails = array(
						'scanner_name' => $scannerName,
						'num_docs' => $quantity
					);
					$taskBase->create($taskTypeId, 0, time(), $taskDetails, 0, $auditingRoleId, 0);
				}
				else {
					// task exists so update the quantity
					$taskDetails = array(
						'scanner_name' => $scannerName
					);
					$taskRow = TaskBase::findTask($auditingRoleId, $taskTypeId, $taskDetails, 'role_id');
					if ($taskRow) {
						$taskId = $taskRow['task_id'];
						$numDocsType = new TaskDetailsTypes();
						$numDocsType->load(array(
							'task_details_type_name' => 'num_docs'
						));
						$numDocsId = $numDocsType->get('task_details_type_id');
						$query = "UPDATE task_details SET task_details_value = $quantity WHERE task_id = $taskId AND task_details_type_id = $numDocsId";
						LP_Db::execute($query);
					}
				}
			}
			else {
				// clear the task if it exists
				if (isset($tasks[$scannerName])) {
					$taskBase = new TaskBase($tasks[$scannerName]);
					$taskBase->complete();
				}
				else {
					// do nothing
					
				}
			}
		}
	}

}