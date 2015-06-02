<!DOCTYPE html>
<html>
<body>
<?php
exec('make 2>&1',$lines,$ret);
foreach($lines as $line) {
    echo $line,'<br>',PHP_EOL;
}
if($ret == 0) {
    //redirect
}
?>
</body>
</html>
