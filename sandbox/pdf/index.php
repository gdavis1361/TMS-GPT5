<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

$docsDir = __DIR__ . '/docs';
if (!is_dir($docsDir)) {
	die('You need to make ./docs and make it writable');
}


$view = new Zend_View();
$view->setScriptPath(__DIR__ . '/template');
$params = array(
	'title' => 'Load Confirmation',
	'address' => 'Access America Transport<br />2515 East 43rd St, Suite B<br />Chattanooga, TN 37407',
	'logo' => '../../resources/access_america_logo.jpg',
	'pageNumer' => 1,
	'websiteUrl' => 'www.accessamericatransport.com',
	'documentTitle' => 'Load Confirmation',
	'documentSubtitle' => 'Load#: 0020011',
	
	'carrier' => 'Mercer Transportation',
	'contact' => 'Ivan',
);
foreach($params as $key => $value) {
	$view->$key = $value;
}

$html = $view->render('index.php');
//echo $html;die();

require_once(INCLUDES_DIR . '/dompdf/dompdf_config.inc.php');
$dompdf = new DOMPDF();
$dompdf->load_html($html);
$dompdf->render();
$dompdf->stream("sample.pdf");
die();

// Create new font
$font = Zend_Pdf_Font::fontWithName(Zend_Pdf_Font::FONT_HELVETICA); 
$page1 = new Zend_Pdf_Page(Zend_Pdf_Page::SIZE_A4);
$text = "This is generated with Zend's pdf class and sent using Zend's mail class";
$x1 = 50;
$y1 = $page1->getHeight() - 50;

// Apply font
$page1->setFont($font, 24);

$pdf->drawTextBox($page1, $text, $x1, $y1, 500);
$pdf->pages[] = $page1;
$pdf->save($docsDir . '/test.pdf');