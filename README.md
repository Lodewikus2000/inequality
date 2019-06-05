# inequality

https://lodewikus2000.github.io/inequality/

## Problem statement

Data on inequality is widely available, but there is no easy to understand visualization of this data. Complicated line graphs of gini coefficients or bar charts of share of the 1% mean don't communicate the data clear enough.


## Solution

The solution is a visualization of inequality data in human terms, for people who are not experts at readings graphs, mainly focused on income and wealth inequality, in a relatable way.


### Main features

![idea](doc/02.png "idea")


#### Minimum viable product
View 1 : a world map where the user can select a country. Country color based on some measure of inequality.
View 2: a country's national income (or wealth) divided over 10 or 100 people. The representation of the share of income (or wealth) can be a bar chart where the bars are made to look like money, or parts of a pie chart.
View 3: a graph view: something over time?

#### Optional
Information about inequality when it comes to health, government spending on social programs.

## Prerequisites

### Data sources
https://wid.world/
https://data.oecd.org/

### External components
D3 datamap,

### Similar visualizations

Take this example from the World Inequality Database:
![bad example](doc/01.png "I don't like this")
It's unclear what the % share buttons do, the line graph at the bottom is not too informative. The whole visualization does not communicate anything to anyone who is not already very interested in this subject.

### Hardest parts

Animations, combining data from several databases.
