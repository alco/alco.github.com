var dateFormat = d3.time.format("%Y-%m-%d");
var parseDate = dateFormat.parse;

var dateGetter = function(dict) { return dict.date; };
var countGetter = function(dict) { return dict.count; };
var sortByDate = function(data) { return _.sortBy(data, dateGetter); };

var json = JSON.parse($("#json-data").html());
var data = _.chain(json).map(function(list, key) {
    return [key, sortByDate(_.map(list, function(dict) {
        dict.date = parseDate(dict.date);
        return dict;
    }))];
}).object().value();
var flatData = _.chain(data)
    .map(function(list) { return list; })
    .flatten()
    .value();
flatData = sortByDate(flatData);

var dateExtent = d3.extent(_.map(flatData, dateGetter));

var weeklyConfig = {
    interval: "week",
    fromDate: moment(dateExtent[1]).subtract(1, "week").toDate(),
    ticks: [d3.time.day, 1],
    tickFormat: d3.time.format("%a %d"),
};

var monthlyConfig = {
    interval: "month",
    fromDate: moment(dateExtent[1]).subtract(1, "month").toDate(),
};

var yearlyConfig = {
    interval: "year",
    fromDate: moment(dateExtent[1]).subtract(1, "year").toDate(),
};

function getExtent(data, config, cummulative) {
    var transform;
    if (cummulative) {
        transform = accumulateData;
    } else {
        transform = function(x) { return x; };
    }
    return d3.extent(_.chain(data).map(function(list) {
        return _.map(transform(filterData(list, config.fromDate)), countGetter);
    }).flatten().value());
}

var countExtents = {
    week: {
        true: getExtent(data, weeklyConfig, true),
        false: getExtent(data, weeklyConfig, false),
    },
    month: {
        true: getExtent(data, monthlyConfig, true),
        false: getExtent(data, monthlyConfig, false),
    },
    year: {
        true: getExtent(data, yearlyConfig, true),
        false: getExtent(data, yearlyConfig, false),
    },
};

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

var offsetX = 20;

var BLUES   = ["#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c"];
var GREENS  = ["#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c"];
var BLACKS  = ["#bdbdbd", "#969696", "#737373", "#525252", "#252525"];
var ORANGES = ["#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603"];
var VIOLETS = ["#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#54278f"];
var REDS    = ["#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15"];
var NCOLORS = 7;
var COLORS = [BLUES, GREENS, ORANGES, VIOLETS, REDS, BLACKS];
var FLAT_COLORS = _.flatten(_.zip(BLACKS, BLUES, GREENS, ORANGES, VIOLETS, REDS)).reverse();

var colorIndex = 0;

/////////

function newChart(dateExtent, inExtent, config, invertY, cummulative) {
    var x = d3.time.scale.utc()
        .domain([Math.max(dateExtent[0], config.fromDate), dateExtent[1]])
        .range([0, width]);
    var xAccess = function(dict) { return x(dict.date); };

    var extent;
    if (inExtent) {
        extent = inExtent;
    } else {
        extent = countExtents[config.interval][cummulative];
    }
    var y = d3.scale.linear().domain(extent);
    y.range([height, 0]);
    var yAccess = function(dict) { return y(dict.count); };

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
    if (config.ticks) {
        xAxis.ticks.apply(xAxis, config.ticks);
    }
    if (config.tickFormat) {
        xAxis.tickFormat(config.tickFormat);
    }

    var yAxis = d3.svg.axis()
        .scale(y)
        //.tickValues([1, 10, 20, 50, 100, 250, 500, 1000, 2000, 5000, 10000])
        .tickFormat(d3.format("d"))
        .orient("left");

    var svg = d3.select("body").append("svg")
        .attr("class", "tmp")
        .attr("width", width + margin.left + margin.right+offsetX)
        .attr("height", height + margin.top + margin.bottom);
    var chart = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate("+offsetX+"," + height + ")")
      .call(xAxis);

    chart.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      //.attr("transform", "rotate(-90)")
      .attr({
          x: 10,
          y: 6,
          dy: ".71em",
          class: "label",
      })
      //.style("text-anchor", "end")
      .text("last " + config.interval + "'s downloads");

    return {
        svg: svg,
        chart: chart,
        fromDate: config.fromDate,
        useLine: invertY,
        x: xAccess,
        y: function(dict) { return y(dict.count); },
    };
}

function filterData(data, fromDate) {
    return _.filter(data, function(dict) { return dict.date >= fromDate; });
}

function updateChart(chart, data, name) {
    var color = FLAT_COLORS[colorIndex++ % FLAT_COLORS.length];
    var w = Math.min(40, width / data.length);
    var wp = w * .7;
    if (chart.useLine) {
        var line = d3.svg.line().x(chart.x).y(function(dict) { return chart.y(dict); });
        chart.chart.append("path")
          .datum(data)
          .attr("transform", "translate("+offsetX+",0)")
          .attr("class", "line")
          .attr("d", line)
          .attr("stroke", color);
    } else {
        chart.chart.selectAll("rect ."+name)
            .data(data)
            .enter()
            .append("rect")
                .attr({
                    class: name,
                    transform: "scale(1, -1) translate("+(offsetX-wp/2)+", 0)",
                    x: chart.x,
                    y: -height,
                    width: wp,
                    height: function(dict) { return height-chart.y(dict) },
                    fill: color,
                });
    }
    return chart.svg;
}

//////////////

var currentPackage;
var chartType = "bar";
var charts = [];
var totalChart;
var cummulative = false;

var totalData = _.map(_.reduce(flatData, function(acc, dict) {
    if (!acc[dict.date]) {
        acc[dict.date] = {date: dict.date, count: 0};
    }
    acc[dict.date].count += dict.count;
    return acc;
}, {}), function(dict) { return dict; });
var totalAccumulatedData = accumulateData(totalData);
var totalExtent = {
    false: d3.extent(_.map(totalData, countGetter)),
    true: d3.extent(_.map(totalAccumulatedData, countGetter)),
};

function accumulateData(data) {
    var count = 0;
    return _.chain(data)
        .map(function(dict) {
            count += dict.count;
            var obj = {};
            obj.date = dict.date;
            obj.count = count;
            return obj;
        })
        .value();
}

function redrawCharts(type, package) {
    $("svg.tmp").remove();

    if (!package) return;

    var useLine = type == "line";
    charts = _.map([weeklyConfig, monthlyConfig, yearlyConfig], function(config) {
        var chart = newChart(dateExtent, null, config, useLine, cummulative);
        var filteredData = filterData(data[package], chart.fromDate);
        if (cummulative) {
            filteredData = accumulateData(filteredData);
        }
        return updateChart(chart, filteredData, package);
    });
}

function populatePackages(data, selector) {
    selector.empty().append($("<option/>"));
    _.each(data, function(dict, name) {
        selector.append($("<option>"+name+"</option>"));
    });
}

function redrawTotalChart() {
    if (totalChart) {
        totalChart.remove();
    }
    var data;
    if (cummulative) {
        data = totalAccumulatedData;
    } else {
        data = totalData;
    }
    totalChart = newChart(dateExtent, totalExtent[cummulative], yearlyConfig, chartType=="line", cummulative);
    totalChart = updateChart(totalChart, data, "total");
    totalChart.attr("class", "");
}

$(function() {
    $("#chart-type-sel").change(function() {
        chartType = $(this).val();
        redrawTotalChart();
        redrawCharts(chartType, currentPackage);
    });

    $("#package-sel").change(function() {
        currentPackage = $(this).val();
        redrawCharts(chartType, currentPackage);
    });

    $("#cummulative-check").click(function() {
        cummulative = $(this).prop("checked");
        redrawTotalChart();
        redrawCharts(chartType, currentPackage);
    });

    populatePackages(data, $("#package-sel"));

    redrawTotalChart();
});
