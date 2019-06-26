# Made by Leo Schreuders
# Student number 5742978
# For the course Programmeerproject
# Spring 2019

import pandas as pd
import csv
import json
import pycountry_convert as convert


from collections import defaultdict


INPUT_CSV = ["..\\data\\income_pre_tax.csv", "..\\data\\income_pre_p99p100.csv", "..\\data\\average_income.csv"]
LABELS = ["income share", "income share", "average income"]
OUTPUT_JSON = ["..\\data\\income_pre_tax.json", "..\\data\\income_pre_p99p100.json", "..\\data\\average_income.json"]
CURRENCIES_IN = "..\\data\\currencies.csv"
CURRENCIES_OUT = "..\\data\\currencies.json"
dataframes = []


if __name__ == '__main__':

    country_map = convert.map_countries()


    def transform(country_name):
        """
        Input is a country name, returns an ISO 3 country code.
        """

        if country_name in country_map:
            return country_map[country_name]["alpha_3"]
        elif country_name == "USA":
            return country_name
        else:
            return None



    # Make a json with the currency information.
    currency_df = pd.read_csv(CURRENCIES_IN, delimiter=';', usecols=["Country Name", "Unit", ])
    currency_df = currency_df.rename(index=str, columns={"Country Name": "Country", "Unit": "Unit"})
    currency_df = currency_df.drop_duplicates()

    currency_df['ISO'] = currency_df.apply(lambda row: transform(row['Country']), axis=1)
    currency_df = currency_df.dropna()

    json_data = currency_df.to_json(orient='records')

    with open(CURRENCIES_OUT, 'w') as outfile:
        outfile.write(json_data)
    print(currency_df)



    # Merge the csv's into one dataframe.
    for i in range(len(INPUT_CSV)):

        df = pd.read_csv(INPUT_CSV[i], delimiter=';', header=None, names=["Country", "Variable", "Percentile", "Year", "Value"], usecols=["Country", "Variable", "Percentile", "Year", "Value"]) #, usecols=["COU", "Country", "Variable", "Year", "Value"])

        df['ISO'] = df.apply(lambda row: transform(row['Country']), axis=1)

        df = df.assign(Variable=LABELS[i])


        df = df[pd.to_numeric(df["Value"], errors="coerce").notnull()]
        df["Value"] = pd.to_numeric(df["Value"], errors="coerce")

        df = df.dropna()

        json_data = df.to_json(orient='records')

        with open(OUTPUT_JSON[i], 'w') as outfile:
            outfile.write(json_data)

        dataframes.append(df)


    total = pd.concat(dataframes)


    # Remove country + year if data is not available for all 10 income groups.
    for country in total.ISO.unique():
        for year in total.Year.unique():
            selection = total.loc[(total["ISO"] == country) & (total["Year"] == year) & (total["Variable"] == LABELS[0])]

            if len(selection.index) == 0:
                pass
            elif len(selection.index) != 11:
                total.drop(total[(total.ISO == country) & (total.Year == year) & (total.Variable == LABELS[0])].index, inplace=True)


    json_data = total.to_json(orient='records')

    with open("..\\data\\total.json", 'w') as outfile:
        outfile.write(json_data)
