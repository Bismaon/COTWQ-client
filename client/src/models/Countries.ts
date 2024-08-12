// Countries.ts

import { Country } from "./Country";
import { XMLParser } from "fast-xml-parser";

/**
 * Represents a collection of countries.
 */
export class Countries {
  protected countriesArray: Country[] = [];
  protected countriesFound: number;
  protected arraySize: number;

  /**
   * Creates an instance of Countries.
   */
  constructor() {
    this.countriesFound = 0;
    this.arraySize = 0;
  }

  /**
   * Initialize the Countries object by loading data from the XML file.
   * @param {string} filePath The path to the XML file.
   */
  public async initialize(filePath: string): Promise<void> {
    this.countriesArray = await this.loadCountryData(filePath);
    console.log(this.countriesArray);
    this.arraySize = this.countriesArray.length;
  }
  /**
   * Get the array of countries.
   * @returns {Country[]} The array of countries.
   */
  public getCountriesArray(): Country[] {
    return this.countriesArray;
  }

  /**
   * Increment the count of found countries.
   */
  public incrementFound(): void {
    this.countriesFound++;
  }

  /**
   * Get the size of the countries array.
   * @returns {number} The size of the countries array.
   */
  public getSize(): number {
    return this.arraySize;
  }

  /**
   * Get the count of found countries.
   * @returns {number} The count of found countries.
   */
  public getFound(): number {
    return this.countriesFound;
  }

  /**
   * Check if all countries are found.
   * @returns {boolean} True if all countries are found, false otherwise.
   */
  public isAllFound(): boolean {
    return this.countriesFound === 191;
  }

  /**
   * Check if a country exists by name.
   * @param {string} name The name of the country.
   * @returns {number} The index of the country if found, otherwise -1.
   */
  public exists(name: string): number {
    return this.countriesArray.findIndex((obj) =>
      obj.getAcceptedNames().includes(name)
    );
  }

  /**
   * Clear the found status of all countries.
   */
  public clearFound(): void {
    for (let i = 0; i < this.countriesArray.length; i++) {
      if (this.countriesArray[i].getFound()) {
        this.countriesArray[i].setFound(false);
      }
    }
  }

  /** Loads the static XML country data and returns a Country instance Array */
  private async loadCountryData(url: string): Promise<Country[]> {
    try {
      // Fetch XML data from URL
      const response = await fetch(url);
      const xmlData = await response.text();

      // Parse XML to JavaScript object
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      // Map parsed data to instances of the Country class
      return parsedData.countries.country.map((country: any): Country => {
        let territories = country.territories?.territory || null;
        let languages = country.languages?.language || null;
        let acceptedNames = country.acceptedNames?.name || null;
        // makes sure territories/languages/acceptedNames are in array form
        if (typeof territories === "string") {
          territories = [territories];
        }
        if (typeof languages === "string") {
          languages = [languages];
        }
        if (typeof acceptedNames === "string") {
          acceptedNames = [acceptedNames];
        }

        let ownedLocation = country.ownedLocation
          ? (country.ownedLocation.split(",").map(Number) as [number, number])
          : null;

        console.log(ownedLocation);
        return new Country(
          country.name,
          acceptedNames,
          territories?.map(
            (loc: string) => loc.split(",").map(Number) as [number, number]
          ) || null,
          country.location.split(",").map(Number) as [number, number],
          ownedLocation,
          [country.flag.png, country.flag.svg],
          country.currency || null,
          country.capital || null,
          languages
        );
      });
    } catch (error) {
      console.error("Error parsing country data: ", error);
      return [];
    }
  }
}
