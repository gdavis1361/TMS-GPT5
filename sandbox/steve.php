<?php
//require_once('at-includes/engine.php');
require_once('../resources/header.php');

pre( LP_AccountingTypes::listSubAccounts() );

info();


die();
// *****************************************************************************
// Objects to XML
// *****************************************************************************
function objToXML(){
	$oB = new stdClass();
	$oB->transaction->customer = array(
		(object)array(
			'CustomerId' => 'CUST01',
			'Status' => 'A',
			'Name' => 'Steve',
			'Terms' => 30,
			'Attention' => new stdClass()
		),
		(object)array(
			'CustomerId' => 'CUST02',
			'Status' => 'A',
			'Name' => 'Allan',
			'Terms' => 30,
			'Attention' => new stdClass()
		)
	);

	$ob2 = json_decode('{
		"transaction": [{
			"customer": [{
				"CustomerId": "Cust01",
				"Status": "A",
				"Name": "Steve",
				"Attention": [{}]
			},{
				"CustomerId": "Cust02",
				"Status": "A",
				"Name": "Not Steve",
				"Attention": [{}]
			}]
		}]
	}');

	$s = file_get_contents('sample204.xml');
	$o = new LP_XML();
	$obj = $o->xmlToObj($s);
	
	$newXML = $o->objToXML($obj);
	
	pre($obj);
	pre ( htmlspecialchars($newXML) );
	
//	$s = $o->objToXML($oB);
//	
//	$s2 = $o->objToXML($ob2);
//	pre(htmlspecialchars($s));
}


function showUpToDatePct(){
	$o = new LeagueStats();
	$o->load_by_user(2);
	echo ($o->calc_up_to_date_pct()*100) . "%";
	//info();
	//print_errors();

}

die();

// *****************************************************************************
// Monster Query
// *****************************************************************************

ini_set('memory_limit','500M');
ini_set('max_execution_time', '5000');


$queryA = "SELECT contact_id FROM contact_customer_detail";
$a = LP_DB::fetchAll($queryA);

foreach($a as $r) {
	$aContactIDs[] = $r['contact_id'];
}

$query = "USE TMS;
SELECT (contact.first_name + ' ' + contact.last_name) as name, details.*, (
    CASE WHEN (details.calc_next_action_date = details.next_email) THEN 'email'
        WHEN (details.calc_next_action_date = details.next_call) THEN 'call'
        WHEN (details.calc_next_action_date = details.next_visit) THEN 'visit'
    END) AS calc_next_action_name, 
    ( CASE WHEN details.calc_next_action_date < GETDATE() THEN 'no' ELSE 'yes' END ) AS up_to_date
FROM contact_base contact
LEFT JOIN (
    SELECT detail.contact_id, (
        CASE WHEN (YEAR(detail.next_call) > 1970) THEN
            CASE WHEN (YEAR(detail.next_email) > 1970) THEN
                CASE WHEN (YEAR(detail.next_visit) > 1970) THEN
                    /* All 3 are valid */
                    CASE WHEN (detail.next_call <= detail.next_visit AND detail.next_call <= detail.next_email) THEN detail.next_call
                        WHEN (detail.next_email <= detail.next_call AND detail.next_email <= detail.next_visit) THEN detail.next_email
                        WHEN (detail.next_visit <= detail.next_call AND detail.next_visit <= detail.next_email) THEN detail.next_visit 
                    END
                ELSE 
                    /* Invalid Visit. Email and Call are valid. */
                    CASE WHEN (detail.next_email <= detail.next_call) THEN detail.next_email
                        WHEN (detail.next_call <= detail.next_email) THEN detail.next_call
                    END
                END
            ELSE
                /* Invalid email. Visit untested, Call is valid. */
                CASE WHEN (YEAR(detail.next_visit) > 1970) THEN
                    /* Only visit and call are valid */
                    CASE WHEN (detail.next_visit <= detail.next_call) THEN detail.next_visit
                        WHEN (detail.next_call <= detail.next_visit) THEN detail.next_call
                    END
                ELSE
                    /* Invalid Email, Invalid Visit. Call is good. */
                    detail.next_call
                END
            END
        ELSE 
            /* Call is invalid. Email and visit untested */
            CASE WHEN (YEAR(detail.next_email) > 1970) THEN
                /* Email Valid, Call Invalid, Visit untested */
                CASE WHEN (YEAR(detail.next_visit) > 1970) THEN
                    /* Visit and Email Valid */
                    CASE WHEN (detail.next_email <= detail.next_visit) THEN detail.next_emailwebeight
                        WHEN (detail.next_visit <= detail.next_email) THEN detail.next_visit
                    END
                ELSE
                    /* Valid Email, Invalid Call or Visit */
                    detail.next_email
                END
            ELSE
                /* Invalid Call, Invalid Email. Visit untested */
                CASE WHEN (YEAR(detail.next_visit) > 1970) THEN detail.next_visit
                END
            END
        END
    ) as calc_next_action_date, 
    detail.next_email, detail.next_call, detail.next_visit
    FROM contact_customer_detail detail 
) details ON details.contact_id = contact.contact_id";

die();

// *****************************************************************************
// Radius Search
// *****************************************************************************

$o = new GeoData();

$a = array();
$a = $o->radius_search('37379', 20);

?><table>
	<tr><th width="60px">Zip</th>
		<th>City/State</th>
		<th>Distance</th>
	</tr><?
	foreach ($a as $row) {
		?><tr><td><?=$row->Zip;?></td>
			  <td><?=$row->City . ", " . $row->State;?></td>
			  <td><?=number_format($row->D, 1);?></td>
		<?
	}
?></table><?

die();

?>
