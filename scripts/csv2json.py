# Name: Leo Schreuders
# Student number: 5742978

import pandas as pd
import csv
import json
import pycountry_convert as convert


from collections import defaultdict


INPUT_CSV = ["..\\data\\income_post_tax.csv", "..\\data\\gini_post_tax.csv", "..\\data\\income_pre_tax.csv"]
OUTPUT_JSON = ["..\\data\\income_post_tax.json", "..\\data\\gini_post_tax.json", "..\\data\\income_pre_tax.json"]



if __name__ == '__main__':
    for i in range(len(INPUT_CSV)):
        pd.set_option("display.max_columns", 999)
        df = pd.read_csv(INPUT_CSV[i], delimiter=';', header=None, names=["Country", "Variable", "Percentile", "Year", "Value"], usecols=["Country", "Percentile", "Year", "Value"]) #, usecols=["COU", "Country", "Variable", "Year", "Value"])


        country_map = convert.map_countries();
        print(country_map)

        def transform(country_name):
            if country_name in country_map:
                # print(country_map[country_name])
                return country_map[country_name]["alpha_3"]
            elif country_name == "USA":
                return country_name
            else:
                return None

        df['ISO'] = df.apply(lambda row: transform(row['Country']), axis=1)

        # df = df[df.MEASURE == "GINI"]
        # df = df[df.AGE == "TOT"]
        # df = df.set_index("TIME")

        df = df[pd.to_numeric(df["Value"], errors="coerce").notnull()]
        df["Value"] = pd.to_numeric(df["Value"], errors="coerce")

        # df = df[df["Value"].apply(lambda value: isinstance(value, float) )]
        df = df.dropna()


        print(df)

        json_data = df.to_json(orient='records')

        with open(OUTPUT_JSON[i], 'w') as outfile:
            outfile.write(json_data)
