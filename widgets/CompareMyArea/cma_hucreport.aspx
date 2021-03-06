<%@ Page Language="VB" AutoEventWireup="false" CodeFile="cma_hucreport.aspx.vb" Inherits="cma_hucreport" %>
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    
    <meta name="viewport" content="initial-scale=1, maximum-scale=1,user-scalable=no">
    <title>Watershed Report | EnviroAtlas | US EPA</title>
    <link rel="stylesheet" href="https://js.arcgis.com/3.24/dijit/themes/claro/claro.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/dojo/1.10.4/dojo/resources/dojo.css" />
	<link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/dojo/1.10.4/dojox/grid/resources/claroGrid.css" />
    <style>
      td, th {
        border: 1px solid #5b616b;
        padding: 0.88235em;
    }
      .arrow_right {
    background: #CCFFFF url(images/arrow_right.png) no-repeat left !important;
}
.arrow_down {
    background: #CCFFFF url(images/arrow_down.png) no-repeat left !important;
}
.panel-title > a {
  text-decoration: none;
}
.panel-group {
    margin-bottom: 0;
}
.panel-body {
    padding: 0;
}
.chart {
    width: 100%;
    height: 400px;
    text-align: center;
}
.legend {
    width: 100%;
    text-align: center;
}
.dojoxLegendNode td {
    border-width: 0!important;
}
.gridtable {
    
    width: 100%; 
    height: 280px;
}
.claro .dojoxGrid {
    border-width: 0!important;
}
input[type=submit] {
    font-size: 12px;
    padding: 2px 4px 2px 4px;
}
/* .panel-title > a:after {
  content: "\2212";
  float: right!important;
  position: relative;
  top: 1px;
  display: inline-block;
  font-family: 'Glyphicons Halflings';
  font-style: normal;
  font-weight: normal;
  line-height: 1;
}
.panel-title > a.collapsed:after {
  content: "\002b";
}

.panel-default > .panel-heading {
    background-color: #CCFFFF;
} */
    </style>
    <script src="https://js.arcgis.com/3.24/"></script>
    
    <script>
      require([
        "dojo/dom", "dojo/on","dojo/promise/all",
        "dojo/dom-style",
        './configLocal.js',
        'dojo/_base/Color',
        "esri/symbols/SimpleFillSymbol",
 'esri/symbols/SimpleMarkerSymbol',
 'esri/symbols/SimpleLineSymbol',
 'esri/renderers/SimpleRenderer',
        "esri/tasks/query", "esri/tasks/QueryTask",
        "esri/tasks/IdentifyTask",
 "esri/tasks/IdentifyParameters",
 "esri/geometry/Extent",
        "esri/tasks/PrintTask","esri/tasks/PrintParameters","esri/tasks/PrintTemplate",
        "esri/geometry/Point", "esri/SpatialReference",
        'dojox/grid/DataGrid',
'dojo/data/ItemFileWriteStore',
'dojox/charting/Chart',
'dojox/charting/plot2d/ClusteredColumns',
'dojox/charting/widget/SelectableLegend',
'dojox/charting/action2d/Highlight',
'dojox/charting/action2d/Tooltip',
'dojox/charting/plot2d/Grid',
'dojox/charting/plot2d/Markers',
'dojox/charting/axis2d/Default',
'dojox/gfx/utils',
 "dojo/domReady!"
      ], function (dom, on,all,domStyle,_config, 
      Color,
      SimpleFillSymbol,
  SimpleMarkerSymbol,
  SimpleLineSymbol,
  SimpleRenderer,
      Query, QueryTask,
      IdentifyTask,
  IdentifyParameters,
  Extent,
      PrintTask, PrintParameters, PrintTemplate,
      Point, SpatialReference,DataGrid,ItemFileWriteStore,
      Chart,ClusteredColumns,SelectableLegend,Highlight,Tooltip) {
        
        var lat = getQueryVariable('lat');
        var lon = getQueryVariable('lon');
        var llPattern = /^(\-|)\d{1,3}(\.\d+|)$/g;
        //alert(lat + ": " + llPattern.test(lat));
        //alert(lon + ": " + llPattern.test(lon));
        /* if ((!(llPattern.test(lat))) || (!(llPattern.test(lon)))) {
            alert("Invalid latitude/longitude value!");
            document.write('<script type="text/undefined">');
            window.stop();
            if ((i = navigator.userAgent.indexOf('MSIE')) >= 0) {document.execCommand("Stop");};
        } */
        var cmamap = _config.watershed.mapurl;
        var printServerURL = _config.print.mapurl;
        var layerid = _config.watershed.layerindex;
        var watershedlayers = _config.watershed.layers;
        
        var geomPoint = new Point([Number(lon),Number(lat)],new SpatialReference({ wkid:4326 }));

        var hasOpener = true;

        var hucstatus = false;
        var getImageStatus = false;

        var pname = location.pathname.replace(/\/[^/]+$/, '');
        var rooturl = location.protocol + "//" + location.host + pname;
        //console.log("path: " + rooturl)
        document.forms['Form1']['pdfBut'].style.display = "none";
        try {
            if ((!(opener)) || (!(opener.map)) || (!(opener.map.extent))) {
                //document.getElementById("mapDiv").style.display = "none";
                hasOpener = false;
            }
        } catch (e) {
            hasOpener = false;
        }
        if (hasOpener) generateImage(opener.map);
        else getMap_new();
        



        processHUC12();
        checkStatus();
        function getQueryVariable(variable) {
              var query = window.location.search.substring(1);
              var vars = query.split("&");
              for (var i = 0; i < vars.length; i++) {
                  var pair = vars[i].split("=");
                  if (pair[0].toLowerCase() == variable.toLowerCase()) {
                      return pair[1];
                  }
              } // end of for loop
          }
        function processHUC12() {
            var queryArray = [];
            var query = new Query();
            query.returnGeometry = false;
            query.geometry = geomPoint;
            query.outFields = ['*'];
            for (var wlayer in watershedlayers) {
                var wlayerid = watershedlayers[wlayer].layerid;
                var queryurl = cmamap + "/" + wlayerid;
                //console.log(queryurl)
                var queryTask = new QueryTask(queryurl);
                queryArray.push(queryTask.execute(query));
            }

            var promises = all(queryArray);
            promises.then(handleHUCResults);
        }

        function handleHUCResults(results) {
            try {
                if (results[0].features.length == 0) {
                    dojo.byId("container").innerHTML = "Did not find a watershed";
                    return false;
                }
                var hucatts = results[0].features[0].attributes;
                var tidfld = watershedlayers["huc12"].idfield;
                var huc12id = hucatts[tidfld];
                
                var tnamefld = watershedlayers["huc12"].namefield;
                var hucname = hucatts[tnamefld];
                watershedlayers["huc12"].name = huc12id;
                watershedlayers["huc12"].hucname = hucname;
                var cntyatt = results[1].features[0].attributes;
                var stateatt = results[2].features[0].attributes;
                var cnamefld = watershedlayers["county"].namefield;
                //console.log(cnamefld + ": " + cntyatt[cnamefld]);
                watershedlayers["county"].name = cntyatt[cnamefld];
                var snamefld = watershedlayers["state"].namefield;
                watershedlayers["state"].name =stateatt[snamefld];

                getNote(huc12id);
                var wFieldObj = _config.watershed.fields;

                for (var dfield in wFieldObj) {
                        var dvalue = hucatts[dfield];
                        if ((dvalue == null) || (dvalue == 'undefined')) {
                            wFieldObj[dfield]["huc12"] = null;
                        } else {
                            wFieldObj[dfield]["huc12"] = dvalue.toFixed(2);
                        }
                        var dvalue = cntyatt[dfield];
                        if ((dvalue == null) || (dvalue == 'undefined')) {
                            wFieldObj[dfield]["county"] = null;
                        } else {
                            wFieldObj[dfield]["county"] = dvalue.toFixed(2);
                        }
                        
                        var dvalue = stateatt[dfield];
                        if ((dvalue == null) || (dvalue == 'undefined')) {
                            wFieldObj[dfield]["state"] = null;
                        } else {
                            wFieldObj[dfield]["state"] = dvalue.toFixed(2);
                        }
                        
                }
                
                headerjson = {"desc": "Indicators","huc12":"Watershed "+ watershedlayers["huc12"].name, "county": watershedlayers["county"].name + "*", "state": watershedlayers["state"].name };
                document.forms['Form1']['headerjson'].value = JSON.stringify(headerjson);
                getTable();
                
                var headerstr = "Community Data for the " + hucname + " Watershed (" + huc12id + ")";
               
                dojo.byId('hucid').innerHTML = headerstr;
                
                heightNum = 531*dojo.byId('CMA_bannerHUC').width/2560;
                heightStr = Math.ceil(heightNum).toString();
                dojo.setStyle("CMA_bannerHUC", "height", heightStr + "px");
                //domStyle.set("CMA_bannerHUC", "height", "240px");

                document.forms['Form1']['titlestr'].value = headerstr;
                generateChart();
                
                hucstatus = true;
            } catch (err) {
                alert("error occurred when process watershed data: " + err);
            }
            
          }
          function getTable() {
                var fieldObject = _config.watershed.fields;
                var tablestr = '<table style="width: 100%;">';
                var headerstring = getHeaderTR();
                tablestr += headerstring;

                for (var fld in fieldObject) {
                    var desc = fieldObject[fld].description;
                    var tvalue = fieldObject[fld]["huc12"];
                    var cvalue = fieldObject[fld]["county"];
                    var svalue = fieldObject[fld]["state"];
                    if (tvalue == null) tvalue = 'N/A';
                    if (cvalue == null) cvalue = 'N/A';
                    if (svalue == null) svalue = 'N/A';
                    tablestr += '<tr><td style="text-align:left; width:40%;">' + desc + '</td>';
                    tablestr += '<td style="text-align:right; width:20%;">' + tvalue + '</td>';
                    tablestr += '<td style="text-align:right; width:20%;">' + cvalue + '</td>';
                    tablestr += '<td style="text-align:right; width:20%;">' + svalue + '</td>';
                    tablestr += '</tr>';
                        
                }
                
                tablestr += '</table>';
                dojo.byId('resulttable').innerHTML = tablestr;
                document.forms['Form1']['cjsonstr'].value = JSON.stringify(fieldObject);
            
          }

          function getHeaderTR() {
            var headertble = '';
            headertble += '<tr style="color:white;background-color:#0098C9; font-weight: bold;">';
            headertble += '<td style="text-align:center; width:40%;">Indicators</td>';
            headertble += '<td style="text-align:center; width:10%;" id="headerHUC12">Watershed '+ watershedlayers["huc12"].name + '</td>';
            headertble += '<td style="text-align:center; width:10%;" id="headerCounty">' + watershedlayers["county"].name + '*</td>';
            headertble += '<td style="text-align:center; width:10%;" id="headerState">' + watershedlayers["state"].name + '</td>';
            headertble += '</tr>';
            headertble += '';
            
            return headertble;
          }
          function getNote(hucid) {
              var comcounty = _config.watershed.layers["county"].name;
              var stname = _config.watershed.layers["state"].name;
              var hucname = _config.watershed.layers["huc12"].hucname;
            var notelayer = _config.watershed.notelayer;
            var idfield = notelayer.idfield;
            
            var nlayeridx = notelayer.layerid;
            var pctfld = notelayer.pctfield;
            var cntyfld = notelayer.cntyname;
            var stfld = notelayer.statefld;
            var pctfld = notelayer.pctfield;
            var orderstr = pctfld + " DESC";
            var wherestr = idfield + "='" + hucid + "'";
            var queryurl = cmamap + "/" + nlayeridx;
            var query = new Query();
            query.returnGeometry = false;
            query.where = wherestr;
            query.orderByFields = [orderstr];
            query.outFields = ['*'];
            var queryTask = new QueryTask(queryurl);
            queryTask.execute(query, function(results){
                if (results.features.length > 0) {
                    var featureAttributes = results.features[0].attributes;
                    var cntyname = featureAttributes[cntyfld];
                    var stabbr = featureAttributes[stfld];
                    var pct = featureAttributes[pctfld];

                    var notestr = "*You selected the " + hucname +" watershed (" + hucid +  ") and " + comcounty + ", " + stabbr + ". ";
                    notestr += "The majority (" + pct.toFixed(2) + "%) of the selected watershed is in " + cntyname + ", " + stabbr + ". ";
                    document.getElementById("notediv").innerHTML = notestr;
                    document.forms['Form1']['notestr'].value = notestr;
                }
                
                    
                },
                function (error) {

                }
            );

          }
          function generateChart() {

              var chartobj = _config.watershed.fields;

              var legendid = "legenddiv";
              var chartid = "chartdiv";

            var chartHUC = [];
            var chartCounty = [];
            var chartState = [];
            var chartLabels = [];
            
            for (var c in chartobj) {
                var obj = chartobj[c];
                    var ldesc = obj["description"];
                    
                    chartLabels.push(ldesc);
                    chartHUC.push(Number(obj["huc12"]));
                    chartCounty.push(Number(obj["county"]));
                    chartState.push(Number(obj["state"]));
                    //console.log(ldesc + ": " +obj["huc12"]);

            }
            


            chartDataObj = {
                "hucVals": chartHUC,
                "countyVals": chartCounty,
                "stateVals": chartState,
                "labels": chartLabels
            };

            

            var xLabels = [];
            for (var i = 0; i < chartDataObj.labels.length; i++) {
                xLabels.push({ value: i + 1, text: chartDataObj.labels[i] });
            }

            levelegObj = {
                huc: { color: "#ff9966", highlight: "#ff5500", label: "Watershed (" + watershedlayers["huc12"].name + ")"},
                county: { color: "#99cc66", highlight: "#557733", label: "County (" + watershedlayers["county"].name + ")" },
                state: { color: "#3399ff", highlight: "#2266BB", label: "State (" + watershedlayers["state"].name + ")" }

            }
        chart = new Chart(chartid, {
            title: "Ecological Conditions",
            titlePos: "top",
            titleGap: 0,
            titleFont: "normal normal normal 12pt Tahoma",
            titleFontColor: "black",
            htmlLabels: false,
            margins: { l: 0, t: 0, r: 0, b: 0 }

        });

        //main chart
        chart.addPlot("default", {
            type: ClusteredColumns,
            markers: true,
            gap: 12
        });
        //background lines on chart
        chart.addPlot("grid", { type: dojox.charting.plot2d.Grid,
            hMajorLines: true,
            hMinorLines: false,
            vMajorLines: false,
            vMinorLines: false,
            width: 800,
            majorHLine: { color: "#D3D3D3", width: 1 },
            renderOnAxis: false
        });
        var unitstr = "Percent";
        var tstr = "Varibles";
        chart.addAxis("x", { title: tstr, htmlLabels: true, titleOrientation: "away", titleFont: "normal normal normal 9pt Verdana", labels: xLabels, dropLabels: false, rotation: 30, font: "normal normal normal 7pt Verdana", fontColor: "#000000", majorTick: { length: 0 }, minorTick: { length: 0 }, majorTickStep: 1, minorTickStep: 0, minorLabels: false }); //set major tick to 1, minor to 0 so draws every step of data but doesn't fill in decimals between integers.
        chart.addAxis("y", { title: unitstr,  htmlLabels: true, titleFont: "normal normal normal 9pt Verdana", vertical: true, min: 0}); //gridline fix: set max to 101 and fixUpper to minor ticks. 100 cuts off top grid line. 101 adds bit of padding.

                chart.addSeries(levelegObj.state.label, chartDataObj.stateVals, { stroke: 'white', fill: levelegObj.state.color });
                chart.addSeries(levelegObj.county.label, chartDataObj.countyVals, { stroke: 'white', fill: levelegObj.county.color });
                chart.addSeries(levelegObj.huc.label, chartDataObj.hucVals, { stroke: 'white', fill: levelegObj.huc.color });
            
            
            new dojox.charting.action2d.Highlight(chart, "default");
            var pattern = "<span style='font-family:Verdana;font-size: 9px !important'><strong>{0}</strong><br>{1}:&nbsp;{2}</span>";
            var tip = new dojox.charting.action2d.Tooltip(chart, "default", { text:
                    function (o) {
                        return dojo.replace(pattern, [o.run.name, xLabels[o.index].text, o.y]);
                    }
            });

            chart.render();
            if (dojo.byId(legendid)) {
                var columnsLegend = new dojox.charting.widget.Legend({ chart: chart,series: chart.series.reverse()}, legendid);
            }
            
                //reset hidden fields
            //document.forms['Form1'][theme+subtheme + 'Chart'].value = "";
            //put svg into hidden fields for export
            dojox.gfx.utils.toSvg(chart.surface).then(
                     function (svg) {
                        //console.log(svg)
                        document.forms['Form1']['chartsvg'].value = svg;

                     },
                    function (error) {
                        alert("Error occurred: " + error);
                    }
                );
                var legendtablestr = JSON.stringify(levelegObj);
                
                
                document.forms['Form1']['legendsvg'].value = legendtablestr;
                
          }
          function getMap() {
            dojo.byId("imgDiv").style.width = "100%";
            dojo.byId("imgDiv").style.height = "300px";
            dojo.byId("imgDiv").style.visibility = "hidden";
            var fillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
            new Color([255,0,0]), 2),new Color([255,255,0,0.25]));
           
            var queryTask = new QueryTask(cmamap + "/" + layerid);
            var query = new Query();
            query.returnGeometry = true;
            query.geometry = geomPoint;
            query.outFields = ['*'];
            query.outSpatialReference = new esri.SpatialReference({ wkid: 102100 });
            queryTask.execute(query,function(results){
                if (results.features.length>0) {
                    //map.graphics.clear();
                    var tractfeat = results.features[0];
                    tractfeat.setSymbol(fillSymbol);
                    
                    var uExtent = tractfeat.geometry.getExtent().expand(2);
                    var map = new esri.Map("imgDiv", {
                        //wrapAround180: true,
                        basemap: "topo",
                        extent: uExtent
                    });
                    map.on("load", function(){
                        map.graphics.add(tractfeat);
                        generateImage(map);
                    });
                }
                
            }, function(err){
                
                console.log("error occurred: " + err);
            });
            
          }
          function getMap_new() {
            dojo.byId("imgDiv").style.width = "100%";
            dojo.byId("imgDiv").style.height = "300px";
            dojo.byId("imgDiv").style.visibility = "hidden";
            var idmapurl = _config.watershed.mapurl;
            var idindex = _config.watershed.layers["huc12"].layerid;
            var cntyindex = _config.watershed.layers["county"].layerid;
            var vscalelayers = [];
            vscalelayers.push(idindex);
            vscalelayers.push(cntyindex);
            var mextent = new Extent(Number(lon)-1,Number(lat)-1,Number(lon)+1,Number(lat)+1, new SpatialReference({ wkid:4326 }));
            var identifyTask = new IdentifyTask(idmapurl);

            var identifyParams = new IdentifyParameters();
            identifyParams.tolerance = 0;
            //identifyParams.maxAllowableOffset = 100;
            identifyParams.returnGeometry = true;
            //identifyParams.spatialReference = this.map.spatialReference;
            identifyParams.layerIds = vscalelayers;
            identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
            identifyParams.width = 400;
            identifyParams.height = 300;
            identifyParams.geometry = geomPoint;
            identifyParams.mapExtent = mextent;
            //idParamAry.push(identifyParams);
            identifyTask.execute(identifyParams, 
                function(results){
                    if (results.length > 0) {
                        var hucfillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
                            new Color([255,0,0]), 2),new Color([255,255,0,0.25]));

                        var cntyfillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color([92,92,92]), 2),new Color([255,255,0,0]));
                            
                        var unionExtent = null;
                        var grps = {};
                        for (var j = 0; j < results.length; j++) {
                            var feat = results[j].feature;
                            var lyrName = results[j].layerName;
                            var lyrID = results[j].layerId;
                            var key = "";
                            for (var lyr in _config.watershed.layers) {
                                var lid = _config.watershed.layers[lyr].layerid;
                                if (lid == lyrID) key = lyr;
                            }
                           
                            grps[key]= feat;
                            
                            var uExtent = feat.geometry.getExtent();
                            if (unionExtent == null) {
                                unionExtent = uExtent;
                            } else {
                                unionExtent = unionExtent.union(uExtent);
                            } 
                            //console.log(unionExtent)
                            
                        }
                        var map = new esri.Map("imgDiv", {
                        //wrapAround180: true,
                            basemap: "topo",
                            extent: unionExtent.expand(1.5)
                        });
                        map.on("load", function(){
                            for (var lkey in grps) {
                                var g = grps[lkey];
                                if (lkey == 'county') {
                                    g.setSymbol(cntyfillSymbol);
                                } else {
                                    g.setSymbol(hucfillSymbol);
                                }
                                map.graphics.add(g);
                            }
                            generateImage(map);
                        });
        
                        
                    }
                },
                function (error) {
                    console.log("error occurred when identify layers: " + error);
            });
            
          }
          function generateImage(omap) {
              var layoutOptions = {
                'scalebarUnit': 'Miles'
            };
            var printTask = new PrintTask(printServerURL);
            var template = new esri.tasks.PrintTemplate();
            template.exportOptions = {
                width: omap.width,
                height: omap.height,
                dpi: 96
            };
            template.format = "PNG32";
            template.layout = "MAP_ONLY";
            template.layoutOptions = layoutOptions;
            template.preserveScale = true;
            template.showAttribution = false;

            var params = new esri.tasks.PrintParameters();
            params.map = omap;
            params.template = template;

            //alert(params.toJson().Web_Map_as_JSON);
            printTask.execute(params, function (result) {
                if (result.url) {
                    var mapimageurl = result.url;
                    dojo.byId("imgDiv").style.width = "100%";
                    dojo.byId("imgDiv").style.visibility = "visible";
                    document.getElementById("imgDiv").innerHTML = "<img src='" +  mapimageurl + "' alt='map image' title='map image' />";
                    document.forms['Form1']['mapimage'].value = mapimageurl;
                    getImageStatus = true;
                }
            },
            function (err) {
                console.log("error occurred when generating map image: " + err);
                getImageStatus = true;
            });
          }
          function checkStatus() {
              if ((hucstatus) && (getImageStatus)) {
                document.forms['Form1']['pdfBut'].style.display = "block";
              } else {
                setTimeout(function () {
                    checkStatus();
                }, 500);
              }
          }

      });
    </script>
  </head>

  <body class="claro">
    <div class="container">
        
                <img id="CMA_bannerHUC" src="images/header.png" style="width: 100%; height: 231px;" alt="CMA banner" /><br/>
        <div style="font-size: 32px;width: 100%; text-align: center;" id='hucid'></div>
        <form id="Form1" runat="server" target="_blank"> 	
            <asp:Button ID="pdfBut" runat="server" Text="Save as PDF" title="Save this report as PDF" style="display: none;" />
            <asp:HiddenField ID="headerjson" runat="server" Value="" />
            <asp:HiddenField ID="titlestr" runat="server" Value="" />
            <asp:HiddenField ID="cjsonstr" runat="server" Value="" />
            <asp:HiddenField ID="notestr" runat="server" Value="" />
            <asp:HiddenField ID="chartsvg" runat="server" Value="" />
            <asp:HiddenField ID="legendsvg" runat="server" Value="" />
            <asp:HiddenField ID="mapimage" runat="server" Value="" />      
         </form>
         
        <div id="imgDiv" style="text-align:center"></div>
        <br /><br />
        <div id='resulttable'></div>
        <div id='notediv'>
        </div>
        <br /><br />
         <div id="chartdiv" class="chart"></div>
         <center><div id="legenddiv" class="legend"></div></center>
        
      </div>
  </body>
</html>

