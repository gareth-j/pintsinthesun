import { getLocation } from '../services/location';
import { floorLatLng } from '../services/location';
import { reverseGeocode } from '../services/googlemaps';
import { fetchWeather, filterWeather } from './weather';

import config from '../config';

export const UPDATE_TIME = 'update_time';
export const FETCH_POSITION = 'fetch_position';
export const REQUEST_POSITION = 'request_position';
export const RESPONSE_POSITION = 'response_position';

export const REQUEST_PUBS = 'request_pubs';
export const RESPONSE_PUBS = 'response_pubs';
export const REQUEST_PUB_DETAIL = 'request_pub_detail';
export const RESPONSE_PUB_DETAIL = 'response_pub_detail';

export const INCREMENT_CURRENT_PUB = 'increment_current_pub';
export const DECREMENT_CURRENT_PUB = 'decrement_current_pub';

export const LAUNCH_LOCATION_MODAL = 'launch_location_modal';
export const LAUNCH_INFO_MODAL = 'launch_info_modal';
export const CLOSE_MODAL = 'close_modal';

export const REQUEST_ADDRESS = 'request_address'
export const RESPONSE_ADDRESS = 'response_address'

import { hashHistory } from 'react-router'



export function launchLocationModal(){
    return function(dispatch) {
        dispatch({
            type: LAUNCH_LOCATION_MODAL
        });
    }
}

export function launchInfoModal(){
    return function(dispatch) {
        dispatch({
            type: LAUNCH_INFO_MODAL
        });
    }
}

export function closeModal(){
    return function(dispatch) {
        dispatch({
            type: CLOSE_MODAL
        });
    }
}

export function requestPosition() {
    return {
        type: REQUEST_POSITION
    }
}

export function responsePosition(centre, isGPSPosition = false) {
    let isRealPosition = true;
    return function(dispatch) {

        if(centre.error){ //user denied location access
            centre = {lat: 51.523661, lng: -0.077338}; //default to shoreditch when no location available 51.523661, -0.077338
            isRealPosition = false;
            isGPSPosition = false;
        }

        dispatch(fetchPubs(centre));
        dispatch(fetchWeather(centre));

        dispatch({
            type: RESPONSE_POSITION,
            centre: centre,
            receivedAt: new Date(),
            isRealPosition,
            isGPSPosition
        });
    }
}



export function updateTime(date, isNow = false) {

    let hours = date.getHours();
    var timeRange = 'morning';
    if(hours >= 12 && hours < 18){
        timeRange = 'afternoon'
    }
    if(hours > 17 && hours < 24){
        timeRange = 'evening';
    }
    if(isNow){
        timeRange = 'now';
    }

    return function(dispatch) {
        dispatch({
            type: UPDATE_TIME,
            date,
            timeRange
        });
        let hour = date.getHours();
        dispatch(filterWeather(hour));
    }
}

export function fetchPosition() {
    return function(dispatch) {
        // Update UI to show spinner or something
        dispatch(requestPosition());

        return getLocation().then(result => {
            dispatch(responsePosition(result, true));
        });
    }
}

/**
 * @returns Promise
 */
export function getSuggestions(date, centre) {
    let { lat, lng } = floorLatLng(centre);
    const url = config.API + `near/${lat}/${lng}/${date.toISOString()}`;
    return fetch(url).then(
        data => data.json()).catch( handleError );
}

export function requestPubs() {
    return {
        type: REQUEST_PUBS,
        isLoading: true
    }
}
export function requestPubDetail() {
    return {
        type: REQUEST_PUB_DETAIL,
        isLoading: true
    }
}

export function responsePubs(data) {
    return {
        type: RESPONSE_PUBS,
        items: data.items,
        receivedAt: new Date(),
        isLoading: false
    }
}

export function getAddress(centre) {
    return function (dispatch){
        reverseGeocode(centre, (result) => {
            if(result.status === 'OK'){
                dispatch(responseAddress(result.address));
            }
        });
    }
}

export function fetchPubs(centre) {
    return function(dispatch) {
        dispatch(requestPubs());
        let { lat, lng } = floorLatLng(centre);
        const url = config.API + `near/${lat}/${lng}`;
        return fetch(url)
            .then(data => data.json())
            .then(data => {
                dispatch(responsePubs(data));
            }).catch( handleError );

    };
}

export function fetchPubDetail(id) {
    return function(dispatch) {
        dispatch(requestPubDetail());
        const url = config.API + `pub/${id}`;
        return fetch(url)
            .then(data => data.json())
            .then(data => {
                dispatch(responsePubDetail(data));
            }).catch( handleError );
    };
}

export function responseAddress(address) {
    return {
        type: RESPONSE_ADDRESS,
        address: address
    }
}

export function responsePubDetail(data) {
    return {
        type: RESPONSE_PUB_DETAIL,
        pub: data.pub,
        receivedAt: new Date(),
        isLoading: false
    }
}

export function incrementCurrentPub() {
    return {
        type: INCREMENT_CURRENT_PUB
    }
}

export function decrementCurrentPub() {
    return {
        type: DECREMENT_CURRENT_PUB
    }
}

function handleError(err) {
    hashHistory.push('/error');
}
