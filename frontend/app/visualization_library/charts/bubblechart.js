/*
 * DIMPLE CHART LIBRARY
 * DATA FORMAT: [{"column1":"value1", "column2":"value2", ...}, {"column1":"value3", "column2":"value4", ...}, ...]
 * 
 */

var bubblechart = function() {
    var chart = null;
    var seriesHeaders = [];
    var series = [];

    function draw(configuration, visualisationContainer) {
        console.log("### INITIALIZE VISUALISATION - COLUMN CHART");

        $('#' + visualisationContainer).empty();

        if (!(configuration.dataModule && configuration.datasourceLocation
                && configuration.xAxis && configuration.yAxis
                && configuration.label)) {
            return $.Deferred().resolve().promise();
        }

        if ((configuration.label.length === 0) || (configuration.xAxis.length === 0) || (configuration.yAxis.length === 0)) {
            return $.Deferred().resolve().promise();
        }

        var dataModule = configuration.dataModule;
        var location = configuration.datasourceLocation;

        var selection = {
            dimension: [],
            multidimension: configuration.label.concat(configuration.xAxis).concat(configuration.yAxis).concat(configuration.radius).concat(configuration.color),
            group: []
        };

        console.log("VISUALIZATION SELECTION FOR COLUMN CHART:");
        console.dir(selection);

        var svg = dimple.newSvg('#' + visualisationContainer, "100%", "400px");

        return dataModule.parse(location, selection).then(function(inputData) {
            console.log("GENERATE INPUT DATA FORMAT FOR COLUMN CHART - INPUT DATA");
            console.dir(inputData);
            seriesHeaders = inputData[0];
            series = rows(inputData);
            console.log("GENERATE INPUT DATA FORMAT FOR COLUMN CHART - OUTPUT DATA");
            console.dir(series);

            var chart = new dimple.chart(svg, series);

            var labelAxisName = seriesHeaders[0];
            var xAxisName = seriesHeaders[1];
            var yAxisName = seriesHeaders[2];
            
            var radiusAxisName;
            if (configuration.radius.length > 0) {
                radiusAxisName = seriesHeaders[3];
            }

            var colorAxisName;
            if (configuration.color.length > 0) {
                colorAxisName = seriesHeaders[3 + configuration.radius.length];
            }

            chart.addMeasureAxis("x", xAxisName);
            chart.addMeasureAxis("y", yAxisName);

            if (radiusAxisName) {
                chart.addMeasureAxis("z", radiusAxisName);
            }

            var series = [labelAxisName];

            if (colorAxisName) {
                series.push(colorAxisName);
            }
            
            console.log("SERIES:");
            console.dir(series);

            chart.addSeries(series, dimple.plot.bubble);
            chart.addLegend("50%", "10%", 500, 20, "right");
            chart.draw();
        });
    }

    function tune(config) {
    }

    function export_as_PNG() {
        return exportC3.export_PNG();
    }

    function export_as_SVG() {
        return exportC3.export_SVG();
    }

    function get_SVG() {
        return exportC3.get_SVG();
    }

    return {
        export_as_PNG: export_as_PNG,
        export_as_SVG: export_as_SVG,
        get_SVG: get_SVG,
        draw: draw,
        tune: tune
    };
}();