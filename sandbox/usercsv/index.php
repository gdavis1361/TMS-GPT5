<?php
require_once('../../resources/init.php');

/*********************************************
**********                         ***********
*********   CSV Employee Entering   **********
**********                         ***********
*********************************************/
$file = 'list.csv';

$vClearTables = ( isset($_GET['clear_tables']) && $_GET['clear_tables'] == 1);

if ($vClearTables) {
	$sContactSelect = "SELECT contact_base.contact_id FROM contact_base 
						LEFT JOIN user_base ON user_base.contact_id = contact_base.contact_id
						WHERE contact_base.contact_type_id = '". ContactTypes::AATEmployee ."'
						AND user_base.role_id <> '". UserRoles::Admin ."'";
	$sUserSelect = "SELECT user_id FROM user_base WHERE role_id <> '". UserRoles::Admin ."'";
	$s = "
		DELETE FROM user_employee_to_pod;
		DELETE FROM user_pods;
		DELETE FROM user_employee_to_supervisor;
		DELETE FROM user_employee_to_branch;
		DELETE FROM user_employee_to_team";
	$oDB->query($s);
	echo "<b>Deleting all tables</b><br>";
	
}

if ($file){
	// Let the magic happen
	echo "Opening file: $file<br/>";
	$handle = fopen($file, "r");
	
	$keys = true;
	$aData = array();
	$vInfo = false; //true;
	while (($data = fgetcsv($handle)) !== FALSE) {
		if ($keys) {
			$aKeys = $data;
			$keys = false;
		}else{
			//echo "Setting Data: ";
			foreach ($data as $k => $row){
				$aTmp[$aKeys[$k]] = $row;
			}
			$aData[] = (object)$aTmp;
		}
	}
	$nCreatedById = 2;
	
	$aUserIds = array();
	$oContact = new ContactBase();
	$oUser = new UserBase();
	$oTeam = new LeagueTeams();
	$oUserEmployee = new UserEmployees();
	$oBranch = new UserBranches();
	$oUserToBranch = new UserEmployeeToBranch();
	$oSupervisor = new UserEmployeeToSupervisor();
	$oModes = new Modes();
	$oContactMode = new ContactUsedModes();
	$oPod = new UserPods();
	$oEmployee2Pod = new UserEmployeeToPod();
	
	foreach ($aData as $user) {
		$oContact->unload();
		$nContactTypeId = ContactTypes::AATEmployee;
		list($sFirstName, $sLastName) = explode(" ", $user->Name, 2 );
		$sMiddleName = '';
		$sPreferredName = '';
		$sTitle = $user->Team == $user->Name ? "Pod Leader" : "Pod Member";
		
		$sUsername = strtolower( substr(trim($sFirstName), 0,1) . trim($sLastName));
		
		$nUserId = $oUser->findByUserName($sUsername);
		
		if ( empty($nUserId) ){
			echo "Creating Contact $sFirstName $sLastName: ";
			echo ($oContact->create( $nContactTypeId, $sFirstName, $sLastName, $sMiddleName, $sPreferredName, $sTitle, $nCreatedById ) ? "Success" : "Fail") . "<br>";

			$nContactId = $oContact->get('contact_id');
			$nRoleId = $user->Team == $user->Name ? UserRoles::PodLoader : UserRoles::Broker;

			$sPassword = $sUsername;

			$oUser->unload();
			echo "Creating User $sUsername: ";
			echo ($oUser->create( $nContactId, $nRoleId, $sPassword, $sUsername, $nCreatedById ) ? "Success" : "Fail") . "<br>";

			$nUserId = $oUser->get('user_id');
		
			$aUserIds[$user->Name] = $nUserId;
			$oTeam->unload();
			$oUserEmployee->unload();
			$nTeamId = $oTeam->find_id( $user->Team );
			$sHireDate = date('Y-m-d');
			$sSSN = '000000000';


			echo "Creating Employee $sUsername: ";
			echo ($oUserEmployee->create( $nUserId, $sHireDate, $sSSN, $nTeamId, $nCreatedById ) ? "Success" : "Fail") . "<br>";
		}else {
			echo $user->Name . " Already exists ($nUserId). Skipped creation of Contact and User.<br>";
			$nTeamId = $oTeam->find_id( $user->Team );
			$aUserIds[$user->Name] = $nUserId;
		}
		
		
		// Set captain to 0 if we're creating and the user is not the captain. 
		$nCaptainId = ( $user->Team == $user->Name ) ? $nUserId : 0; 
		if ( $nTeamId == 0 ) { // Create
			echo "Creating team $sName: ";
			echo ($oTeam->create( $sName, $nCaptainId, $nCreatedById ) ? "Success" : "Fail!") . "<br>";
			$nTeamId = $oTeam->get('league_team_id');
		}else if ( $user->Team == $user->Name ) {
			// This will happen if the team got created when looking at a user 
			// that wasn't the captain
			$oTeam->load($nTeamId);
			$oTeam->set('captain_id', $nUserId);
			$oTeam->save();
		}
		
		
		if ($user->Team == $user->Name) {
			echo "Creating pod: ";
			echo ($oPod->create($nCaptainId) ? "Success" : "Fail") . "<br/>";
		}

		$nPodId = ($user->Team == $user->Name) ? $oPod->get('pod_id') : $oEmployee2Pod->findByCaptainName($user->Team);
		echo "Associating user to pod $nPodId: ";
		echo ($oEmployee2Pod->create( $nPodId, $nUserId)) ? "Success" : "Fail";
		echo "<br>";

		// Branch
		$oBranch->unload();
		$nBranchId = $oBranch->find_id( $user->Branch );

		if (empty($nBranchId)) {
			echo "Creating Branch {$user->Branch}: ";
			echo ($oBranch->create($user->Branch, time(), '1') ? "Success!" : "Failure") . "<br>";
			$nBranchId = $oBranch->get('branch_id');
		}

		$oUserToBranch->unload();

		echo "Adding User $sFirstName $sLastName to {$user->Branch} Branch: ";
		echo ($oUserToBranch->create($nUserId, $nBranchId, 1, $nCreatedById) ? "Success" : "Failure") . "<br/>";

		// Supervisor
		$nSupervisor = request($user->Supervisor, 0, $aUserIds);

		if ($nSupervisor){
			$oSupervisor->unload();
			echo "Adding {$user->Supervisor} as {$user->Name}'s Supervisor: ";
			echo ($oSupervisor->create($nUserId, $nSupervisor) ? "Success" : "Failure") . "<br/>";
		}

		// Modes


		$oEmployeeToTeam = new UserEmployeeToTeam();
		echo "Adding {$user->Name} to team {$user->Team} ($nTeamId): ";
		echo ($oEmployeeToTeam->create( $nUserId, $nTeamId ) ? "Success!" : "Failure") . "<br>";
		
		echo "<hr>";
		
		if ($vInfo) {
			$vInfo = false;
			info();
			print_errors();
			//die();
		}
	}

}

print_errors();
info();



/*************** END csv processing ***********/

