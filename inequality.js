const mapW = 1000;
const mapH = 500;


const COLORLEGENDHEIGHT = .5 * mapH;
const COLORLEGENDWIDTH = 24;


const pieW = 1000;
const pieH = 300;



const lineW = 800;
const lineH = 400;

const lorenzW = 400;
const lorenzH = 400;

var defaultCountry = "NLD";



var countries2ISO = {};
var iso2Countries = {};


var currentYear = 2015;



const SPEED = 500;

INCOMESCALECOLORS = ["#fde0dd", "#c51b8a"];
INCOMEGROUPCOLORS = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a'];

window.onload = function() {

    let requests = [d3v5.json("data/total.json")]

    Promise.all(requests).then(function(response) {

        let pieCut = false;



        let allData = response[0]




        let incomeData = allData.filter(d => d.Variable == "income pre tax");



        // Make a list of all the countries for which income data is available.
        for (j = 0; j < incomeData.length; j++) {
            iso2Countries[incomeData[j].ISO] = incomeData[j].Country;
            countries2ISO[incomeData[j].Country] = incomeData[j].ISO;
        };


        let countrySelect = d3v5.select("#countrySelect");

        countrySelect.selectAll("option").data(Object.keys(countries2ISO).sort())
            .enter().append("option")
            .property("selected", d => d === iso2Countries[defaultCountry])
            .text(d => d);

        countrySelect.on("change", function() {

            var countryName = d3v5.select("#countrySelect").node().value;
            drawPie.updateCountry(countries2ISO[countryName], SPEED);
            drawLine.update(countries2ISO[countryName], SPEED)
            drawLorenz.updateCountry(countries2ISO[countryName], SPEED);

        });

        let mapSelect = d3v5.select("#mapSelect");

        mapSelect.selectAll("option").data(["top 1%", "top 10%", "bottom 10%"])
            .enter().append("option")
            .property("selected", d => d === "top 10%")
            .text(d => d);

        mapSelect.on("change", function() {

            var percentile = d3.select("#mapSelect").node().value;
            console.log(percentile)

            switch(percentile) {
                case "top 1%":
                    drawMap.update("p99p100", 1000);
                    break;
                case "top 10%":
                    drawMap.update("p90p100", 1000);
                    break;
                case "bottom 10%":
                    drawMap.update("p0p10", 1000);
                    break;
            }

        });



        drawMap(incomeData);
        drawPie(incomeData);
        drawPie.updateCountry(defaultCountry, 0);
        drawLine(incomeData);
        drawLine.update(defaultCountry, 0);

        drawLorenz(incomeData);
        drawLorenz.updateCountry(defaultCountry, 0);







        d3v5.select("#yearSelect").on("change", function() {

            var year = d3v5.select("#yearSelect").node().value;

            drawPie.updateYear(year, SPEED);
            drawLorenz.updateYear(year, SPEED);

        });


        d3v5.select("#divideButton").on("click", function() {

            if (pieCut) {
                drawPie.unDivide(SPEED);
                pieCut = false;
                d3v5.select(this).text("Cut the pie");
            } else {
                drawPie.divide(SPEED*2);
                pieCut = true;
                d3v5.select(this).text("Put it back");
            }




        });










    });
};

function drawPie(dataset) {
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


    let pieRadius = (pieH * 0.7 - marginHere.top - marginHere.left) / 2;

    drawPie.updateYear = updateYear;
    drawPie.updateCountry = updateCountry;
    drawPie.divide = divide;
    drawPie.unDivide = unDivide;


    let dataHere = dataset;
    let currentData;
    let currentCountry;


    let tooltip = d3v5.select("#tooltip");

    let svg = d3v5.select("#pieChart");


    svg.append("g")
        .attr("class", "people")
        .attr("transform", "translate(" + marginHere.left + "," + (marginHere.top + height - peopleH) + ")");



    let people = svg.select(".people")

    for (i = 0; i < 10; i ++) {
        people.append('svg:image')
        .attr('xlink:href', "img/man1.png")
        .attr("height", peopleH)
        .attr("width", peopleH)
        .attr("x", ( (width / 10 * i) + ( ( (width / 10) -peopleH )  * (i / 10) )   ))
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



        // The top 1 percent is included in the top 10 percent, so we filter them out.
        currentData = dataHere.filter(d => d.ISO == currentCountry && d.Variable == "income pre tax" && d.Year == year && d.Percentile != "p99p100");


        // Sort the data by its percentiles.
        currentData.sort(function(a, b) {

            return a.Percentile.localeCompare(b.Percentile);

        });



        let path;

        if (currentData.length != 10) {
            return;
        } else {
            path = svg.selectAll("path")
                .data(pie(currentData));
        }


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
            .attr("stroke", "white")
            .attr("stroke-width", "2px")
            .each(function(d) { this._current = d; });



        if (divided) {
            divide(2 * speed);
        }




    }

    function updateCountry(country, speed) {

        console.log("en de speed is:")
        console.log(speed);




        currentCountry = country;

        // Filter out the top 1
        let countryData = dataHere.filter(d => d.ISO == country && d.Variable == "income pre tax" && d.Percentile != "p99p100");


        let years = new Set();

        for (j = 0; j < countryData.length; j++) {
            years.add(countryData[j].Year);
        };

        years = Array.from(years);
        years.sort();

        let yearOptions = d3v5.select("#yearSelect").selectAll("option").data(years.reverse());

        yearOptions.enter().append("option")
            .merge(yearOptions)
            .property("selected", d => d === currentYear)
            .text(d => d);

        yearOptions.exit().remove();



        let newestYear = d3v5.max(years);

        currentData = []
        currentData = countryData.filter(d => d.Year == newestYear);





        // Sort the data by its percentiles.
        currentData.sort(function(a, b) {

            return a.Percentile.localeCompare(b.Percentile);

        });



        let path;

        if (currentData.length != 10) {
            return;
        } else {
            path = svg.selectAll("path")
                .data(pie(currentData));
        }


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
            .each(function(d) { this._current = d; })
            .on("mouseover", function(d){
                tooltip.text(d.data.Value)
                return tooltip.style("visibility", "visible");
            })
            .on("mousemove", function(){
                return tooltip.style("top", (event.pageY + 30)+"px").style("left",(event.pageX)+"px");
            })
            .on("mouseout", function(){
                return tooltip.style("visibility", "hidden");
            });


        svg.selectAll(".title")
            .text(currentData[0].Country);


        if (divided) {
            divide(2 * speed);
        }



    };


    function divide(speed) {
        console.log("begin divide functie");



        slices = svg.selectAll(".slice").data(pie(currentData));

        slices.transition().duration(speed).attr("transform", function(d, i) {



            var rotate = 360 - (d.startAngle + d.endAngle) / 2 / Math.PI * 180;

            // if (i == 9) {
            //     rotate = 90 - (d.startAngle + d.endAngle) / 2 / Math.PI * 180
            // }

            x = marginHere.left + peopleH / 2 + ( i / piecesNumber ) * ( width + (width / piecesNumber) - peopleH)
            // x =  marginHere.left + ( width / 10 * i) + ((width / 10) / 2)


            // let x = marginHere.left + ( (width / 100) * i * i) + (width / 10)  ;
            let y = marginHere.top + height - peopleH - 8;

            return "translate(" + x + "," + y + ") rotate(" + rotate + ")";



        });

        divided = true;
    }

    function unDivide(speed) {




        console.log("aan het UNdividen")

        slices = svg.selectAll(".slice");

        slices.transition().duration(speed).attr("transform", "translate(" + (pieW / 2) + "," + (pieRadius + marginHere.top) + ")");

        divided = false;

    }

};


function drawLine(dataset) {

    let currentCountry;
    let currentCountryName;

    let marginHere = {
        left: 40,
        right: 20,
        top: 40,
        bottom: 40
    };

    let percentiles = ["p0p10", "p10p20", "p20p30", "p30p40", "p40p50", "p50p60", "p60p70", "p70p80", "p80p90", "p90p100"];

    drawLine.update = update;

    // Used help from https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0/

    let dataHere = dataset;
    let currentData;

    let svg = d3v5.select("#lineChart").attr("width", lineW).attr("height", lineH);

    // Scale for x.
    let xScale = d3v5.scaleLinear()
        .range([0, lineW - marginHere.left - marginHere.right]);

    // Function for x axis.
    let xAxis = g => g
        .attr("transform", "translate(" + marginHere.left + "," + (- marginHere.top + lineH) + ")")
        .call(d3v5.axisBottom(xScale)
            .tickFormat(d3v5.format("d"))
        );
    // Element for x.
    svg.append("g")
        .attr("class", "x-axis")
        .append("text")
        .attr("x", lineW - marginHere.right - marginHere.left)
        .attr("y", 32)
        .style("text-anchor", "end")
        .style("fill", "black")
        .text("year");



    // Scale for y.
    let yScale = d3v5.scaleLinear().range([lineH - marginHere.top - marginHere.bottom, 0]);

    // Function for y.
    let yAxis = g => g
        .attr("transform", "translate(" + marginHere.left + "," + marginHere.top + ")")
        .call(d3v5.axisLeft(yScale));

    // Element for y label.
    svg.append("g")
        .attr("class", "y-axis")
        .append("text")


        .attr("y", -32)
        .style("text-anchor", "end")

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
        .attr("x",  marginHere.left)
        .attr("y", marginHere.top - 8)
        .attr("class", "title")
        .style("text-anchor", "begin")
        .style("fill", "black");


    // // Draw the legend with help from https://stackoverflow.com/questions/38954316/adding-legends-to-d3-js-line-charts.
    // let legendBoxSize = 10;
    // let legendBoxDistance = 16;
    //
    // let legend_keys = ["Females", "Total", "Males"]
    //
    // let lineLegend = svg.selectAll(".lineLegend").data(legend_keys)
    //     .enter().append("g")
    //     .attr("class", "lineLegend")
    //     .attr("transform", "translate(" + (margin.left + lineW * .8) + "," + (lineH * .8) + ")");
    //
    // lineLegend.append("text").text(d => d)
    //     .attr("class", "legendText")
    //     .attr("x", legendBoxDistance)
    //     .attr("y", function(d, i) {
    //         return i * legendBoxDistance;
    //     });
    //
    // lineLegend.append("rect")
    //     .attr("class", d => d + "Legend")
    //     .attr("width", legendBoxSize).attr("height", legendBoxSize)
    //     .attr("y", function(d, i) {
    //         return i * legendBoxDistance - (legendBoxSize);
    //     });






    function update(country, speed) {


        currentCountry = country;

        let t = d3v5.transition().duration(speed);

        currentData = dataHere.filter(d => d.Variable == "income pre tax" && d.ISO == currentCountry)


        let maxValue = d3v5.max(currentData, d => d.Value);

        let scaleFactor = 1.1;
        yScale.domain([0, maxValue * scaleFactor]);



        let yearMax = d3v5.max(currentData, d => d.Year);
        let yearMin = d3v5.min(currentData, d => d.Year);


        xScale.domain([yearMin, yearMax])

        // Lines.
        for (i = 0; i < percentiles.length; i++) {

            let lines = svg.selectAll(".line" + percentiles[i]).data([currentData.filter(d => d.Percentile == percentiles[i])]);

            lines.exit().remove();

            lines.enter().append("path")
                .attr("transform", "translate(" + marginHere.left + "," + marginHere.top + ")")
                .attr("class", "line" + percentiles[i])
                .merge(lines)
                .transition(t)
                .attr("d", valueLine);
        }





        svg.selectAll(".y-axis").transition(t).call(yAxis);
        svg.selectAll(".x-axis").transition(t).call(xAxis);



        title.transition(t).text("Income shares over time in " + currentData[0].Country);



        // Dots.
        for (i = 0; i < percentiles.length; i++) {

            let dots = svg.selectAll(".dot" + percentiles[i]).data(currentData.filter(d => d.Percentile == percentiles[i]));

            dots.exit().remove();

            dots.enter().append("circle") // Uses the enter().append() method
                .attr("class", "dot" + percentiles[i]) // Assign a class for styling
                .attr("transform", "translate(" + marginHere.left + "," + marginHere.top + ")")
                .merge(dots)
                .transition(t)
                .attr("cx", function(d) {
                    return xScale(d.Year)
                })
                .attr("cy", function(d) {
                    return yScale(d.Value)
                })
                .attr("r", 1);

        }


    }
}


function drawMap(dataset) {

    let marginHere = {
        left: 20,
        right: 20,
        top: 40,
        bottom: 20
    };


    // The year determines what year the map shows initially.


    drawMap.update = update;

    var dataHere = dataset;

    let currentData;


    // Help from http://jsbin.com/kuvojohapi/1/edit?html,output.

    d3v5.select("#mapContainer").style("width", mapW + "px").style("height", mapH + "px").style("position", "relative");



    let defaultFillColor = '#B8B8B8';
    let colorScale = d3v5.scaleLinear()
        .range(INCOMESCALECOLORS)


    var colorMap = {};


    let map = new Datamap({
        element: document.getElementById("mapContainer"),
        done: function(datamap) {
            datamap.svg.selectAll('.datamaps-subunit').on('click', function(geo, data) {

                if (Object.keys(iso2Countries).includes(geo.id)) {


                    d3v5.select("#countrySelect").selectAll("option")
                        .property("selected", d => d === iso2Countries[geo.id])
                        .text(d => d);


                    var elmnt = document.getElementById("pieChart");
                    elmnt.scrollIntoView();

                    drawPie.updateCountry(geo.id, SPEED);
                    drawLine.update(geo.id, SPEED);
                    drawLorenz.updateCountry(geo.id, SPEED);

                }


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
            popupTemplate: function(geo, d) {

                if (!d || !d.numberOfThings) {

                    return ['<div class="hoverinfo"><strong>',
                        geo.properties.name,
                        ': ' + "no data",
                        '</strong></div>'
                    ].join('');
                } else {
                    let data = currentData.filter(d => d.ISO == geo.id)[0];
                    string = '<div class="hoverinfo"><strong>' + geo.properties.name + "<br>" + Math.round(d.numberOfThings * 100) + "% in " + data.Year + '</strong></div>';
                    return string;
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
        .range(INCOMESCALECOLORS)
        .domain([0, COLORLEGENDHEIGHT]);


    let legendAxis = g => g
        .attr("transform", "translate(" + (marginHere.left + COLORLEGENDWIDTH) + "," + (mapH - marginHere.bottom - COLORLEGENDHEIGHT) + ")")
        .call(d3v5.axisRight(dataToLegendScale));


    let svg = d3v5.select(".datamap");

    // Title.
    svg.append("text")
        .attr("x", marginHere.left)
        .attr("y", marginHere.top - 8)
        .attr("class", "title")
        .style("text-anchor", "begin")
        .style("fill", "black");

    // Reserve an element for the colorLegend's axis
    svg.append("g")
        .attr("class", "colorAxis");

    svg.selectAll(".colorAxis")
        .append("text")
        .attr("x", -COLORLEGENDWIDTH)
        .attr("y", -8)
        .attr("class", "colorAxisLabel")
        .style("text-anchor", "start")
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
        .attr('x', marginHere.left)
        .attr('y', function(d, i) {
            return mapH - marginHere.bottom - (i + 1) * (COLORLEGENDHEIGHT / legendData.length);
        })
        .attr('width', COLORLEGENDWIDTH)
        .attr('height', COLORLEGENDHEIGHT / legendData.length);



    update("p90p100", 0);

    function update(percentile, speed) {



        let newestData = []

        // only select the newest data

        colormap = {}

        currentData = []


        // Get only the entry where year is highest.
        Object.keys(iso2Countries).forEach(function(iso) {


            let countryData = dataHere.filter(d => d.ISO == iso && d.Percentile == percentile);
            let newestYear = d3v5.max(countryData, d => d.Year);
            newestCountryData = countryData.filter(d => d.Year == newestYear);
            if (newestCountryData[0]){
                currentData.push(countryData.filter(d => d.Year == newestYear)[0]);
            }

        });




        let group;

        switch(percentile) {
            case "p99p100":
                group = "top 1%";
                break;
            case "p90p100":
                group = "top 10%";
                break;
            case "p0p10":
                group = "bottom 10%";
                break;

        }


        svg.selectAll(".colorAxisLabel")
            .text("income share");

        // Title.
        svg.selectAll(".title")
            .text("income share of "+ group +" (before taxes)");




        let t = d3v5.transition().duration(speed);


        let incomeMax = d3v5.max(currentData, d => d.Value);
        let incomeMin = d3v5.min(currentData, d => d.Value);





        colorScale.domain([incomeMin, incomeMax]);

        // Set and update the axis of the legend.
        dataToLegendScale.domain([incomeMin, incomeMax]);
        svg.selectAll(".colorAxis").transition(t).call(legendAxis);


        // Set all country colors back to default.
        Object.values(colorMap).forEach(function(d) {
            d.numberOfThings = null;
            d.fillColor = defaultFillColor;
        });


        // Update the colors of countries with data.
        currentData.forEach(function(item) {
            let iso = item.ISO;
            let value = item.Value;
            colorMap[iso] = {
                numberOfThings: value,
                fillColor: colorScale(value)
            }
        });

        console.log(colorMap);
        map.updateChoropleth(colorMap);

    };
}


function drawLorenz(dataset) {

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
        currentData = dataHere.filter(d => d.ISO == currentCountry && d.Variable == "income pre tax" && d.Year == year && d.Percentile != "p99p100");


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

            currentData = dataHere.filter(d => d.ISO == currentCountry && d.Variable == "income pre tax" && d.Year == currentYear && d.Percentile != "p99p100");


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
