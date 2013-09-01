(function() {
    var errLabel = $('#404');

    setInterval(function() {
        errLabel.toggleClass('yello').toggleClass('hidden');
    }, 500);

    $('#home-link').on('mouseenter', function() {
        $(this).removeClass('home-link').addClass('home-link-hover');
    }).on('mouseleave', function() {
        $(this).addClass('home-link').removeClass('home-link-hover');
    });
})();

////////////////////////////////////////

var WIDTH = 175;
var HEIGHT = 100;

var CANVAS_WIDTH = 700, CANVAS_HEIGHT = 400;

var world = new Array(WIDTH * HEIGHT);
var altWorld = new Array(WIDTH * HEIGHT);
var currentWorld = world;
var newWorld = altWorld;

var neighbours = [
    {i: -1, j: -1},
    {i: -1, j: 0},
    {i: -1, j: 1},
    {i: 1, j: -1},
    {i: 1, j: 0},
    {i: 1, j: 1},
    {i: 0, j: -1},
    {i: 0, j: 1},
];

// Initial setup
for (var i = 0; i < WIDTH * HEIGHT; ++i) {
    currentWorld[i] = 0;
    newWorld[i] = 0;
}

var mod = function(a, b) {
    return ((a % b) + b) % b;
};

var swapWorlds = function() {
    var tmp = currentWorld;
    currentWorld = newWorld;
    newWorld = tmp;
};

var flush = function(w) {
    for (var i = 0; i < WIDTH * HEIGHT; ++i) {
        w[i] = 0;
    }
};

var tick = function() {
    var i, j, k;
    var ii, jj;
    var index;
    var neighbourCount;
    flush(newWorld);
    for (i = 0; i < HEIGHT; ++i) {
        for (j = 0; j < WIDTH; ++j) {
            neighbourCount = 0;
            for (k = 0; k < 8; ++k) {
                ii = mod(i + neighbours[k].i, HEIGHT);
                jj = mod(j + neighbours[k].j, WIDTH);
                index = ii * WIDTH + jj;
                neighbourCount += currentWorld[index];
            }

            index = i * WIDTH + j;
            if (currentWorld[index] === 0) {  // dead cell
                if (neighbourCount === 3)
                    newWorld[index] = 1;
            } else {  // live cell
                newWorld[index] = (neighbourCount >= 2 && neighbourCount <= 3 ? 1 : 0);
            }
        }
    }
};

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

ctx.fillStyle = '#000';
ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

var w = CANVAS_WIDTH / WIDTH;
var h = CANVAS_HEIGHT / HEIGHT;

var draw = function() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#fff';
    for (i = 0; i < HEIGHT; ++i) {
        for (j = 0; j < WIDTH; ++j) {
            index = i * WIDTH + j;

            if (currentWorld[index] === 1)
                ctx.fillRect(j * w, i * h, w, h);
        }
    }
}

setInterval(function() {
    tick();
    draw();
    swapWorlds();
}, 80);


var string_to_figure = function(s) {
    // Split the string into lines
    var comps = _.filter(s.split(/\s/), function(elem) {
        return elem.length > 0;
    });

    // Create a buffer that'll store the final figure
    var buffer = new Array(comps.length * comps[0].length);
    _.each(comps, function(line, index) {
        var i = 0, l = line.length;
        for (; i < l; ++i) {
            buffer[index * l + i] = (line[i] === 'x' ? 1 : 0);
        }
    });

    return { width: comps[0].length, height: comps.length, buffer: buffer};
}

var implant = function(s, left, top) {
    var buffer = string_to_figure(s);

    for (var i = 0; i < buffer.height; ++i) {
        for (var j = 0; j < buffer.width; ++j) {
            var l_index = i * buffer.width + j;
            var x = mod(left + j, WIDTH);
            var y = mod(top + i, HEIGHT);
            currentWorld[y * WIDTH + x] = buffer.buffer[l_index];
        }
    }
}

var glider = "\
_x_ \
__x \
xxx \
";

var pulsar = "\
__xxx___xxx__ \
_____________ \
x____x_x____x \
x____x_x____x \
x____x_x____x \
__xxx___xxx__ \
_____________ \
__xxx___xxx__ \
_____x_x_____ \
x____x_x____x \
x____x_x____x \
x___________x \
__xxx___xxx__ \
";

var line = "\
xxxxxxxx_xxxxx___xxx______xxxxxxx_xxxxx \
";

var block = "\
xxx_x \
x____ \
___xx \
_xx_x \
x_x_x \
";

var gosper_glider_gun = "\
________________________x___________ \
______________________x_x___________ \
____________xx______xx____________xx \
___________x___x____xx____________xx \
xx________x_____x___xx______________ \
xx________x___x_xx____x_x___________ \
__________x_____x_______x___________ \
___________x___x____________________ \
____________xx______________________ \
";

var starting_patterns = [
pulsar, 44, 40,
line, 35, 49,
block, 47, 48,
gosper_glider_gun, 5, 44
];

// Select a random starting pattern
var num_patterns = starting_patterns.length/3;
var rnd_index = mod(Math.floor(Math.random() * num_patterns), num_patterns) * 3;
implant(starting_patterns[rnd_index], starting_patterns[rnd_index+1], starting_patterns[rnd_index+2]);
