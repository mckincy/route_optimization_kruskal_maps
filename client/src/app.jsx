import axios from 'axios';
import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
var api_key_maps = require('./../../google_api_key.js').api_key_maps;
import {Algorithms} from './algorithms.jsx';
import ReactLoading from 'react-loading';
import styled from 'styled-components';
import {Grid, Col, Row} from 'react-styled-flexboxgrid'

const Title = styled.h1`
  font-size: 1em;
  padding: 0.15em 0.5em;
  height: 2.0em;
  background:teal;
  color:white;
`;

const SubTitle = styled.h2`
  font-size: 1.0em;
  padding: 0.15em 0.5em;
  height: 1.0em;
  background:#2f3542;
  color:white;
  text-align: left;
  vertical-align:middle;
  margin: 0.15em;
`;

const List_item = styled.li`
  font-size: 0.8em;
  text-align: left;
`;

const div_item = styled.div`
  font-size: 0.8em;
  text-align: left;
`;

const Right_Box = styled.div`
  text-align: left;
  color: black;
  float:right;
  width: 16.0em;
  margin-top: 0.7em;
  margin-right: 1.5em;
`;

const Waiting_box = styled.div`
  font-size: 1em;
  text-align: center;
  color: white;
  background:#2f3542;
  float:left;
  width: 10.0em;
  margin: 0.18em;
  border: 1px solid;
`;

const Transport_Box = styled.div`
  font-size: 0.3em;
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
      routes:[],
      times:[],
      items_to_deliver:[],
      locations:[],
      chosen_algorithm: '',
      algorithms_available: ['K-means and Kruskal', 'Kirk Genetic Algorithm', 'Christofides'],
      total_time: 0
    }
    this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
  }

  forceUpdateHandler(){
    this.forceUpdate();
    console.log('se ha updateado')
  };

  componentDidMount(){
    this.get_transports_from_company(this.state.componentDidMount);
    this.get_routes_optimization();
    this.get_items_to_deliver();
    this.get_locations();
  }

  //method to get all the transports from a given company
  get_transports_from_company(){
    //url is /groceries because by default is not specified. Try with ajax.
    axios.get(`/trucks/companies/:${this.state.company}`).then((results) => {
      console.log(results.data); this.setState({myMarkers:results.data})
    }).catch(err => 
    console.log(err,'error fetching transports from company'));
  }

  get_items_to_deliver(){
    axios.get('/items').then((results) => {
      console.log(JSON.stringify(results.data), 'items to deliver')
      this.setState({items_to_deliver:results.data})
    }).catch(err => 
    console.log(err,'error fetching items to deliver'));
  }

  get_locations(){
    axios.get('/locations').then((results) => {
      console.log(results.data, 'locations')
      this.setState({locations:results.data})
    }).catch(err => 
    console.log(err,'error fetching locations'));
  }

  get_routes_optimization(){
    //url is /groceries because by default is not specified. Try with ajax.
    axios.get('http://localhost:5000/alldistances').then((results) => {
      console.log(JSON.parse(results.data).map(function(value,index) { return value[0]; }), 'ruta optima');
      this.setState({routes:JSON.parse(results.data).map(function(value,index) { return value[0]; })})
      this.setState({times:JSON.parse(results.data).map(function(value,index) { return value[1]; })})
      console.log(this.state.times, 'times');
      this.setState({total_time:parseFloat(this.state.times.reduce((a, b) => Number(a) + Number(b), 0)).toFixed(2)});
      console.log(this.state.total_time, 'total time');
      this.forceUpdateHandler()
    }).catch(err => 
    console.log(err,'error fetching transports from company'));
  }

  sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  render() {

    console.log('render se llamo', this.state.items_to_deliver)
    const Marker = ({text}) => {
        return (
              <div style={{fontWeight: 'normal'}, {fontSize: 10}}>
                <b>{text}</b>
                <img src={'http://www.hino.com/images/195_diesel_crewcab_3qtr_ghs3176_final-crop-u18340.png?crc=4010437874'} width="50"/>
              </div>
        );
    }

   var getRandomColor = () => {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
    }

    var apiIsLoaded = (map,maps) => {
        //Render each route
        this.state.locations.map(function(location, index){
          var myLatlng = new google.maps.LatLng(location[0],location[1]);
          var marker = new maps.Marker({
          position: myLatlng,
          label:String(index)
          });
          marker.setMap(map);
        })

        this.state.routes.map(function(route){
          setTimeout(function (){
            console.log('apis loadaed se llamo')
          }, 500)
          var delay_factor = 200
          var route_color = getRandomColor()
          route.map(function(origin_destination){
            const directionsService = new maps.DirectionsService();
            const directionsDisplay = new maps.DirectionsRenderer();
            // console.log("'"+origin_destination[1].replace('[','').replace(']','')+"'", 'origin_destination')
            //set up the latLang of the origin
            var origin = origin_destination[0].replace('[','').replace(']','')+"'".split(',')

            origin = Number(origin.split(',')[0]) + ', ' + Number(origin.split(',')[1].replace("'",''))

            var destination = origin_destination[1].replace('[','').replace(']','')+"'".split(',')
            destination = Number(destination.split(',')[0]) + ', ' + Number(destination.split(',')[1].replace("'",''));
            
            var request = {
              origin:origin, 
              destination:destination,
              travelMode: maps.DirectionsTravelMode.DRIVING
            };

            setTimeout(function () {
              directionsService.route(request
              , (response, status) => {
              if (status === 'OK') {
                directionsDisplay.setDirections(response);
                console.log(response.routes[0].overview_path, 'Ruta')
                const routePolyline = new google.maps.Polyline({
                  path: response.routes[0].overview_path,
                  strokeColor: route_color,
                  strokeWeight: 3
              });
                routePolyline.setMap(map);
              } else {
                window.alert('Directions request failed due to ' + status);
              }
            });
            }, delay_factor * 2000);
          delay_factor++
          })  
        })
    };

    const listTransports = this.state.myMarkers.map((transport) =>
      <List_item key={transport.id}>
        {transport.id} {transport.text} ubicacion:{transport.lat},{transport.lng}
      </List_item>
    );

    const listItems = this.state.items_to_deliver.map((item) =>
      <List_item key={item}>
        {item}
      </List_item>
    );

    return (
      // Important! Always set the container height explicitly
      <div>
        <Title> Kruskal route optimization using Google Maps API </Title>
          <select>
            <option selected value={this.state.algorithms_available[0]}>{this.state.algorithms_available[0]}</option>
            <option value={this.state.algorithms_available[1]}>{this.state.algorithms_available[1]}</option>
            <option value={this.state.algorithms_available[2]}>{this.state.algorithms_available[2]}</option>
          </select>
        <Right_Box>
          <Grid>
            <Row>
              <Col xs={6} md={3}>
              <SubTitle>Available transports</SubTitle>
              <ul>{listTransports}</ul>
              </Col>
            </Row>
            <Row>
            <Col xs={6} md={3}>
              <SubTitle>Total time of routes</SubTitle>
              <div_item>
                {this.state.times.length !== 0 ?    
                  this.state.total_time:
                ''}
              </div_item>
              </Col>
            </Row>
          </Grid>
        </Right_Box>
        <div style={{ height: '70vh', width: '70%' }}>  
          {this.state.routes.length !== 0 ? 
          <GoogleMapReact bootstrapURLKeys={{ key: api_key_maps}} 
            defaultCenter={this.state.center} 
            defaultZoom={this.state.zoom} 
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => {
              apiIsLoaded(map, maps)
            }}>
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
          : <div>
              <ReactLoading type='spinningBubbles' color='#0000FF' height={200} width={200} />
              <Waiting_box> Se estan calculando las rutas </Waiting_box>
            </div>
        }
        </div>
      </div>
    );
  }
}

//<TransportSummary transports={this.state.myMarkers}/>
export default App;


