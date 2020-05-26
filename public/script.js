function st2Func() {
	$(document).ready(function(){
	     $('#uploadForm').html('<p> Please, select a WAV file </p><form action="/upload" method= "POST" enctype="multipart/form-data"><input type="file" name="filename"><br><br><input type="submit" value="Submit"></form>');
	  });
}

function vtsFunc() {
	$(document).ready(function(){
	     $('#uploadForm').html('<p> Please, select a MP4 file </p><form action="/apis" method= "POST" enctype="multipart/form-data"><input type="file" name="filename"><br><br><input type="submit" value="Submit"></form>');
	  });
}
