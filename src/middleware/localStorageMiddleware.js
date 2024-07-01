const localStorageMiddleware = store => next => action => {
    const result = next(action);
    const state = store.getState();
    if (action.type.startsWith('basket/')) {
      localStorage.setItem('basket', JSON.stringify(state.basket.items));
    }
    return result;
  };
  
  export default localStorageMiddleware;
  