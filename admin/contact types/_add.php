<div class="contentBox2" >
	<div class="header_text Delicious">Contact Types
		<div class="header_button"><a href="/admin/?page=<?=$sPage;?>" class="red">Back</a></div>
	</div>
	<div class="contentBox2_body" style="padding-left: 15px;">
		<form action="/admin/?page=<?=$sPage;?>" method="post" id="add_form" enctype='multipart/form-data'>
			<input type="hidden" name="type_id" value="<?=$nId;?>">
			<input type="hidden" name="a" value="<?=$sDisplay;?>">
			<div><b>Name</b><br>
				<input type="text" style="width: 180px" name="type_name" value="<?=$aVars['type_name'];?>">
			</div>
			<div><b>Description</b><br>
				<textarea name="type_desc"><?=$aVars['type_desc'];?></textarea>
			</div>
			
			<div><input type="submit" value="Save"></div>
		</form>
	</div>
</div>
<script type="text/javascript">
	$('input[type=submit]').button();
	$('.date').datepicker();
	$('.date').datepicker( "option", "showAnim", "slideDown");
</script>

<style type="text/css">
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