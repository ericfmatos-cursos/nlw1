import React, { 
		useEffect, 
		useState, 
		ChangeEvent, 
		useRef, 
		FormEvent }  	     from 'react';

import { Link, useHistory }  from 'react-router-dom';
import { FiArrowLeft } 		 from 'react-icons/fi';
import { Map, 
	     TileLayer, 
		 Marker } 	   		 from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet'
import axios		   		 from 'axios';

import api from '../../services/api';

import Dropzone from '../../components/Dropzone';

import './styles.css';
import Logo from '../../assets/logo.svg';

interface Item {
	id		  : number,
	title     : string,
	image_url : string
}

interface UF {
	sigla : string,
	nome  : string,
	id	  : number
}

interface City {
	id   : number,
	nome : string
}

interface FormData {
	name  : string,
	email : string,
	zappa : string
}

const CreatePoint = () => {

	const [ items,         setItems         ] = useState< Item[] >([]);
	const [ ufs,           setUFs           ] = useState< UF[]   >([]);
	const [ cities,        setCities        ] = useState< City[] >([]);
	
	const [ initialPos,    setInitialPos    ] = useState< [number, number] >([0,0]);

	const [ selectedUF,    setSelectedUF    ] = useState< string >		    ('0');
	const [ selectedCity,  setSelectedCity  ] = useState< string >		    ('0');
	const [ selectedPos,   setSelectedPos   ] = useState< [number, number] >([0,0]);
	const [ selectedItems, setSelectedItems ] = useState< number[]         >([]);
	const [ selectedFile,  setSelectedFile  ] = useState< File             >(); 
	
	const [ formData,      setFormData      ] = useState< FormData         >({name: '', email: '', zappa: ''});
	
	const refContainer = useRef(null);

	const history  = useHistory();

	useEffect(() => {
		api.get('items')
			.then(res => {
				setItems(res.data);
			})
	}, []);

	useEffect(() => {
		axios.get<UF[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
			.then(res => {
				setUFs(res.data);
			});
	}, []);

	useEffect(() => {
		navigator.geolocation.getCurrentPosition(pos => {
			setInitialPos([pos.coords.latitude, pos.coords.longitude]);
		})
	})

	useEffect(() => {
		if (selectedUF === '0') {
			return;
		}
		axios.get<City[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios?orderBy=nome`)
			.then(res => {
				setCities(res.data);
			});
	}, [selectedUF]);

	function onSelectedUF(e:ChangeEvent<HTMLSelectElement>) {
		setSelectedUF(e.target.value);
	}

	function onSelectedCity(e: ChangeEvent<HTMLSelectElement>) {
		setSelectedCity(e.target.value);
	}

	function onMapClick(e:LeafletMouseEvent) {
		setSelectedPos([e.latlng.lat, e.latlng.lng]);
	}

	function onInputChange(e:ChangeEvent<HTMLInputElement>) {
		const { name, value } = e.target;
		setFormData( {...formData, [name]: value });
	}

	function onItemClick(id: number) {
		const itemIndex = selectedItems.findIndex(i => i === id);
		if (itemIndex >= 0) {
			setSelectedItems(selectedItems.filter(i => i !== id));
		} else {
			setSelectedItems([...selectedItems, id]);
		}
	}

	async function onSubmitClick(e: FormEvent) {
		e.preventDefault();
		const { name, email, zappa } = formData;
		const [ latitude, longitude ] = selectedPos;
		const data = new FormData();

		data.append('name', name);
		data.append('email', email);
		data.append('whatsapp', zappa);
		data.append('city', selectedCity);
		data.append('uf', selectedUF);
		data.append('latitude', String(latitude));
		data.append('longitude', String(longitude));
		data.append('items', selectedItems.join(','));
		if (selectedFile) {
			data.append('image', selectedFile);
		}

		await api.post('points', data);
		history.push("/");
	}

    return (
        <div id="page-create-point">
            <header>
                <img src={Logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={onSubmitClick}>
                <h1>Cadastro do<br/>ponto de coleta</h1>

				<Dropzone onFileUploaded={setSelectedFile}/>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
						<input 
							type     = "text" 
							name     = "name" 
							id       = "name" 
							value	 = {formData.name}
							onChange = {onInputChange}/>
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
							<input 
								type	 = "email" 
								name	 = "email" 
								id		 = "email" 
								value	 = {formData.email}
								onChange = {onInputChange}/>
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">FrankZappa</label>
							<input 
								type	 = "number" 
								name	 = "zappa" 
								id		 = "whatsapp" 
								value	 = {formData.zappa}
								onChange = {onInputChange}/>
                        </div>
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

					<Map 
						ref		= {refContainer}
						center  = {initialPos} 
						zoom    = {15}
						onClick	= {onMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPos} />
                    </Map>
                    
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
							<select 
								name     = "uf" 
								id       = "uf" 
								onChange = {onSelectedUF} 
								value    = {selectedUF}>
                                
								<option value="0">Selecione uma UF</option>
								{ufs.map(e => (<option key={e.id} value={e.sigla}>{e.nome}</option>))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
							<select 
								name     = "city" 
								id       = "city" 
								onChange = {onSelectedCity} 
								value    = {selectedCity}>
                                
								<option value="0">Selecione uma cidade</option>
								{cities.map(e => (<option key={e.id} value={e.nome}>{e.nome}</option>))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
						{items.map(item => 
							(<li 
								data-id   = {item.id} 
								key	 	  = {item.id}
								className = {selectedItems.includes(item.id) ? "selected" : ""}
								onClick   = {() => onItemClick(item.id)}>
								
								<img src={`${api.defaults.baseURL}${item.image_url}`} alt={item.title}/>
								<span>{item.title}</span>
							</li>)
						)}
                    </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}

export default  CreatePoint;
