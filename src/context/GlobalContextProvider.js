import React, { useReducer } from 'react';

export const GlobalStateContext = React.createContext();
export const GlobalDispatchContext = React.createContext();

const initialState = {
  collapsed: {
    '/JCode': false,
    '/JStackOverflow': false,
    '/JHelper': false,
  }
};

function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_NAV_COLLAPSED':
      return {
        ...state,
        collapsed: {
          ...state.collapsed,
          [action.url]: !state.collapsed[action.url]
        }
      };
    default:
      return {
        ...state
      };
  }
}

const GlobalContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GlobalStateContext.Provider value={state}>
      <GlobalDispatchContext.Provider value={dispatch}>{children}</GlobalDispatchContext.Provider>
    </GlobalStateContext.Provider>
  );
};

export default GlobalContextProvider;
