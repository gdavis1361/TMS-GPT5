<?php
abstract class Migration_Abstract {
	abstract public function migrate($page, $perPage);
	abstract public function process($row);
	abstract public function getMigratedRow($id);
}