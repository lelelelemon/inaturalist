import "babel-polyfill";
import moment from "moment";
import thunkMiddleware from "redux-thunk";
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { createStore, compose, applyMiddleware } from "redux";
import setupKeyboardShortcuts from "./keyboard_shortcuts";
import rootReducer from "./reducers/";
import { normalizeParams } from "./reducers/search_params_reducer";
import {
  fetchObservations,
  fetchObservationsStats,
  setConfig,
  updateSearchParams,
  updateSearchParamsFromPop,
  updateDefaultParams
} from "./actions/";
import App from "./components/app";
import _ from "lodash";

// Use custom relative times for moment
const shortRelativeTime = I18n.t( "momentjs" ) ? I18n.t( "momentjs" ).shortRelativeTime : null;
moment.locale( I18n.locale, {
  relativeTime: shortRelativeTime
} );

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(
      thunkMiddleware
    ),
    // enable Redux DevTools if available
    window.devToolsExtension ? window.devToolsExtension() : applyMiddleware()
  )
);


// Set state from initial url search and listen for changes
// Order is important, this needs to happen before any other actions are dispatched.
const newParams = normalizeParams(
  $.deparam( window.location.search.replace( /^\?/, "" ) )
);
store.dispatch( updateSearchParams( newParams ) );

if ( CURRENT_USER !== undefined && CURRENT_USER !== null ) {
  store.dispatch( setConfig( {
    currentUser: CURRENT_USER
  } ) );
}

if ( PREFERRED_PLACE !== undefined && PREFERRED_PLACE !== null ) {
  // we use this for requesting localized taoxn names
  store.dispatch( setConfig( {
    preferredPlace: PREFERRED_PLACE
  } ) );
  // this is the default place for all obs API requests
  store.dispatch( updateDefaultParams( {
    place_id: PREFERRED_PLACE.id
  } ) );
}

setupKeyboardShortcuts( store.dispatch );

// Somewhat magic, so be advised: binding a a couple actions to changes in
// particular parts of the state. Might belong elsewhere, but this is where we
// have access to the store
function observeStore( storeToObserve, select, onChange ) {
  let currentState;
  function handleChange() {
    const nextState = select( storeToObserve.getState( ) );
    if ( !_.isEqual( nextState, currentState ) ) {
      currentState = nextState;
      onChange( currentState );
    }
  }
  const unsubscribe = storeToObserve.subscribe( handleChange );
  handleChange( );
  return unsubscribe;
}
// Fetch observations when the params change
observeStore( store, s => s.searchParams.params, ( ) => {
  store.dispatch( fetchObservations( ) );
} );

window.onpopstate = ( e ) => {
  store.dispatch( updateSearchParamsFromPop( e.state ) );
  store.dispatch( fetchObservationsStats() );
};

// retrieve initial set of observations
store.dispatch( fetchObservations() );
store.dispatch( fetchObservationsStats() );


render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById( "app" )
);
