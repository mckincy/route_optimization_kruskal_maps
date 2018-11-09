import axios from 'axios';
import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
var api_key_maps = require('./../../google_api_key.js').api_key_maps;
import {TransportSummary} from './transport_summary.jsx'

import styled from 'styled-components'

const Title = styled.h1`
  font-size: 2em;
  padding: 0.15em 0.5em;
  height: 2.0em;
  background:teal;
  color:white;
`;

const SubTitle = styled.h2`
  font-size: 1em;
  padding: 0.15em 0.5em;
  height: 2.0em;
  background:#2f3542;
  color:white;
  text-align: left;
  vertical-align:middle;
  margin: 0.15em;
`;

const Right_Box = styled.div`
  font-size: 1.5em;
  text-align: center;
  color: black;
  float:right;
  width: 23.0em;
  border: 1px solid;
`;

const Transport_Box = styled.div`
  font-size: 0.8em;
  text-align: left;
  color: black;
  width: 23.0em;
  margin: 0.18em;
  height: 14.0em;
  float:top;
`;

const AnyReactComponent = ({ text }) => <div classname='any'>{text}</div>;

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      myMarkers:[],
      company:'FirstTruckCompany',
      center: {lat: 19.434940, lng: -99.195697},
      zoom:12,
    }
  }

  componentDidMount(){
    this.get_transports_from_company(this.state.componentDidMount);
  }


  //method to get all the transports from a given company
  get_transports_from_company(){
    //url is /groceries because by default is not specified. Try with ajax.
    axios.get(`/trucks/companies/:${this.state.company}`).then((results) => {
      console.log(results.data); this.setState({myMarkers:results.data})
    }).catch(err => 
    console.log(err,'error fetching transports from company'));
  }

  render() {

    const Marker = ({text}) => {
        return (
              <div style={{fontWeight: 'normal'}, {fontSize: 10}}>
                <b>{text}</b>
                <img src={'http://www.hino.com/images/195_diesel_crewcab_3qtr_ghs3176_final-crop-u18340.png?crc=4010437874'} width="50"/>
              </div>
        );
    }

    const apiIsLoaded = (map,maps) => {
        const directionsService = new maps.DirectionsService();
        const directionsDisplay = new maps.DirectionsRenderer();
        directionsService.route({
          origin: 'Av 565 145, San Juan de Aragón II Secc, 07969 Ciudad de México, CDMX, Mexico',
          destination: 'Piña MZ3 LT8, Ampliacion Lopez Portillo, 13400 Ciudad de México, CDMX, Mexico',
          travelMode: 'DRIVING'
        }, (response, status) => {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
            console.log(response.routes[0].overview_path, 'Ruta')
            const routePolyline = new google.maps.Polyline({
              path: response.routes[0].overview_path
            });
            routePolyline.setMap(map);
          } else {
            window.alert('Directions request failed due to ' + status);
            }
          });
    };

    const listItems = this.state.myMarkers.map((transport) =>
      <li key={transport.id}>
        {transport.id} {transport.text} ubicacion:{transport.lat},{transport.lng}
      </li>
    );

    return (
      // Important! Always set the container height explicitly
      <div>
        <Title> Leanit Fleet </Title>
        <Right_Box>
          <SubTitle>Resumen de transportes</SubTitle>
          <ul>{listItems}</ul>
        </Right_Box>
        <div style={{ height: '100vh', width: '65%' }}>
          <GoogleMapReact bootstrapURLKeys={{ key: api_key_maps}} 
            defaultCenter={this.state.center} 
            defaultZoom={this.state.zoom} 
            yesIWantToUseGoogleMapApiInternals 
            onGoogleApiLoaded={({ map, maps }) => apiIsLoaded(map, maps)}>
             {
            //Add a list of Markers to Your Map
            this.state.myMarkers.map( (each) =>
              <Marker 
                lat = {each.lat}
                lng = {each.lng}
                text = {each.text}
              />
            )
          }      
          </GoogleMapReact> 
        </div>
      </div>
    );
  }
}

//<TransportSummary transports={this.state.myMarkers}/>
export default App;