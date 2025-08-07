<?php
$nId = request('user_id', request('id') );

$aVars['user_name'] 		= request('user_name');
$aVars['contact_type_id'] 	= request('contact_type_id');
$aVars['first_name'] 		= request('first_name');
$aVars['last_name'] 		= request('last_name');
$aVars['user_id'] 			= $nId;
$aVars['role_id']			= request('role_id');
$aVars['ssn_no']			= request('ssn_no');
$aVars['employee_number'] 	= request('emp_no');
$aVars['hire_date'] 		= request('hire_date');
$aVars['supervisor_name'] 	= trim(request('supervisor_name'));
$aVars['supervisor_id'] 	= request('supervisor_id');
$aVars['league_team_id'] 	= request('league_team_id');
$aVars['pod_id']		 	= request('pod_id');
$aVars['user_branch']	 	= request('user_branch');

$aVars['pass_one']		 	= request('pass_one', '');
$aVars['pass_two'] 		 	= request('pass_two', '');

switch($sAction) {
	case 'edit':
		if (empty($nId) ) break;
	case 'add':
		if ( !empty($aVars['pass_one']) || !empty($aVars['pass_two']) ) {
			if ( $aVars['pass_one'] !== $aVars['pass_two'] ) {
				add_error('Passwords do not match!');
				$sDisplay = $sAction;
				break;
			}
		}
		if (!is_numeric($aVars['ssn_no']) || empty($aVars['ssn_no']) ) {
			add_error('SSN is invalid');
			$sDisplay = $sAction;
			break;
		}
		
		
		$oUser = new UserBase();
		$nContactId = null;
		if ($sAction == 'edit'){
			$oUser->load($nId);
			$nContactId = $oUser->get('contact_id');
		}
	
		$oContact = new ContactBase();
		if ($sAction == 'edit') $oContact->load($nContactId);
		
		$nCreatedById = get_user_id();
		
		$oContact->create( $aVars['contact_type_id'], $aVars['first_name'], $aVars['last_name'], '', '', '', $nCreatedById );
		$nContactId = $oContact->get( 'contact_id' );
		
		$oUser->create( $nContactId, $aVars['role_id'], $aVars['pass_one'], $aVars['user_name'], $nCreatedById );
		$nUserId = $oUser->get( 'user_id' );
		
		$oUserEmployee = new UserEmployees();
		if ($sAction == 'edit') $oUserEmployee->load($nId);
		$oUserEmployee->create( $nUserId, date('Y-m-d', strtotime($aVars['hire_date'])), $aVars['ssn_no'], $nCreatedById );
		
		
		if (isset($aVars['league_team_id']) && !empty($aVars['league_team_id'])){
			$oUserToTeam = new UserEmployeeToTeam();
			$oUserToTeam->create( $nUserId, $aVars['league_team_id'] );
		}
		
		if ( isset($aVars['user_branch']) && !empty($aVars['user_branch']) ){
			$oBranch = new UserEmployeeToBranch();
			if ($sAction == 'edit') $oBranch->load($nUserId);
			
			$oBranch->create( $nUserId, $aVars['user_branch'], '1', $nCreatedById );
		}
		
		break;
	case 'remove':
		if ( empty($nId) ) break;
		?><div class="contentBox2" >
			<div class="contentBox2_body" style="padding-left: 15px;"><?
				$oUser = new UserBase();
				$oUser->load($nId);
				$oUser->where('user_id', '=', $nId);
				$oUser->update( array('active' => '0') );
				echo "User <b>" . $oUser->get('user_name') . "</b> has been removed.";
				
		?>	</div>
		</div>	<?
	break;
}

print_errors();

switch( $sDisplay ) {
	case 'confirm':
		if (empty($nId) ) break;
		$oUser = new UserBase();
		$oUser->load($nId);
		?><div class="contentBox2" ><div class="header_text Delicious">Remove User</div>
			<div class="contentBox2_body" style="padding-left: 15px;">
				Are you sure you want to remove <b><?=$oUser->get('user_name');?></b>?<br>
				<form action="/admin/" method="post">
					<input type="hidden" name="page" value="<?=$sPage;?>">
					<input type="hidden" name="a" value="remove">
					<input type="hidden" name="id" value="<?=$nId;?>">
					<input type="submit" value="Remove" />
					<input type="button" onclick="javascript:window.location='/admin/?page=<?=$sPage;?>'" value="Cancel" />
				</form>
			</div>
		</div>	<?
		break;
	case 'edit':
		if ( empty($nId) ) break;
		$o = new DBModel();
		
		$o->connect();
		$s = "SELECT branch.branch_id, team.team_id, supervisor.supervisor_id, emp.hire_date, emp.ssn_no, emp.emp_no, emp.user_photo, user_base.role_id, user_base.user_name, contact.contact_type_id, contact.first_name, contact.last_name FROM user_base
				LEFT JOIN user_employees emp ON user_base.user_id = emp.user_id
				LEFT JOIN contact_base contact ON user_base.contact_id = contact.contact_id
				LEFT JOIN user_employee_to_supervisor supervisor ON supervisor.user_id = user_base.user_id
				LEFT JOIN user_employee_to_team team ON team.user_id = user_base.user_id
				LEFT JOIN user_employee_to_branch branch ON branch.user_id = user_base.user_id
				WHERE user_base.user_id = '" . $nId . "'";
				
		$res = $o->query($s);
		
		if ( !( $row = $o->db->fetch_array($res) ) ) {
			echo "Error Loading User Data<br>";
			pre($s);
			break;
		}
		
		$oSupervisor = new UserBase();
		$oSupervisor->load($row['supervisor_id']);
		$oSupervisorContact = $oSupervisor->get_Contact();
		$row['supervisor_name'] = trim($oSupervisorContact->get_FirstLastName());
		
		$aVars['user_name'] = $row['user_name'];
		$aVars['contact_type_id'] = $row['contact_type_id'];
		$aVars['first_name'] = $row['first_name'];
		$aVars['last_name'] = $row['last_name'];
		$aVars['user_id'] = $nId;
		$aVars['role_id'] = $row['role_id'];
		$aVars['ssn_no'] = $row['ssn_no'];
		$aVars['employee_number'] = $row['emp_no'];
		$aVars['hire_date'] = $row['hire_date'];
		$aVars['supervisor_name'] = $row['supervisor_name'];
		$aVars['supervisor_id'] = $row['supervisor_id'];
		$aVars['league_team_id'] = $row['team_id'];
		$aVars['user_branch'] = $row['branch_id'];
	case 'add':
		
		require_once('_add.php');
		break;
	default:
		require_once('_list.php');
}