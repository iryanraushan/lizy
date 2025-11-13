import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_VISITS_KEY = 'recent_visits';
const SEARCH_HISTORY_KEY = 'search_history';

export const addToRecentVisits = async (property) => {
  try {
    const existingVisits = await getRecentVisits();
    const filteredVisits = existingVisits.filter(visit => visit.id !== property.id);
    const updatedVisits = [
      {
        ...property,
        visitedAt: new Date().toISOString()
      },
      ...filteredVisits
    ].slice(0, 50);
    
    await AsyncStorage.setItem(RECENT_VISITS_KEY, JSON.stringify(updatedVisits));
    return updatedVisits;
  } catch (error) {
    console.error('Error adding to recent visits:', error);
    return [];
  }
};

export const getRecentVisits = async (limit = null) => {
  try {
    const visits = await AsyncStorage.getItem(RECENT_VISITS_KEY);
    const parsedVisits = visits ? JSON.parse(visits) : [];
    
    return limit ? parsedVisits.slice(0, limit) : parsedVisits;
  } catch (error) {
    console.error('Error getting recent visits:', error);
    return [];
  }
};

export const clearRecentVisits = async () => {
  try {
    await AsyncStorage.removeItem(RECENT_VISITS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing recent visits:', error);
    return false;
  }
};

// Search History Management
export const addToSearchHistory = async (searchQuery) => {
  try {
    if (!searchQuery.trim()) return [];
    
    const existingHistory = await getSearchHistory();
    
    // Remove if already exists to avoid duplicates
    const filteredHistory = existingHistory.filter(
      item => item.query.toLowerCase() !== searchQuery.toLowerCase()
    );
    
    // Add to beginning and limit to 20
    const updatedHistory = [
      {
        query: searchQuery.trim(),
        searchedAt: new Date().toISOString()
      },
      ...filteredHistory
    ].slice(0, 20);
    
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (error) {
    console.error('Error adding to search history:', error);
    return [];
  }
};

export const getSearchHistory = async (limit = null) => {
  try {
    const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    const parsedHistory = history ? JSON.parse(history) : [];
    
    // Return limited results if specified
    return limit ? parsedHistory.slice(0, limit) : parsedHistory;
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

export const removeFromSearchHistory = async (query) => {
  try {
    const existingHistory = await getSearchHistory();
    const updatedHistory = existingHistory.filter(
      item => item.query !== query
    );
    
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (error) {
    console.error('Error removing from search history:', error);
    return [];
  }
};

export const clearSearchHistory = async () => {
  try {
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing search history:', error);
    return false;
  }
};