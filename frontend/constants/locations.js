import locationsData from './locations.json';

// Export the raw location data
export const LOCATIONS_DATA = locationsData;

// Utility functions for working with location data
export const LocationHelper = {
  // Get all countries
  getCountries: () => {
    return Object.keys(locationsData).map(country => ({
      label: country,
      value: country
    }));
  },

  // Get states for a specific country
  getStates: (country) => {
    if (!country || !locationsData[country]) return [];
    return Object.keys(locationsData[country]).map(state => ({
      label: state,
      value: state
    }));
  },

  // Get cities for a specific country and state
  getCities: (country, state) => {
    if (!country || !state || !locationsData[country] || !locationsData[country][state]) return [];
    return Object.keys(locationsData[country][state]).map(city => ({
      label: city,
      value: city
    }));
  },

  // Get places for a specific country, state, and city
  getPlaces: (country, state, city) => {
    if (!country || !state || !city || 
        !locationsData[country] || 
        !locationsData[country][state] || 
        !locationsData[country][state][city]) return [];
    
    return locationsData[country][state][city].map(place => ({
      label: place,
      value: place
    }));
  },

  // Search across all locations
  searchLocations: (query, maxResults = 50) => {
    if (!query || query.length < 2) return [];
    
    const results = [];
    const searchTerm = query.toLowerCase();
    
    Object.entries(locationsData).forEach(([country, states]) => {
      Object.entries(states).forEach(([state, cities]) => {
        Object.entries(cities).forEach(([city, places]) => {
          // Check if city matches
          if (city.toLowerCase().includes(searchTerm)) {
            results.push({
              type: 'city',
              city,
              state,
              country,
              fullLocation: `${city}, ${state}, ${country}`,
              score: city.toLowerCase().indexOf(searchTerm)
            });
          }
          
          // Check if any place matches
          places.forEach(place => {
            if (place !== 'Other' && place.toLowerCase().includes(searchTerm)) {
              results.push({
                type: 'place',
                place,
                city,
                state,
                country,
                fullLocation: `${place}, ${city}, ${state}, ${country}`,
                score: place.toLowerCase().indexOf(searchTerm)
              });
            }
          });
        });
        
        // Check if state matches
        if (state.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'state',
            state,
            country,
            fullLocation: `${state}, ${country}`,
            score: state.toLowerCase().indexOf(searchTerm)
          });
        }
      });
      
      // Check if country matches
      if (country.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'country',
          country,
          fullLocation: country,
          score: country.toLowerCase().indexOf(searchTerm)
        });
      }
    });
    
    // Sort by relevance (exact matches first, then partial matches)
    return results
      .sort((a, b) => a.score - b.score)
      .slice(0, maxResults);
  },

  // Format location string
  formatLocation: (locationData) => {
    const { place, city, state, country } = locationData;
    const parts = [];
    
    if (place && place !== 'Other') parts.push(place);
    if (city && city !== place) parts.push(city);
    if (state) parts.push(state);
    if (country) parts.push(country);
    
    return parts.join(', ');
  },

  // Parse location string back to object
  parseLocation: (locationString) => {
    if (!locationString) return {};
    
    const parts = locationString.split(',').map(part => part.trim());
    const country = parts[parts.length - 1] || '';
    const state = parts[parts.length - 2] || '';
    const city = parts[parts.length - 3] || '';
    const place = parts[parts.length - 4] || '';
    
    return {
      country,
      state,
      city,
      place: place || city
    };
  },

  // Validate if a location exists in our data
  validateLocation: (country, state, city, place) => {
    const validation = {
      isValid: false,
      exists: {
        country: false,
        state: false,
        city: false,
        place: false
      }
    };
    
    if (!country) return validation;
    
    if (locationsData[country]) {
      validation.exists.country = true;
      
      if (!state) {
        validation.isValid = true;
        return validation;
      }
      
      if (locationsData[country][state]) {
        validation.exists.state = true;
        
        if (!city) {
          validation.isValid = true;
          return validation;
        }
        
        if (locationsData[country][state][city]) {
          validation.exists.city = true;
          
          if (!place) {
            validation.isValid = true;
            return validation;
          }
          
          if (locationsData[country][state][city].includes(place)) {
            validation.exists.place = true;
            validation.isValid = true;
          }
        }
      }
    }
    
    return validation;
  },

  // Get suggestions for partial location input
  getSuggestions: (country, state, city, limit = 10) => {
    const suggestions = [];
    
    if (!country) {
      return Object.keys(locationsData).slice(0, limit).map(c => ({
        type: 'country',
        value: c,
        display: c
      }));
    }
    
    if (!locationsData[country]) return suggestions;
    
    if (!state) {
      return Object.keys(locationsData[country]).slice(0, limit).map(s => ({
        type: 'state',
        value: s,
        display: `${s}, ${country}`
      }));
    }
    
    if (!locationsData[country][state]) return suggestions;
    
    if (!city) {
      return Object.keys(locationsData[country][state]).slice(0, limit).map(c => ({
        type: 'city',
        value: c,
        display: `${c}, ${state}, ${country}`
      }));
    }
    
    if (!locationsData[country][state][city]) return suggestions;
    
    return locationsData[country][state][city].slice(0, limit).map(p => ({
      type: 'place',
      value: p,
      display: `${p}, ${city}, ${state}, ${country}`
    }));
  }
};

// Default export for easy importing
export default {
  LOCATIONS_DATA,
  LocationHelper
};