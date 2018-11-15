///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
    'dojo/_base/declare',
    'dijit/_WidgetsInTemplateMixin',
    "dojo/Deferred",
    'dojo/_base/lang',
    'jimu/BaseWidget',
    'dijit/Dialog',
    'esri/symbols/jsonUtils',
     'jimu/WidgetManager',
     'jimu/PanelManager',
     'esri/geometry/Extent',
	 'esri/symbols/SimpleLineSymbol',
	 'esri/symbols/SimpleFillSymbol',
	 'esri/symbols/SimpleMarkerSymbol',
	 'jimu/shared/utils',
	 'jimu/utils',
	 'esri/lang',
	 'esri/dijit/PopupTemplate',
	 'esri/renderers/SimpleRenderer',
	 'esri/tasks/QueryTask',
     'esri/tasks/query',
	 'esri/graphic',
	 'esri/Color',
	 'esri/renderers/ClassBreaksRenderer',     
	 'dojo/_base/connect',
	 'dojo/_base/html',
    'dijit/layout/AccordionContainer', 
    'dijit/layout/ContentPane',
    'dijit/layout/TabContainer',
    'dijit/form/TextBox',
    'dojox/grid/DataGrid',
    'dojo/data/ItemFileWriteStore',
    'dijit/form/DropDownButton',
    'dijit/TooltipDialog',
    'dijit/form/TextBox',
    'dijit/TitlePane'
    
  ],
  function(
    declare,
    _WidgetsInTemplateMixin,
    Deferred,
    lang,
    BaseWidget,
    Dialog,
    esriSymJsonUtils,
    WidgetManager,
    PanelManager,
    Extent,
    SimpleLineSymbol,
    SimpleFillSymbol,
    SimpleMarkerSymbol,
    sharedUtils,
    utils,
    esriLang,
    PopupTemplate,
    SimpleRenderer,
    QueryTask,
    query,
    graphic,
    Color,
    ClassBreaksRenderer,
    connect,
    html) {
    	var singleLayerToBeAddedRemoved = "";
    	var bNoTopicSelected = false;
    	var communitySelected = "";
    	var bSimulatedClick = false;
    	var bSimulatedClickAddressed = true;
    	var mapClickListenerForPopup;
    	var arrLayersToChangeSynbology = [];
    	var arrCategoryForAllScale = ["PSI", "PBS", "BNF"];
    	var clickEvent = null;
        var   layerData = {
            identifier: "eaID",  //This field needs to have unique values
            label: "name", //Name field for display. Not pertinent to a grid but may be used elsewhere.
            items: []};
    	var layerDataStore = new dojo.data.ItemFileWriteStore({ data:layerData });

    	var SelectableLayerFactory = function(data) {
		    this.eaLyrNum = data.eaLyrNum;
		    this.name = data.name;
		    this.eaDescription = data.eaDescription;		    
		    this.eaDfsLink = data.eaDfsLink;
		    this.eaCategory = data.eaCategory;
		    this.eaID = data.eaID;
		    this.eaMetadata = data.eaMetadata;
		    this.eaScale = data.eaScale;
		    this.eaTags = data.eaTags;
		    this.eaTopic = data.eaTopic;
		    this.categoryTab = data.categoryTab;
		}
		var selectableLayerArray = [];
		var dicTopicSelected = {};
		hiderows = {};
		
		
		var hashFactsheetLink = {};
		var hashLayerNameLink = {};
		var hashDescriptionforI = {};
		
		var hashLayerName = {};
		var hashEaDescription = {};
		var hashEaTag = {};
		var hashSubLayers = {};
		var hashSubTopicforI = {};
		//set popup info for each featuer layer
	    var featuresCollection = [];
	    var previuosMapInfoFromFL = [];
	    var currentMapInfoFromFL = [];
	    var previousMapInfoFromDynamic = [];
	    var currentMapInfoFromDynamic = [];
	    var previuosMapInfoFromAll = [];
	    var arrLayersForPopup = [];
	    var numDecimalDigit = 0;
	    var strDateFormat = '';
	    var bCollapseClicked = false;
	    var featureExistInCollection = function(feature, Collection) {
			var bFeatureExist = false;
			for (kk=0; kk < Collection.length; kk++) {
				if (JSON.stringify(Collection[kk].attributes) === JSON.stringify(feature.attributes)) {
					bFeatureExist = true;
					break;
				}
			}
			return bFeatureExist    	
	    }
	    var bSelectedByTopics = function(currentTopic, categoryTab) {
			var topicDictionary = {};

	    	if (typeof Object.assign != 'function') {
				for (var key in window.topicDicESB) {
					topicDictionary[key] = window.topicDicESB[key];
				}
				for (var key in window.topicDicPSI) {
                    topicDictionary[key] = window.topicDicPSI[key];
                }
				for (var key in window.topicDicPBS) {
					topicDictionary[key] = window.topicDicPBS[key];
				}
				for (var key in window.topicDicBNF) {
					topicDictionary[key] = window.topicDicBNF[key];
				}									    		
	    	} else {
		    	var topicDictionaryESB_PSI = Object.assign({}, window.topicDicESB, window.topicDicPSI);
		    	var topicDictionaryESB_PSI_PBS = Object.assign({}, topicDictionaryESB_PSI, window.topicDicPBS);
		    	topicDictionary = Object.assign({}, topicDictionaryESB_PSI_PBS, window.topicDicBNF);
		    }

			var numTopicSelected = 0;
			var currentLayerSelectable = false;
			for (var key in topicDictionary) {
		        var chkboxId = window.chkTopicPrefix + topicDictionary[key];

		        var checkbox = document.getElementById(chkboxId);	
		        if (checkbox != null) {	

		        	if(checkbox.checked == true){
        		
				        dicTopicSelected[topicDictionary[key]]  = true;    	
				        numTopicSelected = numTopicSelected + 1;
			        } else {
			        	dicTopicSelected[topicDictionary[key]]  = false; 
			        }
		        }
			}

			if ((dicTopicSelected[topicDictionary[currentTopic]] == true) || (numTopicSelected ==0)){

				currentLayerSelectable = true;				
			}			
	    	return currentLayerSelectable;
	    };
	    var addSingleFeatureForPopup = function(eaID, clickEvt) {
	    	selfSimpleSearchFilter.map.infoWindow.resize(260, 150 );
        	/*if (window.widthOfInfoWindow > 0 ) {
        		selfSimpleSearchFilter.map.infoWindow.resize(window.widthOfInfoWindow, window.heightOfInfoWindow );
        	}*/	    	
			var selectQuery = new query();
	        selectQuery.geometry = clickEvt.mapPoint;
	        selectQuery.returnGeometry = true;
	        selectQuery.spatialRelationship = query.SPATIAL_REL_INTERSECTS;  
	        if (window.hashPopup[eaID].hasOwnProperty('geometrytype')) {
	        	if (window.hashPopup[eaID].geometrytype == "point") {
	        		selectQuery.distance = 180;
	        	}
	        }
	                   
	        var queryTask = new QueryTask(window.hashURL[eaID]);
	        popupField = window.hashPopup[eaID].fieldInfos[0]["fieldName"];
	        var bIsTextFormat = false;
	        if (window.hashPopup[eaID].fieldInfos[0].hasOwnProperty('stringFieldOption')) {	        	
	        	if (window.hashPopup[eaID].fieldInfos[0].stringFieldOption == "textbox") {
	        		bIsTextFormat = true;
	        	}
	        }
	        
	        if (window.hashPopup[eaID].fieldInfos[0].hasOwnProperty('format')) {
	        	if (window.hashPopup[eaID].fieldInfos[0].format.hasOwnProperty('places')) {
	        		numDecimalDigit = window.hashPopup[eaID].fieldInfos[0].format.places;
	        	}
	        }
	        
			if (window.hashPopup[eaID].hasOwnProperty('title')) {
				var popupField = window.hashPopup[eaID].fieldInfos[0]["fieldName"];
				var popupTitle = window.hashPopup[eaID].title.split(":");

				selectQuery.outFields = [popupTitle[1].trim().replace("{","").replace("}","")];
			} else {
				selectQuery.outFields = [];
			}

	        for (var ii=0, il=window.hashPopup[eaID].fieldInfos.length; ii<il; ii++) {
	        	if ((window.hashPopup[eaID].fieldInfos[ii].visible == true)||(window.hashPopup[eaID].fieldInfos[ii].visible == "true")) { 
	        		selectQuery.outFields.push(window.hashPopup[eaID].fieldInfos[ii].fieldName);		        
		        }	
	        }

	        queryTask.execute(selectQuery, function (features) {
	        	if (window.hashPopup[eaID] != undefined) {
					//Performance enhancer - assign featureSet array to a single variable.
					
					if (features.features.length >=1){
						var resultFeatures = features.features;
						if (resultFeatures[0].geometry.type == "polygon") {
							var symbol = new SimpleFillSymbol(
			                  SimpleFillSymbol.STYLE_NULL, 
			                  new SimpleLineSymbol(
			                    SimpleLineSymbol.STYLE_SOLID, 
			                    new Color([0, 0, 200, 255]), 
			                    1
			                  ),
			                  new Color([215, 215, 215,255])
			                );
		               }
					   /*if (resultFeatures[0].geometry.type == "polyline") {
							var symbol = new SimpleFillSymbol(
			                  SimpleFillSymbol.STYLE_NULL, 
			                  new SimpleLineSymbol(
			                    SimpleLineSymbol.STYLE_SOLID, 
			                    new Color([0, 0, 200, 255]), 
			                    1
			                  ),
			                  new Color([215, 215, 215,255])
			                );
		               }	*/	       
					   if (resultFeatures[0].geometry.type == "point") {
							var symbol = new SimpleMarkerSymbol(
			                  SimpleMarkerSymbol.STYLE_NULL, 
			                  new SimpleMarkerSymbol(
			                    SimpleMarkerSymbol.STYLE_SOLID, 
			                    new Color([0, 0, 200, 255]), 
			                    1
			                  ),
			                  new Color([215, 215, 215,255])
			                );
		               }	
						//Loop through each feature returned
						for (var i=0, il=resultFeatures.length; i<il; i++) {
							var popupTitle;
							var content;
							if (window.hashPopup[eaID].hasOwnProperty('title')) {
									popupTitle = window.hashPopup[eaID].title.split(":");
									content = "<b>" + popupTitle[0] + "</b>: $" + popupTitle[1].trim() + "<hr>";
							}else {
								content = "";
							}
							var indexLineNumber = 0;
					        for (var ii=0, i2=window.hashPopup[eaID].fieldInfos.length; ii<i2; ii++) {
					        	var strFirstLine = "";
					        	if (indexLineNumber==0) {
					        		strFirstLine = "<b>";
					        	} else {
					        		strFirstLine = "<br><b>";
					        	}
					        	if ((window.hashPopup[eaID].fieldInfos[ii].visible == true)||window.hashPopup[eaID].fieldInfos[ii].visible == "true") { 
									if (window.hashPopup[eaID].fieldInfos[ii].hasOwnProperty('format'))  {
							        	if (window.hashPopup[eaID].fieldInfos[ii].format.hasOwnProperty('dateFormat')) {
							        		strDateFormat = window.hashPopup[eaID].fieldInfos[ii].format.dateFormat;
							        		content = content +  strFirstLine + window.hashPopup[eaID].fieldInfos[ii].label + "</b>: ${" + window.hashPopup[eaID].fieldInfos[ii].fieldName + ":selfSimpleSearchFilter.formatDateByFieldInfo}";	
								     	}
								     	else if (window.hashPopup[eaID].fieldInfos[ii].format.hasOwnProperty('places')) {
								     		numDecimalDigit = window.hashPopup[eaID].fieldInfos[ii].format.places;
								     		content = content +  strFirstLine + window.hashPopup[eaID].fieldInfos[ii].label + "</b>: ${" + window.hashPopup[eaID].fieldInfos[ii].fieldName + ":selfSimpleSearchFilter.formatValue}";	
								     	}
								     }  else if (window.hashPopup[eaID].fieldInfos[ii].fieldName.indexOf("_URL")>=0) {
								     	content = content +  strFirstLine + window.hashPopup[eaID].fieldInfos[ii].label + "</b>: ${" + window.hashPopup[eaID].fieldInfos[ii].fieldName + ":selfSimpleSearchFilter.formatURL}";	
								     }  else {
										content = content +  strFirstLine + window.hashPopup[eaID].fieldInfos[ii].label + "</b>: ${" + window.hashPopup[eaID].fieldInfos[ii].fieldName + "}";	
									}
									indexLineNumber = indexLineNumber + 1;												        		
				        		}
			        		}	
			        		var infoTitle = "";
			        		for (var key in window.hashTitleToEAID){
							  if (window.hashTitleToEAID[key]==eaID) {
							  	infoTitle = key;
							  }
							}					
							var infoTemplate = new esri.InfoTemplate(infoTitle, content);
						    var graphic = resultFeatures[i];
						    graphic.setSymbol(symbol);
						    graphic.setInfoTemplate(infoTemplate);
						    featuresCollection.push(graphic);
						    if (!featureExistInCollection(graphic, currentMapInfoFromFL)) {
						    currentMapInfoFromFL.push(graphic);
						    }
						    selfSimpleSearchFilter.map.graphics.add(graphic);
						}		               	                        
	               }

					if 	(arrLayersForPopup.length > 0){
	        			addSingleFeatureForPopup(arrLayersForPopup.pop(),clickEvt);
	        		}
	        		else {
						if (selfSimpleSearchFilter.map.infoWindow.features != null){
							//test if current infoWindow resulted from  the previous click
							var bInfoWindowUpdated = true;
							if (selfSimpleSearchFilter.map.infoWindow.features.length == previuosMapInfoFromAll.length) {
								bInfoWindowUpdated = false;
							for (ii=0; ii < selfSimpleSearchFilter.map.infoWindow.features.length; ii++) {
									if (!featureExistInCollection(selfSimpleSearchFilter.map.infoWindow.features[ii], previuosMapInfoFromAll)) {
										bInfoWindowUpdated = true;
										break;
									}
								}
							}
							//end of test if current infoWindow resulted from  the previous click
							if (bInfoWindowUpdated) {
								if (selfSimpleSearchFilter.map.infoWindow.isShowing) {
									for (ii=0; ii < selfSimpleSearchFilter.map.infoWindow.features.length; ii++) {
									featuresCollection.push(selfSimpleSearchFilter.map.infoWindow.features[ii]);
										if (!featureExistInCollection(selfSimpleSearchFilter.map.infoWindow.features[ii], currentMapInfoFromDynamic)) {
									    	currentMapInfoFromDynamic.push(selfSimpleSearchFilter.map.infoWindow.features[ii]);	
									    }																			
									}
								}
							}
						}
	        			if 	(featuresCollection.length > 0){
			    			selfSimpleSearchFilter.map.infoWindow.setFeatures(featuresCollection);
							selfSimpleSearchFilter.map.infoWindow.show(clickEvt.mapPoint);
						}
					}
	           } //end of if (window.hashPopup[eaID] != undefined)
	        }); 	
		};
		var setClickEventForPopup = function(){    		
				bSimulatedClickAddressed = false;
				bSimulatedClick = false;
	 			var mapClickListenerForPopup = connect.connect(selfSimpleSearchFilter.map, "onClick", function(evt) {
	 				    if (!bSimulatedClick) {
	 				    	bSimulatedClickAddressed = false;
	 				    	previuosMapInfoFromFL = [];	
	 				    	previousMapInfoFromDynamic = [];
	 				    	previuosMapInfoFromAll = [];
	 				    	for (kk=0; kk < currentMapInfoFromFL.length; kk++) {
	 				    		previuosMapInfoFromFL.push(currentMapInfoFromFL[kk]);
	 				    		previuosMapInfoFromAll.push(currentMapInfoFromFL[kk]);
	 				    	}
	 				    	for (kk=0; kk < currentMapInfoFromDynamic.length; kk++) {
	 				    		previousMapInfoFromDynamic.push(currentMapInfoFromDynamic[kk]);
	 				    		previuosMapInfoFromAll.push(currentMapInfoFromDynamic[kk]);
	 				    	}	 				    	
 				    		featuresCollection = [];
	 				    	currentMapInfoFromFL = [];	 	
	 				    	currentMapInfoFromDynamic = [];
	 				    }
						if (bSimulatedClick) {
			 				if (!bSimulatedClickAddressed) {
					if ((window.toggleOnHucNavigation == true) || (window.toggleOnRainDrop == true)|| (window.toggleOnElevation == true)) {					
						connect.disconnect(mapClickListenerForPopup);
					} 
					else {
						currentMapInfoFromDynamic = [];
						selfSimpleSearchFilter.map.graphics.clear();
						if (selfSimpleSearchFilter.map.infoWindow.features != null){
							for (ii=0; ii < selfSimpleSearchFilter.map.infoWindow.features.length; ii++) {
								if (!featureExistInCollection(selfSimpleSearchFilter.map.infoWindow.features[ii], previuosMapInfoFromFL)) {
									if (!featureExistInCollection(selfSimpleSearchFilter.map.infoWindow.features[ii], currentMapInfoFromDynamic)) {
										currentMapInfoFromDynamic.push(selfSimpleSearchFilter.map.infoWindow.features[ii]);
									}
								}									
							}					
						}	
						arrLayersForPopup = [];
			    		for (i in window.featureLyrNumber) {  
			    			bVisibleFL = false;
			    			bVisibleTL = false;
				    		lyrFL = selfSimpleSearchFilter.map.getLayer(window.layerIdPrefix + window.featureLyrNumber[i]);		    		
				    		if (lyrFL != null) {		    			
								if (lyrFL.visible == true){
									bVisibleFL = true;
								}
							} else {
								lyrFL = selfSimpleSearchFilter.map.getLayer(window.layerIdPBSPrefix + window.featureLyrNumber[i]);	
								if (lyrFL != null) {
									if (lyrFL.visible == true){
										bVisibleFL = true;
									}
								}
							}
							lyrTL = selfSimpleSearchFilter.map.getLayer(window.layerIdTiledPrefix + window.featureLyrNumber[i]);
				    		if (lyrTL != null) {		    			
								if (lyrTL.visible == true){
									bVisibleTL = true;							
								}
							}		
							if ((bVisibleFL == true) || (lyrTL == true)) {
								arrLayersForPopup.push(window.featureLyrNumber[i]);
							}		    		
				    	}
				    	//start to popup for first layer:
				    	if 	(arrLayersForPopup.length > 0){
				    	addSingleFeatureForPopup(arrLayersForPopup.pop(),evt);         
			        	}       
			        }
								//end of addressed
				 				bSimulatedClickAddressed= true;
				 				bSimulatedClick = false;
			 				}
			 			}
						setTimeout(lang.hitch(this, function() {
				          if (!bSimulatedClick && !bSimulatedClickAddressed) {
				          	bSimulatedClickAddressed = false;
				          	bSimulatedClick = true;
				          	selfSimpleSearchFilter.map.emit("click", { bubbles: false, cancelable: true, screenPoint: evt.mapPoint, mapPoint: evt.mapPoint });
				          }
				        }), 1000);
				})
		};
		var updateSelectableLayersArea = function (){
			    if (dijit.byId('selectionCriteria')._isShown()) {
			    	if (navigator.userAgent.indexOf("Chrome")>=0) {
			    		document.getElementById('tableSelectableLayersArea').style.height = "calc(100% - 515px)"; 
			    	} else if(navigator.userAgent.indexOf("Firefox")>=0) {			    		
			    		document.getElementById('tableSelectableLayersArea').style.height = "calc(100% - 630px)"; 
			    		document.getElementById("tableSelectableLayersArea").style.width = '360px';
			    	} else {
			    		document.getElementById('tableSelectableLayersArea').style.height = "calc(100% - 530px)"; 
			    	}
			    	
			    } else {
			    	if (navigator.userAgent.indexOf("Chrome")>=0) {
			    		document.getElementById('tableSelectableLayersArea').style.height = "calc(100% - 125px)";
			    	} else if(navigator.userAgent.indexOf("Firefox")>=0) {
			    		document.getElementById("tableSelectableLayersArea").style.width = '360px';
			    		document.getElementById('tableSelectableLayersArea').style.height = "calc(100% - 125px)"; 
			    	} else {
			    		document.getElementById('tableSelectableLayersArea').style.height = "calc(100% - 125px)";
			    	}		    	
	
			    }		
			
		}
		
  		
		var loadBookmarkHomeExtent = function(callback){   
		
		    var xobj = new XMLHttpRequest();
		
		    xobj.overrideMimeType("application/json");
		
		    xobj.open('GET', 'configs/eBookmark/config_Enhanced Bookmark.json', true); 
		
		    xobj.onreadystatechange = function () {
		      if (xobj.readyState == 4 && xobj.status == "200") {
		            callback(xobj.responseText);
		          }
		    };
		    xobj.send(null);  
		}; 	
		var objectPropInArray = function(list, prop, val) {
		  if (list.length > 0 ) {
		    for (i in list) {
		      if (list[i][prop] === val) {
		        return true;
		      }
		    }
		  }
		  return false;  
		};
    var updateSingleCommunityLayer = function(selectedLayerNum){    	
		lyrTobeUpdated = selfSimpleSearchFilter.map.getLayer(window.layerIdPrefix + selectedLayerNum);	 
		if(lyrTobeUpdated == null){				
    		lyrTobeUpdated = selfSimpleSearchFilter.map.getLayer(window.layerIdPBSPrefix + selectedLayerNum);
      	}  
		if (window.communitySelected != window.strAllCommunity) {        
			$.getJSON( 'configs/CommunitySymbology/' + window.communitySelected + '_JSON_Symbol/Nulls/' + window.communitySelected + '_' + window.hashAttribute[selectedLayerNum] + ".json", function( data ) {
				var renderer = new ClassBreaksRenderer(data);
        		lyrTobeUpdated.setRenderer(renderer);	
        		lyrTobeUpdated.redraw();
        		if (lyrTobeUpdated.visible == true){
            		lyrTobeUpdated.setVisibility(false);
            		lyrTobeUpdated.setVisibility(true);						                			
        		}
        		if 	(arrLayersToChangeSynbology.length > 0){
        			updateSingleCommunityLayer(arrLayersToChangeSynbology.pop());
        		}
        		
			})
		} else {
			$.getJSON( 'configs/CommunitySymbology/' + 'AllCommunities' + '_JSON_Symbol/Nulls/' + 'CombComm' + '_' + window.hashAttribute[selectedLayerNum] + ".json", function( data ) {
				var renderer = new ClassBreaksRenderer(data);
        		lyrTobeUpdated.setRenderer(renderer);	
        		lyrTobeUpdated.redraw();
        		if 	(arrLayersToChangeSynbology.length > 0){
        			updateSingleCommunityLayer(arrLayersToChangeSynbology.pop());
        		}	                		
			})						
		}
   };

		var chkIdDictionary = {};
		var nationalTopicList = [];
		var communityTopicList = [];
		var loadJSON = function(callback){   
	
	        var xobj = new XMLHttpRequest();
	
	        xobj.overrideMimeType("application/json");

        xobj.open('GET', 'widgets/LocalLayer/config.json', true); 

        xobj.onreadystatechange = function () {
              if (xobj.readyState == 4 && xobj.status == "200") {
	                callback(xobj.responseText);
	              }
	        };
	        xobj.send(null);  
	    };    	
		  var loadCommunityJSON = function(callback){   
	
	        var xobj = new XMLHttpRequest();
	
	        xobj.overrideMimeType("application/json");

	        xobj.open('GET', 'widgets/LocalLayer/communitymetadata.json', true); 
	
	        xobj.onreadystatechange = function () {
              if (xobj.readyState == 4 && xobj.status == "200") {
	                callback(xobj.responseText);
	              }
	        };
	        xobj.send(null);  
	    }; 	    
	    
		var loadNationalMetadataJSON = function(callback){   
	
	        var xobj = new XMLHttpRequest();
	
	        xobj.overrideMimeType("application/json");

	        xobj.open('GET', 'widgets/LocalLayer/nationalmetadata.json', true); 
	
	        xobj.onreadystatechange = function () {
                if (xobj.readyState == 4 && xobj.status == "200") {
	                callback(xobj.responseText);
	            }
	        };
	        xobj.send(null);  
	    };		    
	    var _onSelectAllLayers = function() {
			for (var key in chkIdDictionary) {
			  if ((chkIdDictionary.hasOwnProperty(key)) && (document.getElementById(key)!=null) ){
	        	document.getElementById(key).checked = true;
	
			  }
			}
	   };
	    var _onUnselectAllLayers = function() {
			for (var key in chkIdDictionary) {
			  if ((chkIdDictionary.hasOwnProperty(key)) && (document.getElementById(key)!=null) ){
	        	 document.getElementById(key).checked = false;	
			  }
			}
	   };	   
	   
	   var showLayerListWidget = function(){
	        var widgetName = 'LayerList';
	        var widgets = selfSimpleSearchFilter.appConfig.getConfigElementsByName(widgetName);
	        var pm = PanelManager.getInstance();
	        pm.showPanel(widgets[0]);	   	
	   }

	   var add_bc_icons = function(layerArea, scale, type) {
	   		indexImage = 0;

	   		var BC_Div = dojo.create('div', {
	   			'style': 'overflow:hidden; padding-left: 16px; position: relative; top: -2px; width:245px'
			}, layerArea);
			
			for (var key in window.categoryDic) {

				bc_img = document.createElement('div');
				bc_img.title  = key;
								
				if (eaCategory.indexOf(key) !=-1) {
					bc_img.setAttribute("class",window.categoryDic[key] + ' icon_style');
				}
				else {
					bc_img.setAttribute("class",window.categoryDic[key] + "_bw icon_style");
				}
				
				indexImage = indexImage + 1;
				BC_Div.appendChild(bc_img);
				
				
			}

			scale_img = document.createElement('div');
			scale_img.style.marginLeft = '20px';
			

			if (scale == "NATIONAL") {
					scale_img.title = "National Dataset";
				} else {
					scale_img.title = "Community Dataset";
				}
			scale_img.setAttribute("class", scale + ' icon_style');
			BC_Div.appendChild(scale_img);

			datatype_img = document.createElement('div');
			

			if (type == 'huc12') {
				datatype_img.title = "Data summarized by 12 digit HUCs";
			} else if (type == 'cbg') {
				datatype_img.title = "Data summarized by census block groups";
			} else if (type == 'ctr') {
				datatype_img.title = "Data summarized by census tract";
			} else if (type == 'grid') {
				datatype_img.title = "Non-summarized grid data";
			} else if (type == 'plp') {
				datatype_img.title = "Point, line, or polygon data"
			}

			datatype_img.setAttribute("class", type + ' icon_style');
			BC_Div.appendChild(datatype_img);

			// Add popup dialog box for Benefit 
			BC_Div.onclick = function () {
				
				$.getJSON("./widgets/Demo/config.json", function(json) {
						// read from tour stop 4 content
						helpContent = json['tour'][3]['content'].join("")

						var bc_description = new Dialog({
		        		title: 'EnviroAtlas Icons', 
		        		style: 'width: 450px',
		        		onHide: function() {
		        			bc_description.destroy()
		        			}
		        		});

		        		bc_description.containerNode.style='background:rgb(72,85,102); color:white';
		        		
					    var iconContent = dojo.create('div', {
	    					'innerHTML': helpContent,
	    				}, bc_description.containerNode);

	    				bc_description.show();
					});
				} // end onclick

		   }
 	   
    var	_addSelectableLayerSorted = function(items){	  
	    
		updateTopicToggleButton("ESB");
		updateTopicToggleButton("PSI");
		updateTopicToggleButton("PBS");
		updateTopicToggleButton("BNF");

		var nSearchableColumns = document.getElementById('tableLyrNameDescrTag').getElementsByTagName('tr')[0].getElementsByTagName('th').length;
		var eaIDFilteredList = [];
		
		$("#tableLyrNameDescrTag").dataTable().$('td',{"filter":"applied"}).each( function (value, index) {

			var currentCellText = $(this).text();
			if (!isNaN(currentCellText)){
				eaIDFilteredList.push(currentCellText);
			}			
		}); 
			
		//alert(selfSimpleSearchFilter.domNode.parentNode.clientHeight);


		var tableOfRelationship = document.getElementById("tableSelectableLayersArea");

		dojo.destroy('layerAreaESB');
		dojo.destroy('layerAreaPSI');
		dojo.destroy('layerAreaPBS');
		dojo.destroy('layerAreaBNF');
		
        dojo.destroy('hrSeperatorESB');
        dojo.destroy('hrSeperatorPSI');
        dojo.destroy('hrSeperatorPBS');
        dojo.destroy('hrSeperatorBNF');		
		
        var hrSeperatorESB = dojo.create('div', {
            'id': 'hrSeperatorESB',
            'style': 'width: 100%',
        }, tableOfRelationship);
        
		var layerAreaESB = dojo.create('div', {
			'id': 'layerAreaESB',
			'style': 'width: 100%',
		}, tableOfRelationship);

        var hrSeperatorPSI = dojo.create('div', {
            'id': 'hrSeperatorPSI',
            'style': 'width: 100%',
        }, tableOfRelationship);
        
        var layerAreaPSI = dojo.create('div', {
            'id': 'layerAreaPSI',
            'style': 'width: 100%',
        }, tableOfRelationship);    
        		
        var hrSeperatorPBS = dojo.create('div', {
            'id': 'hrSeperatorPBS',
            'style': 'width: 100%',
        }, tableOfRelationship);
		
		var layerAreaPBS = dojo.create('div', {
			'id': 'layerAreaPBS',
			'style': 'width: 100%',
		}, tableOfRelationship);	
		
        var hrSeperatorBNF = dojo.create('div', {
            'id': 'hrSeperatorBNF',
            'style': 'width: 100%',
        }, tableOfRelationship);
        			
		var layerAreaBNF = dojo.create('div', {
			'id': 'layerAreaBNF',
			'style': 'width: 100%',
		}, tableOfRelationship);

        var hrSeperatorESB = dojo.create('hr', {
            'id': "hrESB",
            'class': 'seperator',
        }, hrSeperatorESB);
 
        var hrSeperatorPSI = dojo.create('hr', {
            'id': "hrPSI",
            'class': 'seperator',
        }, hrSeperatorPSI);
               
        var hrSeperatorPBS = dojo.create('hr', {
            'id': "hrPBS",
            'class': 'seperator',
        }, hrSeperatorPBS);
        
        var hrSeperatorBNF = dojo.create('hr', {
            'id': "hrBNF",
            'class': 'seperator',
        }, hrSeperatorBNF);

        document.getElementById("hrESB").style.display = 'none';
        document.getElementById("hrPSI").style.display = 'none';
        document.getElementById("hrPBS").style.display = 'none';
        document.getElementById("hrBNF").style.display = 'none';

        var numOfSelectableLayers = 0;
        var totalNumOfLayers = 0;

		SelectedTopics = [];          
    	dojo.forEach(items, function(item) {
           	var currentLayerSelectable = false;
			eaLyrNum = layerDataStore.getValue( item, 'eaLyrNum').toString();
			eaID = layerDataStore.getValue( item, 'eaID').toString();
			layerName = layerDataStore.getValue( item, 'name');
			eaDescription = layerDataStore.getValue( item, 'eaDescription');
			eaDfsLink = layerDataStore.getValue( item, 'eaDfsLink');
			eaScale = layerDataStore.getValue( item, 'eaScale');
			eaMetadata = layerDataStore.getValue( item, 'eaMetadata');
			eaTopic = layerDataStore.getValue( item, 'eaTopic');
			eaCategory = layerDataStore.getValue( item, 'eaCategory');
			IsSubLayer = layerDataStore.getValue( item, 'IsSubLayer');
			SubLayerNames = layerDataStore.getValue( item, 'SubLayerNames');
			SubLayerIds = layerDataStore.getValue( item, 'SubLayerIds');
			sourceType = layerDataStore.getValue( item, 'sourceType');
			categoryTab = layerDataStore.getValue( item, 'categoryTab');
			bSelectedByNationalOrCommunity = false;
			

			var chkNationalScale = document.getElementById("chkNational").checked;
			var chkCommunityScale = document.getElementById("chkCommunity").checked;

			// Search should use both national and community
			if (document.getElementById('searchFilterText').value != ''){
				chkNationalScale = true;
				chkCommunityScale = true;
			}
			switch (eaScale) {
				case "NATIONAL":					
					if(chkNationalScale){
						bSelectedByNationalOrCommunity = true;
					}
					break;
				case "COMMUNITY":
					if(chkCommunityScale){
						bSelectedByNationalOrCommunity = true;
					}
					break;
			}    			
			if (((chkNationalScale == false) && (chkCommunityScale == false)) || (arrCategoryForAllScale.indexOf(categoryTab) >= 0)) {
				bSelectedByNationalOrCommunity = true;
			}

			if (SubLayerIds.length == 0) {
				totalNumOfLayers = totalNumOfLayers + 1;
			}				


			if (bSelectedByNationalOrCommunity) {
				if (bSelectedByTopics(eaTopic, categoryTab)) {
					currentLayerSelectable = true;				
				}
			}// end of if (bSelectedByNationalOrCommunity)
			
			//if searchFilterText is not empty then search all EnviroAtalas data
            if (document.getElementById('searchFilterText').value != ''){
                currentLayerSelectable = true;
            }
            
			if (currentLayerSelectable && (eaIDFilteredList.indexOf(eaID) >= 0)) {//add the current item as selectable layers
		
				var bLayerSelected = false;
				if ((window.allLayerNumber.indexOf(eaID)) == -1) {                        	
                	window.allLayerNumber.push(eaID);
                }
                else {
		    		lyr = selfSimpleSearchFilter.map.getLayer(window.layerIdPrefix + eaID);
					if(lyr){
			    		bLayerSelected = true;
		          	}                   	
                }
	
                numOfSelectableLayers++;
				//Add Header for each Topic in list
				if (SelectedTopics.indexOf(eaTopic) == -1) {
					if (!(eaTopic in hiderows)) {
						hiderows[eaTopic] = true;
					}
					
					SelectedTopics.push(eaTopic);
					
					if (categoryTab == "ESB") {
					    //document.getElementById("hrESB").style.display = '';

						var topicHeader = dojo.create('div', {
		    				'id': eaTopic,
		    				'class': 'topicHeader topicHeader'+categoryTab,
		    				'innerHTML': eaTopic,
		    				onclick: function(){
		    					hiderows[this.id] = !hiderows[this.id];
								_updateSelectableLayer();
		    				}
		    			}, layerAreaESB);
			    	} else if (categoryTab == "PSI"){
                        //document.getElementById("hrPSI").style.display = '';
                        var topicHeader = dojo.create('div', {
                            'id': eaTopic,
                            'class': 'topicHeader topicHeader'+categoryTab,
                            'innerHTML': eaTopic,
                            onclick: function(){
                                hiderows[this.id] = !hiderows[this.id];
                                _updateSelectableLayer();
                            }
                        }, layerAreaPSI);                       
                    } else if (categoryTab == "PSI"){
                        //document.getElementById("hrPSI").style.display = '';
                        var topicHeader = dojo.create('div', {
                            'id': eaTopic,
                            'class': 'topicHeader topicHeader'+categoryTab,
                            'innerHTML': eaTopic,
                            onclick: function(){
                                hiderows[this.id] = !hiderows[this.id];
                                _updateSelectableLayer();
                            }
                        }, layerAreaPSI);                       
                    } else if (categoryTab == "PBS"){
			    	    //document.getElementById("hrPBS").style.display = '';
						var topicHeader = dojo.create('div', {
		    				'id': eaTopic,
		    				'class': 'topicHeader topicHeader'+categoryTab,
		    				'innerHTML': eaTopic,
		    				onclick: function(){
		    					hiderows[this.id] = !hiderows[this.id];
								_updateSelectableLayer();
		    				}
		    			}, layerAreaPBS);			    		
					} else if (categoryTab == "BNF"){
					    //document.getElementById("hrBNF").style.display = '';
						var topicHeader = dojo.create('div', {
		    				'id': eaTopic,
		    				'class': 'topicHeader topicHeader'+categoryTab,
		    				'innerHTML': eaTopic,
		    				onclick: function(){
		    					hiderows[this.id] = !hiderows[this.id];
								_updateSelectableLayer();
		    				}
		    			}, layerAreaBNF);			    		
					}
				}
				//Finsih add header for each topic	

				var buttonInfoId = "but" + eaID;
    			hashFactsheetLink[buttonInfoId] = eaDfsLink;
	        	hashLayerNameLink[buttonInfoId] = layerName;
	        	hashDescriptionforI[buttonInfoId] = eaDescription;
	        	hashSubLayers[buttonInfoId] = SubLayerIds;
	        	hashSubTopicforI[buttonInfoId] = SubLayerNames;


				//If not a subLayer create a new Row
				
				if (!IsSubLayer) {
					
					if (categoryTab == "ESB") {
						var mainDiv = dojo.create('div', {
							'class': 'layerDiv'
							}, layerAreaESB);						
					} else if (categoryTab == "PSI"){
                        var mainDiv = dojo.create('div', {
                            'class': 'layerDiv'
                            }, layerAreaPSI);                       
                    } else if (categoryTab == "PBS"){
						var mainDiv = dojo.create('div', {
							'class': 'layerDiv'
							}, layerAreaPBS);						
					} else if (categoryTab == "BNF"){
						var mainDiv = dojo.create('div', {
							'class': 'layerDiv'
							}, layerAreaBNF);						
					}
					if (bCollapseClicked == true) {
					    if (document.getElementById("collapseIcons").checked) {
                            mainDiv.style.display = 'None';
                            hiderows[eaTopic] = false;
                        } else {
                            mainDiv.style.display = '';
                            hiderows[eaTopic] = true;
                        }
					} else {
					    if (!hiderows[eaTopic]) {
                            mainDiv.style.display = 'None';
                        }
					}




					var topicRow = dojo.create('div', {
						"style" : "display:inline-block; width:100%"
						//"style": ""
	    			}, mainDiv);

	    			var Checkbox_div = dojo.create('div', {
	    				'class': 'checkbox_cell',
	    				
	    			}, topicRow);

	    			if (!SubLayerIds.length) {

		    			chkboxId = window.chkSelectableLayer + eaID;
		    			var checkbox = dojo.create('input', {
		    				"type": "checkbox",
							"name": chkboxId,
							"value": 1,
							"id": chkboxId,
							"checked": bLayerSelected,
                            "style": "margin-top: 1px"

		    			}, Checkbox_div);
		    			chkIdDictionary[chkboxId] = SubLayerNames[i] + layerName;
		    		} else {
		    			Checkbox_div.innerHTML = '_&nbsp';
		    			Checkbox_div.style.textAlign = 'right';
		    			Checkbox_div.style.color = 'gray';

		    		}


	    			var iButton = dojo.create('input', {
	    				"type": "button",
						"name": buttonInfoId,
						"id": buttonInfoId,
						"checked": bLayerSelected,
						"class": "i-button",
						"style": "float: right",
						onclick: function(e) {

							
							var infobox = new Dialog({
			        		title: hashLayerNameLink[this.id],
			        		style: 'width: 300px'
			        		});

			        		subLayers = hashSubLayers[this.id].split(';');

			        		if (subLayers != "") {
			        			for (i=0; i < subLayers.length; i++) {
			        				var subTopicHeader = dojo.create('h2', {
			        					'innerHTML': hashSubTopicforI[this.id].split(';')[i],
			        					'style': 'margin-top: 0px'
			        				}, infobox.containerNode);

			        				var infoDiv = dojo.create('div', {
			        					'innerHTML': hashDescriptionforI['but' + subLayers[i]] + '<br><br>'
			        				}, infobox.containerNode);

			        				var linkDiv = dojo.create('div', {
		        					}, infobox.containerNode);
		        					// if factsheetlink is not empty
		        					if (/\S/.test(hashFactsheetLink['but' + subLayers[i]])) {
			        					var factsheetDiv = dojo.create('a', {
				        					'innerHTML': 'Fact Sheet',
				        					'href': window.dataFactSheet + hashFactsheetLink['but' + subLayers[i]],
				        					'target': '_blank',
				        					'class': 'factsheetLink'
				        					}, linkDiv);
			        				}
			        				if (i < subLayers.length -1) {
			        					var line = dojo.create('hr', {'style': 'margin-top: 10px'}, infobox.containerNode);
			        				}

			        			}
			        		} else {
			        			var infoDiv = dojo.create('div', {
		        					'innerHTML': hashDescriptionforI[this.id] + '<br><br>'
		        				}, infobox.containerNode);

		        				var linkDiv = dojo.create('div', {
		        					}, infobox.containerNode)
		        				if (/\S/.test(hashFactsheetLink[this.id])) {
			        				var factsheetDiv = dojo.create('a', {
			        					'innerHTML': 'Fact Sheet',
			        					'href': window.dataFactSheet + hashFactsheetLink[this.id],
			        					'target': '_blank',
			        					'class': 'factsheetLink' 
			        				}, linkDiv);
			        			}
			        		}
							infobox.show()
						}
					}, topicRow);


	    			var topicName = dojo.create('div', {
	    				"innerHTML": layerName,
		        		"style" : "font-weight: 500; display: table-cell; font-size:13px",
		        		"title" :eaDescription
	    			}, topicRow);
	    			
	    		

		    		if (SubLayerIds.length) {
		    			numOfSelectableLayers--;
						SubLayerNames = SubLayerNames.split(';');
						SubLayerIds = SubLayerIds.split(';');

						var subTopicRow = dojo.create('div', {
							"style" : "display:inline-block; width:100%"
							//"style": "display:inline-block; width:100%"
		    			}, mainDiv);

		    			var Checkbox_div = dojo.create('div', {
		    				'class': 'checkbox_cell',
		    				'innerHTML': '&nbsp'
		    			}, subTopicRow);

		    			for (i=0; i< SubLayerNames.length; i++) {

							bLayerSelected = false;
							lyr = selfSimpleSearchFilter.map.getLayer(window.layerIdPrefix + SubLayerIds[i]);
							if(lyr){
					    		bLayerSelected = true;
				          	}     

				          	var Checkbox_div = dojo.create('div', {
			    				'class': 'checkbox_cell',
			    			}, subTopicRow);


		    				chkboxId = window.chkSelectableLayer + SubLayerIds[i];

		    				var checkbox = dojo.create('input', {
			    				"type": "checkbox",
								"name": chkboxId,
								"value": 1,
								"id": chkboxId,
								"checked": bLayerSelected,
								"style": "margin-top: 1px"

			    			}, Checkbox_div);

			    			var SubLayerDiv = dojo.create('div', {
		    					"innerHTML": SubLayerNames[i],
			        			"style" : "float: left; margin-right: 12px; font-style: italic",
			        			"title" :eaDescription
		    				}, subTopicRow);

		    				chkIdDictionary[chkboxId] = SubLayerNames[i] + layerName;
		    			}
					}

					if (!(document.getElementById("hideIcons").checked)) {
						add_bc_icons(mainDiv, eaScale, sourceType);
					} 
				}		
				
			}//end of if (currentLayerSelectable)
		});	
		var heightOfSelectableLayersArea = selfSimpleSearchFilter.domNode.parentNode.clientHeight-100;
		var widthOfSelectableLayersArea = selfSimpleSearchFilter.domNode.parentNode.clientWidth;
		//alert("widthOfSelectableLayersArea:"+widthOfSelectableLayersArea);
		//html.setStyle(this.selectableLayersArea, "height", heightOfSelectableLayersArea + "px");
		document.getElementById("tableSelectableLayersArea").style.height = heightOfSelectableLayersArea+ 'px';
		document.getElementById("tableSelectableLayersArea").style.width = widthOfSelectableLayersArea +'px';
		
			dojo.byId("numOfLayers").value = " " + String(numOfSelectableLayers) + " of " + String(totalNumOfLayers) + " Maps";

		for (var key in chkIdDictionary) {
		
	  		if ((chkIdDictionary.hasOwnProperty(key)) && (document.getElementById(key)!=null) ){
	  			document.getElementById(key).addEventListener('change', function() {
					if (this.checked){
						showLayerListWidget();	
						singleLayerToBeAddedRemoved = "a" + "," + this.getAttribute("id").replace(window.chkSelectableLayer, "");
						if (window.bLayerListWidgetStarted == false) {
							window.bLayerListWidgetStarted = true;
							setTimeout(lang.hitch(this, function() { //LayerList widget need to be started before layer is added.
								document.getElementById('butAddSingleLayer').click();
					        }), 3000);							
						} else {
							document.getElementById('butAddSingleLayer').click();
						}

					}
					else {
						singleLayerToBeAddedRemoved = "r" + "," + this.getAttribute("id").replace(window.chkSelectableLayer, "");
						document.getElementById('butAddSingleLayer').click();
					}				
	    		});
	  		}
		}    	
	};	  	   

	var updateTopicToggleButton = function(categoryTab) {
		var topicDictionary = null;
		switch (categoryTab) {
			case "ESB":					
				topicDictionary = window.topicDicESB;
				break;
            case "PSI":
                topicDictionary = window.topicDicPSI;
                break;				
			case "PBS":
				topicDictionary = window.topicDicPBS;
				break;
			case "BNF":
				topicDictionary = window.topicDicBNF;
				break;					
		}

		var chkNationalScale = document.getElementById("chkNational");
		var chkCommunityScale = document.getElementById("chkCommunity");

		if (document.getElementById('searchFilterText').value != ''){
			//chkNationalScale.className ="cmn-toggle cmn-toggle-round-flat-grayedout";
			chkNationalScale.disabled = true;
			//document.getElementById("chkNational_label").className = 'topicTitleGray';
			
			//chkCommunityScale.className ="cmn-toggle cmn-toggle-round-flat-grayedout";
			chkCommunityScale.disabled = true;
			//document.getElementById("chkCommunity_label").className = 'topicTitleGray';
			
			var usingSearchBox = true;
		} else {
			//chkNationalScale.className ="cmn-toggle cmn-toggle-round-flat";
			chkNationalScale.disabled = false;
			//document.getElementById("chkNational_label").className = 'none';
			//chkCommunityScale.className ="cmn-toggle cmn-toggle-round-flat";
			chkCommunityScale.disabled = false;
			//document.getElementById("chkCommunity_label").className = 'none';
			var usingSearchBox = false;
		}
				
	    for (var key in topicDictionary) {
	    	var bCurrentTopicDisabled = true;
	    	
	    	
			if((chkNationalScale.checked) && (nationalTopicList.indexOf(key) >= 0)) {
				bCurrentTopicDisabled = false;
			}
			if((chkCommunityScale.checked) && (communityTopicList.indexOf(key) >= 0)) {
				bCurrentTopicDisabled = false;
			}
			if ((chkNationalScale.checked == false) && (chkCommunityScale.checked == false)) {
				bCurrentTopicDisabled = false;
			}			
			if (arrCategoryForAllScale.indexOf(categoryTab) >= 0) {
			    bCurrentTopicDisabled = false;
			}
			
	        var chkboxId = window.chkTopicPrefix + topicDictionary[key];
	        var checkbox = document.getElementById(chkboxId);			

	        //var title = document.getElementById(chkboxId + '_label');
	        //var title = document.getElementById(chkboxId);

	       if (bCurrentTopicDisabled || usingSearchBox) {
		        //checkbox.className ="cmn-toggle cmn-toggle-round-flat-grayedout";
		        checkbox.nextSibling.style.color= "#b3b3b3";
		        checkbox.removeEventListener("click", _updateSelectableLayer);	   
		        //title.className = 'topicTitleGray';    
		        checkbox.disabled = true;	
	       } else {
		        //checkbox.className ="cmn-toggle cmn-toggle-round-flat";	
		        checkbox.nextSibling.style.color= "#000000";
		        checkbox.addEventListener("click", _updateSelectableLayer);	    
		        //title.className = 'none';  
		        checkbox.disabled = false;	       	
	       }
		}
	}
	var collapseSelectableLayer = function(){
	    bCollapseClicked = true;
	    /*for (var key in hideRows) {
	        if (document.getElementById("collapseIcons").checked) {
	            hideRows[key] = true;
	        } else {
	            hideRows[key] = false;
	        }
	        
	    }*/
        setTimeout(lang.hitch(this, function() { //LayerList widget need to be started before layer is added.
            bCollapseClicked = false;
        }), 1000);  
	    _updateSelectableLayer();
	}
	
	var	_updateSelectableLayer = function(){	
		
		layerDataStore.fetch({
			//Sort by alphabetically Topic, then by Name
				sort: [{attribute: 'eaTopic', descending: false},
				  		{attribute: 'name', descending: false}],
				onComplete: _addSelectableLayerSorted
				});
	};
    var clazz = declare([BaseWidget, _WidgetsInTemplateMixin], {
        baseClass: 'jimu-widget-simplesearchfilter',
		onReceiveData: function(name, widgetId, data, historyData) {
			if (((name == 'AddData')||(name == 'AddWebMapData'))&&(data.message == "openFailedLayer")){
				this._onOpenFailedLayerClick();
			   } 	
			if (((name == 'LocalLayer')||(name == 'PeopleAndBuildSpaces')||(name == 'SelectCommunity')||(name == 'AddWebMapData'))&&(data.message == "updateCommunityLayers")){
				this._onUpdateCommunityLayers();
			}	
			if (((name == 'ElevationProfile')||(name == 'Raindrop')||(name == 'HucNavigation'))&&(data.message == "mapClickForPopup")){
				this._onMapClickForPopup();
			}		  
		},
    displayCloseButton: function() {		
        	indexImage = 0;
    		var tableOfRelationship = document.getElementById('closeFilter');
    		var tableRef = tableOfRelationship.getElementsByTagName('tbody')[0];

	    	newRow = tableRef.insertRow(tableRef.rows.length);
			var newCheckboxCell  = newRow.insertCell(0);

           	var checkbox = document.createElement('input');
			checkbox.type = "button";
			
	        chkboxId = "closeForFilter";
			checkbox.id = chkboxId;
			checkbox.className ="jimu-widget-filterforselect-close";

	        newCheckboxCell.appendChild(checkbox);    
        
			checkbox.addEventListener('click', function() {
				var widgetManager;
		        var filterForSelectWidgetEle = selfSimpleSearchFilter.appConfig.getConfigElementsByName("FilterForSelect")[0];
		        widgetManager = WidgetManager.getInstance();

	        	widgetManager.closeWidget(filterForSelectWidgetEle.id);
	        	document.getElementById("titleForFilter").style.display = "none"; 
	        	document.getElementById("resizeForFilterArea").style.display = "none";
	        	document.getElementById("closeFilterArea").style.display = "none";
	        	window.filterForSelectOpened = false;				
			}); 
    },	
    displayDragButton: function() {		
        	indexImage = 0;
    		var tableOfRelationship = document.getElementById('dragFilter');
    		var tableRef = tableOfRelationship.getElementsByTagName('tbody')[0];

	    	newRow = tableRef.insertRow(tableRef.rows.length);
			var newCheckboxCell  = newRow.insertCell(0);

           	var checkbox = document.createElement('input');
			checkbox.type = "button";
			
	        chkboxId = "dragForFilter";
			checkbox.id = chkboxId;
			checkbox.value = "Select data by topic";
			checkbox.className ="jimu-widget-filterforselect-drag";
	        newCheckboxCell.appendChild(checkbox);    
    },	
    displayResizeButton: function() {
		
        	indexImage = 0;

    		var tableOfRelationship = document.getElementById('resizeForFilter');
    		var tableRef = tableOfRelationship.getElementsByTagName('tbody')[0];

	    	newRow = tableRef.insertRow(tableRef.rows.length);
			var newCheckboxCell  = newRow.insertCell(0);
           	var checkbox = document.createElement('input');
	        chkboxId = "resizeForFilter";
			checkbox.id = chkboxId;
			checkbox.className ="jimu-widget-filterforselect-move";
	        newCheckboxCell.appendChild(checkbox);    

    },
    displayCategorySelection: function(categoryTab) {
		
        indexImage = 0;
	    var categoCount = 1;
	    var newRow;
	    var topicDictionary = null;
		switch (categoryTab) {
			case "ESB":					
				topicDictionary = window.topicDicESB;
				break;
            case "PSI":
                topicDictionary = window.topicDicPSI;
                break;				
			case "PBS":
				topicDictionary = window.topicDicPBS;
				break;
			case "BNF":
				topicDictionary = window.topicDicBNF;
				break;					
		} 

	    var keys = Object.keys(topicDictionary);
	    var half = Math.ceil((keys.length / 2));

	    for (i=0; i<keys.length; i++) {
	    	if (i < half) {
	    		var tableOfRelationship = document.getElementById(categoryTab + 'categoryTableL');
	    		var tableRef = tableOfRelationship.getElementsByTagName('tbody')[0];
	    	} else {
	    		var tableOfRelationship = document.getElementById(categoryTab + 'categoryTableR');
	    		var tableRef = tableOfRelationship.getElementsByTagName('tbody')[0];
	    	}

	    	newRow = tableRef.insertRow(tableRef.rows.length);
			var newCheckboxCell  = newRow.insertCell(0);
           	newCheckboxCell.style.paddingRight = "3px";

           	var checkbox = document.createElement('input');
			checkbox.type = "checkbox";
			
	        chkboxId = window.chkTopicPrefix + topicDictionary[keys[i]];

			checkbox.name = chkboxId;
			checkbox.value = 0;
			checkbox.id = chkboxId;
			//checkbox.className ="cmn-toggle cmn-toggle-round-flat";
			checkbox.className ="chk-toggle";
	        newCheckboxCell.appendChild(checkbox);    
	        var label = document.createElement('label');
	        label.setAttribute("for",chkboxId);
	        label.className ="label-chk-toggle";
			//label.innerHTML = "";
			label.innerHTML = keys[i];
			newCheckboxCell.appendChild(label);


			checkbox.addEventListener('change', function() {
				_updateSelectableLayer();
				
			});
			/// add category title:
           	/*var newTitleCell  = newRow.insertCell(1);
           	newTitleCell.id = chkboxId + '_label';
           	newTitleCell.style.paddingBottom = "3px";
           	//newTitleCell.style.width = "40%"
        
			var title = document.createElement('label');
			title.innerHTML = keys[i];    
			newTitleCell.appendChild(title); */
	    	
	    }


        /* Commenting out Supply/demand/driver choices.
		document.getElementById("Supply").onclick = function() {
		    _updateSelectableLayer();
		};
		document.getElementById("Demand").onclick = function() {
		    _updateSelectableLayer();
		};	
		document.getElementById("Driver").onclick = function() {
		    _updateSelectableLayer();
		};
		document.getElementById("SpatiallyExplicit").onclick = function() {
		    _updateSelectableLayer();
		};	
        */
		document.getElementById("hideIcons").onclick = function() {
		    _updateSelectableLayer();
		};					
        document.getElementById("collapseIcons").onclick = function() {
            collapseSelectableLayer();
        };
		layersToBeAdded = "a";
	    

    },
	displayGeographySelection: function() {
        var tableOfRelationship = document.getElementById('geographyTable');
	    var tableRef = tableOfRelationship.getElementsByTagName('tbody')[0];    	
	    indexImage = 0;
	    
		//add row of National geography
	    var newRow   = tableRef.insertRow(tableRef.rows.length);	    
       	newRow.style.height = "20px";
       	var newCheckboxCell  = newRow.insertCell(0);
       	newCheckboxCell.style.paddingRight = "3px";
       	var checkbox = document.createElement('input');
		checkbox.type = "checkbox";
        chkboxId = "chkNational";
		checkbox.name = chkboxId;
		checkbox.checked = false;
		checkbox.id = chkboxId;
		//checkbox.className ="cmn-toggle cmn-toggle-round-flat";
        newCheckboxCell.appendChild(checkbox);    
        var label = document.createElement('label');
        label.setAttribute("for",chkboxId);
		label.innerHTML = "";
		newCheckboxCell.appendChild(label);
		
		checkbox.addEventListener('click', function() {
			_updateSelectableLayer();
	    });				
		/// add National title:
       	var newTitleCell  = newRow.insertCell(1);
		var title = document.createElement('label');
		title.id = 'chkNational_label';
		title.innerHTML = "National";    
		newTitleCell.appendChild(title); 
        newTitleCell.style.paddingRight = "15px";

		//add Community geography to same row
       	var newCheckboxCell  = newRow.insertCell(2);
       	newCheckboxCell.style.paddingRight = "3px";
       	var checkbox = document.createElement('input');
		checkbox.type = "checkbox";
        chkboxId = "chkCommunity";
		checkbox.name = chkboxId;
		checkbox.checked = false;
		checkbox.id = chkboxId;
		//checkbox.className ="cmn-toggle cmn-toggle-round-flat";
        newCheckboxCell.appendChild(checkbox);    
        var label = document.createElement('label');
        label.setAttribute("for",chkboxId);
		label.innerHTML = "";
		newCheckboxCell.appendChild(label);
		
		checkbox.addEventListener('click', function() {
			_updateSelectableLayer();
	    });				
		
		// add Community title:
       	var newTitleCell  = newRow.insertCell(3);
		var title = document.createElement('label');
		title.id = 'chkCommunity_label';
		title.innerHTML = "EnviroAtlas Communities";    
		newTitleCell.appendChild(title); 

		var newButtonInfoCell  = newRow.insertCell(4);
		var iButton = dojo.create('input', {
	    				"type": "button",					
						"class": "i-button",
						"style": "float: right; height:14px; width:14px; position:relative; top:-1px",
						onclick: function(e) {
							var infobox = new Dialog({
			        		title: "EnviroAtlas Spatial Extents",
			        		style: 'width: 300px'
			        		});

			        		var nationalHeader = dojo.create('h2', {
			        			'style': 'margin-top: 0px',
			        			'innerHTML': 'National'
			        		}, infobox.containerNode);

			        		var nationalDiv = dojo.create('div', {
	        					'innerHTML': "Most maps at the national extent provide wall-to-wall data \
	        								 coverage for the contiguous U.S. as well as some data for \
	        								 Alaska and Hawaii. These data include raster datasets, state \
	        								 and local polygons, and many layers derived from data with a \
	        								 resolution of 30m. Most national datasets are summarized by 12-digit \
	        								 hydrologic unit codes, or sub-watershed basins."
	        				}, infobox.containerNode);

	        				dojo.create('hr', {'style': 'margin-top: 10px'}, infobox.containerNode);

	        				var communityHeader = dojo.create('h2', {
	        					'style': 'margin-top: 0px',
			        			'innerHTML': 'EnviroAtlas Communities'
			        		}, infobox.containerNode);

	        				var CommunityDiv = dojo.create('div', {
	        					'innerHTML': "Community-level information in EnviroAtlas draws from fine scale \
	        								  land cover data, census data, and models and is only available \
	        								  for selected communities (up to 50 by 2019). There are approximately \
	        								  100 data layers per community. EnviroAtlas community data are \
	        								  consistent for each available community, and they are mostly \
	        								  summarized by census block groups. <br><br>"
	        				}, infobox.containerNode);

	        				var moreInfo = dojo.create('a', {
	        					'innerHTML': 'More info',
	        					'href': "https://www.epa.gov/enviroatlas/enviroatlas-spatial-extents",
	        					'target': '_blank',
	        					'class': 'factsheetLink'
	        					}, infobox.containerNode);


	        				var CommunityLink = dojo.create('a', {
	        					'innerHTML': 'Community Fact Sheet',
	        					'href': "https://www.epa.gov/sites/production/files/2015-07/documents/enviroatlas_community_factsheet.pdf",
	        					'target': '_blank',
	        					'class': 'factsheetLink',
	        					'style': 'margin-left: 10px'
	        					}, infobox.containerNode);



							infobox.show()
						}
					}, newButtonInfoCell);
		
		/*var newButtonInfoCell  = newRow.insertCell(4);
		var buttonInfo = document.createElement('input');
		buttonInfo.type = "button";
        var buttonInfoId = "butSelectOneCommunity";
		buttonInfo.name = buttonInfoId;
		buttonInfo.id = buttonInfoId;
		buttonInfo.value = "+/-";
		buttonInfo.style.height = "16px";
		buttonInfo.style.width = "28px";
		buttonInfo.style.lineHeight = "3px";//to set the text vertically center
		
		newButtonInfoCell.style.verticalAlign = "center";//this will put checkbox on first line
        newButtonInfoCell.appendChild(buttonInfo);  
        document.getElementById(buttonInfoId).onclick = function(e) {
   			document.getElementById('butOpenSelectCommunityWidget').click();
	    };   	*/	  		

	},
      startup: function() {

        this.inherited(arguments);
	    this.fetchDataByName('SelectCommunity');	
	     
	    this.displayCategorySelection("ESB");
	    this.displayCategorySelection("PSI");
	    this.displayCategorySelection("PBS");
	    this.displayCategorySelection("BNF");
		this.displayGeographySelection();
		this.displayResizeButton();	
		this.displayDragButton();
		this.displayCloseButton();
	
		selfSimpleSearchFilter = this;      	
	
	    loadBookmarkHomeExtent(function(response){
	    	var bookmarkClassified = JSON.parse(response);
	
	        for (index = 0, len = bookmarkClassified.bookmarks.length; index < len; ++index) {
	        	currentBookmarkClass = bookmarkClassified.bookmarks[index];
	        	if (currentBookmarkClass.name == "National") {
	        		bookmarkNational = currentBookmarkClass.items;	        		
        			var currentExtent = bookmarkNational[0].extent;
        			nExtent = Extent(currentExtent);
        			selfSimpleSearchFilter.map.setExtent(nExtent);	        		
	        	}
	        }
	    }); 
        loadJSON(function(response) {
            var localLayerConfig = JSON.parse(response);
            var arrLayers = localLayerConfig.layers.layer;
            console.log("arrLayers.length:" + arrLayers.length);
			///search items
	        var tableOfRelationship = document.getElementById('tableLyrNameDescrTag');
		    var tableRef = tableOfRelationship.getElementsByTagName('tbody')[0];    
            for (index = 0, len = arrLayers.length; index < len; ++index) {
                layer = arrLayers[index];                          
                var indexCheckbox = 0;

                if(layer.hasOwnProperty('eaID')) {
                	eaID = layer.eaID.toString();
                	if (eaID.trim() != "") {

	                    if(layer.hasOwnProperty('eaLyrNum')){
	                        eaLyrNum = layer.eaLyrNum.toString();
	                    }
	                    else {
	                    	eaLyrNum = "";
	                    }

	                    if(layer.hasOwnProperty('IsSubLayer')){
	                        IsSubLayer = layer.IsSubLayer;
	                    }
	                    else {
	                    	IsSubLayer = "";
	                    }

	                    if(layer.hasOwnProperty('sourceType')){
	                    	sourceType = layer.sourceType;
	                    }
	                    else {
	                    	sourceType = "";
	                    }
	                    if(layer.hasOwnProperty('categoryTab')){
	                    	categoryTab = layer.categoryTab;
	                    }
	                    else {
	                    	categoryTab = "";
	                    }			                        
			            layerName = "";          
	                	if(layer.hasOwnProperty('name') ){	                		
		                	if ((layer.name != null)){
		                    	layerName = layer.name.toString();
	                    }
	                    }
	                	if(layer.hasOwnProperty('eaDescription')){
	                    	eaDescription = layer.eaDescription.toString();
	                    }
	                    else {
	                    	eaDescription = "";
	                    }
	                    if(layer.hasOwnProperty('eaDfsLink')){
	                    	eaDfsLink = layer.eaDfsLink.toString();
	                    }
	                    else {
	                    	eaDfsLink = "";
	                    }
	                    if(layer.hasOwnProperty('eaMetadata')){
	                    	eaMetadata = layer.eaMetadata.toString();
	                    }
	                    else {
	                    	eaMetadata = "";
	                    }
	                    if(layer.hasOwnProperty('eaTopic')){
	                    	eaTopic = layer.eaTopic.toString();
	                    	//console.log("eaID:" + eaID + ", eaTopic: " + eaTopic);
	                    	window.hashTopic[eaID]  = eaTopic;
	                    }
	                    else {
	                    	eaTopic = "";
	                    }	                    
	                    if(layer.hasOwnProperty('eaScale')){
	                    	eaScale = layer.eaScale.toString();
	                    	if (eaScale == "NATIONAL") {
	                    		if (nationalTopicList.indexOf(eaTopic) < 0) {
	                    			nationalTopicList.push(eaTopic);
	                    		}	                    		
	                    	}
	                    	if (eaScale == "COMMUNITY") {
	                    		if (communityTopicList.indexOf(eaTopic) < 0) {
	                    			communityTopicList.push(eaTopic);
	                    		}	                    		
	                    	}	                    	
	                    }
	                    else {
	                    	eaScale = "";
	                    }		                        
					    var eaCategoryWhole =  "";
					    if(layer.hasOwnProperty('eaBCSDD')){
					    	for (categoryIndex = 0, lenCategory = layer.eaBCSDD.length; categoryIndex < lenCategory; ++categoryIndex) {
					    		eaCategoryWhole = eaCategoryWhole + layer.eaBCSDD[categoryIndex] + ";";
					    	}
					    }
					    eaCategoryWhole = eaCategoryWhole.substring(0, eaCategoryWhole.length - 1);
					    
					    var eaTagsWhole =  "";
					    if(layer.hasOwnProperty('eaTags')){
					    	for (tagsIndex = 0, lenTags = layer.eaTags.length; tagsIndex < lenTags; ++tagsIndex) {
					    		eaTagsWhole = eaTagsWhole + layer.eaTags[tagsIndex] + ";";
					    	}
					    }

					    var SubLayerNames =  "";
					    if(layer.hasOwnProperty('SubLayerNames')){
					    	for (categoryIndex = 0, lenCategory = layer.SubLayerNames.length; categoryIndex < lenCategory; ++categoryIndex) {
					    		SubLayerNames = SubLayerNames + layer.SubLayerNames[categoryIndex] + ";";
					    	}
					    }
					    SubLayerNames = SubLayerNames.substring(0, SubLayerNames.length - 1);

					    var SubLayerIds =  "";
					    if(layer.hasOwnProperty('SubLayerIds')){
					    	for (categoryIndex = 0, lenCategory = layer.SubLayerIds.length; categoryIndex < lenCategory; ++categoryIndex) {
					    		SubLayerIds = SubLayerIds + layer.SubLayerIds[categoryIndex] + ";";
					    	}
					    }
					    SubLayerIds = SubLayerIds.substring(0, SubLayerIds.length - 1);


					    eaTagsWhole = eaTagsWhole.substring(0, eaTagsWhole.length - 1);			
					    if (eaScale	!= "") {//selectable layers should be either National or Community 
					    	var layerItem = {eaLyrNum: eaLyrNum, name: layerName, IsSubLayer:IsSubLayer, SubLayerNames: SubLayerNames, SubLayerIds: SubLayerIds, eaDescription: eaDescription, eaDfsLink: eaDfsLink, eaCategory: eaCategoryWhole, eaID: layer.eaID.toString(), eaMetadata: eaMetadata, eaScale: eaScale, eaTags:eaTagsWhole, eaTopic:eaTopic, sourceType:sourceType, categoryTab:categoryTab};
							
							layerDataStore.newItem(layerItem);
											
							//add to the table for use of search text		
				    	    var newRow   = tableRef.insertRow(tableRef.rows.length);
				    	    
			               	var newCell  = newRow.insertCell(0);
							newCell.appendChild(document.createTextNode(eaID));
							newRow.appendChild(newCell);
			
			               	newCell  = newRow.insertCell(1);
							newCell.appendChild(document.createTextNode(layerName));
							newRow.appendChild(newCell);			
			       
			               	newCell  = newRow.insertCell(2);
							newCell.appendChild(document.createTextNode(eaDescription));
							newRow.appendChild(newCell);
							
			               	newCell  = newRow.insertCell(3);
							newCell.appendChild(document.createTextNode(eaTagsWhole));
							newRow.appendChild(newCell);					
						}//end of if (eaScale	!= "")
					
						//end of adding of the table for use of search text
			    
				    }// end of if (eaID.trim() != "")
                }// end of if(layer.hasOwnProperty('eaID'))                	

            }// end of for (index = 0, len = arrLayers.length; index < len; ++index) 

            $('#tableLyrNameDescrTag').DataTable( {
			   language: {
			        searchPlaceholder: 'Search All Layers'			
			   },
		        "columnDefs": [
		            {
		                "targets": [ 0 ],
		                "searchable": false
		            }
		        ]
		    } );	

			$('#tableLyrNameDescrTag').on( 'draw.dt', function () {
			    _updateSelectableLayer();		    
			} );
					
			var page = document.getElementById('tableLyrNameDescrTag_paginate');
			page.style.display = 'none';	
				
			var searchBox = document.getElementById('searchFilterText');
            searchBox.style.cssText = "width:100%; padding:3px; height:40px; font-family:'Avenir Light', Verdana, Geneva, sans-serif; font-size:15px;"
        });// end of loadJSON(function(response)
        loadCommunityJSON(function(response){
        	var community = JSON.parse(response);

            for (index = 0, len = community.length; index < len; ++index) {
            	currentMetadataCommunityIndex = community[index];
            	singleCommunityMetadataDic = {};
            	for (var key in window.communityDic) {
            		if(currentMetadataCommunityIndex.hasOwnProperty(key)) {
            			singleCommunityMetadataDic[key] = currentMetadataCommunityIndex[key];
            		}
	        		if(currentMetadataCommunityIndex.hasOwnProperty(window.strAllCommunity)) {
	        			singleCommunityMetadataDic[window.strAllCommunity] = currentMetadataCommunityIndex[window.strAllCommunity];
	        		}            		
            	}

            	window.communityMetadataDic[currentMetadataCommunityIndex.MetaID_Community] = singleCommunityMetadataDic;
            }
        }); // end of loadCommunityJSON(function(response)
        
        loadNationalMetadataJSON(function(response){
        	var national = JSON.parse(response);

            for (index = 0, len = national.length; index < len; ++index) {
            	currentMetadataNationalIndex = national[index];
				for (var key in currentMetadataNationalIndex) {
				    if (currentMetadataNationalIndex.hasOwnProperty(key)) {
				        window.nationalMetadataDic[key] = currentMetadataNationalIndex[key];
				    }
				}
            }
        }); // end of loadNationalMetadataJSON(function(response)
        this._onMapClickForPopup();
    },               
    onOpen: function(){						
    	setTimeout(lang.hitch(this, function() {
			_updateSelectableLayer();
			/*document.getElementById("butInSearchFilterBox").onclick = function() {
	            selfSimpleSearchFilter._onButFilterInSimpleSearchClick();
	         
	        };*/			
        }), 2000);
    },

                    
	    _onSingleLayerClick: function() {
		    this.publishData({
		        message: singleLayerToBeAddedRemoved
		    });
		},
	    _onViewActiveLayersClick: function() {

			this.openWidgetById('widgets_SelectCommunity_29');
			var wm = WidgetManager.getInstance();
			widget = wm.getWidgetById('widgets_SelectCommunity_29');
			if (widget != undefined){
				var pm = PanelManager.getInstance();   
				pm.showPanel(widget);  
			}    
	    },	
    _onAddLayersClick: function() {
        layersToBeAdded = "a";
		for (var key in chkIdDictionary) {
		  if ((chkIdDictionary.hasOwnProperty(key)) && (document.getElementById(key)!=null) ){
		  	if (document.getElementById(key).checked) {
            	layersToBeAdded = layersToBeAdded + "," + key.replace(window.chkSelectableLayer, "");
        	}
		  }
		}
        this.publishData({
	        message: layersToBeAdded
	    });
	    this.i ++;
    },   

    _onOpenFailedLayerClick: function() {
	        var widgetName = 'DisplayLayerAddFailure';
	        var widgets = this.appConfig.getConfigElementsByName(widgetName);
	        var pm = PanelManager.getInstance();
	        pm.showPanel(widgets[0]);	  
	        this.publishData({
		        message: ""
		    });
     },
     _onButFilterInSimpleSearchClick: function () {

     	var widgetManager;
        var filterForSelectWidgetEle = this.appConfig.getConfigElementsByName("FilterForSelect")[0];
        widgetManager = WidgetManager.getInstance();
        if (window.filterForSelectOpened == true){
        	widgetManager.closeWidget(filterForSelectWidgetEle.id);
        	document.getElementById("titleForFilter").style.display = "none"; 
        	document.getElementById("resizeForFilterArea").style.display = "none";
        	document.getElementById("closeFilterArea").style.display = "none";
        	window.filterForSelectOpened = false;
        }
        else {
        	//widgetManager.triggerWidgetOpen(filterForSelectWidgetEle.id);
        	if (window.filterForSelectFirstCreated == true) {
        		widgetManager.closeWidget(filterForSelectWidgetEle.id);
        		window.filterForSelectFirstCreated = false;
        		
        	}
        	widgetManager.openWidget(filterForSelectWidgetEle.id);
        	document.getElementById("titleForFilter").style.display = ""; 
        	document.getElementById("resizeForFilterArea").style.display = "";
        	document.getElementById("closeFilterArea").style.display = "";
        	window.filterForSelectOpened = true;
        }
        

     },
     _onUpdateCommunityLayers: function() {

     	arrLayersToChangeSynbology = [];
	    var lyr;
    	for (i in window.communityLayerNumber) {
    		lyr = this.map.getLayer(window.layerIdPrefix + window.communityLayerNumber[i]);
			if(lyr){				
	    		arrLayersToChangeSynbology.push(lyr.id.replace(window.layerIdPrefix, ""));
          	}          	
    		lyrPBS = this.map.getLayer(window.layerIdPBSPrefix + window.communityLayerNumber[i]);
			if(lyrPBS){				
	    		arrLayersToChangeSynbology.push(lyrPBS.id.replace(window.layerIdPBSPrefix, ""));
          	}           	        	
        } 	    

        updateSingleCommunityLayer(arrLayersToChangeSynbology.pop());
     },
     _onMapClickForPopup: function() {
		  setClickEventForPopup();   	
     },
     formatValue : function (value, key, data){

     	pow10 = Math.pow(10, numDecimalDigit);
     	return parseFloat(Math.round(value * pow10) / pow10).toFixed(numDecimalDigit);
     },
     formatURL : function (value, key, data){
     	var resultURL = "<a href=\"" + value + "\" target=\"_blank\">" + "<div>"+ value + "</div>" +"</a>";
     	return resultURL;
     },     
	  formatDateByFieldInfo : function(d, fieldInfo) {
	    var fd = null;
	    try {
	      var data = {
	        date: d instanceof Date ? d.getTime() : d
	      };
	      //dateFormat = 'shortDateShortTime';
	      dateFormat = strDateFormat;
	
	      var substOptions = {
	        dateFormat: {
	          properties: ['date'],
	          formatter: 'DateFormat' + PopupTemplate.prototype._dateFormats[dateFormat]
	        }
	      };
	      fd = esriLang.substitute(data, '${date}', substOptions);
	    }catch (err) {
	      console.error(err);
	      fd = d;
	    }

    return fd;
  }
    });

    return clazz;
  });
