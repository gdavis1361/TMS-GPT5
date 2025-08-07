<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
/*
 * Return Format
 * ARRAY
 *    SELECTED
 *    RETURNED
 *    TOTAL
 *    RESULTS
 *       CODE
 *       GROUP_ID
 *       INDUSTRY_NAME
 */


$sQuery = urldecode( request('q') );

$aResults = array();
$aResults['TOTAL']    = 0;
$aResults['SELECTED'] = 0;
$aResults['RETURNED'] = 0;
$aResults['RESULTS']  = array();
$nMaxReturn = 25;

if ( strlen($sQuery) >= 2 ) {
	
	$sQuery = trim( preg_replace("/[^0-9A-Za-z]/", " ", $sQuery) );
	$aQuery = explode( ' ', $sQuery );
	
	
	
	// Cleanse Query Array
	$t_aQuery = array();
	foreach ( $aQuery as $sQueryWord ) {
		if ( strlen( trim($sQueryWord) ) > 0 ) {
			$t_aQuery[] = $sQueryWord;
		}
	}
	$aQuery = $t_aQuery;

	$oIndustryBase  = new IndustryBase;
	$oIndustryBase->connect();
		
	// Prep Words
	$aSqlWords = array();
	foreach ( $aQuery as $sQueryWord ) {
		
		
		// Over 2 Characters
		if ( strlen($sQueryWord) >= 2 ) {
			$aSqlWords[] = $sQueryWord;
			
			// Use Columns
			if ( is_numeric($sQueryWord) ) {
				$oIndustryBase->where( 'industry_id', 'startslike', $sQueryWord );
			}
			else {
				$oIndustryBase->where( 'lower(industry_name)', 'like', strtolower($sQueryWord) );
			}
		}
	}
	
	if ( count($aSqlWords) > 0 ) {
		
		$oIndustryBase->order('industry_id', 'ASC');
		$o = $oIndustryBase->list();
		
		$aResults['TOTAL']    = $o->selected_rows;
		$aResults['SELECTED'] = $o->selected_rows;
		$aResults['RETURNED'] = $o->returned_rows;
		
		foreach ($o->rows as $row) { 
			$aResults['RESULTS'][]  = array(
				"CODE" => trim($row->industry_id),
				"GROUP_ID" => trim($row->industry_group_id),
				"INDUSTRY_NAME" => trim($row->industry_name)
			);
			//$sHtml .= ;
		}
		/*
		$sSql = "
			SELECT
				".$sLocationTable.".[location_id],
				".$sLocationTable.".[location_abbr],
				".$sLocationTable.".[location_name_1],
				".$sLocationTable.".[location_name_2],
				".$sLocationTable.".[address_1],
				".$sLocationTable.".[address_2],
				".$sLocationTable.".[address_3],
				".$sZipDataTable.".[City],
				".$sZipDataTable .".[County],
				".$sZipDataTable .".[State],
				".$sLocationTable.".[zip]
			FROM ".$sLocationTable."
				JOIN ".$sZipDataTable." ON ".$sZipDataTable.".[zip] = ".$sLocationTable.".[zip]
			WHERE 
				".$sLocationTable.".[active] = 1
				AND ".$sZipDataTable.".[Seq] = 1
		";
		foreach ( $aSqlWords as $nKey => $sWord ) {
			$sSql .= ' AND (';
			$aLikes = array();
			if ( isset($aTMSCheckFields[ $nKey ]) && count($aTMSCheckFields[ $nKey ]) ) {
				foreach( $aTMSCheckFields[ $nKey ] as $sField ) {
					$aLikes[] = $sLocationTable.".[".$sField."] LIKE '%".$sWord."%'";
				}
			}
			if ( isset($aCMCheckFields[ $nKey ]) && count($aCMCheckFields[ $nKey ]) ) {
				foreach( $aCMCheckFields[ $nKey ] as $sField ) {
					if ( $sField == 'state' ) {
						$aLikes[] = $sZipDataTable.".[".$sField."] = '".$sWord."'";
					}
					else {
						$aLikes[] = $sZipDataTable.".[".$sField."] LIKE '%".$sWord."%'";
					}
				}
			}
			$sSql .= implode( "\nOR ", $aLikes );
			$sSql .= ") \n";
		}
		$sSql .= ' ORDER BY '.$sLocationTable.'.[location_name_1] ASC';
		
		//echo $sSql;
		$oRes = $oLocationBase->db->query($sSql);
		
		$aResults['TOTAL'] = $oLocationBase->db->num_rows($oRes);
		
		while( $oRow = $oLocationBase->db->fetch_object($oRes) ) {
			$aResults['SELECTED']++;
			if ( count($aResults['RESULTS']) <= $nMaxReturn ) {
				$aResults['RETURNED']++;
				$aResults['RESULTS'][] = array(
					'ID' => $oRow->location_id,
					'NAME_ABBR' => $oRow->location_abbr,
					'NAME' => $oRow->location_name_1,
					'NAME_2' => $oRow->location_name_2,
					'ADDRESS1' => $oRow->address_1,
					'ADDRESS2' => $oRow->address_2,
					'ADDRESS3' => $oRow->address_3,
					'CITY' => $oRow->City,
					'COUNTY' => $oRow->County,
					'STATE' => $oRow->State,
					'ZIP' => $oRow->zip,
					'PHONE' => '',
					'FAX' => ''
				);
				//$aResults['RESULTS'][count($aResults)-1]['MATCHED_ON'][] = $sField;
			}
			//echo '<br /> '. print_r($oRow,1);
		}
		*/
	}
}

echo json_encode($aResults);
?>