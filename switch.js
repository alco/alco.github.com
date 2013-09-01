var body = $('body');
var classes = ["", "alt-font1", "alt-font2"];
var currentClass = 0;

$('#home-switch').on('click', function() {
    body.removeClass(classes[currentClass]);
    currentClass = (currentClass + 1) % classes.length;
    body.addClass(classes[currentClass]);
});
