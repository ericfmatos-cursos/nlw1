import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { Feather as Icon, FontAwesome as FA } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native';
import * as MailComposer from 'expo-mail-composer';

import api from '../../services/api';

interface RouteParams {
  point_id : number
}

interface Point {
  point: {
    id        : number,
    image_url : string,
    name      : string,
    email     : string,
    whatsapp  : string,
    latitude  : number,
    longitude : number,
    city      : string,
    uf        : string
  },
  items: {
    title : string,
    id    : number
  }[]
}

const Detail = () => {
  const navigation   = useNavigation();
  const route        = useRoute();
  const route_params = route.params as RouteParams;

  const [ data, setPoint ] = useState<Point>({} as Point);

  useEffect(() => {
    api.get(`points/${route_params.point_id}`)
      .then(res => setPoint(res.data));
  }, [])

  function handleNavigateBack() {
    navigation.goBack();
  }

  if (!data.point) {
    return null;
  }

  function onComposeMail() {
    MailComposer.composeAsync({
      subject    : 'Interesse na coleta de resíduos',
      recipients : [data.point.email]
    });
  }

  function onZappa() {
    Linking.openURL(`whatsapp://send?phone=${data.point.whatsapp}&text=Lorem ipsum`);
  }

    return (
      <SafeAreaView style={{flex:1}}> 
        <View style={styles.container}>
          <TouchableOpacity onPress={handleNavigateBack}>
            <Icon name="arrow-left" size={20} color="#34cb79"></Icon>
          </TouchableOpacity>

          <Image style={styles.pointImage} source={{uri: `${api.defaults.baseURL}${data.point.image_url}`}}></Image>

          <Text style={styles.pointName}>{data.point.name}</Text>
          <Text style={styles.pointItems}>{data.items.map(e => e.title).join(", ")}</Text>

          <View style={styles.address}>
            <Text style={styles.addressTitle}>Endereço</Text>
            <Text style={styles.addressContent}>{data.point.city}, {data.point.uf}</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <RectButton style={styles.button} onPress={onZappa}>
            <FA name="whatsapp" size={20} color="#FFF"></FA>
            <Text style={styles.buttonText}>FrankZappa</Text>
          </RectButton>
          <RectButton style={styles.button} onPress={onComposeMail}>
            <Icon name="mail" size={20} color="#FFF"></Icon>
            <Text style={styles.buttonText}>Imeio</Text>
          </RectButton>
        </View>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    paddingTop: 20,
  },

  pointImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 32,
  },

  pointName: {
    color: '#322153',
    fontSize: 28,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  pointItems: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80'
  },

  address: {
    marginTop: 32,
  },
  
  addressTitle: {
    color: '#322153',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  },

  addressContent: {
    fontFamily: 'Roboto_400Regular',
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80'
  },

  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  
  button: {
    width: '48%',
    backgroundColor: '#34CB79',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    marginLeft: 8,
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
  },
});
export default Detail;