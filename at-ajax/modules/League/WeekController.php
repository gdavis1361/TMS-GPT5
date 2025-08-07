<?php
class League_WeekController extends CrudController {
	public $model = 'LeagueWeek';
	public $primaryKey = 'week_id';
	
	public function createAction() {
		if(get_user()->get('role_id') != UserRoles::Admin){
			return;
		}
		return parent::createAction();
	}
	
	public function updateAction() {
		if(get_user()->get('role_id') != UserRoles::Admin){
			return;
		}
		return parent::updateAction();
	}
	
	public function destroyAction() {
		if(get_user()->get('role_id') != UserRoles::Admin){
			return;
		}
		return parent::destroyAction();
	}
	
	public function formatRow($row) {
		$row['start_date'] = date('n/j/Y', strtotime($row['start_date']));
		$row['end_date'] = date('n/j/Y', strtotime($row['end_date']));
		return parent::formatRow($row);
	}
	
	public function getWhere(){
		$where = parent::getWhere();
		
		//Load the active season?
		if(isset($_REQUEST['active'])){
			$season = new LeagueSeason();
			$season->loadActiveSeason();

			if($season->get('season_id')){
				$where[] = "season_id = {$season->get('season_id')}";
			}
		}
		
		return $where;
	}
	
	public function getSort() {
		return array(
			'week_id ASC'
		);
	}
}