declare module 'react-select-country-list' {
  interface CountryOption {
    value: string;
    label: string;
  }

  interface CountryList {
    getData(): CountryOption[];
    getValue(label: string): string;
    getLabel(value: string): string;
  }

  function countryList(): CountryList;
  export default countryList;
}