# Name: Leo Schreuders
# Student number: 5742978

import pandas as pd
import csv
import json

from collections import defaultdict


INPUT_CSV = "post_tax_0_100_merged.csv"
OUTPUT_JSON = "income_after_tax.json"



if __name__ == '__main__':
    #pd.set_option("display.max_columns", 999)
    df = pd.read_csv(INPUT_CSV, delimiter=';', header=None, names=["country","variable","percentile","year","value"], usecols=["country", "percentile", "year", "value"]) #, usecols=["COU", "Country", "Variable", "Year", "Value"])


    print(df)
    # df = df[df.MEASURE == "GINI"]
    # df = df[df.AGE == "TOT"]


    # df = df.set_index("TIME")
    # df = df.dropna()

    json_data = df.to_json(orient='records')

    with open(OUTPUT_JSON, 'w') as outfile:
        outfile.write(json_data)




    # df = pd.read_csv(INPUT_CSV[1], delimiter=',', usecols=["Variable", "Measure" ,"COU","Country","Year","Value"])
    #
    #
    # print(df)
    # # df = df.set_index("TIME")
    # # df = df.dropna()
    #
    # json_data = df.to_json(orient='records')
    #
    # with open(OUTPUT_JSON[1], 'w') as outfile:
    #     outfile.write(json_data)
