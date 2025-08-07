<?php
class LP_Navigation {
	public $navigation = array();
	public $activeSection = false;
	public $activePage = false;
	
	public function __construct($navigation, $activeSection = false, $activePage = false) {
		$this->navigation = $navigation;
		$this->activeSection = $activeSection;
		$this->activePage = $activePage;
	}
	
	public function getTopLevelHtml($id = 'header-main-nav', $cls = 'header-main-nav') {
		$numItems = count($this->navigation);
		$html = '<ul id="'.$id.'" class="'.$cls.'" style="display: none;">';
		for ($i = 0; $i < $numItems; $i++) {
			$item = $this->navigation[$i];
			if (!isset($item['cls'])) {
				$item['cls'] = '';
			}
			if (isset($item['section']) && $item['section'] == $this->activeSection) {
				$item['cls'] .= ' active';
			}
			$html .= '<li>';
			$html .= '<a href="'.$item['href'].'" class="'.$item['cls'].'">'.$item['text'].'</a>';
			$html .= $this->getSubLevelHtml($item['section']);
			$html .= '</li>';
		}
		$html .= '</ul>';
		return $html;
	}
	
	public function getSubLevelHtml($section, $cls = 'header-sub-nav') {
		$numItems = count($this->navigation);
		$html = '<ul class="'.$cls.'" style="display: none;">';
		for ($i = 0; $i < $numItems; $i++) {
			$item = $this->navigation[$i];
			if ($item['section'] == $section) {
				$subNav = array();
				if (isset($item['items'])) {
					$subNav = $item['items'];
				}
				$numSubItems = count($subNav);
				for ($j = 0; $j < $numSubItems; $j++) {
					$subItem = $subNav[$j];
					if (!isset($subItem['cls'])) {
						$subItem['cls'] = '';
					}
					if (isset($subItem['page']) && $subItem['page'] == $this->activePage && $item['section'] == $this->activeSection) {
						$subItem['cls'] .= ' active';
					}
					$html .= '<li><a href="'.$subItem['href'].'" class="'.$subItem['cls'].'">'.$subItem['text'].'</a></li>';
				}
			}
		}
		$html .= '</ul>';
		return $html;
	}
}