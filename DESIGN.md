# Design document



## Data sources
Data from the world inequality database.
a list of data sources if you will get data from an external source, including information on how your are going to filter and transform the data for your project



## a diagram with an overview of the technical components of your app (visualizations, scraper etc etc)
1: World map. Country code calculated based on gini coefficient with a d3 colorScale. Mousing over the country shows the number of the gini coefficient. A legend shows the relationship between colors and gini values. Clicking a country changes views 2 and 3 to display information of the clicked country.

2: Pie chart. Pie chart will represent 100 percent of the national income of a country. It will be divided into 10 parts, every representing the share of the national income of an income group. There will be 10 groups, each representing 10% of the population. Preferably, parts of the pie chart will move to the 10 groups (represented by images of people). Not sure yet how to do this.

3: Line graph. X axis: years. Y axis: income share. Every income group will have a line.



## Components


### A map of the world where the color of a country is based on the gini-coefficient.
Needed:
- data of gini-coefficient;
- datamaps plugin.

### Pie chart representing the national income for a country where the pieces are spread over several income groups.
Needed:;
- income data for differnt percentiles;
- pie chart code (d3.pie).

### Line graph with the share of the national income over time, where one line represents one percentile group.
Needed:
- income data for different percentiles over time;
- line chart code (d3, percentages-to-pixels-scales).




## D3 plugins
datamaps
d3 tip
