var image_set = {base:null, src:null};

window.onload = function(){
  document.getElementById("start-app").disabled = true;
  document.getElementById("app").hidden = true;
};

document.getElementById("base-file").addEventListener("change", function(e) {
  loadSelectedFile(e.target.files[0], "base");
}, true);

document.getElementById("src-file").addEventListener("change", function(e) {
  loadSelectedFile(e.target.files[0], "src");
}, true);

function loadSelectedFile(file, which) {
  if(file.type.match('image/(jpeg|png)')) {
    var file_reader = new FileReader();
    file_reader.onload = (function(img_file) {
      return function(e) {
        image_set[which] = e.target.result;
        var img = "<img src='"+image_set[which]+"' alt='"+escape(img_file.name)+"' width=150 height=150 />";
        document.getElementById(which+"-img").innerHTML = img;
        if(image_set.base && image_set.src) { document.getElementById("start-app").disabled = false; }
      };
    })(file);
    file_reader.readAsDataURL(file);
  } else {
    alert("Please select JPEG/PNG image file.");
  }
}

function startApp() {
  window.onscroll = function(){ calMaskCanvasOffset(); };

  var front_div = document.getElementById("front");
  var front_div_parent = front_div.parentNode;
  front_div_parent.removeChild(front_div);

  document.getElementById("app").hidden = false;

  base_canvas = document.getElementById("base-canvas");
  src_canvas = document.getElementById("src-canvas");
  mask_canvas = document.getElementById("mask-canvas");
  result_canvas = document.getElementById("result-canvas");

  base_ctx = base_canvas.getContext("2d");
  src_ctx = src_canvas.getContext("2d");
  mask_ctx = mask_canvas.getContext("2d");
  result_ctx = result_canvas.getContext("2d");

  initializeCanvas();
}


/*-----------------------------------------
 Save result canvas as image
 Reference: http://jsdo.it/Yukisuke/p311
-----------------------------------------*/
function saveResult() {
  var base64 = result_canvas.toDataURL();
  var blob = Base64toBlob(base64);
  saveBlob(blob,"blend_result.png");
}
