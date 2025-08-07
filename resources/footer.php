<?
$nPageRenderEnd = microtime(TRUE);
$nPageRenderTime = round( ($nPageRenderEnd - $nPageRenderBegin), 3);
if ($vDisplayRenderTime) echo "Page rendered in " . $nPageRenderTime . " second" . ($nPageRenderTime == 1 ? "" : "s");

?>
</div>
</div>
</body> 
</html> 
<?php 
//ob_end_flush();
?>
