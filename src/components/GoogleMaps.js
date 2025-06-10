import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF  } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};


const libraries = ['places'];
const GoogleMaps = ({ lat,long,onLocationChange }) => {
  
  
  const [center, setCenter] = useState({
    lat: parseFloat(lat),
    lng: parseFloat(long)
  });
  

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyBdb9a4LIj6aaLdxOB47HRZKD8ouOB344Q" ,// Replace with your API key
    libraries
  });

 
  const [markerPosition, setMarkerPosition] = useState(center);
  const [address, setAddress] = useState('');
  const inputRef = useRef(null);
  const mapRef = useRef(null);

  const onLoad = useCallback(function callback(map) {
    mapRef.current = map;
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
  }, [center]);

  const onUnmount = useCallback(function callback(map) {
    // Clean up function when map unmounts
  }, []);

  const handleMapClick = async (event) => {
    const clickedLocation = event.latLng;
    const lat = clickedLocation.lat();
    const lng = clickedLocation.lng();
    setMarkerPosition({ lat, lng });
    setCenter({ lat, lng });
    alert(`Lattitude:${lat},Longitude: ${lng}`);
    try {
      const address = await getPlaceDetails(lat, lng);
      setAddress(address);
      alert(`Address ${address}`);
      if (onLocationChange) onLocationChange({ lat, lng, address });
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
        alert(`Lattitude:${lat},Longitude:${lng}`);
        alert(`Address ${place.formatted_address}`);
        if (onLocationChange) onLocationChange({ lat, lng, address: place.formatted_address });
      });
    }
  }, [isLoaded,onLocationChange]);
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
  
          alert(`Latitude: ${lat}, Longitude: ${lng}`);
          alert(`Address: ${place.formatted_address}`);
  
          if (onLocationChange) {
            onLocationChange({ lat, lng, address: place.formatted_address });
          }
        } else {
          alert(`Cannot locate '${query}' on the map`);
        }
      });
    }
  };
  
  return isLoaded ? (
    <div>
      <input
        id="pac-input"
        type="text"
        placeholder="Enter a location"
        ref={inputRef}
        style={{ width: "90%", margin: "15px", height: "30px" }}
      />
       <button id="go-button" type="button" onClick={handleGoButtonClick}>Go</button>
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
      <div id="place-address">{address}</div>
    </div>
  ) : <></>;
};

export default GoogleMaps;
