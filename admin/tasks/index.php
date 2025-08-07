<?
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

$sSection  = 'admin';
$sPage = request('p', request('page', 'home') );
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/header.php');

$sAction = request('a', request('action') );
$sDisplay = request('d', request('display') );

$nId = request('task_type_id', request('id') );


$aVars['task_name'] = request('task_name', '');
$aVars['task_description'] = request('task_description', '');
$aVars['task_url'] = request('task_url', '');
$aVars['task_priority_weight'] = request('task_priority_weight', '');
//$aVars['task_type_id'] = request('task_type_id', 0);

switch($sAction) {
	case 'edit':
		if (empty($nId) ) break;
	case 'add':
		$error = false;
		foreach($aVars as $k => $v) {
			if ( empty($v) ) {
				$error = true;
				echo "<b>$k</b> may not be left blank<br>";
			}
		}
		?><div class="contentBox2" >
			<div class="contentBox2_body" style="padding-left: 15px;"><?
				if (!$error){
					$oTaskType = new TaskTypes();
					
					if ($sAction == 'add') {
						$v = $oTaskType->insert($aVars);
						?>New Task Type Created Successfully!<?
					}elseif ($sAction == 'edit') {
						$oTaskType->where('task_type_id', '=', $nId);
						$oTaskType->update($aVars);
						?>Successfully Updated <? echo $aVars['task_name'];
					}
				}else{
					?><br>Errors caused <?=$sAction;?> to fail<?
					$sDisplay = $sAction;
				}
		?>	</div>
		</div>	<?
		break;
	case 'remove':
		if ( empty($nId) ) break;
		?><div class="contentBox2" >
			<div class="contentBox2_body" style="padding-left: 15px;"><?
				$oTask = new TaskTypes();
				$oTask->load($nId);
				$oTask->where('task_type_id', '=', $nId);
				$oTask->update( array('active' => '0') );
				echo "Task Template <b>" . $oTask->get('task_name') . "</b> has been removed.";
		?>	</div>
		</div>	<?
	break;
}

print_errors();

switch( $sDisplay ) {
	case 'confirm':
		if (empty($nId) ) break;
		$oTaskType = new TaskTypes();
		$oTaskType->load($nId);
		?><div class="contentBox2" ><div class="header_text Delicious">Remove Task Template</div>
			<div class="contentBox2_body" style="padding-left: 15px;">
				Are you sure you want to remove <b><?=$oTaskType->get('task_name');?></b>?<br>
				<form action="/admin/" method="post">
					<input type="hidden" name="page" value="tasks">
					<input type="hidden" name="a" value="remove">
					<input type="hidden" name="id" value="<?=$nId;?>">
					<input type="submit" value="Remove" />
					<input type="button" onclick="javascript:window.location='/admin/?page=tasks'" value="Cancel" />
				</form>
			</div>
		</div>	<?
		break;
	case 'edit':
		if (empty($nId) ) break;
		$oTaskType = new TaskTypes();
		$oTaskType->load($nId);
		
		$aVars['task_type_id'] = $nId;
		$aVars['task_name'] = $oTaskType->get('task_name');
		$aVars['task_description'] = $oTaskType->get('task_description');
		$aVars['task_url'] = $oTaskType->get('task_url');
		$aVars['task_priority_weight'] = $oTaskType->get('task_priority_weight');
	case 'add':
		require_once('_add.php');
		break;
	default:
		require_once('_list.php');

}