var slideshow = remark.create({
    highlightLanguage: 'ruby',
    highlightStyle: 'default',
//arta, ascetic, dark, default, far, github, googlecode, idea, ir_black, magula, monokai, rainbow, solarized_dark, solarized_light, sunburst, tomorrow, tomorrow-night-blue, tomorrow-night-bright, tomorrow-night, tomorrow-night-eighties, vs, zenburn.
});


///////////////////////////////////

function addFontSizeDelta(delta) {
  var body = document.getElementsByTagName("body")[0];
  var fontSize = body.style.fontSize;
  body.style.fontSize = (parseInt(fontSize) + delta) + "pt";
}

function setFontSize(size) {
  var body = document.getElementsByTagName("body")[0];
  body.style.fontSize = size + "pt";
}

var delta = 5;
function scaleUp() { addFontSizeDelta(delta); }
function scaleDown() { addFontSizeDelta(-delta); }

document.addEventListener("keydown", function(e) {
  console.log(e.keyCode);
  switch (e.keyCode) {
  case 187: // '='
    scaleUp();
    break;
  case 189: // '-'
    scaleDown();
    break;
  }

  var zero = 48;
  if (e.keyCode == zero) {  // '0'
    setFontSize(20);
  } else if (e.keyCode > zero && e.keyCode < zero + 10) {  // '1' - '9'
    setFontSize((e.keyCode - zero) * 4);
  }
});
document.getElementById("but-font-larger").addEventListener("click", function() {
  scaleUp();
});

document.getElementById("but-font-smaller").addEventListener("click", function() {
  scaleDown();
});

