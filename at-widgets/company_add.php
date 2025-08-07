<?php 
require_once('../at-includes/engine.php');
require_once('../resources/functions.php');

$nContactTypeId = request('contact_type_id', '');
$sContactType = request('contact_type_name', '');
$sName = request('name', '');
$sCustomerStatus = request('customer_status', '');

$nCompanyId = request('id', 0);

if (($nContactTypeId == 2 || $nContactTypeId == 3) && empty($sContactType) )
	$sContactType = $nContactTypeId == 3 ? 'Carrier' : 'Customer';


$aCustomerStatus 	= array('Customer');
$aCreditLimit 		= array('Bill To');
$aPayToAddr 		= array('Pay To');
$aMCNumber 			= array('Carrier', 'Pay To');
$aPaymentType 		= array();
$aEquip 			= array('Carrier');
$aModes 			= array('Carrier');

if ($sContactType == 'Customer' && ($sCustomerStatus == 'Warm' || $sCustomerStatus == 'Hot') ) $aEquip[] = 'Customer';
if ($sContactType == 'Customer' && ($sCustomerStatus == 'Warm' || $sCustomerStatus == 'Hot') ) $aModes[] = 'Customer';

if (empty($nContactTypeId)) {
	if ($sContactType == 'Carrier') $nContactTypeId = 3;
	else if ($sContactType == 'Customer') $nContactTypeId = 2;
}
?>

<div id="lbox">
	<form class="form_normal" id="location_add_form">
		<fieldset id="locationFields" style="border: 0px;">
			<input type='hidden' name='company_id' value='<?=$nCompanyId;?>'>
			<? if ( !empty($nCompanyId) ) {
				if ( $nContactTypeId == 2 ) {
					$o = new CustomerBase();
					$o->load($nCompanyId);
					$sName = $o->get('customer_name');
				}else if ( $nContactTypeId == 3 ) {
					$o = new CarrierBase();
					$a = $o->get_carrier_by_id($nCompanyId);
					$sName = $a->CarrName;
				}
				?>
			<h2><?=$sName;?></h2>
			<? } ?>
			<? if (in_array($sContactType, $aMCNumber) ) { ?>
				<div>
					<div style="float: left">
						<label for="mc_number">MC Number <span>(six digits only)</span></label>
						<input type="text" name="mc_no" id="mc_number" value="<?=is_numeric($sName) ? $sName : '';?>" />
					</div>
					<div id="mc_info">
					
					</div>
					<div style="clear:both;"></div>
				</div>
			<? } ?>
			<div style="float: left;">
				<label for="name1">Name</label>
				<input type="text" tabindex="1" name="name1" id="name1" value="<?=($nContactTypeId != 3) ? $sName : '';?>" <?=($nContactTypeId == 3) ? "readonly='readonly'" : ''?> />
				<input type="text" tabindex="2" name="name2" id="name2" <?=($nContactTypeId == 3) ? "readonly='readonly'" : ''?>/>
			</div>
			<div style="float: left;"> 
				<label for="address1">Address</label>
				<input type="text" tabindex="3" name="address1" id="address1" <?=($nContactTypeId == 3) ? "readonly='readonly'" : ''?>/>
				<input type="text" tabindex="4" name="address2" id="address2" <?=($nContactTypeId == 3) ? "readonly='readonly'" : ''?>/>
				<input type="text" tabindex="5" name="address3" id="address3" <?=($nContactTypeId == 3) ? "readonly='readonly'" : ''?>/>
				<? if (in_array($sContactType, $aPayToAddr) ) { ?>
					<label for="pay_separate" style="font-size: 12px"><input type="checkbox" name="pay_separate" id="pay_separate" style="display: inline;"> Pay To Different</label>
				<? } ?>
			</div>
			
			<? if (in_array($sContactType, $aPayToAddr ) ) { ?>
				<div style="float: left; display: none;" id="pay_to">
					<label for="pay_to1">Pay To</label>
					<input type="text" tabindex="3" name="pay_to1" id="pay_to1" />
					<input type="text" tabindex="4" name="pay_to2" id="pay_to2" />
					<input type="text" tabindex="5" name="pay_to3" id="pay_to3" />
				</div>
			<? } ?>
			
			<div class="c"></div>
			<div>
				<table>
					<tr><td><label for="city">City</label>
							<input type="text" tabindex="6" name="city" id="location_city" title="City" <?=($nContactTypeId == 3) ? "readonly='readonly'" : ''?>/></td>
						<td><label for="state">State</label>
							<select name="state" tabindex="7" id="location_state" <?=($nContactTypeId == 3) ? "disabled" : ''?>>
								<option value="">--</option> <option value="AL">Alabama</option> <option value="AK">Alaska</option>	<option value="AZ">Arizona</option>	<option value="AR">Arkansas</option>	<option value="CA">California</option>	<option value="CO">Colorado</option>	<option value="CT">Connecticut</option>	<option value="DE">Delaware</option>	<option value="DC">District of Columbia</option>	<option value="FL">Florida</option>	<option value="GA">Georgia</option>	<option value="HI">Hawaii</option>	<option value="ID">Idaho</option>	<option value="IL">Illinois</option>	<option value="IN">Indiana</option>	<option value="IA">Iowa</option>	<option value="KS">Kansas</option>	<option value="KY">Kentucky</option>	<option value="LA">Louisiana</option>	<option value="ME">Maine</option>	<option value="MD">Maryland</option>	<option value="MA">Massachusetts</option>	<option value="MI">Michigan</option>	<option value="MN">Minnesota</option>	<option value="MS">Mississippi</option>	<option value="MO">Missouri</option>	<option value="MT">Montana</option>	<option value="NE">Nebraska</option>	<option value="NV">Nevada</option>	<option value="NH">New Hampshire</option>	<option value="NJ">New Jersey</option>	<option value="NM">New Mexico</option>	<option value="NY">New York</option>	<option value="NC">North Carolina</option>	<option value="ND">North Dakota</option>	<option value="OH">Ohio</option>	<option value="OK">Oklahoma</option>	<option value="OR">Oregon</option>	<option value="PA">Pennsylvania</option>	<option value="RI">Rhode Island</option>	<option value="SC">South Carolina</option>	<option value="SD">South Dakota</option>	<option value="TN">Tennessee</option>	<option value="TX">Texas</option>	<option value="UT">Utah</option>	<option value="VT">Vermont</option>	<option value="VA">Virginia</option>	<option value="WA">Washington</option>	<option value="WV">West Virginia</option>	<option value="WI">Wisconsin</option>	<option value="WY">Wyoming</option>
								<option id="AB" value="AB">Alberta</option>
								<option id="BC" value="BC">British Columbia</option>
								<option id="MB" value="MB">Manitoba</option>
								<option id="NB" value="NB">New Brunswick</option>
								<option id="NL" value="NL">Newfoundland and Labrador</option>
								<option id="NT" value="NT">Northwest Territories</option>
								<option id="NS" value="NS">Nova Scotia</option>
								<option id="NU" value="NU">Nunavut</option>
								<option id="PE" value="PE">Prince Edward Island</option>
								<option id="SK" value="SK">Saskatchewan</option>
								<option id="ON" value="ON">Ontario</option>
								<option id="QC" value="QC">Quebec</option>
								<option id="YT" value="YT">Yukon</option>
								<option id="MX" value="MX">Mexico</option>
							</select></td>
						<td><label for="zip">Zip</label>
							<input type="text" tabindex="8" name="zip" id="zip" size="6" title="Zip Code" <?=($nContactTypeId == 3) ? "readonly='readonly'" : ''?> />
							<input type="hidden" tabindex="8" name="seq" id="location_seq" />
						</td>
					</tr>
				</table>
			</div>
			<? if (in_array($sContactType, array('Carrier')) ) { 
				$nPendingStatus = 1; ?>
				<div style="margin-left: 8px; margin-bottom: 25px;">
					<input name="status_id" type="hidden" value="<?=$nPendingStatus;?>">
					<strong>Status: </strong> Pending
				</div>
			<? } ?>
			
			<? if ( in_array($sContactType, $aCreditLimit ) ) { 
				$nDefaultCreditLimit = 5000;?>
				<div>
					<b>Initial Credit Limit: </b>
					$<?=$nDefaultCreditLimit;?>.00
				</div>
			<? } ?>
			
			<? if ( in_array($sContactType, $aModes ) ) { ?>
				<div style="float: left; margin-left: 8px; margin-bottom: 25px;" id="location_modes">
					<b>Modes Used</b>
					<div>
					<?	$oModes = new Modes();
						echo $oModes->make_list('mode_list', 'mode_list'); ?>
					<img src="/resources/silk_icons/add.png" style="margin-left: 0px" id="mode_add">
					</div>
				</div>
			<? } ?>
			
			<? if ( in_array($sContactType, $aCustomerStatus ) ) { ?>
				<input type="hidden" name="customer_status" value="<?=$sCustomerStatus;?>" />
			<? } ?>
			
			<? if ( in_array($sContactType, $aPaymentType ) ) { ?>
				<div style="float: left; margin-left: 8px; margin-bottom: 5px;">
					<div>
						<b>Payment Type</b>
						<div>
							<select name="payment_type">
								<option>Check</option>
								<option>ACH</option>
							</select>
						</div>
					</div>
					<div style=" margin-bottom: 25px;">
						<label for="accept_comcheck"><input type="checkbox" name="accept_comcheck" id="accept_comcheck" style="display: inline;">Accepts Com Check</label>
					</div>
				</div>
			<? } ?>
			
			<? if ( in_array($sContactType, $aEquip) ) {  ?>
				<div style="float: left; margin-left: 8px; margin-bottom: 25px;">
					<b>Equipment Used</b>
					<div>
						<?=list_equipment('equipment_types');?>
						<img src="/resources/silk_icons/add.png" alt="Add" id="add_equipment"/>
						<div id="equipment"></div>
					</div>
				</div>
			<? } ?>
			<div class="c"></div>
			<input type="button" tabindex="11" value="Create" id="location_add" style="display:none"/>
		</fieldset>
		<input type="hidden" name="contact_type_id" value="<?=$nContactTypeId;?>" />
		<input type="reset" style="display:none" id="formReset">
	</form>
</div>

<div id="ajax"></div>
<script type="text/javascript">
<? if (in_array($sContactType, $aMCNumber) ) { ?>
$('#mc_number').keyup(function(){
	var num = $(this).val();
	if (num.length < 6) return;
	$.get('/at-ajax/mc_lookup.php', {'mc': num}, function(d){
		if (d.FAULTMESSAGE) {
			$('#mc_info').html('<span style="color: red; text-decoration: bold">' 
				+ d.FAULTMESSAGE + '</span>');
			$('#name1').val('');
			$('#name2').val('');
			$('#address1').val('');
			$('#zip').val('');
			return;
		}
		var name_1 = d.FMCSALEGALNAME;
		var name_2 = d.FMCSADBANAME;
		var address = d.FMCSABUSADDRESS;
		var zip = d.FMCSABUSZIP.replace(' ', '');
		var zip = d.FMCSABUSZIP.replace(' ', '');
		var phone = d.FMCSABUSPHONE;
		var safety_rating = d.SAFETYRATING;
		var common = d.FMCSACOMMON;
		var broker = d.FMCSABROKER;
		var contract = d.FMCSACONTRACT
		
		var safety_rating_date = d.SAFETYRATEDATE;
		var safety_rating = d.SAFETYRATING;
		
		$('#name1').val(name_1);
		$('#name2').val(name_2);
		$('#address1').val(address);
		$('#zip').val(zip);
		$('#zip').keyup();

		function formatPhone(phonenum) {
			var regexObj = /^(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/;
			if (regexObj.test(phonenum)) {
				var parts = phonenum.match(regexObj);
				var phone = "";
				if (parts[1]) { phone += "(" + parts[1] + ") "; }
				phone += parts[2] + "-" + parts[3];
				return phone;
			}
			else {
				//invalid phone number
				return phonenum;
			}
		}
		
		$('#mc_info').html('<b>Phone Number: </b> ' + formatPhone(phone) + '<br>' +
				'<b>Safety Rating: </b>' + (safety_rating == 'U' ? "<span style='color: red'>UNSATISFACTORY</span>" : safety_rating == 'C' ? "Conditional" : safety_rating == 'S' ? "<span style='color: green'>Satisfactory</span>" : safety_rating) + ' <br>' +
				'<b>Common Authority: </b>' + (common == 'A' ? "Active" : "<span style='color: red;'><b>INACTIVE</b></span>") +
				'<input type="hidden" name="common_auth" value="' + common + '">' + 
				'<input type="hidden" name="contract_auth" value="' + contract + '">' + 
				'<input type="hidden" name="broker_auth" value="' + broker + '">' + 
				'<input type="hidden" name="safety_date" value="' + safety_rating_date + '">' + 
				'<input type="hidden" name="safety_rating" value="' + safety_rating + '">'
				);
	}, 'json');
});
$('#mc_number').keyup(); //Just in case it got 6 digits loaded as its value. 
<? } ?>

<? if (in_array($sContactType, $aPayToAddr ) ) { ?>
	$('#pay_separate').click(function(){
		v = $(this).attr('checked');
		if (v) {
			$('#pay_to').show('fast');
		} else {
			$('#pay_to').hide('fast');
		}
	});
<? } ?>

<? if ( in_array($sContactType, $aModes ) ) { ?>
	$('#mode_add').click(function() {
		var mode_id = $('select[name=mode_list]').val();
		var mode_name = $('select[name=mode_list] :selected').html();
		var h = "<div><input type='hidden' name='used_modes[]' value='" + mode_id + "'>";
		h += mode_name + " <img src='/resources/silk_icons/cross.png' class='remove_mode'></div>";
		if (mode_id > 0){
			$('#location_modes').append(h);
		}
	});
	
	$('.remove_mode').live('click', function() {
		$(this).parent().remove();
	});
<? } ?>

<? if ( in_array($sContactType, $aEquip) ) { ?>
var aEquip = new Array();
$('#add_equipment').click(function(){
	var equip = $('select[name=equipment_types] :selected');
	add_equipment(equip.val(), equip.text());
	return;
});

function add_equipment(equipId, equipText){
	if (equipId == '' || aEquip.indexOf( equipId ) >= 0 ) return;
	var html = '<div class="allowed_equip">' + equipText;
	html += '<img src="/resources/silk_icons/cross.png" class="remove_equipment" />';
	html += '<input type="hidden" name="allowed_equipment[]" value="' + equipId + '" class="equip_type"  />';
	html += '</div>';
	$('#equipment').prepend(html);
	aEquip.push( equipId );
}

$('.remove_equipment').live('click', function(){
	var id = $(this).parent(".allowed_equip").find('.equip_type').val();
	$(this).parent(".allowed_equip").remove();
	aEquip.splice( aEquip.indexOf( id, 1 ) );
});
<? } ?>
 
function add_location(){
	$.post('/at-ajax/location-add.php', $('#location_add_form').serialize(), function(d){
		//$('#ajax').html(d);
		data = $.parseJSON(d);
		if (data.id != false) { // Success
			name = $('#name1').val() + '<br/>' + $('#name2').val();
			address = $('#address1').val() + '<br/>' + $('#location_city').val() + ', ' + $('#location_state').val() + ' ' + $('#zip').val();

			$('.location_search_result a').remove(); //clear search results
			$('#location_search_selected').html(
			'<div style="clear:both;margin-bottom:5px;"></div>' + 
			'<span id="company_name">' + name + '</span> <span class="change">(<a href="#" id="location_search_again">change</a>)</span><br/>' +
			'<span id="location_name">' + name + '</span> <span class="change">(<a href="#" id="location_change">change</a>)</span><br/>' +
			address
			);
			$('#location_search_stage').hide();
			$('#location_search_selected').show();
			$('#location_id').attr('value', data.id);
			$('*').dialog('destroy');
			//$('#newLocDialog').html('');
		}
	});
}
function just_add_location(func){
	$.post('/at-ajax/location-add.php', $('#location_add_form').serialize(), function(d){
		data = $.parseJSON(d);
		window[func](data.id);
	});
}

$('#zip').keyup(function(){
	var zip = $(this).val();
	zip = zip.replace(' ', '');
	url = '/at-ajax/city_zip_info.php?type=city&zip=' + zip;
	if ( zip.length == 5 || zip.length == 6 ) {
		$.getJSON(url, function(data) {
			$('#location_city').focus().val(data.city?data.city:'');
			$('#location_state').val(data.state?data.state:'');
			$('#location_seq').val(data.seq?data.seq:'');
			$('#zip').focus();
		});
	}
});


$('#location_city').focusout(function(){
	url = '/at-ajax/city_zip_info.php?type=zip&city=' + $('#location_city').val() + '&state=' + $('#location_state').val();
	$.getJSON(url, function(data) {
		$('#zip').val(data.zip ? data.zip : '');
		$('#location_seq').val(data.seq ? data.seq : '');
	});
});


$('#location_state').change(function(){
	url = '/at-ajax/city_zip_info.php?type=zip&city=' + $('#location_city').val() + '&state=' + $('#location_state').val();
	if ($('#location_city').focus().val().length > 2) {
		$.getJSON(url, function(data) {
			$('#zip').focus().val(data.zip ? data.zip : '');
			$('#location_city').focus().val(data.city ? data.city : '');
		});
	}
	$('#location_state').focus();
});

</script>
<style>
#lbox {
	font-size: 14px;
	font-family: arial, Helvetica,sans-serif; 
}

#mc_info { 
	float: left; 
	overflow: auto; 
	width: 250px;
	padding-left: 5px;
}

label[for=mc_number] span {
font-size: 10px; font-weight: normal;
}
</style>