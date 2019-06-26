/*
Made by Leo Schreuders
Student number: 5742978
Made for the course Programmeerproject
Spring 2019
*/

function drawLorenz(dataset) {
    /*
    Draw a lorenz curve based on the dataset. The main function only initializes the Lorenz curve. updateCountry must then be used to draw an actualy curve.
    */

    let lorenzW = 500;
    let lorenzH = 400;


    drawLorenz.updateCountry = updateCountry;
    drawLorenz.updateYear = updateYear;

    let dataHere = dataset;
    let currentCountry;
    let currentYear;
    let currentData;

    let marginHere = {
        left: 40,
        right: 100,
        top: 40,
        bottom: 40
    };


    let height = lorenzH - marginHere.top - marginHere.bottom;
    let width = lorenzW - marginHere.left - marginHere.right;

    let percentiles = ["p0p10", "p10p20", "p20p30", "p30p40", "p40p50", "p50p60", "p60p70", "p70p80", "p80p90", "p90p100"];

    let svg = d3v5.select("#lorenz").attr("width", lorenzW).attr("height", lorenzH);


    // Scale for x.
    let xScale = d3v5.scaleLinear()
        .domain([0, 100])
        .range([0, width]);

    // Function for x axis.
    let xAxis = g => g
        .attr("transform", "translate(" + marginHere.left + "," + (height + marginHere.bottom) + ")")
        .call(d3v5.axisBottom(xScale)
            .tickFormat(d3v5.format("d"))
        );

    // G element for x.
    svg.append("g")
        .attr("class", "x-axis")
        .call(xAxis)
        .append("text")
        .attr("x", width)
        .attr("y", 32)
        .style("text-anchor", "end")
        .style("fill", "black")
        .text("cumulative share of people (%)");


    // Scale for y.
    let yScale = d3v5.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    // Function for y.
    let yAxis = g => g
        .attr("transform", "translate(" + marginHere.left + "," + marginHere.top + ")")
        .call(d3v5.axisLeft(yScale));

    // Element for y label.
    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .append("text")
        .attr("y", -32)
        .style("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .style("fill", "black")
        .text("cumulative share of income (%)");


    // Define the line for the graph.
    let valueLine = d3v5.line()
        .x(function(d) {
            return xScale(d.x);
        })
        .y(function(d) {
            return yScale(d.y);
        })
        .curve(d3v5.curveMonotoneX);


    // Draw the diagonal:
    let diagonal = [{
        x: 0,
        y: 0
    }, {
        x: 100,
        y: 100
    }];

    svg.selectAll(".diagonal").data([diagonal])
        .enter().append("path")
        .attr("transform", "translate(" + marginHere.left + "," + marginHere.top + ")")
        .attr("class", "diagonal")
        .attr("d", valueLine)
        .style("stroke", "#01cdfe")
        .style("fill", "none")
        .style("stroke-width", "3px");



    let title = svg.append("text")
        .attr("x", marginHere.left)
        .attr("y", marginHere.top - 8)
        .attr("class", "title")
        .style("text-anchor", "begin")
        .style("fill", "black");


    drawLegend();

    function drawLegend() {

        // Draw the legend with help from https://stackoverflow.com/questions/38954316/adding-legends-to-d3-js-line-charts.
        let legendBoxSize = 10;
        let legendBoxDistance = 16;


        let lineLegend = svg.append("g")
            .attr("class", "lineLegend")
            .attr("transform", "translate(" + (marginHere.left + width  * 0.1) + "," + (marginHere.top + height * 0.1) + ")");


        // Diagonal text.
        lineLegend.append("text").text("equality")
            .attr("x", legendBoxDistance)
            .style("fill", "black");

        // Country text.
        lineLegend.append("text")
            .attr("class", "legendText")
            .attr("x", legendBoxDistance)
            .attr("y", legendBoxDistance)
            .style("fill", "black");;

        // Diagonal box.
        lineLegend.append("rect")
            .attr("width", legendBoxSize).attr("height", legendBoxSize)
            .attr("y",  - (legendBoxSize))
            .style("fill", "#01cdfe");


        // Country box.
        lineLegend.append("rect")
            .attr("width", legendBoxSize).attr("height", legendBoxSize)
            .attr("y", legendBoxDistance - legendBoxSize)
            .style("fill", "#f0027f");

    }



    function updateCountry(country, speed) {
        /*
        This function updates the Lorenz curve based on the selected country. It automatically finds the newest year for which data is available.
        */

        var year = d3v5.select("#yearSelect").node().value;


        currentCountry = country;
        // The top 1 percent is included in the top 10 percent, so we filter them out.
        currentData = dataHere.filter(d => d.ISO == currentCountry && d.Variable == "income share" && d.Year == year && d.Percentile != "p99p100");


        // Sort the data by its percentiles.
        currentData.sort(function(a, b) {

            return a.Percentile.localeCompare(b.Percentile);

        });

        // We provide the first coordinate.
        let cumulative = [{
            x: 0,
            y: 0
        }];

        for (i = 0; i < percentiles.length; i++) {
            valueHere = currentData.filter(d => d.Percentile == percentiles[i])[0].Value * 100;

            if (i > 0) {
                valueHere = valueHere + cumulative[i].y;
            }

            let point = {
                x: (i + 1) * 10,
                y: valueHere
            }
            cumulative.push(point);
        }


        let t = d3v5.transition().duration(speed);

        let lines = svg.selectAll(".line").data([cumulative]);

        lines.exit().remove();

        lines.enter().append("path")
            .attr("transform", "translate(" + marginHere.left + "," + marginHere.top + ")")
            .attr("class", "line")
            .merge(lines)
            .transition(t)
            .attr("d", valueLine)
            .style("stroke", "#f0027f")
            .style("fill", "none")
            .style("stroke-width", "3px");

        title.transition(t).text("Lorenz curve for " + currentData[0].Country + " in " + currentData[0].Year);

        d3v5.select(".legendText").text(currentData[0].Country);

    };

    function updateYear(year, speed) {
        /*
        This function updates the Lorenz curve based on the selected year.
        */

        currentYear = year;

        currentData = dataHere.filter(d => d.ISO == currentCountry && d.Variable == "income share" && d.Year == currentYear && d.Percentile != "p99p100");


        // Sort the data by its percentiles.
        currentData.sort(function(a, b) {

            return a.Percentile.localeCompare(b.Percentile);

        });

        // We provide the first coordinate.
        let cumulative = [{
            x: 0,
            y: 0
        }];

        for (i = 0; i < percentiles.length; i++) {
            valueHere = currentData.filter(d => d.Percentile == percentiles[i])[0].Value * 100;

            if (i > 0) {
                valueHere = valueHere + cumulative[i].y;
            }

            let point = {
                x: (i + 1) * 10,
                y: valueHere
            }
            cumulative.push(point);
        }


        let t = d3v5.transition().duration(speed);

        let lines = svg.selectAll(".line").data([cumulative]);

        lines.exit().remove();

        lines.enter().append("path")
            .attr("transform", "translate(" + marginHere.left + "," + marginHere.top + ")")
            .attr("class", "line")
            .merge(lines)
            .transition(t)
            .attr("d", valueLine);


        title.transition(t).text("Lorenz curve for " + currentData[0].Country + " in " + currentData[0].Year);

    };

}
