import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF  } from '@react-google-maps/api';
import { Dialog, DialogContent, DialogActions, Button, Typography,Box} from '@mui/material';
import ward_boundaries from "../assets/ward_boundaries.json"
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../components/Axios';
import '../components/GooglemapsWard.css';
const containerStyle = {
  width: '100%',
  height: '400px'
};


const libraries = ['places'];
const GoogleMapsWardCoordinates = ({ }) => {
  
    const navigate = useNavigate();
  const [center, setCenter] = useState({
    lat: parseFloat(13.0055),
    lng: parseFloat(77.5692)
  });
  

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyBdb9a4LIj6aaLdxOB47HRZKD8ouOB344Q" ,// Replace with your API key
    libraries
  });

 
  const [markerPosition, setMarkerPosition] = useState(center);
  const [address, setAddress] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const inputRef = useRef(null);
  const mapRef = useRef(null);
  const [wardName, setWardName] = useState('Not Found');
  const [wardNumber, setWardNumber] = useState('Not Found');
  const [nearbyWards, setNearbyWards] = useState([]); // Manage nearby wards in state

  const onLoad = useCallback(function callback(map) {
    mapRef.current = map;
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
  }, [center]);

  const onUnmount = useCallback(function callback(map) {
    // Clean up function when map unmounts
  }, []);
 
  const handleConfirmYes = () => {
    setConfirmOpen(false);
    onClose(); 
    handleNavigation();
  };
const onClose = () => {
  setConfirmOpen(false);
}
  const handleConfirmNo = () => {
    setConfirmOpen(false);
    onClose(); 
  };
  const handleMapClick = async (event) => {
    const clickedLocation = event.latLng;
    const lat = clickedLocation.lat();
    const lng = clickedLocation.lng();
    setMarkerPosition({ lat, lng });
    setCenter({ lat, lng });
   // alert(`Lattitude:${lat},Longitude: ${lng}`);
    getWard(lat,lng);
    try {
      const address = await getPlaceDetails(lat, lng);
      setAddress(address);
      // alert(`Address ${address}`);
      //if (onLocationChange) onLocationChange({ lat, lng, address });
    } catch (error) {
      alert('Failed to fetch place details');
    }
  };

  const getPlaceDetails = (lat, lng) => {
    return new Promise((resolve, reject) => {
      const request = {
        location: { lat, lng },
        radius: '50',
      };

      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
          const placeId = results[0].place_id;
          getPlaceAddress(placeId, resolve, reject);
        } else {
          reject('No results found');
        }
      });
    });
  };

  const getPlaceAddress = (placeId, resolve, reject) => {
    const request = {
      placeId,
      fields: ['formatted_address'],
    };

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    service.getDetails(request, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        resolve(place.formatted_address);
      } else {
        reject(`Place details request failed due to: ${status}`);
      }
    });
  };

  useEffect(() => {
    if (isLoaded && inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          alert("Cannot locate the place on the map.");
          return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarkerPosition({ lat, lng });
        setAddress(place.formatted_address);
        setCenter({ lat, lng });
      //  alert(`Lattitude:${lat},Longitude:${lng}`);
        getWard(lat,lng);
        // alert(`Address ${place.formatted_address}`);
        //if (onLocationChange) onLocationChange({ lat, lng, address: place.formatted_address });
      });
    }
  }, [isLoaded]);
  const handleGoButtonClick = () => {
    if (isLoaded && inputRef.current) {
      const query = inputRef.current.value; // Get the text from the input field
      const service = new window.google.maps.places.PlacesService(mapRef.current);
  
      service.textSearch({ query }, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
          const place = results[0];
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
  
          setMarkerPosition({ lat, lng });
          setAddress(place.formatted_address);
          setCenter({ lat, lng });
  
       //   alert(`Latitude: ${lat}, Longitude: ${lng}`);
          // alert(`Address: ${place.formatted_address}`);
          getWard(lat,lng);
       //   if (onLocationChange) {
        //    onLocationChange({ lat, lng, address: place.formatted_address });
       //   }
        } else {
          alert(`Cannot locate '${query}' on the map`);
        }
      });
    }
  };
  const pointInPolygon = (latitude, longitude, polygon) => {
    const n = polygon.length;
    let inside = false;

    const x = new Array(n);
    const y = new Array(n);

    for (let i = 0; i < n; i++) {
      const coord = polygon[i];
      x[i] = coord[0];
      y[i] = coord[1];
    }

    for (let i = 0, j = n - 1; i < n; j = i++) {
      if ((y[i] > latitude) !== (y[j] > latitude) &&
          (longitude < (x[j] - x[i]) * (latitude - y[i]) / (y[j] - y[i]) + x[i])) {
        inside = !inside;
      }
    }

    return inside;
  };
  const getWard = async (lat, lon) => {
    debugger
    try {
     // const response = await fetch('\ward_boundaries.json'); 
    const response = ward_boundaries;
    //  if (!response.ok) throw new Error('Network response was not ok');

     // const data = await response.json();
      const features = response.features;

      const foundNearbyWards = []; // Temporary array for nearby wards

      for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        const geometry = feature.geometry;

        if (geometry.type === "MultiPolygon") {
          const coordinates = geometry.coordinates;
          for (let j = 0; j < coordinates.length; j++) {
            const polygon = coordinates[j][0]; // Accessing the first polygon
            if (pointInPolygon(lat, lon, polygon)) {
              const wardName = feature.properties.WARD_NAME;
              const wardNo = feature.properties.WARD_NO.toString();
              setWardName(wardName);
              setWardNumber(wardNo);
              setConfirmOpen(true)
            } else {
              // If the point is outside, calculate the distance
              const nearestDistance = getNearestDistance(lat, lon, polygon);
              if (nearestDistance <= 500) { // If within 500 meters
                foundNearbyWards.push({
                  wardName: feature.properties.WARD_NAME,
                  wardNo: feature.properties.WARD_NO,
                  distance: nearestDistance
                });
              }
            }
          }
        }
      }
      setNearbyWards(foundNearbyWards); // Update state with nearby wards
    } catch (error) {
      console.error('Error fetching ward data:', error);
    }
  };
const handleNavigation =async  () =>{
  try {
    debugger
    if(wardNumber === "Not Found"){
        alert("Please Search or Select your Location on Map");
        return
    }
   var response1 = await axiosInstance.get("BBMPCITZAPI/GET_WARD_BY_WARDNUMBER?wardNumber=" + wardNumber)
  // let ward =  setWardData(response1.data.Table)
  if(response1.data.Table.length !== 0){
  localStorage.setItem('DraftZoneId', JSON.stringify(response1.data.Table[0].ZONEID));
    localStorage.setItem('DraftWardId', JSON.stringify(response1.data.Table[0].WARDID));
    localStorage.setItem("userProgress", 2);
    localStorage.setItem("FromGoogleMaps","1")
    navigate('/PropertyList')
  }
  else{
    alert("No Zone and Ward Found")
    return
  }
  }
    catch(error)
    {
      console.log(error)
    }
}
  // Find the nearest distance from a point to a polygon's vertices
  const getNearestDistance = (lat, lon, polygon) => {
    let minDistance = Infinity;

    for (let i = 0; i < polygon.length; i++) {
      const [vertexLon, vertexLat] = polygon[i];
      const distance = getDistance(lat, lon, vertexLat, vertexLon);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    return minDistance;
  };

  // Haversine formula to calculate the distance between two lat/lon points
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * (Math.PI / 180);
    const φ2 = lat2 * (Math.PI / 180);
    const Δφ = (lat2 - lat1) * (Math.PI / 180);
    const Δλ = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters
    return distance;
  };
  return isLoaded ? (
    
    <div className="map-container">
      
      <Typography
          variant="h6"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontFamily: "sans-serif",
            marginBottom: 3,
            color: '#1565c0',
            fontSize: {
              xs: '.2rem',
              sm: '2rem',
              md: '2rem',
            }
          }}
        >
        
        Welcome to Faceless, Contactless, Online enmass eKhata Issuance System
        </Typography>
        <Typography
          variant="h6"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontFamily: "sans-serif",
            marginBottom: 3,
            color: '#1565c0',
            fontSize: {
              xs: '.2rem',
              sm: '2rem',
              md: '2rem',
            }
          }}
        >
        
       Select your Property
        </Typography>
      <div className="input-section">
        <input
          id="pac-input"
          type="text"
          placeholder="Enter a location"
          ref={inputRef}
          className="location-input"
        />
        <button id="go-button" className="go-button" type="button" onClick={handleGoButtonClick}>Go</button>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        mapTypeId='hybrid'
      >
        <MarkerF position={markerPosition} />
      </GoogleMap>

      {/* <div className="result-section"  onClick={handleNavigation}>
     
        <div className="nearby-ward-card">
          <div id="result1" className="ward-name">Ward Name: {wardName}</div>
          <div id="result2" className="ward-number">Ward No: {wardNumber}</div>
        </div>
      </div> */}
        <Dialog open={confirmOpen} onClose={handleConfirmNo} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography variant="h5">The selected Property Belongs to <span style={{ color: 'red' }}>'{wardName}'</span> Ward and Ward Number is  <span style={{ color: 'red' }}>{wardNumber}</span>. Do you wish to continue ? </Typography>
        
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmYes} color="primary">{("Yes")}</Button>
          <Button onClick={handleConfirmNo} color="secondary">{("No")}</Button>
        </DialogActions>
      </Dialog>
    </div>
  ) : <></>;
};
export default GoogleMapsWardCoordinates;
