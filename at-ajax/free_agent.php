<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

$nContactId = request('contact_id');
$nUserId = request('user_id');
$sAction = request('a', request('action') );
$sDisplay = request('d', request('display') );
$sRestricted = request('restricted', '0');
$nTaskId = request('task_id');

$oDb = new DBModel();
$oDb->connect();


switch($sAction) {
	case "release": 
		if (empty($nContactId) ) break;
		$sTimeStamp = date('Y-m-d H:i:s');
		$sql = "UPDATE contact_owners 
				SET free_agent = '1', updated_by_id = '" . get_user_id() ."', updated_at = '". $sTimeStamp . "'" .
				($sRestricted == '0' ? ", owner_id = '0' " : " ") . "
				WHERE contact_id = '". $nContactId . "'";
		$oDb->query($sql);
		
		$sDisplay = $sAction;
		break;
	case "clear_task":
		if (empty($nTaskId) ) break;
		$sql = "UPDATE task_base
				SET completed_at = '". date('Y-m-d H:i:s') ."'
				WHERE task_id = '". $nTaskId ."'";
		$oDb->query($sql);
		$sDisplay = 'task_cleared';
	
	case "transfer":
		$nUserId = request('user_id');
		$nContactId = request('contact_id');
		
		$sTimeStamp = date('Y-m-d H:i:s');
		$sThreshhold = strtotime('-7 day');
		$sql = "SELECT * FROM contact_owners WHERE contact_id ='$nContactId' AND free_agent = '1'";
		$res = $oDb->query($sql);
		$vNewContact = false; //guilty until proven innocent
		if ( $row = $oDb->db->fetch_array($res) ) {
			if ($row['updated_by_id'] == get_user_id() && strtotime($row['updated_at']) >= $sThreshhold) {
				//This user Released this contact recently
			}
			else{
				//Contact is New!
			}
		}
		else{
			// Contact is not a free agent
			break;
		}
		
		$sql = "UPDATE contact_owners 
				SET owner_id = '" . $nUserId ."', free_agent = '0', updated_by_id = '" . get_user_id() ."', updated_at = '". $sTimeStamp . "'
				WHERE contact_id = '" . $nContactId . "';
				
				UPDATE task_base 
				SET completed_at = '". $sTimeStamp . "', updated_by_id = '" . get_user_id() ."', updated_at = '". $sTimeStamp . "'
				WHERE task_id IN (
					SELECT task_id FROM task_details details
					LEFT JOIN task_details_types types ON types.task_details_type_id = details.task_details_type_id
					WHERE types.task_details_type_name = 'contact_id'
						AND details.task_details_value = '".$nContactId."'
				)";
		echo $oDb->query($sql) ;
		break;
	default;
		break;
		
}

switch ($sDisplay) {
	case "task_cleared":
		?>Cleared task: <?=$nTaskId;?> <?
		break;
		
	case "claim":
		
		$sSql = "SELECT owner.owner_id, (contact.first_name + ' ' + contact.last_name) as name, (oc.first_name + ' ' + oc.last_name) as contact_owner_name FROM contact_base contact
					LEFT JOIN contact_owners owner ON owner.contact_id = contact.contact_id
					LEFT JOIN user_base user_owner ON user_owner.user_id = owner.owner_id
					LEFT JOIN contact_base oc ON oc.contact_id = user_owner.contact_id
					WHERE contact.contact_id = '$nContactId'";
		
		$res = $oDb->query($sSql);
		if ($row = $oDb->db->fetch_array($res)) {
			$a['contact_id'] = $nContactId;
			$a['contact_name'] = $row['name'];
			$a['contact_owner_name'] = $row['contact_owner_name'];
			$a['owner_id'] = $row['owner_id'];
			$a['restricted'] = ($a['owner_id'] == 0 ? "0" : "1");
		}
		
		if ($a['restricted']) {
			?>
			Request to claim contact <?=$a['contact_name'];?> sent to <?=$a['contact_owner_name'];?>. <br>
			<br>Thank you.
			
			<?php
			$oTask = new TaskBase();
			
			$oUser = new UserBase();
			$sUserName = $oUser->get_contact_name($nUserId);
			
			$nTaskTypeId = 10; //Confirm Contact Transfer
			$nEmployeeId = $a['owner_id'];
			$nDueAt = time();
			$aTaskDetails = array(	'contact_name' => $a['contact_name'], 
									'user_name' => $sUserName, 
									'user_id' => $nUserId, 
									'contact_id' => $nContactId); 
			$nCreatedById = get_user_id();
			$oTask->create($nTaskTypeId, $nEmployeeId, $nDueAt, $aTaskDetails, $nCreatedById );
		}
		else{
			?>
			You have claimed <?=$a['contact_name'];?>. 
			<?
			$sTimeStamp = date('Y-m-d H:i:s');
			$sThreshhold = strtotime('-7 day');
			$sql = "SELECT * FROM contact_owners WHERE contact_id ='$nContactId' AND free_agent = '1'";
			$res = $oDb->query($sql);
			$vNewContact = false; //guilty until proven innocent
			if ( $row = $oDb->db->fetch_array($res) ) {
				if ($row['updated_by_id'] == get_user_id() && strtotime($row['updated_at']) >= $sThreshhold) {
					//This user Released this contact recently
					
				}else{
					//Contact is New!
					$vNewContact = true;
					echo "<br><br>+1 contact!";
				}
			}else{
				// Contact is not a free agent
				break;
			}
			
			$sql = "UPDATE contact_owners 
					SET owner_id = '" . $nUserId ."', free_agent = '0', updated_by_id = '" . get_user_id() ."', updated_at = '". $sTimeStamp . "'
					WHERE contact_id = '" . $nContactId . "'";
			$oDb->query($sql);
		}
		break;
	case "confirm": 
		$oUser = new UserBase();
		$sUserName = $oUser->get_contact_name($nUserId);
		$oContact = new ContactBase();
		$oContact->load($nContactId);
		/*<html> 
		<head> 
			<link type="text/css" rel="stylesheet" href="/resources/css/style.css" />
			<script src="/resources/js/jquery-1.4.3.min.js" type="text/javascript"></script>
			
		</head>
		<body>
		 */
		?>
		<span id='user'><?=$sUserName;?></span> Wants to claim contact: <span id='contact'><?=$oContact->get_FirstLastName();?></span>
		<div id="choices"><input id="accept" type="button" value="Accept"> <input id="deny" type="button" value="Deny"></div>
		
		<div id="ajax" style="display:none;"></div>
		
		<script type="text/javascript">
			$('#choices > input').click();
			$('input#accept').click(function(){
				make_decision(true);
				$('#dialog_stage').dialog("close");
			});
			$('input#deny').click(function(){
				make_decision(false);
				$('#dialog_stage').dialog("close");
			});

			function make_decision(v) {
				url = '/at-ajax/free_agent.php';
				if (v) {
					html = 'Accepted';
					$.post( url, { user_id: '<?=$nUserId;?>', contact_id: '<?=$nContactId;?>', task_id: '<?=$nTaskId;?>', a: 'transfer' });
				}else{
					html = 'Denied';
					$.post( url, { task_id: '<?=$nTaskId;?>', a: 'clear_task' } );
				}
				$('#choices').html(html);
			}
		</script>
		<?
		break;
		
		
	default:
		//pre("Contact Id: " . var_dump($nContactId, true) );
		//pre("User Id: " . var_dump($nUserId, true) );
		//echo json_encode(array('contact_id' => $nContactId, 'user_id' => $nUserId, 'action' => $sAction) ) ;
		break;
}?>
