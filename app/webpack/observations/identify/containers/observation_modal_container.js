import { connect } from "react-redux";
import ObservationModal from "../components/observation_modal";
import { hideCurrentObservation } from "../actions";

function mapStateToProps( state ) {
  return {
    observation: state.currentObservation.observation,
    visible: state.currentObservation.visible,
    // TODO i think the process of adding the currentObservation to the state
    // needs to load these extra bits of data
    reviewedByCurrentUser: false,
    captiveByCurrentUser: false
  };
}

function mapDispatchToProps( dispatch ) {
  return {
    onClose: ( ) => {
      dispatch( hideCurrentObservation( ) );
    },
    toggleCaptive: ( observation, captive ) => {
      console.log( "[DEBUG] toggleCaptive, observation: ", observation, ", captive: ", captive );
      // TODO dispatch( toggleQualityMetric( observation, "captive", captive ) );
    },
    toggleReviewed: ( observation, reviewed ) => {
      console.log( "[DEBUG] toggleCaptive, observation: ", observation, ", reviewed: ", reviewed );
      // TODO dispatch( toggleQualityMetric( observation, "captive", captive ) );
    }
  };
}

const ObservationModalContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)( ObservationModal );

export default ObservationModalContainer;