import axios from 'axios'
import { adalApiFetch } from '../adalConfig.js';

import { VEHICLEDETAILS_SUCCESSFUL, VEHICLEDETAILS_FAILURE, VEHICLEDETAILS_PENDING} from '../constants/actionTypes';

export const readVehicleDetails = () => {
	console.log("in readVD");
	
    let config1 = {
        method: 'get',
        'OData-MaxVersion': 4.0,
        'OData-Version': 4.0,
        Accept: 'dmv_vehicles/json',
        'Content-Type': 'dmv_vehicles/json; charset=utf-8',
        headers: {
            'Prefer': "odata.include-annotations=*"
        }
    };
	

    let config2 = {
        method: 'get',
        'OData-MaxVersion': 4.0,
        'OData-Version': 4.0,
        Accept: 'dmv_contacthasvehicles/json',
        'Content-Type': 'dmv_contacthasvehicles/json; charset=utf-8', 
        headers: {
        'Prefer': "odata.include-annotations=*"
        }
    }

    return dispatch => {
        dispatch(vehicleDetailsPending()); 

        let thisGuid = JSON.parse(localStorage.getItem('token')).contactid;
		console.log("thisGuid =" + thisGuid);
        let urlBase1 = "https://sstack4.crm.dynamics.com/api/data/v9.1/dmv_contacthasvehicles?$select=_dmv_vehiclerecordid_value&$filter=_dmv_contactrecordid_value%20eq%20";
        let vRecordsURL = urlBase1.concat(thisGuid);

        let apiFetch = adalApiFetch(axios, vRecordsURL, config2)
        .then(results => {
            
            console.log("in results");
            console.log(results);        
            console.log(results.data.value);        
            console.log(results.data.value[0]._dmv_vehiclerecordid_value);
            console.log(results.data.value.length);
            
            
            let vRecordsArr = [];
            let vRecordsArrLen = 0;
            let urlBase2 = "https://sstack4.crm.dynamics.com/api/data/v9.1/dmv_vehicles?$select=dmv_register_date,dmv_expiration_date,dmv_year,dmv_color,dmv_make,dmv_model,dmv_vin_number,dmv_vehicleid&$filter=dmv_vehicleid%20eq%20";
            let urlArray = []; 

            for (let i = 0; i < results.data.value.length; i++){
                vRecordsArr.push(results.data.value[i]._dmv_vehiclerecordid_value);    
            }
            vRecordsArrLen = results.data.value.length;
            console.log(vRecordsArrLen);
            console.log("vRecordsArr[0] = " + vRecordsArr[0]);
            //console.log("vRecordsArrLen = " + vRecordsArr.length);
            //console.log("vRecordsArrLen = " + vRecordsArrLen);

            for (let i = 0; i < vRecordsArrLen; i++){ //create array of URLS to adalApiFetch and iterate through below
                urlArray.push(urlBase2.concat(vRecordsArr[i]));    
            }
			
			/*
            let today = new Date();
            if (results.data.value[i].dmv_expiration_date > today){
                alert("You have an expired registration!");
            }    
            */
        
            for (let i = 0; i < vRecordsArrLen; i++){
                let apiFetch = adalApiFetch(axios, urlArray[i], config1)
                .then(results => {
                    console.log("in results for " + urlArray[i]);
                    //console.log(results);        
                    //console.log(results.data.value);        
                    //console.log(results.data.value[0]._dmv_vehiclerecordid_value);                      
                    //
                    // godURL
                    // NEED TO COMBINE ARRAY INTO SINGLE JSON TEXT FILE URL
                    // SO THAT return adalApiFetch GETS ALL CARS REGISTERED
                    // BY A SINGLE CONTACT AT ONCE
                    //
                    let godURL = urlArray[0];
                    console.log(godURL);

                    for (let j = 0; j < vRecordsArrLen; j++){	
                        if (j > 0){
                            godURL = godURL.concat("+or+dmv_vehicleid%20eq%20", vRecordsArr[j]);
                            //console.log("godURL =" + godURL);
                        }	                        
                    }
                    window.value = godURL;
                })
                .catch((error) => {
                    console.log(error);
                });         
            }
        })
        .catch((error) => {
            console.log(error);
        });
        
        //(window.value !=  )
        //return adalApiFetch(axios, window.value, config2) //urlArray[0] not in scope; unable to be used as param #2
        return adalApiFetch(axios, "https://sstack4.crm.dynamics.com/api/data/v9.1/dmv_vehicles?$select=dmv_color,dmv_make,dmv_model,dmv_vin_number,dmv_vehicleid&$filter=dmv_vehicleid%20eq%20ab0a1a76-a901-41c4-9e16-40592ede9d8e", config1)
            .then(res => {
                dispatch(vehicleDetailsSuccess(res));
            })
            .catch((error) => {
                console.log(error);
                dispatch(vehicleDetailsFailure(error));
            });
    };
}


const vehicleDetailsSuccess = (res) => {
    return {
        type: VEHICLEDETAILS_SUCCESSFUL,
        data:  res.data
    };
}

const vehicleDetailsFailure = (error) => {
    return {
        type: VEHICLEDETAILS_FAILURE,
        error  
    };
}

const vehicleDetailsPending = () => {
    return {
        type: VEHICLEDETAILS_PENDING
    };
}