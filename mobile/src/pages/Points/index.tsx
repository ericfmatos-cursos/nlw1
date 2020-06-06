import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons'
import Constants from 'expo-constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg'
import * as Location from 'expo-location';

import api from '../../services/api';

interface Item {
  id        : number,
  title     : string,
  image_url : string
}

interface Position {
  latitude  : number,
  longitude : number
}

interface PointData {
  id        : number,
  image_url : string,
  name      : string,
  latitude  : number,
  longitude : number
}

interface RouteParams {
  city : string,
  uf   : string
}

const Point = () => {
  const navigation   = useNavigation();
  const route        = useRoute();
  const route_params = route.params as RouteParams;
  
  const [ items,      setItems      ] = useState <Item[]  > ([]);
  const [ initialPos, setInitialPos ] = useState <Position> ();
  const [ points,     setPoints     ] = useState <PointData[]>  ([]);

  const [ selectedItems, setSelectedItems ] = useState<number[]>([-1]);

  useEffect(() => {
    api.get('items').then((res) => {
      setItems(res.data);
    })
  }, []);

  useEffect(() => {
    async function loadPosition() {
      const { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Deu ruim!', 'Precisamos de sua permissão para obter sua localização');
        return;
      }

      const location = await Location.getCurrentPositionAsync();
      const { latitude, longitude } = location.coords;
      setInitialPos({latitude, longitude});
    }
    loadPosition();
  }, [])

  useEffect(() => {
    api.get('points', {
      params: {
        city      : route_params.city,
        uf        : route_params.uf,
        items     : selectedItems
      }
    }).then (res => {
      setPoints(res.data);
    })
  }, [selectedItems])

	function onItemClick(id: number) {
		const itemIndex = selectedItems.findIndex(i => i === id);
		if (itemIndex >= 0) {
			setSelectedItems(selectedItems.filter(i => i !== id));
		} else {
			setSelectedItems([...selectedItems, id]);
		}
	}

  function handleNavigateBack() {
    navigation.goBack();
  }

  function handleNavigateToDetail(id: number) {
    navigation.navigate("Detail", { point_id : id});
  }

  return (
      <>
        <View style={styles.container}>
          <TouchableOpacity onPress={handleNavigateBack}>
            <Icon name="arrow-left" size={20} color="#34cb79"></Icon>
          </TouchableOpacity>
          <Text style={styles.title}>Bem vindo.</Text>
          <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

          <View style={styles.mapContainer}>
            { (initialPos) && (
              <MapView 
              style          = { styles.map } 
              initialRegion  = {
                {
                  latitude       : initialPos.latitude, 
                  longitude      : initialPos.longitude,
                  latitudeDelta  : 0.014,
                  longitudeDelta : 0.014
                }
              }>
              {points.map(_point => (
                 <Marker 
                  key        = {String(_point.id)}
                  style      = {styles.mapMarker}
                  onPress    = {() => {handleNavigateToDetail(_point.id)}}
                  coordinate = {{
                    latitude       : _point.latitude, 
                    longitude      : _point.longitude}}>
                 <View style={styles.mapMarkerContainer}>
                   <Image style={styles.mapMarkerImage} source={{uri: `${api.defaults.baseURL}${_point.image_url}`}}></Image>
                   <Text style={styles.mapMarkerTitle}>{_point.name}</Text>
                 </View>
                 
               </Marker>
              ))}
            </MapView>
            )  }
          </View>
        </View>
        
        <View style={styles.itemsContainer}>
          <ScrollView 
            horizontal 
            contentContainerStyle          = {{paddingHorizontal: 20}}
            showsHorizontalScrollIndicator = {false} >
              
            {items.map(item => {
              return (
                  <TouchableOpacity 
                    key           = {String(item.id)} 
                    style         = {[styles.item, selectedItems.includes(item.id) ? styles.selectedItem : {}]} 
                    activeOpacity = {0.6}
                    onPress       = {() => onItemClick(item.id)}>
                    <SvgUri width={42} height={42} uri={`${api.defaults.baseURL}${item.image_url}`}></SvgUri>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                  </TouchableOpacity>
                )
              })
            }
           
          </ScrollView>
        </View>
        
      </>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80, 
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});


export default Point;