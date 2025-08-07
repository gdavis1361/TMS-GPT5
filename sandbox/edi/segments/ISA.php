<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_ISA extends Edi_Segments_Abstract {
	public $type = "ISA";
	public $AuthorizationInformationQualifier;
	public $AuthorizationInformation;
	public $SecurityInformationQualifier;
	public $SecurityInformation;
	public $InterchangeSenderIdQualifier;
	public $InterchangeSenderId;
	public $InterchangeReceiverIdQualifier;
	public $InterchangeRecieverId;
	public $InterchangeDate;
	public $InterchangeTime;
	public $InterchangeControlStandardsIdentifier;
	public $InterchangeControlVersionNumber;
	public $InterchangeControlNumber;
	public $AcknowledgmentRequested;
	public $UsageIndicator;
	public $ComponentElementSeperator;
	
	public $map = array(
		"AuthorizationInformationQualifier",
		"AuthorizationInformation",
		"SecurityInformationQualifier",
		"SecurityInformation",
		"InterchangeSenderIdQualifier",
		"InterchangeSenderId",
		"InterchangeReceiverIdQualifier",
		"InterchangeRecieverId",
		"InterchangeDate",
		"InterchangeTime",
		"InterchangeControlStandardsIdentifier",
		"InterchangeControlVersionNumber",
		"InterchangeControlNumber",
		"AcknowledgmentRequested",
		"UsageIndicator",
		"ComponentElementSeperator"
	);
}