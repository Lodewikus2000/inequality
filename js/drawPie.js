function drawPie(dataset, currencies) {

    let dataHere = dataset;

    // These will be filled by the update functions.
    let currentData;
    let currentCountry;


    let percentiles = ["p0p10", "p10p20", "p20p30", "p30p40", "p40p50", "p50p60", "p60p70", "p70p80", "p80p90", "p90p100"];

    let pieW = 1000;
    let pieH = 400;

    let textHeight = 20;
    // based on https://bl.ocks.org/adamjanes/5e53cfa2ef3d3f05828020315a3ba18c/22619fa86de2045b6eeb4060e747c5076569ec47

    let piecesNumber = 10;

    let marginHere = {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
    };

    let width = pieW - marginHere.left - marginHere.right;
    let height = pieH - marginHere.top - marginHere.bottom;
    let peopleH = 64;

    let divided = false;

    // These are used for the spacing of the pieces and humans.
    let linear = 0.8;
    let exponential = 0.2;

    let pieRadius = (pieH * 0.6 - marginHere.top - marginHere.left) / 2;

    drawPie.updateYear = updateYear;
    drawPie.updateCountry = updateCountry;
    drawPie.divide = divide;
    drawPie.unDivide = unDivide;


    let currenciesHere = currencies;


    let tooltip = d3v5.select("#tooltip");


    let svg = d3v5.select("#pieChart");


    svg.append("g")
        .attr("class", "people")
        .attr("transform", "translate(" + marginHere.left + "," + (marginHere.top + height - peopleH - textHeight) + ")");


    svg.append("g")
        .attr("class", "groupText")
        .attr("transform", "translate(" + marginHere.left + "," + (marginHere.top + height - textHeight / 2) + ")");


    let people = svg.select(".people");

    let groupText = svg.select(".groupText");

    for (i = 0; i < piecesNumber; i++) {
        people.append('svg:image')
            .data([percentiles[i]])
            .attr('xlink:href', "img/man1.png")
            .attr("height", peopleH)
            .attr("width", peopleH)
            .attr("x", linear * ((width / piecesNumber * i) + (((width / piecesNumber) - peopleH) * (i / piecesNumber))) + exponential * ((width / ((2 ** piecesNumber) - 1)) * 2 ** i))
            .on("mouseover", function(d) {

                let shareData = currentData.filter(x => x.Percentile == d && x.Variable == "income share")[0];

                let averageData = currentData.filter(x => x.Percentile == d && x.Variable == "average income")[0];

                // Average income is not always availab.e
                if (averageData) {

                    let average = averageData.Value.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                    let currency = currencies.filter(d => d.ISO == currentData[0].ISO)[0].Unit
                    currency = currency.split(';')[0]

                    tooltip.html("share: " + (Math.round(shareData.Value * 10000) / 100) + "% <br> average income: " + average + " " + currency);

                } else {
                    tooltip.html("share: " + (Math.round(shareData.Value * 10000) / 100) + "% <br> average income: no data");
                }


                tooltip.style("visibility", "visible");
            })
            .on("mousemove", function() {
                tooltip.style("top", (event.pageY + 30) + "px").style("left", (event.pageX) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });

        groupText.append("text")
            .attr("id", "text" + i)
            .attr("x", peopleH / 2 + linear * ((width / piecesNumber * i) + (((width / piecesNumber) - peopleH) * (i / piecesNumber))) + exponential * ((width / ((2 ** piecesNumber) - 1)) * 2 ** i))
            .style("text-anchor", "middle")
            .text(i * 10 + " to " + (i + 1) * 10 + " % ");
    }



    svg.append("text")
        .attr("x", marginHere.left)
        .attr("y", marginHere.top - 8)
        .attr("class", "title")
        .style("text-anchor", "begin")
        .style("fill", "black");

    svg.attr("width", pieW)
        .attr("height", pieH)

    let pieColor = d3v5.scaleLinear()
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        .range(INCOMEGROUPCOLORS)



    let pie = d3v5.pie()
        .value(d => d.Value);



    let arc = d3v5.arc()
        .innerRadius(0)
        .outerRadius(pieRadius);


    function arcTween(a) {
        const i = d3v5.interpolate(this._current, a);
        this._current = i(1);
        return (t) => arc(i(t));
    }


    function updateYear(year, speed) {
        console.log("HALLO???")


        // The top 1 percent is included in the top 10 percent, so we filter them out.
        currentData = dataHere.filter(d => d.ISO == currentCountry && d.Year == year && d.Percentile != "p99p100");


        // Sort the data by its percentiles.
        currentData.sort(function(a, b) {
            return a.Percentile.localeCompare(b.Percentile);
        });



        let shares = currentData.filter(d => d.Variable == "income share")


        let path = svg.selectAll("path")
            .data(pie(shares));


        path.exit().remove();

        if (divided) {
            path.transition().duration(2 * speed).attrTween("d", arcTween);
        } else {
            path.transition().duration(speed).attrTween("d", arcTween);
        }

console.log("hallo");
        path.enter()
            .append("g")
            .attr("transform", "translate(" + (pieW / 2) + "," + (pieRadius + marginHere.top) + ")")
            .attr("class", function(d, i) {
                return "slice";
            })
            .append("path")
            .attr("fill", function(d, i) {
                return pieColor(i);
            })
            .attr("d", arc)
            .attr("stroke", "white")
            .attr("stroke-width", "2px")
            .each(function(d) {
                this._current = d;
            });

        console.log("jaartje:");
        console.log(currentData[0]);

            svg.select(".title")
                .text("Pie chart for " + currentData[0].Country + " in " + currentData[0].Year);
        // This makes sure the pieces are centered above the people.
        if (divided) {
            divide(2 * speed);
        }

    }

    function updateCountry(country, speed) {
        // This function automatically finds the newest year for which data is available and displays this data.


        currentCountry = country;

        // Filter out the top 1.
        let countryData = dataHere.filter(d => d.ISO == country && d.Percentile != "p99p100");


        let years = new Set();

        for (j = 0; j < countryData.length; j++) {
            years.add(countryData[j].Year);
        };

        years = Array.from(years);
        years.sort();

        let yearOptions = d3v5.select("#yearSelect").selectAll("option").data(years.reverse());

        let newestYear = d3v5.max(years);

        yearOptions.enter().append("option")
            .merge(yearOptions)
            .property("selected", d => d === newestYear)
            .text(d => d);

        yearOptions.exit().remove();

        currentData = countryData.filter(d => d.Year == newestYear);

        // Sort the data by its percentiles.
        currentData.sort(function(a, b) {

            return a.Percentile.localeCompare(b.Percentile);

        });

        let shares = currentData.filter(d => d.Variable == "income share")

        let path = svg.selectAll("path")
            .data(pie(shares));



        path.exit().remove();


        if (divided) {
            path.transition().duration(2 * speed).attrTween("d", arcTween);
        } else {
            path.transition().duration(speed).attrTween("d", arcTween);
        }


        path.enter()
            .append("g")
            .attr("transform", "translate(" + (pieW / 2) + "," + (pieRadius + marginHere.top) + ")")
            .attr("class", function(d, i) {
                return "slice";
            })
            .append("path")
            .attr("fill", function(d, i) {
                return pieColor(i);
            })
            .attr("d", arc)
            .attr("stroke", "#404040")
            .attr("stroke-width", "1px")
            .each(function(d) {
                this._current = d;
            })
            .on("mouseover", function(d) {

                let averageData = currentData.filter(x => x.Percentile == d.data.Percentile && x.Variable == "average income")[0];

                // Average income is not always available.
                if (averageData) {
                    let average = averageData.Value.toLocaleString("en-US", {
                        minimumFractionDigits: 2
                    });

                    let currency = currencies.filter(d => d.ISO == currentData[0].ISO)[0].Unit
                    currency = currency.split(';')[0]

                    tooltip.html("share: " + (Math.round(d.data.Value * 10000) / 100) + "% <br> average income: " + average + " " + currency);
                } else {
                    tooltip.html("share: " + (Math.round(d.data.Value * 10000) / 100) + "% <br> average income: no data");
                }

                tooltip.style("visibility", "visible");

            })
            .on("mousemove", function() {
                tooltip.style("top", (event.pageY + 30) + "px").style("left", (event.pageX) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });


        svg.select(".title")
            .text("Pie chart for " + currentData[0].Country + " in " + currentData[0].Year);


        // This centers the pieces above the people.
        if (divided) {
            divide(2 * speed);
        }


    };


    function divide(speed) {
        // This function takes the pie pieces and spreads them accross the svg.

        let shares = currentData.filter(d => d.Variable == "income share");

        slices = svg.selectAll(".slice").data(pie(shares));

        slices.transition().duration(speed).attr("transform", function(d, i) {



            let rotate = 360 - (d.startAngle + d.endAngle) / 2 / Math.PI * 180;


            // The distance between pieces is partly linear, partly exponential, because the pieces at the end are sometimes much larger.

            let x = marginHere.left + peopleH / 2 + linear * (((width) / piecesNumber * i) + ((((width) / piecesNumber) - peopleH) * (i / piecesNumber))) + exponential * (((width) / ((2 ** piecesNumber) - 1)) * 2 ** i)
            let y = marginHere.top + height - peopleH - textHeight - 8;

            return "translate(" + x + "," + y + ") rotate(" + rotate + ")";


        });

        divided = true;
    }

    function unDivide(speed) {
        // This function puts the pie pieces back together.

        slices = svg.selectAll(".slice");

        slices.transition().duration(speed).attr("transform", "translate(" + (pieW / 2) + "," + (pieRadius + marginHere.top) + ")");

        divided = false;

    }

};
