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



# Day 8



# Day 9
