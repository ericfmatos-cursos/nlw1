import React, { useEffect, useState } from 'react';
import { View, ImageBackground, Image, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { Feather as Icon } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';


interface UF {
	sigla : string,
	nome  : string,
	id	  : number
}

interface City {
	id   : number,
	nome : string
}


const Home = () => {
  const navigation = useNavigation();

  const [ ufs,     setUFs     ] = useState< UF[]   >	([]);
  const [ cities,  setCities  ] = useState< City[] >  ([]);

  const [ selectedUF,    setSelectedUF    ] = useState< string >		  ('0');
	const [ selectedCity,  setSelectedCity  ] = useState< string >		  ('0');

  function handleNavigationToPoints() {
    navigation.navigate("Points", { uf: selectedUF, city: selectedCity });
  }

  function onSelectedUF(val:string) {
      val && setSelectedUF(val);
  }

  function onSelectedCity(val:string) {
    val && setSelectedCity(val);
  }

  useEffect(() => {
		if (selectedUF === '0') {
			return;
		}
		axios.get<City[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios?orderBy=nome`)
			.then(res => {
				setCities(res.data);
			});
	}, [selectedUF]);

  useEffect(() => {
		axios.get<UF[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
			.then(res => {
				setUFs(res.data);
			});
	}, []);

    return (
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ImageBackground 
            style      = {styles.container} 
            source     = {require('../../assets/home-background.png')} 
            imageStyle = {{ width: 274, height: 368 }}> 

            <View style={styles.main}>
                <Image source={require('../../assets/logo.png')} />
                <View>
                  <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
                  <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
                </View>
            </View>
            
            <RNPickerSelect
              key="uf"
              placeholder={{label:"Selecione um estado..."}}
              onValueChange={(val) => onSelectedUF(val)} 
              value={selectedUF}
              items={ufs.map(uf => { return { key: uf.id, label: uf.nome, value: uf.sigla }})}
              style={pickerSelectStyles}
              Icon={() => {return <Icon name="chevron-down" style={{paddingTop: 6, paddingRight: 2}} color="#6C6C80" size={48}></Icon>}}
              >
            </RNPickerSelect>

            <RNPickerSelect
              key="city"
              onValueChange={(val) => onSelectedCity(val)} 
              placeholder={{label:"Selecione uma cidade..."}}
              value={selectedCity}
              items={ cities.map(city => { return {  label: city.nome, value: city.nome }})  }
              style={pickerSelectStyles}
              Icon={() => {return <Icon name="chevron-down" style={{paddingTop: 6, paddingRight: 2}} color="#6C6C80" size={48}></Icon>}}
              >
            </RNPickerSelect>

            <View style={styles.footer}>
                <RectButton style={styles.button} onPress={handleNavigationToPoints}>
                    <View style={styles.buttonIcon}>
                        <Text>
                            <Icon name="arrow-right" color="#FFF" size={24}></Icon>
                        </Text>
                    </View>
                    <Text style={styles.buttonText}>Entrar</Text>
                </RectButton>
            </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
    },
  
    main: {
      flex: 1,
      justifyContent: 'center',
    },
  
    title: {
      color: '#322153',
      fontSize: 32,
      fontFamily: 'Ubuntu_700Bold',
      maxWidth: 260,
      marginTop: 64,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 16,
      fontFamily: 'Roboto_400Regular',
      maxWidth: 260,
      lineHeight: 24,
    },
  
    footer: {},
  
    select: {},
  
    input: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  
    button: {
      backgroundColor: '#34CB79',
      height: 60,
      flexDirection: 'row',
      borderRadius: 10,
      overflow: 'hidden',
      alignItems: 'center',
      marginTop: 8,
    },
  
    buttonIcon: {
      height: 60,
      width: 60,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      color: '#FFF',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    }
  });


  const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,

      paddingVertical: 12,
      borderWidth: 1,
      borderColor: '#34CB79',
      color: '#6C6C80',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,

      paddingVertical: 8,
      borderWidth: 0.5,
      borderColor: '#34CB79',
      color: '#6C6C80',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
  });
export default Home;