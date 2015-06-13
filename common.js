var base_size = {width:150, height:150}; // Size of all Canvas

var base_img;
var base_canvas, src_canvas, mask_canvas, result_canvas;
var base_ctx, src_ctx, mask_ctx, result_ctx;


/*-----------------------------------------
 Functions to set arbitrary button state
 state: true->enabled, false->disabled
-----------------------------------------*/
function setButtonState(button_name, state) {
  var button_elements = document.getElementsByName(button_name);
  for(var i=0; i<button_elements.length; i++) {
    button_elements[i].disabled = !state;
  }
}


/*-----------------------------------------
 Initial functions
 1) all Canvas
 2) only Result Canvas(for re-draw)
-----------------------------------------*/
function initializeCanvas() {
  // To call completeInitializeCanvas()
  var loaded_image_count = 0;

  blend_position_offset.x = 0; blend_position_offset.y = 0;

  var mask_pixels = mask_ctx.getImageData(0, 0, base_size.width, base_size.height);
  for(var i=0; i<mask_pixels.data.length; i++) {
    mask_pixels.data[i] = 255;
  }
  mask_ctx.putImageData(mask_pixels, 0, 0);

  setButtonState("blendBtn", false);
  setButtonState("adjustBtn", true);
  setButtonState("directionBtn", false);

  base_img = new Image();
  base_img.src = image_set.base;
  base_img.onload = function() { // Images must be Pre-loaded
    if(++loaded_image_count === 2) completeInitializeCanvas();
  };

  var src_img = new Image();
  src_img.src = image_set.src;
  src_img.onload = function() {
    if(++loaded_image_count === 2) completeInitializeCanvas();
  };

  function completeInitializeCanvas() {
    base_canvas.width = base_size.width; base_canvas.height = base_size.height;
    src_canvas.width = base_size.width; src_canvas.height = base_size.height;
    mask_canvas.width = base_size.width; mask_canvas.height = base_size.height;
    result_canvas.width = base_size.width; result_canvas.height = base_size.height;

    base_ctx.drawImage(base_img, 0, 0, base_size.width, base_size.height);
    src_ctx.drawImage(src_img, 0, 0, base_size.width, base_size.height);
    mask_ctx.drawImage(src_img, 0, 0, base_size.width, base_size.height);
    initializeResultCtx();

    calMaskCanvasOffset();
    mask_canvas.addEventListener("mousemove", drawMask, true);
    mask_canvas.addEventListener("mousedown", startDrawing, true);
    mask_canvas.addEventListener("mouseup", finishDrawing, true);
  }
}
function initializeResultCtx() {
  var result_pixels = result_ctx.getImageData(0, 0, base_size.width, base_size.height);
  for(var i=0; i<result_pixels.data.length; i++) {
    result_pixels.data[i] = 255;
  }
  result_ctx.putImageData(result_pixels, 0, 0);
  result_ctx.drawImage(base_img, 0, 0, base_size.width, base_size.height);
}


/*-----------------------------------------
 [Step1]
 Function to control
 value of Gradients radio button
-----------------------------------------*/
var is_mixing_gradients = false;
function changeGradients(gradients) {
  if(gradients === "mixing") is_mixing_gradients = true;
  else is_mixing_gradients = false;
}


/*-----------------------------------------
 [Step2]
 Functions for EventListener
 Related to drawing mask area
-----------------------------------------*/
var mask_canvas_offset = {x:0, y:0};
var drawing = false, old_point = {x:0, y:0};
function calMaskCanvasOffset() {
  var bounds = mask_canvas.getBoundingClientRect();
  mask_canvas_offset.x = bounds.left;
  mask_canvas_offset.y = bounds.top;
}
function drawMask(e) {
  if(drawing) {
    var x = e.clientX - mask_canvas_offset.x;
    var y = e.clientY - mask_canvas_offset.y;
    mask_ctx.strokeStyle = "rgba(0,255,0,1.0)";
    mask_ctx.lineWidth = 20;
    mask_ctx.lineJoin = "round";
    mask_ctx.lineCap = "round";
    mask_ctx.beginPath();
    mask_ctx.moveTo(old_point.x, old_point.y);
    mask_ctx.lineTo(x, y);
    mask_ctx.stroke();
    mask_ctx.closePath();
    old_point.x = x;
    old_point.y = y;
  }
}
function startDrawing(e) {
  drawing = true;
  old_point.x = e.clientX - mask_canvas_offset.x;
  old_point.y = e.clientY - mask_canvas_offset.y;
}
function finishDrawing(e) {
  drawing = false;
}


/*-----------------------------------------
 [Step3]
 Adjust and move blend position
-----------------------------------------*/
var blend_position_offset = {x:0, y:0};
function adjustBlendPosition() {
  var src_pixels = src_ctx.getImageData(0, 0, base_size.width, base_size.height);
  var mask_pixels = mask_ctx.getImageData(0, 0, base_size.width, base_size.height);
  var result_pixels = result_ctx.getImageData(0, 0, base_size.width, base_size.height);

  for(var y=1; y<base_size.height-1; y++) {
    for(var x=1; x<base_size.width-1; x++) {
      var p = (y*base_size.width+x)*4;
      if(mask_pixels.data[p+0]==0 && mask_pixels.data[p+1]==255 &&
          mask_pixels.data[p+2]==0 && mask_pixels.data[p+3]==255) {

        var p_offseted = p + 4*((blend_position_offset.y)*base_size.width+blend_position_offset.x);
        for(var rgb=0; rgb<3; rgb++) {
          result_pixels.data[p_offseted+rgb] = src_pixels.data[p+rgb];
        }
      }
    }
  }
  result_ctx.putImageData(result_pixels, 0, 0);

  mask_canvas.removeEventListener("mousemove", drawMask, true);
  mask_canvas.removeEventListener("mousedown", startDrawing, true);
  mask_canvas.removeEventListener("mouseup", finishDrawing, true);

  setButtonState("adjustBtn", false);
  setButtonState("blendBtn", true);
  setButtonState("directionBtn", true);
}
function moveBlendPosition(direction) {
  var mask_pixels = mask_ctx.getImageData(0, 0, base_size.width, base_size.height);
  var max = {x:base_size.width-2, y:base_size.height-2}, min = {x:0, y:0};

  if(direction === "up") {
    blend_position_offset.y-=10;
  } else if(direction === "right") {
    blend_position_offset.x+=10;
  } else if(direction === "down") {
    blend_position_offset.y+=10;
  } else if(direction === "left") {
    blend_position_offset.x-=10;
  }

  for(var y=1; y<base_size.height-1; y++) {
    for(var x=1; x<base_size.width-1; x++) {
      var p = (y*base_size.width+x)*4;
      if(mask_pixels.data[p+0]==0 && mask_pixels.data[p+1]==255 &&
          mask_pixels.data[p+2]==0 && mask_pixels.data[p+3]==255) {

        if((x+blend_position_offset.x)>max.x || (x+blend_position_offset.x)<min.x ||
          (y+blend_position_offset.y)>max.y || (y+blend_position_offset.y)<min.y) {

          if(direction === "up") {
            blend_position_offset.y+=10;
          } else if(direction === "right") {
            blend_position_offset.x-=10;
          } else if(direction === "down") {
            blend_position_offset.y-=10;
          } else if(direction === "left") {
            blend_position_offset.x+=10;
          }

          return false;
        }
      }
    }
  }
  initializeResultCtx();
  adjustBlendPosition();
}


/*-----------------------------------------
 Blend Images
 g : src_pixels (using mask_pixels)
 f*: base_pixels
 ---> Blend result is result_pixels
-----------------------------------------*/
function blendImages() {
  initializeResultCtx();

  var base_pixels = base_ctx.getImageData(0, 0, base_size.width, base_size.height);
  var src_pixels = src_ctx.getImageData(0, 0, base_size.width, base_size.height);
  var mask_pixels = mask_ctx.getImageData(0, 0, base_size.width, base_size.height);
  var result_pixels = result_ctx.getImageData(0, 0, base_size.width, base_size.height);

  var dx, absx, previous_epsilon=1.0;
  var cnt=0;

  do {
    dx=0; absx=0;
    for(var y=1; y<base_size.height-1; y++) {
      for(var x=1; x<base_size.width-1; x++) {
        // p is current pixel
        // rgba r=p+0, g=p+1, b=p+2, a=p+3
        var p = (y*base_size.width+x)*4;

        // Mask area is painted rgba(0,255,0,1.0)
        if(mask_pixels.data[p+0]==0 && mask_pixels.data[p+1]==255 &&
            mask_pixels.data[p+2]==0 && mask_pixels.data[p+3]==255) {

          var p_offseted = p + 4*(blend_position_offset.y*base_size.width+blend_position_offset.x);

          // q is array of connected neighbors
          var q = [((y-1)*base_size.width+x)*4, ((y+1)*base_size.width+x)*4,
                    (y*base_size.width+(x-1))*4, (y*base_size.width+(x+1))*4];
          var num_neighbors = q.length;

          for(var rgb=0; rgb<3; rgb++) {
            var sum_fq = 0;
            var sum_vpq = 0;
            var sum_boundary = 0;

            for(var i=0; i<num_neighbors; i++) {
              var q_offseted = q[i] + 4*(blend_position_offset.y*base_size.width+blend_position_offset.x);

              if(mask_pixels.data[q[i]+0]==0 && mask_pixels.data[q[i]+1]==255 &&
                  mask_pixels.data[q[i]+2]==0 && mask_pixels.data[q[i]+3]==255) {
                sum_fq += result_pixels.data[q_offseted+rgb];
              } else {
                sum_boundary += base_pixels.data[q_offseted+rgb];
              }

              if(is_mixing_gradients && Math.abs(base_pixels.data[p_offseted+rgb]-base_pixels.data[q_offseted+rgb]) >
                Math.abs(src_pixels.data[p+rgb]-src_pixels.data[q[i]+rgb])) {
                sum_vpq += base_pixels.data[p_offseted+rgb]-base_pixels.data[q_offseted+rgb];
              } else {
                sum_vpq += src_pixels.data[p+rgb]-src_pixels.data[q[i]+rgb];
              }
            }
            var new_value = (sum_fq+sum_vpq+sum_boundary)/num_neighbors;
            dx += Math.abs(new_value-result_pixels.data[p_offseted+rgb]);
            absx += Math.abs(new_value);
            result_pixels.data[p_offseted+rgb] = new_value;
          }
        }
      }
    }
    cnt++;
    var epsilon = dx/absx;
    if(!epsilon || previous_epsilon-epsilon === 0) break; // convergence
    else previous_epsilon = epsilon;
  } while(true);
  result_ctx.putImageData(result_pixels, 0, 0);

  mask_canvas.addEventListener("mousemove", drawMask, true);
  mask_canvas.addEventListener("mousedown", startDrawing, true);
  mask_canvas.addEventListener("mouseup", finishDrawing, true);

  setButtonState("adjustBtn", true);
  setButtonState("blendBtn", false);
  setButtonState("directionBtn", false);

  alert(cnt+" times iterated.");
}
