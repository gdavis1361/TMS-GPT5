<?php
class EquipmentGroupToPostingCode_Fields {
	const GroupId = 'equipment_group_id';
	const ServiceId = 'posting_service_id';
	const Code = 'posting_code';
	const CreatedBy = 'created_by_id';
	const CreatedAt = 'created_at';
	const UpdatedBy = 'updated_by_id';
	const UpdatedAt = 'updated_at';
}


/**
 * @author jaredtlewis
 *
 */
class EquipmentGroupToPostingCode extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'equipment_group_to_posting_code';
}
?>