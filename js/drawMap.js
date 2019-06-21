function drawMap(dataset) {

    let mapW = 1000;
    let mapH = 500;


    let COLORLEGENDHEIGHT = .5 * mapH;
    let COLORLEGENDWIDTH = 24;

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


                    var elmnt = document.getElementById("pieStory");
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
                    string = '<div class="hoverinfo"><strong>' + geo.properties.name + "<br>" + (Math.round(d.numberOfThings * 10000)/100) + "% in " + data.Year + '</strong></div>';
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


            let countryData = dataHere.filter(d => d.ISO == iso && d.Percentile == percentile && d.Variable == "income share");
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
