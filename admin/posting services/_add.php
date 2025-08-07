<div class="contentBox2">
	<div class="header_text Delicious">Posting Services
		<div class="header_button"><a href="/admin/?page=<?=$sPage;?>" class="red">Back</a></div>
	</div>
	<div class="contentBox2_body" style="padding-left: 15px;">
		<form action="/admin/?page=<?=$sPage;?>" method="post" id="add_form" enctype='multipart/form-data'>
			<input type="hidden" name="id" value="<?=$nId;?>">
			<input type="hidden" name="a" value="<?=$sDisplay;?>">
			<div><b>Name</b><br>
				<input type="text" style="width: 180px" name="service_name" value="<?=$aVars['service_name'];?>">
			</div>
			<div><b>URL</b><br>
				<input type="text" style="width: 180px" name="url" value="<?=$aVars['url'];?>">
			</div>
			
			<? if ($sDisplay == 'edit') { ?>
				
			<div>
				<h2>Credentials 
					<span style="font-size: 10px; text-decoration: none;" id="cred_add">
						(<a href="#">Add</a>)
					</span>
				</h2>
				<? foreach( $aVars['credentials'] as $cred ) { ?>
				<div>
					<div style="display: inline;"><b>Login:</b> <?=$cred->login;?><br><b>Password:</b> <?=$cred->password;?></div>
					<img src="/resources/silk_icons/cross.png" class="cred_remove">
				</div>
				<? } ?>
			</div>
				
			<? } ?>
			
			<div><input type="submit" value="Save"></div>
		</form>
	</div>
</div>

<div style="display: none;">
	<div id="add_cred">
		<form id="new_credentials">
			<b>Login:</b> <input type="text" name="login"><br>
			<b>Password:</b> <input type="text" name="password"><br><br>
			<hr>
			<div style="text-align: right;"><input type="submit" value="Save"></div>
		</form>
	</div>
</div>
<script type="text/javascript">
	$('input[type=submit]').button();
	$('#cred_add').click(function(){
		$('#add_cred').dialog({
							"modal" : "true",
							"title" : "Add Credentials"
							});
	});
	
	$('.cred_remove').click(function(){
		alert('Confirm');
	});
	
	$('#new_credentials').submit(function(){
		alert( $(this).serialize() ) ;
		return false;
	});
</script>

<style type="text/css">
	#add_cred b {
		font-size: 14px;
		display: inline-block;
		width: 100px;
	}
	
	
	#add_form > div {
		background-color: #fff;
		margin: 10px 0px;
		width: 100%;
	}
	
	#add_form input[type=text]:hover, #add_form textarea:hover {
		background-color: #ffe;
	}
	
	#add_form input[type=text], #add_form textarea {
		font-family: arial;
		font-size: 14px;
		border: 1px solid #838383;
		width: 60%;
		padding: 5px;
		-moz-border-radius: 5px;
		border-radius: 5px;
	}
</style>