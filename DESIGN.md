# Design document



## Data sources
Data from the world inequality database.
a list of data sources if you will get data from an external source, including information on how your are going to filter and transform the data for your project


## a diagram with an overview of the technical components of your app (visualizations, scraper etc etc)


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
