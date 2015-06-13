

/*-----------------------------------------
 [Step1]
 Function to control
 value of Image Set radio button
-----------------------------------------*/
var image_set = {base:"images/vinci_target-150x150.png", src:"images/vinci_src-150x150.png"};
function changeImageSet(image) {
  if(image === "face"){
    image_set.base = "images/vinci_target-150x150.png";
    image_set.src = "images/vinci_src-150x150.png";
  } else {
    image_set.base = "images/hand1-150x150.png";
    image_set.src = "images/sign-150x150.png";
  }
  initializeCanvas();
}


window.onload = function() {
  base_canvas = document.getElementById("base-canvas");
  src_canvas = document.getElementById("src-canvas");
  mask_canvas = document.getElementById("mask-canvas");
  result_canvas = document.getElementById("result-canvas");

  base_ctx = base_canvas.getContext("2d");
  src_ctx = src_canvas.getContext("2d");
  mask_ctx = mask_canvas.getContext("2d");
  result_ctx = result_canvas.getContext("2d");

  window.onscroll = function(){ calMaskCanvasOffset(); };

  initializeCanvas();
};
