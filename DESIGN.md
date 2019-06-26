# Design document


## Data sources
Data from the world inequality database on gini coefficients and income shares.
Going to have to deal with missing data for certain countries and years. I can get them in in a CSV. Entries have country names, but I will need to add the ISO code (to work with the datamap).
Some values for the gini coefficient make no sense, have text in them. I will have to drop those, as well as missing values.
I will use pandas in python to import the csv, filter if, and then save it in JSON format.



## a diagram with an overview of the technical components of your app (visualizations, scraper etc etc)

![idea](doc/02.png "idea")

1: World map.

2: Pie chart.

3: Lorenz curve.

4: Line graph.



## Components

Some global attributes:
taxOn (bool): are the taxes on or off;
currentCountry: ISO code of the last country the user clicked on;
currentYear: last year the user selected;

### Map
Country color calculated based on share of income of top 10%, top 1%, or bottom 10%, with a d3 colorScale. Mousing over the country shows that number.
A legend shows the relationship between colors and share.
Clicking a country changes views 2, 3 and 4 to display information of the clicked country.
This works by sending the geograhpy.id to a new function to update the pie chart.
Needed:
- data of gini-coefficient;
- datamaps plugin.
The map function:
 - drawMap(dataset)
 - update(speed)

### Pie chart
Pie chart will represent 100 percent of the national income. It will be divided into 10 parts, each representing the share of the national income of an income group. There will be 10 groups, each representing 10% of the population. Preferably, parts of the pie chart will move to the 10 groups (represented by images of people). Not sure yet how to do this.
representing the national income for a country where the pieces are spread over several income groups.
Needed:
- income data for different percentiles;
- pie chart code (d3.pie).
The pie function:
 - drawPie(dataset)
 - update(speed)


### Line graph
X axis: years. Y axis: income share. Every income group will have a line.
Problem: how many lines? 10 lines for 10 groups is a bit much.
Needed:
- income data for different percentiles over time;
- line chart code (d3, percentages-to-pixels-scales).
The line function:
 - drawLine(dataset)
 - update(speed)




## D3 plugins
datamaps
d3 tip
