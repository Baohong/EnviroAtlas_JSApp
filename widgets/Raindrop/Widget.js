define(['dojo/_base/declare',
      'jimu/BaseWidget',
      'dojo/on',
      'dojo/_base/lang',
      'jimu/utils',
        'esri/request',
        'dojo/_base/json',
        'esri/graphic',
        'esri/symbols/SimpleLineSymbol',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/Color',
        'esri/geometry/Polyline',
      'jimu/dijit/TabContainer',
      'dijit/layout/ContentPane',
       'dojo/parser'],
function(declare, BaseWidget, on, lang, utils, esriRequest, dojoJson, Graphic, SimpleLineSymbol, SimpleMarkerSymbol, Color, Polyline, TabContainer, ContentPane) {

  var curMap;
  var RaindropTool;
  var onMapClick;

  return declare([BaseWidget], {
    // DemoWidget code goes here

    //please note that this property is be set by the framework when widget is loaded.
    //templateString: template,

    baseClass: 'jimu-widget-demo',


    postCreate: function() {
      this.inherited(arguments);
      this._initTabContainer();

      console.log('postCreate');
    },

    startup: function() {
      this.inherited(arguments);
      //this.mapIdNode.innerHTML = 'map id:' + this.map.id;

      RaindropTool = this;
      curMap = this.map;

      //Events
      on(this.run_Service, "click", function(){

      });
      onMapClick = on(this.map, "click", function(evt){

        //Get Location of Click
        var point = evt.mapPoint;
        //symbology for point
        var pointSymbol = new SimpleMarkerSymbol().setStyle(
            SimpleMarkerSymbol.STYLE_circle).setColor(
            new Color([255, 0, 0, 0.5])
        );
        //add graphic
        var graphic = new Graphic(point, pointSymbol);
        curMap.graphics.add(graphic);

        RaindropTool._run_RaindropService(point);
      });


      console.log('startup');
    },

    _run_RaindropService: function (point){

      //var service_url = 'http://ofmpub.epa.gov/waters10/PointIndexing.Service';

      //settings for indexing service
      var data = {
        "pGeometry": "POINT(" + point.getLongitude() + " " + point.getLatitude() + ")",
        "pGeometryMod": "WKT,SRSNAME=urn:ogc:def:crs:OGC::CRS84",
        "pPointIndexingMethod": "RAINDROP",
        "pPointIndexingRaindropDist": 5,
        "pPointIndexingMaxDist": 2,
        "pOutputPathFlag": "TRUE",
        "pReturnFlowlineGeomFlag": "FALSE",
        "optOutCS": "SRSNAME=urn:ogc:def:crs:OGC::CRS84",
        "optOutPrettyPrint": 0,
        "optClientRef": "CodePen"
      };
      //Point Indexing service
      var layerUrl = "http://ofmpub.epa.gov/waters10/PointIndexing.Service";
      var layersRequest = esriRequest({
        url: layerUrl,
        content: data,
        handleAs: "json",
        callbackParamName: "callback"
      });
      layersRequest.then(
          function(response) {

            //Line Symbology
            var lineSymbol = new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SHORTDASHDOTDOT,
                new Color([255, 0, 0]),
                2
            );
            console.log("JSON: ",  dojoJson.toJson(response, true));
            //add polyline to map
            var polyline = new Polyline(response['output']['indexing_path']['coordinates']);

            var graphic = new Graphic(polyline, lineSymbol);
            curMap.graphics.add(graphic);

            console.log("Success: ", dojoJson.toJson(response['output']['indexing_path']['coordinates'], true));
          }, function(error) {
            console.log("Error: ", error.message);
          });

    },

    _initTabContainer: function () {
      var tabs = [];
      tabs.push({
        title: "About",
        content: this.tabNode1
      });
      tabs.push({
        title: "Settings",
        content: this.tabNode2
      });
      tabs.push({
        title: "Results",
        content: this.tabNode3
      });
      this.selTab = this.nls.measurelabel;
      this.tabContainer = new TabContainer({
        tabs: tabs,
        selected: this.selTab
      }, this.tabMain);

      this.tabContainer.startup();
      this.own(on(this.tabContainer, 'tabChanged', lang.hitch(this, function (title) {
        if (title !== this.nls.resultslabel) {
          this.selTab = title;
        }
        //this._resizeChart();
      })));
      utils.setVerticalCenter(this.tabContainer.domNode);
    },

    onOpen: function(){
      console.log('onOpen');
    },

    onClose: function(){

      onMapClick.remove();
      console.log('onClose');
    },

    onMinimize: function(){
      console.log('onMinimize');
    },

    onMaximize: function(){
      console.log('onMaximize');
    },

    onSignIn: function(credential){
      /* jshint unused:false*/
      console.log('onSignIn');
    },

    onSignOut: function(){
      console.log('onSignOut');
    }
  });
});