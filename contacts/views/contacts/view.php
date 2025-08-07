<?php
$sPage = 'contacts';

// check permissions
$myUser = get_user();
$myRoleId = $myUser->get('role_id');
$adminRoleId = UserRoles::Admin;
$myContactId = $myUser->get('contact_id');

// Check for who has access to view this contact
$hasAccess = false;
if ($myRoleId == $adminRoleId) {
	$hasAccess = true;
}
else {
	if ($nId && $myContactId != $nId && !in_array($nId, ContactBase::getContactIds($oSession->session_var('user_scope')))) {
		$hasAccess = false;
	}
	else {
		$hasAccess = true;
	}
}


if (!$hasAccess) {
	redirect('/contacts/');
}

require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/header.php');

if (is_numeric($nId) && $nId > 0) {
	$nContactId = $nId;
}
else {
	die("Wrong Contact Id. <a href='/contacts/?d=list'>Go back</a> to list.");
}
$oContact = new ContactBase();
$oContact->load($nContactId);
?>
<!--page = _contact_view.php-->
<input type="hidden" id="contact_id" value="<?php echo $oContact->get('contact_id'); ?>" />
<input type="hidden" id="contact_type_id" value="<?php echo $oContact->get('contact_type_id'); ?>" />

<div class="content-container">
	<div id="update-form"></div>
</div>

<script type="text/javascript">
	Ext.require([
		'TMS.contacts.forms.Update'
	]);
	
	Ext.onReady(function() {
		Ext.create('TMS.contacts.forms.Update', {
			renderTo: 'update-form',
			contact_id: Ext.get('contact_id').getValue()
		});
	});
</script>