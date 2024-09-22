import React, { useState, useEffect } from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import axios from 'axios'; // Importa axios

MapboxGL.setAccessToken('YOUR_MAPBOX_ACCESS_TOKEN'); // Reemplaza esto con tu token

const App = () => {
  const [coordinates, setCoordinates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [centerCoordinate, setCenterCoordinate] = useState([-58.37723, -34.61315]);

  useEffect(() => {
    const fetchStreetClosures = async () => {
      try {
        const response = await axios.get('YOUR_WAZE_API_URL', {
          headers: {
            'Authorization': 'Bearer YOUR_ACCESS_TOKEN' // Reemplaza con tu token
          }
        });

        // Procesa los datos según la estructura que devuelva la API
        const closures = response.data.closures.map(closure => ({
          lat: closure.lat, // Ajusta según la respuesta de la API
          lng: closure.lng, // Ajusta según la respuesta de la API
          reason: closure.reason, // Ajusta según la respuesta de la API
          area: closure.area // Ajusta según la respuesta de la API
        }));
        setCoordinates(closures);
      } catch (error) {
        console.error('Error al obtener datos de Waze:', error);
      }
    };

    fetchStreetClosures();
    const interval = setInterval(fetchStreetClosures, 30000);
    return () => clearInterval(interval);
  }, []);

  const areaCoordinates = {
    'san nicolás': [-58.37723, -34.611],
    'balvanera': [-58.380, -34.615],
    // Agrega más barrios y sus coordenadas aquí
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    const lowerCaseText = text.toLowerCase();
    if (areaCoordinates[lowerCaseText]) {
      setCenterCoordinate(areaCoordinates[lowerCaseText]);
    }
  };

  return (
    <View style={styles.page}>
      <TextInput
        style={styles.searchBox}
        placeholder="Ponga aquí su barrio/municipio"
        value={searchTerm}
        onChangeText={handleSearch}
      />
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera
          zoomLevel={13}
          centerCoordinate={centerCoordinate}
        />
        {coordinates.map((closure, index) => (
          <MapboxGL.PointAnnotation
            key={index}
            id={`closure-${index}`}
            coordinate={[closure.lng, closure.lat]}
          >
            <View style={styles.marker}>
              <Text style={styles.markerText}>⚠</Text>
            </View>
            <MapboxGL.Callout title={`Corte: ${closure.reason}`} />
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchBox: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  marker: {
    backgroundColor: 'red',
    borderRadius: 5,
    padding: 5,
  },
  markerText: {
    color: 'white',
  },
});

export default App;
