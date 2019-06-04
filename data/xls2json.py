
import pandas as pd


FILENAME = "2019_stadsdelen_1_01.xlsx"

OUTPUT_JSON = "2019_stadsdelen_1_01.json"

def process_excel(filename):


    df = pd.read_excel(filename, header=None)
    print(df)

    json_data = df.to_json()

    with open(OUTPUT_JSON, 'w') as outfile:
        outfile.write(json_data)


if __name__ == '__main__':
    process_excel(FILENAME)
