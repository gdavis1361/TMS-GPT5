<?php
//Get the user info
$nUserId = request('user', get_user_id() );
$nContactId = get_user()->get('contact_id');
$oEmployee = new UserEmployees();
$aEmployeeIds = $oEmployee->list_employees( get_user_id() );

if ( !in_array($nUserId, $aEmployeeIds) ) {
	// Permission Denied
	$nUserId = get_user_id();
}

$oUserBase = new UserBase();
$oUserBase->load($nUserId);

$img = $oUserBase->get('image');
if ( empty($img) ) $img = 'noimage.png';

$oLeagueStats = new LeagueStats();
$vLoaded = $oLeagueStats->load_by_user($nUserId);
?>


<div id="header-user-info" class="header-user-info" style="display: none;">
	<div class="image">
		<img src="/resources/<?=$img;?>" />
		<div class="name"><?=$oUserBase->get_Contact()->get_FirstLastName();?></div>
	</div>
</div>
<div id="header-panel"></div>

<script type="text/javascript">
	Ext.onReady(function() {
		Ext.create('TMS.mypage.user.Stats', {
			imageEl: 'header-user-info',
			renderTo: 'header-panel'
		});
	});
</script>

<div class="mypage-divider"></div>