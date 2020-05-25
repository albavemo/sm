
let options = {
  el: '#app',
  data: {

  },
methods: {
}
,
  template: `<div>
      <form action="/upload" method="POST" enctype="multipart/form-data">
      	<input type="file" name="filename" >
      	<br>
      	<input type="submit" value="Upload a file">
      </form>
  </div>`
} //end options
let vm = new Vue(options);
