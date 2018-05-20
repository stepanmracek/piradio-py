webpackJsonp([0],{

/***/ 120:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 120;

/***/ }),

/***/ 163:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 163;

/***/ }),

/***/ 207:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return HomePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_observable_timer__ = __webpack_require__(299);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_observable_timer___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_rxjs_add_observable_timer__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_switchMap__ = __webpack_require__(309);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_switchMap___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_switchMap__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_filter__ = __webpack_require__(312);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_filter___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_filter__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__radio_detail_radio_detail__ = __webpack_require__(208);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__services_radio_service__ = __webpack_require__(209);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__menu_menu__ = __webpack_require__(210);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__services_websocket_service__ = __webpack_require__(211);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};









var HomePage = /** @class */ (function () {
    function HomePage(navCtrl, radio, websocket, modalCtrl, actionSheetCtrl, alertCtrl, popoverCtrl) {
        this.navCtrl = navCtrl;
        this.radio = radio;
        this.websocket = websocket;
        this.modalCtrl = modalCtrl;
        this.actionSheetCtrl = actionSheetCtrl;
        this.alertCtrl = alertCtrl;
        this.popoverCtrl = popoverCtrl;
        this.addressStorageKey = 'piradio-address';
        this.apiKeyStorageKey = 'piradio-apikey';
        this.stations = null;
        this.playingStation = null;
        this.volume = 0;
        this.subscriptions = [];
        this.error = false;
    }
    HomePage.prototype.ngOnInit = function () {
        var address = localStorage.getItem(this.addressStorageKey);
        var apiKey = localStorage.getItem(this.apiKeyStorageKey);
        if (address && apiKey) {
            var url = "http://" + address + ":3000";
            this.radio.setUrl(url, apiKey);
            this.subscribe(url, apiKey);
        }
        else {
            this.promptUrl();
        }
    };
    HomePage.prototype.showError = function (text) {
        this.error = true;
        this.alertCtrl.create({
            title: 'Error',
            message: text,
            buttons: ['OK']
        }).present();
    };
    HomePage.prototype.subscribe = function (url, apiKey) {
        var _this = this;
        this.error = false;
        this.subscriptions.push(this.radio.getStations()
            .subscribe(function (stations) { return _this.stations = stations; }, function (error) {
            _this.showError('Can\'t connect to RaspberryPi');
        }));
        this.subscriptions.push(this.radio.getStatus()
            .subscribe(function (playingStation) { return _this.playingStation = playingStation; }, function (error) { return console.error(error); }));
        this.subscriptions.push(this.radio.getVolume()
            .subscribe(function (volume) { return _this.volume = volume; }, function (error) { return console.error(error); }));
        this.subscriptions.push(this.websocket.connect(url, apiKey)
            .subscribe(function () { }, function (error) { return console.error(error); }));
        this.subscriptions.push(this.websocket.status.subscribe(function (s) { return _this.playingStation = s; }));
        this.subscriptions.push(this.websocket.stations.subscribe(function (s) { return _this.stations = s; }));
        this.subscriptions.push(this.websocket.volume.subscribe(function (s) { return _this.volume = s; }));
    };
    HomePage.prototype.edit = function (station) {
        var _this = this;
        var copy = { name: station.name, url: station.url, _id: station._id };
        var modal = this.modalCtrl.create(__WEBPACK_IMPORTED_MODULE_5__radio_detail_radio_detail__["a" /* RadioDetailComponent */], { station: copy });
        modal.present();
        modal.onDidDismiss(function (save) {
            if (save) {
                _this.radio.updateStation(station._id, copy).subscribe(function () { }, function (error) {
                    _this.showError('Error during saving station');
                });
            }
        });
    };
    HomePage.prototype.play = function (station) {
        if (station._id)
            this.radio.play(station._id).subscribe();
    };
    HomePage.prototype.delete = function (station) {
        var _this = this;
        var alert = this.alertCtrl.create({
            title: 'Confirm',
            message: "Do you wish to delete station " + station.name + "?",
            buttons: [{
                    text: 'No'
                }, {
                    text: 'Yes',
                    role: 'destructive',
                    handler: function () {
                        _this.radio.deleteStation(station._id).subscribe(function () { }, function (error) {
                            _this.showError('Error during deleting of the station');
                        });
                    }
                }]
        });
        alert.present();
    };
    HomePage.prototype.onClick = function (station) {
        var _this = this;
        var nonPlayingButtons = [{
                text: 'Edit',
                icon: 'create',
                handler: function () { return _this.edit(station); }
            }, {
                text: 'Play',
                icon: 'play',
                handler: function () { return _this.play(station); }
            }, {
                text: 'Delete',
                role: 'destructive',
                icon: 'trash',
                handler: function () { return _this.delete(station); }
            }];
        var playingButtons = [{
                text: 'Stop',
                icon: 'pause',
                handler: function () { _this.radio.stop().subscribe(); }
            }];
        var actionSheet = this.actionSheetCtrl.create({
            title: 'Radio station actions',
            buttons: this.playingStation && this.playingStation._id === station._id ? playingButtons : nonPlayingButtons
        });
        actionSheet.present();
    };
    HomePage.prototype.onAddClick = function () {
        var _this = this;
        var newStation = { name: '', url: '' };
        var modal = this.modalCtrl.create(__WEBPACK_IMPORTED_MODULE_5__radio_detail_radio_detail__["a" /* RadioDetailComponent */], { station: newStation });
        modal.present();
        modal.onDidDismiss(function (save) {
            if (save)
                _this.radio.createStation(newStation).subscribe(function (station) { }, function (error) {
                    _this.showError('Error during creating of the new station');
                });
        });
    };
    HomePage.prototype.onVolumeChanged = function (e) {
        this.radio.setVolume(e.value).subscribe({ error: function (e) { return console.error(e); } });
    };
    HomePage.prototype.volumeDown = function () {
        var _this = this;
        this.radio.getVolume()
            .switchMap(function (v) { return _this.radio.setVolume(Math.max(0, v - 10)); })
            .subscribe({ error: function (e) { return console.error(e); } });
    };
    HomePage.prototype.volumeUp = function () {
        var _this = this;
        this.radio.getVolume()
            .switchMap(function (v) { return _this.radio.setVolume(Math.min(100, v + 10)); })
            .subscribe({ error: function (e) { return console.error(e); } });
    };
    HomePage.prototype.ngOnDestroy = function () {
        this.unsubscribe();
    };
    HomePage.prototype.unsubscribe = function () {
        this.subscriptions.forEach(function (s) { return s.unsubscribe(); });
    };
    HomePage.prototype.showMenu = function (event) {
        var _this = this;
        var popover = this.popoverCtrl.create(__WEBPACK_IMPORTED_MODULE_7__menu_menu__["a" /* MenuPage */]);
        popover.present({ ev: event });
        popover.onDidDismiss(function (result) {
            if (result === 'setUrl') {
                _this.promptUrl();
            }
        });
    };
    HomePage.prototype.promptUrl = function () {
        var _this = this;
        var address = localStorage.getItem(this.addressStorageKey) || '192.168.0.10';
        var apiKey = localStorage.getItem(this.apiKeyStorageKey) || '';
        apiKey = apiKey ? atob(apiKey) : apiKey;
        var prompt = this.alertCtrl.create({
            title: 'Please enter RaspberryPi address',
            inputs: [{
                    name: 'address',
                    label: 'Address',
                    placeholder: 'Address',
                    value: address
                }, {
                    name: 'apiKey',
                    placeholder: 'API key',
                    label: 'API key',
                    value: apiKey
                }],
            buttons: [{
                    text: 'Cancel'
                }, {
                    text: 'OK',
                    handler: function (value) {
                        _this.unsubscribe();
                        var url = "http://" + value.address + ":3000";
                        var apiKey = btoa(value.apiKey);
                        _this.radio.setUrl(url, apiKey);
                        _this.subscribe(url, apiKey);
                        localStorage.setItem(_this.addressStorageKey, value.address);
                        localStorage.setItem(_this.apiKeyStorageKey, apiKey);
                    }
                }]
        });
        prompt.present();
    };
    HomePage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-home',template:/*ion-inline-start:"/home/stepo/git/piradio-io/src/pages/home/home.html"*/'<ion-header>\n  <ion-navbar color="primary">\n    <ion-title>\n      Radio stations\n    </ion-title>\n    <ion-buttons end>\n      <button (click)="showMenu($event)" ion-button icon-only>\n        <ion-icon name="more"></ion-icon>\n      </button>\n    </ion-buttons>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding>\n  <ion-fab *ngIf="!error && !!stations" right bottom>\n    <button color="secondary" ion-fab (click)="onAddClick()"><ion-icon name="add"></ion-icon></button>\n  </ion-fab>\n  <div *ngIf="error; else list" style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: center">\n    <h1 class="connection-error">Connection error</h1>\n  </div>\n  <ng-template #list>\n    <ion-list>\n      <button ion-item (click)="onClick(station)" *ngFor="let station of stations">\n        {{station.name}}\n        <ion-icon *ngIf="playingStation && playingStation._id == station._id" name="play" item-end></ion-icon>\n      </button>\n    </ion-list>\n  </ng-template>\n</ion-content>\n\n<ion-footer>\n  <ion-toolbar>\n    <ion-item *ngIf="!error && !!stations && playingStation">\n      <ion-range [(ngModel)]="volume" [min]="0" [max]="100" [step]="10" [debounce]="250" (ionChange)="onVolumeChanged($event)">\n        <ion-icon range-left name="volume-mute"></ion-icon>\n        <ion-icon range-right name="volume-up"></ion-icon>\n      </ion-range>\n    </ion-item>\n    <ng-container *ngIf="!error && !!stations && stations.length > 0 && !playingStation">\n        <ion-title>Select station and enjoy music</ion-title>\n    </ng-container>\n    <ng-container *ngIf="!error && !!stations && stations.length === 0">\n      <ion-title>Add station to start listening</ion-title>\n    </ng-container>\n    <ng-container *ngIf="error">\n      <ion-title>Check your PiRadio address</ion-title>\n    </ng-container>\n  </ion-toolbar>\n</ion-footer>'/*ion-inline-end:"/home/stepo/git/piradio-io/src/pages/home/home.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavController */],
            __WEBPACK_IMPORTED_MODULE_6__services_radio_service__["a" /* RadioService */],
            __WEBPACK_IMPORTED_MODULE_8__services_websocket_service__["a" /* WebsocketService */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* ModalController */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["a" /* ActionSheetController */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["b" /* AlertController */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* PopoverController */]])
    ], HomePage);
    return HomePage;
}());

//# sourceMappingURL=home.js.map

/***/ }),

/***/ 208:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return RadioDetailComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(38);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var RadioDetailComponent = /** @class */ (function () {
    function RadioDetailComponent(viewCtrl, params) {
        this.viewCtrl = viewCtrl;
        this.params = params;
        this.station = this.params.get('station');
    }
    RadioDetailComponent.prototype.dismiss = function () {
        this.viewCtrl.dismiss(false);
    };
    RadioDetailComponent.prototype.save = function () {
        this.viewCtrl.dismiss(true);
    };
    RadioDetailComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'radio-detail',template:/*ion-inline-start:"/home/stepo/git/piradio-io/src/pages/radio-detail/radio-detail.html"*/'<ion-header>\n  <ion-navbar color="primary">\n    <ion-buttons start>\n      <button ion-button icon-only (click)="dismiss()">\n        <ion-icon name="close"></ion-icon>\n      </button>\n    </ion-buttons>\n    <ion-title>{{station._id ? \'Edit radio station\' : \'Add radio station\'}}</ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding>\n  <ion-list>\n    <ion-item>\n      <ion-label floating>Name</ion-label>\n      <ion-input type="text" [(ngModel)]="station.name"></ion-input>\n    </ion-item>\n\n    <ion-item>\n      <ion-label floating>URL</ion-label>\n      <ion-input type="text" [(ngModel)]="station.url"></ion-input>\n    </ion-item>\n  </ion-list>\n  <button ion-button full color="secondary" [disabled]="!station.name || !station.url" (click)="save()">{{station._id ? \'Save\' : \'Add\'}}</button>\n</ion-content>'/*ion-inline-end:"/home/stepo/git/piradio-io/src/pages/radio-detail/radio-detail.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["k" /* ViewController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* NavParams */]])
    ], RadioDetailComponent);
    return RadioDetailComponent;
}());

//# sourceMappingURL=radio-detail.js.map

/***/ }),

/***/ 209:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return RadioService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common_http__ = __webpack_require__(121);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map__ = __webpack_require__(313);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var RadioService = /** @class */ (function () {
    function RadioService(http) {
        this.http = http;
        this.url = 'http://localhost:3000';
        this.apiKey = '';
    }
    RadioService.prototype.setUrl = function (url, apiKey) {
        this.url = url;
        this.apiKey = apiKey;
    };
    RadioService.prototype.getStations = function () {
        return this.http.get(this.url + "/stations", { headers: { 'Api-Key': this.apiKey } });
    };
    RadioService.prototype.getStation = function (id) {
        return this.http.get(this.url + "/stations/" + id, { headers: { 'Api-Key': this.apiKey } });
    };
    RadioService.prototype.updateStation = function (id, station) {
        return this.http.put(this.url + "/stations/" + id, station, { headers: { 'Api-Key': this.apiKey } });
    };
    RadioService.prototype.getStatus = function () {
        return this.http.get(this.url + "/status", { headers: { 'Api-Key': this.apiKey } });
    };
    RadioService.prototype.createStation = function (station) {
        return this.http.post(this.url + "/stations", station, { headers: { 'Api-Key': this.apiKey } });
    };
    RadioService.prototype.play = function (id) {
        return this.http.get(this.url + "/play/" + id, { headers: { 'Api-Key': this.apiKey } }).map(function () { });
    };
    RadioService.prototype.stop = function () {
        return this.http.get(this.url + "/stop", { headers: { 'Api-Key': this.apiKey } }).map(function () { });
    };
    RadioService.prototype.deleteStation = function (id) {
        return this.http.delete(this.url + "/stations/" + id, { headers: { 'Api-Key': this.apiKey } });
    };
    RadioService.prototype.getVolume = function () {
        return this.http.get(this.url + "/volume", { headers: { 'Api-Key': this.apiKey } });
    };
    RadioService.prototype.setVolume = function (newVolume) {
        return this.http.post(this.url + "/volume", { volume: newVolume }, { headers: { 'Api-Key': this.apiKey } }).map(function () { });
    };
    RadioService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["A" /* Injectable */])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__angular_common_http__["a" /* HttpClient */]])
    ], RadioService);
    return RadioService;
}());

//# sourceMappingURL=radio.service.js.map

/***/ }),

/***/ 210:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MenuPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(38);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var MenuPage = /** @class */ (function () {
    function MenuPage(viewCtrl) {
        this.viewCtrl = viewCtrl;
    }
    MenuPage.prototype.setAddress = function () {
        this.viewCtrl.dismiss('setUrl');
    };
    MenuPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-menu',template:/*ion-inline-start:"/home/stepo/git/piradio-io/src/pages/menu/menu.html"*/'<ion-content>\n  <ion-list>\n    <button ion-item (click)="setAddress()">Set RaspberryPi address</button>\n  </ion-list>\n</ion-content>\n'/*ion-inline-end:"/home/stepo/git/piradio-io/src/pages/menu/menu.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["k" /* ViewController */]])
    ], MenuPage);
    return MenuPage;
}());

//# sourceMappingURL=menu.js.map

/***/ }),

/***/ 211:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return WebsocketService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_socket_io_client__ = __webpack_require__(314);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_socket_io_client___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_socket_io_client__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_Subject__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_Subject___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_rxjs_Subject__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var WebsocketService = /** @class */ (function () {
    function WebsocketService() {
        this.status = new __WEBPACK_IMPORTED_MODULE_3_rxjs_Subject__["Subject"]();
        this.stations = new __WEBPACK_IMPORTED_MODULE_3_rxjs_Subject__["Subject"]();
        this.volume = new __WEBPACK_IMPORTED_MODULE_3_rxjs_Subject__["Subject"]();
    }
    WebsocketService.prototype.connect = function (url, apiKey) {
        var _this = this;
        var socket = __WEBPACK_IMPORTED_MODULE_1_socket_io_client__(url, {
            transportOptions: {
                polling: {
                    extraHeaders: {
                        'Api-Key': apiKey
                    }
                }
            }
        });
        // We define our observable which will observe any incoming messages
        // from our socket.io server.
        var observable = new __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__["Observable"](function (observer) {
            socket.on('connect', function () { return console.log('Connected to Websocket Server'); });
            socket.on('status', function (data) { return _this.status.next(data); });
            socket.on('stations', function (data) { return _this.stations.next(data); });
            socket.on('volume', function (data) { return _this.volume.next(+data); });
            return function () {
                console.log('Disconnecting from Websocket Server');
                socket.disconnect();
            };
        });
        return observable;
    };
    WebsocketService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["A" /* Injectable */])(),
        __metadata("design:paramtypes", [])
    ], WebsocketService);
    return WebsocketService;
}());

//# sourceMappingURL=websocket.service.js.map

/***/ }),

/***/ 223:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__app_module__ = __webpack_require__(244);


Object(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_1__app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 244:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common_http__ = __webpack_require__(121);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_ionic_angular__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ionic_native_splash_screen__ = __webpack_require__(203);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_status_bar__ = __webpack_require__(206);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__app_component__ = __webpack_require__(298);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__pages_home_home__ = __webpack_require__(207);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__pages_radio_detail_radio_detail__ = __webpack_require__(208);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__services_radio_service__ = __webpack_require__(209);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__pages_menu_menu__ = __webpack_require__(210);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__services_websocket_service__ = __webpack_require__(211);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};












var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_2__angular_core__["I" /* NgModule */])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_6__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_7__pages_home_home__["a" /* HomePage */],
                __WEBPACK_IMPORTED_MODULE_8__pages_radio_detail_radio_detail__["a" /* RadioDetailComponent */],
                __WEBPACK_IMPORTED_MODULE_10__pages_menu_menu__["a" /* MenuPage */],
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_common_http__["b" /* HttpClientModule */],
                __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["e" /* IonicModule */].forRoot(__WEBPACK_IMPORTED_MODULE_6__app_component__["a" /* MyApp */], {}, {
                    links: []
                })
            ],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_3_ionic_angular__["c" /* IonicApp */]],
            entryComponents: [
                __WEBPACK_IMPORTED_MODULE_6__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_7__pages_home_home__["a" /* HomePage */],
                __WEBPACK_IMPORTED_MODULE_8__pages_radio_detail_radio_detail__["a" /* RadioDetailComponent */],
                __WEBPACK_IMPORTED_MODULE_10__pages_menu_menu__["a" /* MenuPage */],
            ],
            providers: [
                __WEBPACK_IMPORTED_MODULE_5__ionic_native_status_bar__["a" /* StatusBar */],
                __WEBPACK_IMPORTED_MODULE_4__ionic_native_splash_screen__["a" /* SplashScreen */],
                { provide: __WEBPACK_IMPORTED_MODULE_2__angular_core__["u" /* ErrorHandler */], useClass: __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["d" /* IonicErrorHandler */] },
                __WEBPACK_IMPORTED_MODULE_9__services_radio_service__["a" /* RadioService */],
                __WEBPACK_IMPORTED_MODULE_11__services_websocket_service__["a" /* WebsocketService */],
            ]
        })
    ], AppModule);
    return AppModule;
}());

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 298:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MyApp; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__ = __webpack_require__(206);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__ = __webpack_require__(203);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__pages_home_home__ = __webpack_require__(207);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var MyApp = /** @class */ (function () {
    function MyApp(platform, statusBar, splashScreen) {
        this.rootPage = __WEBPACK_IMPORTED_MODULE_4__pages_home_home__["a" /* HomePage */];
        platform.ready().then(function () {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();
            splashScreen.hide();
        });
    }
    MyApp = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({template:/*ion-inline-start:"/home/stepo/git/piradio-io/src/app/app.html"*/'<ion-nav [root]="rootPage"></ion-nav>\n'/*ion-inline-end:"/home/stepo/git/piradio-io/src/app/app.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* Platform */], __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__["a" /* StatusBar */], __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__["a" /* SplashScreen */]])
    ], MyApp);
    return MyApp;
}());

//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 333:
/***/ (function(module, exports) {

/* (ignored) */

/***/ })

},[223]);
//# sourceMappingURL=main.js.map