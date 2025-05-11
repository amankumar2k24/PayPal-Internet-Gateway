import fs from 'fs';
import jsonpath from "jsonpath";
import data from "../../united-states.json";
import { response, serverError } from "../helpers/response";

export const getUniqueCountryMapping = async (req, res) => {
  try {
    const zipcode = jsonpath.query(data, '$[*].zip_code');
    const city = jsonpath.query(data, '$[*].usps_city');
    const state = jsonpath.query(data, '$[*].ste_name');

    const result = zipcode.map((zipcode, index) => ({
      zipcode,
      city: city[index],
      state: state[index],
      country: "United States",
    }));

    // Write the result to a new JSON file
    fs.writeFileSync('./us_location_mapped.json', JSON.stringify(result, null, 2), 'utf-8');

    return response(res, false, 201, "Country data retrieved successfully.", result);
  } catch (error) {
    serverError(res, error);
  }
};
