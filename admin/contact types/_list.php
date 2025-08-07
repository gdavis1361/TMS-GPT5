<div class="contentBox2" >
	<div class="header_text">
		<div class="boxleft Delicious">Contact Types</div>
		<div class="button boxright">
			<a href="/admin/?page=<?=$sPage;?>&d=add">Add</a>
		</div>		
		<div class="clear"></div>
	</div>
	<div class="contentBox2_body no-padding">
		<table width="100%" cellpadding="5px" cellspacing="0px" class="list">
			<thead>
				<tr><th width="100px">Name</th>
					<th>Description</th>
					<th width="65px">Edit</th>
					<th width="50px">Delete</th>
				</tr>
			</thead>
			<tbody id="resultset">
				<? 
				$oTypes = new ContactTypes();
				foreach( $oTypes->list()->rows as $type ) { 
					$row = $type->get(); ?>
				<tr><td><?=$row['type_name'];?></td>
					<td><?=$row['type_desc'];?></td>
					<td>
						<div class="button">
							<a href="/admin/?page=<?=$sPage;?>&d=edit&id=<?=$row['type_id'];?>">Edit</a>
						</div>
					</td>
					<td>
						<div class="button">
							<a href="#">Delete</a>
						</div>
					</td>
				</tr>
				
				<? } ?>
			</tbody>
		</table>
		
		
		
		
	</div>
</div>

<script type="text/javascript">
	$('#filter_apply').button({ icons: { primary: "ui-icon-check" } });
	$('#filter_apply').click(function() { 
		$.post('/at-ajax/team_filter.php', $('form#filter').serialize(), function(d) { 
			s = '';
			$.each(d, function (data, value) {
				var name = (value.name) ? value.name : '';
				var captain_name = value.captain_name ? value.captain_name : '';
				var team_id = value.team_id ? value.team_id : '';
				
				s += '<tr><td>' + captain_name + '</td>' + 
						 '<td>' + name + '</td>' + 
						 '<td><span class="edit" rel="' + team_id + '">Edit</span></td>' +
						 '<td><span class="delete" rel="' + team_id + '">Delete</span></td>' +
					'</tr>';
			});
			if (s.length > 0) {
				$('#resultset').html(s);
			}else{
				$('#resultset').html("<tr><td colspan='5'><center><b>No Users To Display</b></center></td></tr>");
			}
			$('.edit').button({
				icons: { primary: 'ui-icon-gear' }
			});	
			
			$('.delete').button({
				icons: { primary: 'ui-icon-closethick'},
				text: false
			});

		}, 
		'json');
	});


$('.delete').live('click', function() {
	var id = $(this).attr('rel');
	alert('delete ' + id);
	//window.location = "/admin/?page=tasks&d=confirm&id="+id;
});

$('.date').datepicker();

$('.edit').live('click', function() {
	var id = $(this).attr('rel');
	//alert('edit ' + id);
	window.location = "/admin/?page=<?=$sPage;?>&d=edit&id="+id;
});
</script>

<style type='text/css'>
	#filter > div {
		padding: 0px 10px;
	}
	
	#document_filter {
		border: 1px solid #0f0f0f;
		padding: 5px 0px;
		margin: 5px 0px;
		background-color: #f0f0f0;
	}
</style>
