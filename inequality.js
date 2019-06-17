const mapW = 800;
const mapH = 400;


const COLORLEGENDHEIGHT = .5 * mapH;
const COLORLEGENDWIDTH = 24;


const pieW = 1000;
const pieH = 300;



const lineW = 800;
const lineH = 400;



var lastCountry = "NLD";



var countries2ISO = {};
var iso2Countries = {};

var taxOn = false;
var currentYear = 2015;



const SPEED = 500;

INCOMESCALECOLORS = ["#fde0dd", "#c51b8a"];
INCOMEGROUPCOLORS = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a'];

window.onload = function() {

    let requests = [d3v5.json("data/gini_post_tax.json"), d3v5.json("data/income_post_tax.json"), d3v5.json("data/income_pre_tax.json"), d3v5.json("data/total.json")]

    Promise.all(requests).then(function(response) {



        let allData = response[3]

        let gini_post_tax = response[0]


        let income_post_tax = response[1]


        let income_pre_tax = response[2]

        let incomeTop10 = allData.filter(d => (d.Variable == "income post tax" || d.Variable == "income pre tax") && d.Percentile == "p90p100");

        let incomeData = allData.filter(d => d.Variable == "income post tax" || d.Variable == "income pre tax");



        console.log(incomeData);



        // Make a list of all the countries for which income data is available.
        for (j = 0; j < incomeData.length; j++) {
            iso2Countries[incomeData[j].ISO] = incomeData[j].Country;
            countries2ISO[incomeData[j].Country] = incomeData[j].ISO;
        };







        let countrySelect = d3v5.select("#countrySelect");

        countrySelect.selectAll("option").data(Object.keys(countries2ISO).sort())
            .enter().append("option")
            .property("selected", d => d === iso2Countries[lastCountry])
            .text(d => d);


        countrySelect.on("change", function() {

            var countryName = d3.select("#countrySelect").node().value;
            drawPie.updateCountry(countries2ISO[countryName], SPEED);
            drawLine.update(countries2ISO[countryName], SPEED)

        });




        drawMap(incomeTop10);
        drawPie(incomeData);
        drawPie.updateCountry("NLD");
        drawLine(incomeData);

        d3v5.select("#yearSelect").on("change", function() {

            var year = d3.select("#yearSelect").node().value;
            console.log(year)

            drawPie.updateYear(year, SPEED);

        });


        d3v5.select("#divideButton").on("click", function() {
            drawPie.divide(SPEED*2)
        });

        d3v5.select("#unDivideButton").on("click", function() {
            drawPie.unDivide(SPEED)
        });








    });
};

function drawPie(dataset) {
// based on https://bl.ocks.org/adamjanes/5e53cfa2ef3d3f05828020315a3ba18c/22619fa86de2045b6eeb4060e747c5076569ec47


    let margin = {
        left: 40,
        right: 40,
        top: 20,
        bottom: 20
    };

    let width = pieW - margin.left - margin.right;
    let height = pieH - margin.top - margin.bottom;
    let peopleH = 64;

    let divided = false;


    let pieRadius = (pieH * 0.7 - margin.top - margin.left) / 2;

    drawPie.updateYear = updateYear;
    drawPie.updateCountry = updateCountry;
    drawPie.divide = divide;
    drawPie.unDivide = unDivide;


    let dataHere = dataset;
    let currentData;
    let currentCountry;




    let svg = d3v5.select("#pieChart");


    svg.append("g")
        .attr("class", "people")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + height - peopleH) + ")");



    let people = svg.select(".people")

    for (i = 0; i<10; i ++) {
        people.append('svg:image')
        .attr('xlink:href', "img/man1.png")
        .attr("height", peopleH)
        .attr("x", ( width / 10 * i) + ((width / 10 - peopleH) / 2) )
        }






    svg.append("text")
        .attr("x", pieW / 2)
        .attr("y", 16)
        .attr("class", "pieTitle")
        .style("text-anchor", "middle")
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



    let tip = d3v5.tip()
        .attr('class', 'pieTip')
        .direction("n")
        .html(function(d) {
            console.log(d);
            return d.data.Value;

        });

    svg.call(tip);


    function updateYear(year, speed) {


        currentData = []
        currentData = dataHere.filter(d => d.ISO == currentCountry && d.Variable == "income pre tax" && d.Year == year);


        // Sort the data by its percentiles.
        currentData.sort(function(a, b) {

            return a.Percentile.localeCompare(b.Percentile);

        });

        console.log("data in de updateYear van de pie:")
        console.log(currentData);

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
            .attr("transform", "translate(" + (pieW / 2) + "," + (pieRadius + margin.top) + ")")
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
            .each(function(d) { this._current = d; })
            .on('mouseover', d => tip.show(d))
            .on('mouseout', tip.hide);



        if (divided) {
            divide(2 * speed);
        }




    }

    function updateCountry(country, speed) {




        currentCountry = country;

        let countryData = dataHere.filter(d => d.ISO == country && d.Variable == "income pre tax");

        console.log("we zitten in updateCountry")
        console.log(country);
        console.log(countryData)
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

        console.log("data in de update van de pie:")
        console.log(currentData);

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
            .attr("transform", "translate(" + (pieW / 2) + "," + (pieRadius + margin.top) + ")")
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
            .on('mouseover', d => tip.show(d))
            .on('mouseout', tip.hide);


        d3v5.selectAll(".pieTitle")
            .text(currentData[0].Country);


        if (divided) {
            divide(2 * speed);
        }



    };


    function divide(speed) {
        console.log("begin divide functie");


        slices = svg.selectAll(".slice").data(pie(currentData));
        slices.transition().duration(1000);

        slices.transition(speed).attr("transform", function(d, i) {



            var rotate = 360 - (d.startAngle + d.endAngle) / 2 / Math.PI * 180;

            // if (i == 9) {
            //     rotate = 90 - (d.startAngle + d.endAngle) / 2 / Math.PI * 180
            // }


            x =  margin.left + ( width / 10 * i) + ((width / 10) / 2)


            // let x = margin.left + ( (width / 100) * i * i) + (width / 10)  ;
            let y = margin.top + height - peopleH - 8;

            return "translate(" + x + "," + y + ") rotate(" + rotate + ")";



        }).duration(speed);

        divided = true;
    }

    function unDivide(speed) {


        console.log("aan het UNdividen")

        slices = svg.selectAll(".slice");

        slices.transition().attr("transform", "translate(" + (pieW / 2) + "," + (pieRadius + margin.top) + ")").duration(speed);

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
        .attr("x", mapW / 2)
        .attr("y", 16)
        .attr("class", "lineTitle")
        .style("text-anchor", "middle")
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



    update("NLD", 0)


    function update(country, speed) {
        console.log("in de update van de lijn")

        currentCountry = country;

        let t = d3v5.transition().duration(speed);

        if (taxOn) {
            currentData = dataHere.filter(d => d.Variable == "income post tax" && d.ISO == currentCountry)
        } else {
            currentData = dataHere.filter(d => d.Variable == "income pre tax" && d.ISO == currentCountry)
        }




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

    let margin = {
        left: 20,
        right: 20,
        top: 40,
        bottom: 20
    };


    // The year determines what year the map shows initially.




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






                    drawPie.updateCountry(geo.id, SPEED);
                    drawLine.update(geo.id, SPEED);
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
        .range(INCOMESCALECOLORS)
        .domain([0, COLORLEGENDHEIGHT]);


    let legendAxis = g => g
        .attr("transform", "translate(" + (margin.left + COLORLEGENDWIDTH) + "," + (mapH - margin.bottom - COLORLEGENDHEIGHT) + ")")
        .call(d3v5.axisRight(dataToLegendScale));


    let svg = d3v5.select(".datamap");

    // Title.
    svg.append("text")
        .attr("x", mapW / 2)
        .attr("y", 16)
        .attr("class", "mapTitle")
        .style("text-anchor", "middle")
        .style("fill", "black");

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


    update(0);


    function update(speed) {



        let newestData = []

        // only select the newest data

        colormap = {}

        currentData = []

        Object.keys(iso2Countries).forEach(function(iso) {


            let countryData = dataHere.filter(d => d.ISO == iso && d.Variable == "income pre tax");
            let newestYear = d3v5.max(countryData, d => d.Year);
            newestCountryData = countryData.filter(d => d.Year == newestYear);
            if (newestCountryData[0]){
                currentData.push(countryData.filter(d => d.Year == newestYear)[0]);
            }

        });



        console.log(currentData)






        svg.selectAll(".colorAxisTitle")
            .text("income share");

        // Title.
        svg.selectAll(".mapTitle")
            .text("income share of top 10% before taxes");




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
