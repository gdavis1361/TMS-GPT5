<div class="contentBox2" >
	<div class="header_text Delicious"><?=ucfirst($sDisplay);?> Task Template
		<div style="float:right;margin-top:-4px;font-size:14px;-moz-border-radius: 5px;margin-left:15px;border-radius: 5px;background:#fff;padding:1px;">
			<a href="/admin/?page=tasks" style="display:block;-moz-border-radius: 5px;border-radius: 5px;background:#750012;color:#fff;padding:6px 9px;">
			Back
			</a>
		</div>
	</div>
	<div class="contentBox2_body" style="padding-left: 15px;">
		<form action="/admin/?page=tasks" method="post" id="add_form">
			<input type="hidden" name="task_type_id" value="<?php if (isset($aVars['task_type_id'])) { echo $aVars['task_type_id']; } ?>">
			<input type="hidden" name="a" value="<?=$sDisplay;?>">
			<div id="task_name"><b>Name</b><br>
				<input type="text" name="task_name" value="<?=$aVars['task_name'];?>">
			</div>
			<div id="task_description"><b>Description</b><br>
				<textarea name="task_description"><?=$aVars['task_description'];?></textarea><br>
				Variables: <span class="extra_info">none</span>
			</div>
			<div id="task_url"><b>URL</b><br>
				<input type="text" name="task_url" value="<?=$aVars['task_url'];?>">
			</div>
			<div id="task_priority_weight"><b>Priority Weight</b><br>
				<input type="text" name="task_priority_weight" value="<?=$aVars['task_priority_weight'];?>">
			</div>
			<div id="buttons" style="text-align: center;"><input type="submit" value="Save Template"></div>
		</form>
	</div>
</div>
<script type="text/javascript">
	$('input[type=submit]').button();
	
	$('#task_description > :input').keyup(function() {
		var text = $(this).val();
		var reg = text.match(/\{[a-z0-9_\|\-]*\}/gi);
		s = '';
		if (reg != null) {
			for (i = 0; i < reg.length; i++) {
				if (s.length > 0) s += ', ';
				s = s + reg[i];
			}
		}else{
			s = 'none';
		}
		$(this).parent().find('.extra_info').html(s);
	});
	
	$('#task_description > :input').keyup();
</script>

<style type="text/css">
	#add_form > div {
		background-color: #fff;
		margin: 10px 0px;
		width: 100%;
	}
	
	#add_form > div > input[type=text]:hover, #add_form > div > textarea:hover {
		background-color: #ffe;
	}
	
	input[type=text], textarea {
		font-family: arial;
		font-size: 14px;
		border: 1px solid #838383;
		width: 60%;
		padding: 5px;
		-moz-border-radius: 5px;
		border-radius: 5px;
	}
</style>