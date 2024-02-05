// cacheManager.js

const setItem = (key, value) => {
    try {
      const stringValue = JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    } catch (error) {
      console.error(`Error setting item in cache: ${error}`);
    }
  };
  
  const getItem = (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting item from cache: ${error}`);
      return null;
    }
  };
  
  const clearItem = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error clearing item from cache: ${error}`);
    }
  };
  
  const clearAll = () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Error clearing cache: ${error}`);
    }
  };
  
  export { setItem, getItem, clearItem, clearAll };
  