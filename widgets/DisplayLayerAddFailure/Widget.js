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
    'jimu/BaseWidget',
    'dijit/Dialog',
     'jimu/WidgetManager',
     'jimu/PanelManager',     
     'esri/layers/FeatureLayer',
     'esri/dijit/PopupTemplate',
     'esri/layers/ArcGISDynamicMapServiceLayer',
    'dijit/layout/ContentPane',
    'dijit/TooltipDialog'
    
  ],
  function(
    declare,
    _WidgetsInTemplateMixin,
    Deferred,
    BaseWidget,
    Dialog,
    WidgetManager,
    PanelManager,
    FeatureLayer,
    PopupTemplate,
    ArcGISDynamicMapServiceLayer) {


	
	var map;
	var self;
   
    var updateFailedListOfLayers = function(){	
    	var comment = document.getElementById("failedLayersComment");
    	if ((Object.keys(window.faildedEALayerDictionary).length == 0)&&(Object.keys(window.faildedOutsideLayerDictionary).length == 0)) {    		
    		comment.innerHTML = "Currently, there is no layers failed being added to map."; 
    		var hr = document.getElementById('hrFailedEnviroAtlasLayers');
			hr.style.display = 'none';	  
    		hr = document.getElementById('hrFailedOutsideLayers');
			hr.style.display = 'none';				 		
    	} else{
    		comment.innerHTML = "The following web service(s) failed to load at this time and may be unavailable for this session.";
    	}
    	if (Object.keys(window.faildedEALayerDictionary).length > 0) {
    		var hr = document.getElementById('hrFailedEnviroAtlasLayers');
			hr.style.display = '';	
    		var commentFaileEA = document.getElementById("failedEnviroAtlasLayersComment");
    		commentFaileEA.innerHTML = "For EnviroAtlas services, an email will be sent notifying administrators of these issues:";

		    var tableOfRelationship = document.getElementById("failedEALayers");
		    var tableRef = tableOfRelationship.getElementsByTagName('tbody')[0]; 
	        while (tableRef.firstChild) {
	            tableRef.removeChild(tableRef.firstChild);
	        }	    	
			for (var key in window.faildedEALayerDictionary) {	
				var newRow   = tableRef.insertRow(tableRef.rows.length);
	           	var newTitleCell  = newRow.insertCell(0);
	        
				var newTitle  = document.createElement('div');
		        newTitle.innerHTML = key;
				newTitleCell.appendChild(newTitle); 							  
			}  		
		}
		
		if (Object.keys(window.faildedOutsideLayerDictionary).length > 0) {
			var hr = document.getElementById('hrFailedOutsideLayers');
			hr.style.display = '';		
    		var commentFaileOursideLayer = document.getElementById("failedOutsideLayersComment");
    		commentFaileOursideLayer.innerHTML = "For web services hosted outside of the EnviroAtlas hosting environment, EnviroAtlas is not responsible for the performance of these services:";

		    var tableOfRelationship = document.getElementById("failedOutLayers");
		    var tableRef = tableOfRelationship.getElementsByTagName('tbody')[0]; 
	        while (tableRef.firstChild) {
	            tableRef.removeChild(tableRef.firstChild);
	        }	    	
			for (var key in window.faildedOutsideLayerDictionary) {	
				var newRow   = tableRef.insertRow(tableRef.rows.length);
	           	var newTitleCell  = newRow.insertCell(0);
	        
				var newTitle  = document.createElement('div');
		        newTitle.innerHTML = key;
				newTitleCell.appendChild(newTitle); 							  
			}  		
		}
	};



    var clazz = declare([BaseWidget, _WidgetsInTemplateMixin], {

        //name: 'DisplayLayerAddFailure',
        baseClass: 'jimu-widget-displaylayeraddfailure',
        
	    onReceiveData: function(name, widgetId, data, historyData) {
	  		updateFailedListOfLayers();
	    },
      	startup: function() {

	        this.inherited(arguments);
	        map = this.map;
	        self = this;
	        updateFailedListOfLayers();
    	}, 	    

    });

    return clazz;
  });
