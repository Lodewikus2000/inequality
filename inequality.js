const mapW = 800;
const mapH = 400;

const COLORLEGENDHEIGHT = .5 * mapH;
const COLORLEGENDWIDTH = 24;


const pieW = 300;
const pieH = 300;
const pieMargin = 10;
const pieRadius = (pieW - pieMargin) / 2;


const margin = {
    left: 20,
    right: 20,
    top: 40,
    bottom: 40
};

const DEFAULTYEAR = 2015;
const DEFAULTCOUNTRY = "NLD";

const SPEED = 500;

GINICOLORS = ["#fde0dd", "#c51b8a"]

window.onload = function() {

    let requests = [d3v5.json("data/gini_post_tax.json"), d3v5.json("data/income_post_tax.json"), d3v5.json("data/income_pre_tax.json")]

    Promise.all(requests).then(function(response) {

        let gini_post_tax = response[0]


        let income_post_tax = response[1]


        let income_pre_tax = response[2]

        let income_post_tax_top10 = income_post_tax.filter(d => d.Percentile == "p90p100")
        let income_pre_tax_top10 = income_pre_tax.filter(d => d.Percentile == "p90p100")



        let years = new Set();
        for (i = 0; i < response.length; i++) {
            for (j = 0; j < response[i].length; j++) {

                years.add(response[i][j].Year);

            };
        };

        years = Array.from(years);
        years.sort();

        let yearOptions = d3v5.select("#yearSelect");
        yearOptions.selectAll("option")
            .data(years.reverse())
            .enter().append("option")
            .property("selected", d => d === DEFAULTYEAR)
            .text(d => d);




        drawMap([income_pre_tax_top10, income_post_tax_top10], DEFAULTYEAR, ["top 10% income share before taxes", "top 10% income share after taxes"] );


        yearOptions.on("change", function() {
            drawMap.update(this.value, SPEED, d3v5.select("#taxesToggle").property("checked"));
        });


        drawPie([income_pre_tax, income_post_tax]);

        d3v5.select("#taxesToggle").on("change", checkTax);

        function checkTax() {
            if (d3v5.select("#taxesToggle").property("checked")) {
                drawMap.setTax(true);
                drawPie.setTax(true);
            } else {
                drawMap.setTax(false);
                drawPie.setTax(false);
            }
        }



    });
};

function drawPie(dataset) {
// based on https://bl.ocks.org/adamjanes/5e53cfa2ef3d3f05828020315a3ba18c/22619fa86de2045b6eeb4060e747c5076569ec47

    drawPie.update = update;
    drawPie.setTax = setTax;
    drawPie.redraw = redraw;

    let dataHere = dataset;

    let currentCountry = DEFAULTCOUNTRY;

    let currentYear = DEFAULTYEAR;

    let currentData;


    let svg = d3v5.select("#pieChart")
        .attr("width", pieW)
        .attr("height", pieH)
        .append("g")
        .attr("transform", "translate(" + (pieW / 2) + "," + (pieH / 2) + ")");

    let pieColor = d3v5.scaleLinear()
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        .range(['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a'])



    let pie = d3v5.pie()
        .value(d => d.Value);



    let arc = d3v5.arc()
        .innerRadius(0)
        .outerRadius(pieRadius);


    function arcTween(a) {
        const i = d3.interpolate(this._current, a);
        this._current = i(1);
        return (t) => arc(i(t));
    }



    update(DEFAULTCOUNTRY, DEFAULTYEAR, false);


    function setTax(taxesBool) {
        if (taxesBool){
            currentData = dataHere[1].filter(d => d.ISO == currentCountry && d.Year == currentYear);
        } else {
            currentData = dataHere[0].filter(d => d.ISO == currentCountry && d.Year == currentYear);
        }
        // Sort the data by its percentiles.
        currentData.sort(function(a, b) {

            return a.Percentile.localeCompare(b.Percentile);

        });


        redraw();
    }

    function update(countryName, year, taxesBool) {

        currentCountry = countryName;
        currentYear = year;


        if (taxesBool){
            currentData = dataHere[1].filter(d => d.ISO == currentCountry && d.Year == currentYear);
        } else {
            currentData = dataHere[0].filter(d => d.ISO == currentCountry && d.Year == currentYear);
        }
        // Sort the data by its percentiles.
        currentData.sort(function(a, b) {

            return a.Percentile.localeCompare(b.Percentile);

        });


        redraw();


    };


    function redraw() {

        console.log("de data in de update van de pie chart");
        console.log(currentData);



        let path = svg.selectAll("path")
            .data(pie(currentData));

        path.transition().duration(1000).attrTween("d", arcTween);

        path.enter().append("path")
            .attr("fill", function(d, i) {
                return pieColor(i);
            })
            .attr("d", arc)
            .attr("stroke", "white")
            .attr("stroke-width", "2px")
            .each(function(d) { this._current = d; });
    };



};







function drawLineGraph(dataset) {
    drawLineGraph.update = update;

    // Used help from https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0/

    let dataHere = dataset;

    let width = mapW - margin.left - margin.right;
    let height = mapH - margin.top - margin.bottom;

    yearMax = d3v5.max(dataHere, d => d.Year);
    yearMin = d3v5.min(dataHere, d => d.Year);


    let svg = d3v5.select("#lineSVG").attr("width", w).attr("height", h);


    let tooltip = d3v5.select('#tooltip');
    let tooltipLine = svg.append('line');


    // Scale for x.
    let xScale = d3v5.scaleLinear()
        .domain([yearMin, yearMax])
        .range([0, width]);
    // Function for x axis.
    let xAxis = g => g
        .attr("transform", "translate(" + margin.left + "," + (margin.top + height) + ")")
        .call(d3v5.axisBottom(xScale)
            .tickFormat(d3v5.format("d"))
        );
    // Element for x.
    svg.append("g")
        .attr("class", "x-axis")
        .append("text")
        .attr("x", width)
        .attr("y", -8)
        .style("text-anchor", "end")
        .style("fill", "black")
        .text("year");
    // Set x axis.
    svg.selectAll(".x-axis").call(xAxis);


    // Scale for y.
    let yScale = d3v5.scaleLinear().range([height, 0]);
    // Function for y.
    let yAxis = g => g
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3v5.axisLeft(yScale));
    // Element for y.
    svg.append("g")
        .attr("class", "y-axis")
        .append("text")

        .attr("x", -height * .8)
        .attr("y", 16)
        .style("text-anchor", "start")

        .attr("transform", "rotate(-90)")
        .style("fill", "black")
        .text("share of income");


    // Define the line for the graph.
    let valueLine = d3v5.line()
        .x(function(d) {
            return xScale(d.Year);
        })
        .y(function(d) {
            return yScale(d.Value);
        });


    let title = svg.append("text")
        .attr("x", mapW / 2)
        .attr("y", 16)
        .attr("class", "lineTitle")
        .style("text-anchor", "middle")
        .style("fill", "black");


    // Draw the legend with help from https://stackoverflow.com/questions/38954316/adding-legends-to-d3-js-line-charts.
    let legendBoxSize = 10;
    let legendBoxDistance = 16;

    let legend_keys = ["Females", "Total", "Males"]

    let lineLegend = svg.selectAll(".lineLegend").data(legend_keys)
        .enter().append("g")
        .attr("class", "lineLegend")
        .attr("transform", "translate(" + (margin.left + width * .8) + "," + (height * .8) + ")");

    lineLegend.append("text").text(d => d)
        .attr("class", "legendText")
        .attr("x", legendBoxDistance)
        .attr("y", function(d, i) {
            return i * legendBoxDistance;
        });

    lineLegend.append("rect")
        .attr("class", d => d + "Legend")
        .attr("width", legendBoxSize).attr("height", legendBoxSize)
        .attr("y", function(d, i) {
            return i * legendBoxDistance - (legendBoxSize);
        });


    function update(countryName, speed) {

        let t = d3v5.transition().duration(speed);


        countryDataTotal = dataHere.filter(d => d.ISO == countryName && d.Variable == "Total population at birth");
        countryDataFemales = dataHere.filter(d => d.ISO == countryName && d.Variable == "Females at birth");
        countryDataMales = dataHere.filter(d => d.ISO == countryName && d.Variable == "Males at birth");


        let giniMax = d3v5.max(countryDataTotal, d => d.Value);

        let scaleFactor = 1.1;
        yScale.domain([0, giniMax * scaleFactor]);


        // Lines.

        let lineTotal = svg.selectAll(".lineTotal").data([countryDataTotal]);
        lineTotal.exit().remove();
        lineTotal.enter().append("path")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("class", "lineTotal")
            .merge(lineTotal)
            .transition(t)
            .attr("d", valueLine);

        let lineFemales = svg.selectAll(".lineFemales").data([countryDataFemales]);
        lineFemales.exit().remove();
        lineFemales.enter().append("path")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("class", "lineFemales")
            .merge(lineFemales)
            .transition(t)
            .attr("d", valueLine);

        let lineMales = svg.selectAll(".lineMales").data([countryDataMales]);
        lineMales.exit().remove();
        lineMales.enter().append("path")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("class", "lineMales")
            .merge(lineMales)
            .transition(t)
            .attr("d", valueLine);


        svg.selectAll(".y-axis").transition(t).call(yAxis);

        // Title.
        if (countryDataTotal.length > 0) {
            title.transition(t).text("Life expectancy in " + countryDataTotal[0].Country);
        } else {
            title.transition(t).text();
        }


        // Dots.

        let dotTotal = svg.selectAll(".dotTotal").data(countryDataTotal);
        dotTotal.exit().remove();
        dotTotal.enter().append("circle") // Uses the enter().append() method
            .attr("class", "dotTotal") // Assign a class for styling
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .merge(dotTotal)
            .transition(t)
            .attr("cx", function(d) {
                return xScale(d.Year)
            })
            .attr("cy", function(d) {
                return yScale(d.Value)
            })
            .attr("r", 2);

        let dotFemales = svg.selectAll(".dotFemales").data(countryDataFemales);
        dotFemales.exit().remove();
        dotFemales.enter().append("circle") // Uses the enter().append() method
            .attr("class", "dotFemales") // Assign a class for styling
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .merge(dotFemales)
            .transition(t)
            .attr("cx", function(d) {
                return xScale(d.Year)
            })
            .attr("cy", function(d) {
                return yScale(d.Value)
            })
            .attr("r", 2);

        let dotMales = svg.selectAll(".dotMales").data(countryDataMales);
        dotMales.exit().remove();
        dotMales.enter().append("circle") // Uses the enter().append() method
            .attr("class", "dotMales") // Assign a class for styling
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .merge(dotMales)
            .transition(t)
            .attr("cx", function(d) {
                return xScale(d.Year)
            })
            .attr("cy", function(d) {
                return yScale(d.Value)
            })
            .attr("r", 2);


        // Used this for tooltip: http://bl.ocks.org/wdickerson/64535aff478e8a9fd9d9facccfef8929.

        tooltipBox = svg.append('rect')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr('width', width)
            .attr('height', height)
            .attr('opacity', 0)
            .on('mousemove', drawTooltip)
            .on('mouseout', removeTooltip);


        function removeTooltip() {

            if (tooltip) tooltip.style('display', 'none');
            if (tooltipLine) tooltipLine.attr('stroke', 'none');
        }

        function drawTooltip() {

            let year = Math.round(xScale.invert(d3v5.mouse(tooltipBox.node())[0]));

            dataYearTotal = countryDataTotal.filter(d => d.Year == year)[0];
            dataYearFemales = countryDataFemales.filter(d => d.Year == year)[0];
            dataYearMales = countryDataMales.filter(d => d.Year == year)[0];


            if (dataYearTotal == undefined) {
                dataYearTotal = {
                    Value: "no data"
                };
            };
            if (dataYearFemales == undefined) {
                dataYearFemales = {
                    Value: "no data"
                };
            };
            if (dataYearMales == undefined) {
                dataYearMales = {
                    Value: "no data"
                };
            };


            tooltipLine.attr('stroke', 'black')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr('x1', xScale(year))
                .attr('x2', xScale(year))
                .attr('y1', 0)
                .attr('y2', height);


            tooltip
                .html("<b>" + year + "</b>" + "<br>" +
                    "Total: " + dataYearTotal.Value + '<br>' +
                    "Female: " + dataYearFemales.Value + '<br>' +
                    "Male: " + dataYearMales.Value)
                .style('display', 'block')
                .style('left', d3v5.event.pageX + 20 + "px")
                .style('top', d3v5.event.pageY - 20 + "px")
        }
    }
}


function drawMap(dataset, year, labels) {
    // The year determines what year the map shows initially.

    drawMap.update = update;
    drawMap.setTax = setTax;

    var dataHere = dataset;
    var labelsHere = labels

    // Help from http://jsbin.com/kuvojohapi/1/edit?html,output.

    d3v5.select("#mapContainer").style("width", mapW + "px").style("height", mapH + "px").style("position", "relative");



    let defaultFillColor = '#B8B8B8';
    let colorScale = d3v5.scaleLinear()
        .range(GINICOLORS)


    var colorMap = {};


    let map = new Datamap({
        element: document.getElementById("mapContainer"),
        done: function(datamap) {
            datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography, data) {
                let yearSelect = d3v5.select('#yearSelect');
                drawPie.update(geography.id, yearSelect.node().value, d3v5.select("#taxesToggle").property("checked") );

            });
        },
        geographyConfig: {
            highlightFillColor: function(data) {
                if (data && data.fillColor != null && data.fillColor != NaN) {
                    return data.fillColor;
                } else {
                    return defaultFillColor;
                };
            },
            borderColor: "909090",
            highlightBorderColor: "#303030",
            popupTemplate: function(geo, data) {
                if (!data || !data.numberOfThings) {

                    return ['<div class="hoverinfo"><strong>',
                        geo.properties.name,
                        ': ' + "no data",
                        '</strong></div>'
                    ].join('');
                } else {
                    return ['<div class="hoverinfo"><strong>',
                        geo.properties.name,
                        ': ' + data.numberOfThings,
                        '</strong></div>'
                    ].join('');
                }
            }
        },
        data: colorMap,
        fills: {
            defaultFill: defaultFillColor
        },
    });



    let dataToLegendScale = d3v5.scaleLinear()
        .range([COLORLEGENDHEIGHT, 0]);


    let legendScale = d3v5.scaleLinear()
        .range(GINICOLORS)
        .domain([0, COLORLEGENDHEIGHT]);


    let legendAxis = g => g
        .attr("transform", "translate(" + (margin.left + COLORLEGENDWIDTH) + "," + (mapH - margin.bottom - COLORLEGENDHEIGHT) + ")")
        .call(d3v5.axisRight(dataToLegendScale));


    svg = d3v5.select(".datamap");

    // Reserve an element for the colorLegend's axis
    svg.append("g")
        .attr("class", "colorAxis");

    svg.selectAll(".colorAxis")
        .append("text")
        .attr("x", -COLORLEGENDWIDTH)
        .attr("y", -8)
        .attr("class", "colorAxisTitle")
        .style("text-anchor", "start")
        .style("fill", "black");

    // Title.
    svg.append("text")
        .attr("x", mapW / 2)
        .attr("y", 16)
        .attr("class", "mapTitle")
        .style("text-anchor", "middle")
        .style("fill", "black");


    let pallete = svg.append('g')
        .attr('id', 'pallete');


    let legendData = []
    for (i = 0; i <= 1; i = i + 0.05) {
        legendData.push(i * COLORLEGENDHEIGHT);
    }

    let colorBar = pallete.selectAll('rect').data(legendData);
    colorBar.enter().append('rect')
        .attr('fill', function(d) {
            return legendScale(d);
        })
        .attr('x', margin.left)
        .attr('y', function(d, i) {
            return mapH - margin.bottom - (i + 1) * (COLORLEGENDHEIGHT / legendData.length);
        })
        .attr('width', COLORLEGENDWIDTH)
        .attr('height', COLORLEGENDHEIGHT / legendData.length);



    setTax(false);

    function setTax(taxesBool) {
        dataHere = dataset;


        if (taxesBool) {
            dataHere[1].forEach(function(item) {
                let iso = item.ISO;
                let value = item.Value;
                colorMap[iso] = {
                    numberOfThings: value,
                    fillColor: defaultFillColor
                }
            });
        } else {
            dataHere[0].forEach(function(item) {
                let iso = item.ISO;
                let value = item.Value;
                colorMap[iso] = {
                    numberOfThings: value,
                    fillColor: defaultFillColor
                }
            });
        }


        if (taxesBool) {
            svg.selectAll(".colorAxisTitle")
                .text(labelsHere[1]);

            // Title.
            svg.selectAll(".mapTitle")
                .text(labelsHere[1]);
        } else {
            svg.selectAll(".colorAxisTitle")
                .text(labelsHere[0]);

            // Title.
            svg.selectAll(".mapTitle")
                .text(labelsHere[0]);
        }



        update(year, 0, taxesBool);
    };






    function update(year, speed, taxesBool) {

        let yearData;

        console.log("voor de filter:")
        console.log(dataHere);
        let t = d3v5.transition().duration(speed);
        if (taxesBool) {
            console.log("here");
            yearData = dataHere[1].filter(d => (d.Year == year));
        } else {
            console.log("orrr here");
            yearData = dataHere[0].filter(d => (d.Year == year));
        }



        console.log(yearData)

        let giniMax = d3v5.max(yearData, d => d.Value);
        let giniMin = d3v5.min(yearData, d => d.Value);


        if (giniMax == giniMin) {
            giniMax *= 1.1;
            giniMin *= 0.9;
        }


        colorScale.domain([giniMin, giniMax]);

        // Set and update the axis of the legend.
        dataToLegendScale.domain([giniMin, giniMax]);
        svg.selectAll(".colorAxis").transition(t).call(legendAxis);


        // Set all country colors back to default.
        Object.values(colorMap).forEach(function(d) {
            d.numberOfThings = null;
            d.fillColor = defaultFillColor;
        });


        // Update the colors of countries with data.
        yearData.forEach(function(item) {
            let iso = item.ISO;
            let value = item.Value;
            colorMap[iso] = {
                numberOfThings: value,
                fillColor: colorScale(value)
            }
        });

        map.updateChoropleth(colorMap);

    };
}
