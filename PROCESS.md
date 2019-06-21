# Day 1

# Day 2
Obtained and parsed data for income share after taxes.
Obtained and parsed gini coefficient data.


# Day 3
Adding ISO country codes to data.
Using pycountry-convert 0.7.2

# Day 4
Pie chart works.

# Day 5
Obtained and parsed data for income before taxes.
Countries for which gini data is available is not the same set as countries for which income data is available. Basing country color on share of the top 10 percent now.


# Weekend
The checkbox for taxes now works.


# Day 6
Rewrote drawMap and drawPie to handle data differently. They do not get fed new data everytime they are updated. Instead they are initialized with the full dataset, and everytime they are updated, they are fed a year, a country or a tax-toggle, and they will select the data within themselves.


# Day 7
Rewrote update functions again. TaxOn, CurrentCountry and currentYear are now set globally.
Implemented the line chart. No legend yet for pie chart and line chart. (They can share the legend).
I'm thinking it would be better to not let the year selection have any effect on the map. Perhaps the map should be made from the newest data available (which can differ per country), and the year selector will only have an effect on the pie chart.


# Day 8
Made the line chart's x-axis update when a different country is selected, because the time period for which data is available differs per country.



# Day 9
Met with Jasper, who advised to add data for the top 1 percent and have the option to show that in the map. A Lorenz curve was also suggested.


# Weekend
The pie chart can now be divided over 10 people, representing ten income groups.
The map now only displays the newest data per country.

# Day 10
Implemented bootstrap.

# Day 11
Out of office.


# Day 12
Obtained and processed data for top 1 percent.

# Day 13
Added a dropdown menu to select what the map should display (top 1, top 10, or bottom 10).
Added a lorenz curve.
Worked on the overall layout.
Merged the 2 buttons to divide and undivide the pie into one toggle button.

# Day 14
Met with Jasper, his opinion is that most of it is done.
Added average income data. Hovering over the pie chart or the people in the pie chart now shows the average income for this group.
It looks like the spacing of the people in the pie chart could be less linear, as the last one or two people need more space.
