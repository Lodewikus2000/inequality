function drawLorenz(dataset) {

    let lorenzW = 400;
    let lorenzH = 400;

    drawLorenz.updateCountry = updateCountry;
    drawLorenz.updateYear = updateYear;

    let dataHere = dataset;
    let currentCountry;
    let currentYear;
    let currentData;

    let marginHere = {
        left: 40,
        right: 20,
        top: 40,
        bottom: 40
    };

    let percentiles = ["p0p10", "p10p20", "p20p30", "p30p40", "p40p50", "p50p60", "p60p70", "p70p80", "p80p90", "p90p100"];

    let svg = d3v5.select("#lorenz").attr("width", lorenzW).attr("height", lorenzH);



    // Scale for x.
    let xScale = d3v5.scaleLinear()
        .domain([0, 100])
        .range([0, lorenzW - marginHere.left - marginHere.right]);

    // Function for x axis.
    let xAxis = g => g
        .attr("transform", "translate(" + marginHere.left + "," + (- marginHere.top + lorenzH) + ")")
        .call(d3v5.axisBottom(xScale)
            .tickFormat(d3v5.format("d"))
        );


    // Element for x.
    svg.append("g")
        .attr("class", "x-axis")
        .call(xAxis)
        .append("text")
        .attr("x", lorenzW - marginHere.right - marginHere.left)
        .attr("y", 32)
        .style("text-anchor", "end")
        .style("fill", "black")
        .text("cumulative share of people");



    // Scale for y.
    let yScale = d3v5.scaleLinear()
        .domain([0, 100])
        .range([lorenzH - marginHere.top - marginHere.bottom, 0]);

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
        .text("cumulative share of income");




    // Define the line for the graph.
    let valueLine = d3v5.line()
        .x(function(d) {
            return xScale(d.x);
        })
        .y(function(d) {
            return yScale(d.y);
        })
        .curve(d3v5.curveMonotoneX) ;

    let title = svg.append("text")
        .attr("x", marginHere.left)
        .attr("y", marginHere.top - 8)
        .attr("class", "title")
        .style("text-anchor", "begin")
        .style("fill", "black");



    function updateCountry(country, speed) {


        var year = d3v5.select("#yearSelect").node().value;


        currentCountry = country;
        // The top 1 percent is included in the top 10 percent, so we filter them out.
        currentData = dataHere.filter(d => d.ISO == currentCountry && d.Variable == "income share" && d.Year == year && d.Percentile != "p99p100");


        // Sort the data by its percentiles.
        currentData.sort(function(a, b) {

            return a.Percentile.localeCompare(b.Percentile);

        });


        let cumulative = [{x: 0, y: 0}];

        for (i = 0; i < percentiles.length; i++) {
            valueHere = currentData.filter(d => d.Percentile == percentiles[i])[0].Value * 100;

            if (i > 0) {
                valueHere = valueHere + cumulative[i].y;
            }

            let point = {x: (i + 1) * 10, y: valueHere}
            cumulative.push(point);
        }

        console.log(cumulative)


        let t = d3v5.transition().duration(speed);



        let lines = svg.selectAll(".line").data([cumulative]);

        lines.exit().remove();

        lines.enter().append("path")
            .attr("transform", "translate(" + marginHere.left + "," + marginHere.top + ")")
            .attr("class", "line")
            .merge(lines)
            .transition(t)
            .attr("d", valueLine);


        console.log("komen we hier?")
        title.transition(t).text("Lorenz curve for " + currentData[0].Country + " in " + currentData[0].Year);




    };

    function updateYear(year, speed) {
            currentYear = year;

            currentData = dataHere.filter(d => d.ISO == currentCountry && d.Variable == "income share" && d.Year == currentYear && d.Percentile != "p99p100");


            // Sort the data by its percentiles.
            currentData.sort(function(a, b) {

                return a.Percentile.localeCompare(b.Percentile);

            });



            let cumulative = [{x: 0, y: 0}];

            for (i = 0; i < percentiles.length; i++) {
                valueHere = currentData.filter(d => d.Percentile == percentiles[i])[0].Value * 100;

                if (i > 0) {
                    valueHere = valueHere + cumulative[i].y;
                }

                let point = {x: (i + 1) * 10, y: valueHere}
                cumulative.push(point);
            }

            console.log(cumulative)


            let t = d3v5.transition().duration(speed);



            let lines = svg.selectAll(".line").data([cumulative]);

            lines.exit().remove();

            lines.enter().append("path")
                .attr("transform", "translate(" + marginHere.left + "," + marginHere.top + ")")
                .attr("class", "line")
                .merge(lines)
                .transition(t)
                .attr("d", valueLine);


            console.log("komen we hier?")
            title.transition(t).text("Lorenz curve for " + currentData[0].Country + " in " + currentData[0].Year);

    };


}
