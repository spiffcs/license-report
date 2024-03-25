import pandas as pd
import json

# Load the CSV file
df = pd.read_csv('artifacts/image.csv')

# Convert the DataFrame to a multidimensional list (array)
array = df.values.tolist()

# Convert the array to a JSON string
json_array = json.dumps(array)

# Print the JSON string in a way that GitHub Actions can capture as an output
print(f"::set-output name=json_output::{json_array}")
