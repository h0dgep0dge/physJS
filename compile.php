<?php
header('Content-Type: application/javascript');
exec('make 2>&1',$lines,$ret);
foreach($lines as $line) {
    echo 'console.log(\'',addslashes($line),'\');',PHP_EOL;
}
?>
var script = document.createElement('script');
script.setAttribute('language','javascript');
script.setAttribute('src','physjs.js');
document.body.appendChild(script);
