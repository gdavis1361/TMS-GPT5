<div class="contentBox2" ><div class="header_text Delicious">Document Manager
	<div class="header_button"><a href="/admin/?page=docs&d=add" class="green">Add</a></div>
</div>
	<div class="contentBox2_body" style="padding-left: 15px;">
			
		<div id="document_filter">
			<form id="filter">
				<div style="float:left;"><label>Document Type:</label><br><?
					$oDocumentTypes = new DocumentTypes();
					echo $oDocumentTypes->make_list('document_type', 'filter_type'); ?>
				</div>
				<div style="float:left;"><label>File Type:</label><br>
					<select name="file_type">
						<option value=''>--</option>
						<? foreach( DocumentBase::file_types() as $type ) { ?>
							<option value="<?=$type;?>"><?=strtoupper($type);?></option>
						<? } ?>
					</select>
				</div>
				<div style="float:left;"><label>Date:</label><br>
					<input type="text" name="date_start" size="10" class="date" value="<?=date('m/d/Y', strtotime('-3 days') );?>"> - 
					<input type="text" name="date_end" size='10' class="date" value="<?=date('m/d/Y');?>">
				</div>
				<div style="float:left;"><label>Time:</label><br>
					<input type="text" name="time_start" size='6'> - 
					<input type="text" name="time_end" size='6'>
				</div>
				<div style="float:left;">
					<span id='filter_apply' style="margin-top: 7px;">Filter</span>
				</div>
				<div class='c'></div>
			</form>
		</div>
	
		<table width="100%" cellpadding="5px" cellspacing="0px" class="list">
		<thead>
			<tr><th width="200px">Document Type</th>
				<th width="80px">File Type</th>
				<th>Description</th>
				<th width="65px">View</th>
			</tr>
		</thead>
		<tbody id="resultset">
		
		</tbody>
		</table>
		
		
	</div>
</div>
<div style="background-color: #fff" id="ajax"></div>

<?
$oDoc = new DocumentBase();
?>
<script type="text/javascript">
$(document).ready( function() {
	$('#filter_apply').button({ icons: { primary: "ui-icon-check" } });
	$('#filter_apply').click(function() { 
		$.post('/at-ajax/document_filter.php', $('form#filter').serialize(), function(d) { 
			s = '';
			$.each(d, function (data, value) {
				var type = (value.document_type_name) ? value.document_type_name : '';
				var file_type = (value.file_type) ? value.file_type : '';
				var description = value.description ? value.description : '';
				var document_id = value.document_id ? value.document_id : ''
				var filename = document_id + '.' + file_type;
				
				s += '<tr><td>' + type + '</td>' +
						'<td>' + file_type + '</td>' + 
						'<td>' + description + '</td>' +
						'<td><span class="view" rel="' + filename + '">View</span></td>' +
					'</tr>'
			});
			$('#resultset').html(s);
			$('.view').button({
				icons: { primary: 'ui-icon-script' }
			});
		}, 
		'json');
	});
		
	

	$('.view').live('click', function() {
		var filename = $(this).attr('rel');

		//window.location = "/admin/?page=tasks&d=edit&id="+id;
		if (filename) {
			$.fancybox({
				'type'			: 'iframe',
				'titleShow'		: false,
				'autoScale'		: false,
				'width'			: '80%',
				'height'		: '90%',
				'href'			: '../<?=$oDoc->m_sDocs;?>/' + filename
			});
		}
	});
	$('.date').datepicker();
	$('.date').datepicker( "option", "showAnim", "slideDown");
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
