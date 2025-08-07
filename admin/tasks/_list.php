<div class="contentBox2" ><div class="header_text Delicious">Task Templates
	<div class="header_button">
		<a href="/admin/?page=tasks&d=add" class="green">
		Add
		</a>
	</div>		
</div>
	<div class="contentBox2_body" style="padding-left: 15px;">
		<table width="100%" cellpadding="5px" cellspacing="0px" class="list">
		<thead>
			<tr><th width="200px">Name</th>
				<th>Description</th>
				<th width="65px">Edit</th>
				<th width="50px">Delete</th>
			</tr>
		</thead>
		<tbody>
		<?
		$oTask = new TaskTypes();
		$oTask->where('active', '=', '1');
		$aTaskTypes = $oTask->list()->rows;
		
		foreach($aTaskTypes as $type) { ?>
			<tr><td><?=$type->get('task_name');?></td>
				<td><?=$type->get('task_description');?></td>
				<td><span class="edit" rel="<?=$type->get('task_type_id');?>">Edit</span></td>
				<td><span class="delete" rel="<?=$type->get('task_type_id');?>">Delete</span></td>
			</tr>
		<? } ?>
		
		
		
	</div>
</div>

<script type="text/javascript">
$('.delete').button({
	icons: { primary: 'ui-icon-closethick'},
	text: false
});
				
$('.edit').button({
	icons: { primary: 'ui-icon-gear'}
});

$('.delete').click(function() {
	var id = $(this).attr('rel');
	window.location = "/admin/?page=tasks&d=confirm&id="+id;
});

$('.edit').click(function() {
	var id = $(this).attr('rel');
	window.location = "/admin/?page=tasks&d=edit&id="+id;
});

</script>