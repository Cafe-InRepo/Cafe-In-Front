// src/utils/loadState.js
export const loadState = () => {
    try {
      const serializedState = localStorage.getItem('basket');
      if (serializedState === null) {
        return undefined;
      }
      return { basket: { items: JSON.parse(serializedState) } };
    } catch (err) {
      console.error('Could not load state', err);
      return undefined;
    }
  };
  