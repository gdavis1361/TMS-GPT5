<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
/*
 * Return Format
 * ARRAY
 *    SELECTED
 *    RETURNED
 *    TOTAL
 *    RESULTS
 *       NAME
 *       ADDRESS1
 *       ADDRESS2
 *       CITY
 *       STATE
 *       STATE_LONG
 *       ZIP
 *       PHONE
 *       FAX
 *       MATCHED_ON
 */


$sQuery = urldecode( request('q') );
// unit test data
//$sQuery = "goog";

$aResults = array();
$aResults['TOTAL']    = 0;
$aResults['SELECTED'] = 0;
$aResults['RETURNED'] = 0;
$aResults['RESULTS']  = array();
$nMaxReturn = 5;

if ( strlen($sQuery) >= 3 ) {
	
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

	// Prep Words
	$aSqlWords = array();
	foreach ( $aQuery as $sQueryWord ) {
		
		
		// Over 2 Characters
		if ( strlen($sQueryWord) >= 2 ) {
			$aSqlWords[] = $sQueryWord;
			
			// Use Columns
			if ( strlen($sQueryWord) >= 2 ) {
				$aTMSCheckFields[ count($aSqlWords)-1 ] = array( 'location_name_1', 'location_name_2' );
				$aCMCheckFields[ count($aSqlWords)-1 ]  = array( 'city' );
			}
			
			// State Abbr
			if ( !is_numeric($sQueryWord) && strlen($sQueryWord) == 2 ) {
				$aCMCheckFields[ count($aSqlWords)-1 ][] = 'state';
			}
			
			// Zip Code
			if ( is_numeric($sQueryWord) && strlen($sQueryWord) == 5 ) {
				$aTMSCheckFields[ count($aSqlWords)-1 ] = array('zip');
			}
			
			// Remove Word if no Columns Match
			if ( count($aCMCheckFields[ count($aSqlWords)-1 ]) === 0 && count($aTMSCheckFields[ count($aSqlWords)-1 ]) === 0 ) {
				unset( $aSqlWords[ count($aSqlWords)-1 ] );
			}
		}
	}
	//echo "Sql words: ";
	//pre($aSqlWords);
	
	if ( count($aSqlWords) > 0 ) {
		// Find Matches
		$oLocationBase  = new LocationBase;
		$oLocationBase->connect();
		
		$sLocationTable = "location_base";
		$sZipDataTable  = "info"; //alias
		$sSql = "
			SELECT
				location_base.*, info.*
			FROM tms.dbo.location_base
				JOIN ContractManager.dbo.ZipsPostalCodesUS info ON info.Zip = location_base.zip
			WHERE 
				location_base.active = 1
				AND info.Seq = location_base.seq";
				
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
		
//		echo $sSql;
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
					'LAT' => $oRow->Lat,
					'LNG' => $oRow->Long,
					'ZIP' => $oRow->zip,
					'SEQ' => $oRow->seq,
					'PHONE' => '',
					'FAX' => ''
				);
				//$aResults['RESULTS'][count($aResults)-1]['MATCHED_ON'][] = $sField;
			}
			//echo '<br /> '. print_r($oRow,1);
		}
	}
}

echo json_encode($aResults);
?>