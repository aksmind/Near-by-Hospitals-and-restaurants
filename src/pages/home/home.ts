import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation';

declare var google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  options: GeolocationOptions;
  currentPos: Geoposition;
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  restaurants:any;
  hospitals: any;
  userLatitude;
  userLongitude;
  latLng;
  restroOrHospital;
  hospitalFlag: boolean = true;
  restroFlag: boolean = true;
  markers: any;
  
  constructor(public navCtrl: NavController, public geolocation : Geolocation) {
    this.markers = [];
  }

  ionViewDidLoad(){
    this.getUserPosition();
  }

  getUserPosition(){
    this.options = {
      enableHighAccuracy: false
    };

    this.geolocation.getCurrentPosition(this.options).then((pos: Geoposition) => {
      this.currentPos = pos;
      console.log(pos);
      this.latLng = new google.maps.LatLng(this.currentPos.coords.latitude,this.currentPos.coords.longitude);
      let mapOptions = {
        center: this.latLng,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      this.addMarker();
      // this.addMap(pos.coords.latitude,pos.coords.longitude);
    },(err: PositionError) => {
      console.log("error" + err.message);
    });
  }

  getTopics(ev: any){ 
    if(this.restroOrHospital == 1){  // 1 means hospitals
      let servVal = ev.target.value;
      if(servVal && servVal.trim() != ''){
        this.hospitals = this.hospitals.filter((hospital) => {
          // return (hospital.name.toLowerCase().indexOf(servVal.toLowerCase()) > -1)
          if(hospital.name.toLowerCase().indexOf(servVal.toLowerCase()) > -1){
            return hospital.name.toLowerCase().indexOf(servVal.toLowerCase()) > -1;
          }
          else{
            return hospital.vicinity.toLowerCase().indexOf(servVal.toLowerCase()) > -1
          }
        })
      }
      else{
        this.showNearByHospitals();
      }
    }
    if(this.restroOrHospital == 2){  // 2 means restaurants
      let servVal = ev.target.value;
      if(servVal && servVal.trim() != ''){
        this.restaurants = this.restaurants.filter((restaurant) => {
          //return (restaurant.name.toLowerCase().indexOf(servVal.toLowerCase()) > -1)
          if(restaurant.name.toLowerCase().indexOf(servVal.toLowerCase()) > -1){
            return restaurant.name.toLowerCase().indexOf(servVal.toLowerCase()) > -1;
          }
          else{
            return restaurant.vicinity.toLowerCase().indexOf(servVal.toLowerCase()) > -1
          }
        })
      }
      else{
        this.showNearByRestro();
      }
    }
  }

  showNearByHospitals(){
    this.restaurants = null;
    this.restroOrHospital = 1;
    //remove markers of restaurants
    if(this.markers !== undefined){
      for(let i=0;i<this.markers.length;i++){
        this.markers[i].setMap(null);  
      }
    }

    this.getHospitals(this.latLng).then((results: Array<any>) => {
      this.hospitals = results;
      if(this.hospitalFlag){
        // this.hospitalFlag = false;
        for(let i=0;i<results.length;i++){
          this.createMarker(results[i]);
        }
      }
    },(status) => console.log(status));
  }

  showNearByRestro(){
    this.hospitals = null;
    this.restroOrHospital = 2;
    //remove markers of hospitals
    if(this.markers !== undefined){
      for(let i=0;i<this.markers.length;i++){
        this.markers[i].setMap(null);  
      }
    }

    this.getRestaurants(this.latLng).then((results: Array<any>) => {
      this.restaurants = results;
      if(this.restroFlag){
        // this.restroFlag = false;
        for(let i=0;i<results.length;i++){
          this.createMarker(results[i]);
        }
      }
    },(status) => console.log(status));
  }

  addMarker(){
    let userMarker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });
    let content = "<p>This is your current position ! </p>";
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });
    google.maps.event.addListener(userMarker,'click',() => {
      infoWindow.open(this.map,userMarker);
    });
  }

  getRestaurants(latLng){
    var service = new google.maps.places.PlacesService(this.map);
    let request = {
      location: latLng,
      radius: 8047,
      types: ['restaurant']
    };
    return new Promise((resolve,reject) => {
      service.nearbySearch(request,function(results,status){
        if(status === google.maps.places.PlacesServiceStatus.OK){
          resolve(results);
        }
        else{
          reject(status);
        }
      });
    });
  }

  getHospitals(latLng){
    var service = new google.maps.places.PlacesService(this.map);
    let request = {
      location: latLng,
      radius: 8047,
      types: ['hospital','health']
    };
    return new Promise((resolve,reject) => {
      service.nearbySearch(request,function(results,status){
        if(status === google.maps.places.PlacesServiceStatus.OK){
          resolve(results);
        }
        else{
          reject(status);
        }
      });
    });
  }

  createMarker(place){
    // if(this.marker !== undefined){
    //   console.log("Marker is undefined");
    //   this.marker.setMap(null);  
    // }
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: place.geometry.location
    });
    marker.setMap(this.map);
    this.markers.push(marker);
  }

}
