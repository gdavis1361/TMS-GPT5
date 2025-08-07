<div class="contentBox2" >
	<div class="header_text Delicious">
		Document Manager
		<div class="header_button">
			<a href="/admin/?page=<?php echo $sPage; ?>" class="red">Back</a>
		</div>
	</div>
	<div class="contentBox2_body" style="padding-left: 15px;">
		<div style="float: left; width: 50%;">
			<form action="/admin/?page=<?php echo $sPage; ?>" method="post" id="add_form" enctype='multipart/form-data'>
				<input type="hidden" name="document_id" value="<?php echo $aVars['document_id']; ?>">
				<input type="hidden" name="a" value="<?php echo $sDisplay; ?>">
				<div id="accordion">
					<h3><a href="#">Unsorted Files</a></h3>
					<div>
						<select name="scanner_name" id="scanner" style="width:300px">
							<option value=''> -- </option>
							<?php
							$oDoc = new DocumentBase();
							foreach ( $oDoc->list_scanners() as $scanner ) {
								?>
								<option value="<?php echo $scanner; ?>"><?php echo ucfirst($scanner); ?></option>
								<?php
							}
							?>
						</select>
					
						<select name="file_name" id="file_name" size="5" style="width:300px">
							<option value=''>Select a scanner first</option>
						</select>
					</div>
					<h3>
						<a href="#">Upload a File</a>
					</h3>
					<div>
						<input type="file" name="uploaded_file"/>
					</div>
				</div>
				<div>
					<b>Association:</b>
					<br />
					<select name="table_name">
						<option value="order_base">Order</option>
						<option value="contact_base">Contact</option>
						<option value="customer_base">Customer</option>
						<option value="carrier_base">Carrier</option>
						<option value="load_base">Load</option>
					</select>
					ID: <input type="text" name="table_value" style="width: 50px;">
				</div>
				<div>
					<b>Document type </b>
					<br />
					<select name="document_type_id">
					<?php
					$oDocType = new DocumentTypes();
					$oDocType->where('active', '=', 1);
					$a = $oDocType->list()->rows;
					foreach($a as $type) {
						?>
						<option value="<?php echo $type->get('document_type_id'); ?>"><?php echo $type->get('document_type_name'); ?></option>
						<?php
					}
					?>
					</select>
				</div>
				<div>
					Description (optional)
					<br />
					<textarea name="description"></textarea>
				</div>
				<div id="buttons" style="text-align: center;">
					<input type="submit" value="Save" />
				</div>
			</form>
		</div>
		<div style="float: left; width: 45%; margin-left: 15px;">
			<iframe id="preview_frame" style="border: 0px; width: 100%; height: 500px;"></iframe>
		</div>
		<div class="c"></div>
	</div>
</div>
<script type="text/javascript">
	$('select#scanner').change(function() {
		var scanner = $(this).val();
		if (scanner.length == 0) {
			var s = "<option value=''>Select a scanner first</option>";
			$('#file_name').html(s);
			return;
		}
		$.getJSON('/at-ajax/scanner_files.php', { "dir": scanner }, function(d) {
			var s = '';
			$.each(d, function(key, val) {
				//console.log(val);
				s += "<option value='" + val.basename + "'>" + val.basename + "</option>";
			});
			$('#file_name').html(s);
		});
	});
	$('input[type=submit]').button();

	$('#accordion').accordion();
	
	$('h3').click(function() { 
		$('input[name=uploaded_file]').val('');
	});
	
	$('#file_name').click(function() {
		$('#preview_frame').attr('src', '');
		var filename = $('#file_name').val();
		if (filename) {
			$('#preview_frame').attr('src', '<?php echo $oDoc->m_sScanned; ?>' + $('#scanner :selected').html().toLowerCase() + '/' + filename);
		}
	});
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