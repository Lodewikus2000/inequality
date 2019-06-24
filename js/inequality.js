

var defaultCountry = "NLD";


var countries2ISO = {};
var iso2Countries = {};


var currentYear = 2015;


const SPEED = 1500;

INCOMESCALECOLORS = ["#fde0dd", "#c51b8a"];
INCOMEGROUPCOLORS = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd'];

window.onload = function() {

    let requests = [d3v5.json("data/total.json")]

    Promise.all(requests).then(function(response) {

        let pieCut = false;


        let allData = response[0]


        let incomeData = allData.filter(d => d.Variable == "income share" || d.Variable == "average income");

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
                drawPie.divide(SPEED);
                pieCut = true;
                d3v5.select(this).text("Put it back");
            }


        });


    });
};
