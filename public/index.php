<?php 
echo("Preparing output...");
shell_exec("python videoLabeling.py gs://testing_videos/test.mp4"); 
echo("Video Description process finished!");
?>
