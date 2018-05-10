///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
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
    'jimu/BaseWidget',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/html',
    'dojo/dom',
    'dojo/on',
    'dojo/query',
    'dijit/registry',
    './LayerListView',
    './NlsStrings',
    'jimu/LayerInfos/LayerInfos'
  ],
  function(BaseWidget, declare, lang, array, html, dom, on,
  query, registry, LayerListView, NlsStrings, LayerInfos) {


    var clazz = declare([BaseWidget], {
      //these two properties is defined in the BaseWiget
      baseClass: 'jimu-widget-layerList',
      name: 'layerList',
      _denyLayerInfosReorderResponseOneTime: null,
      _denyLayerInfosIsVisibleChangedResponseOneTime: null,
      //layerListView: Object{}
      //  A module is responsible for show layers list
      layerListView: null,

      //operLayerInfos: Object{}
      //  operational layer infos
      operLayerInfos: null,

      startup: function() {
        this.inherited(arguments);
        NlsStrings.value = this.nls;
        this._denyLayerInfosReorderResponseOneTime = false;
        this._denyLayerInfosIsVisibleChangedResponseOneTime = false;
        // summary:
        //    this function will be called when widget is started.
        // description:
        //    according to webmap or basemap to create LayerInfos instance
        //    and initialize operLayerInfos;
        //    show layers list;
        //    bind events for layerLis;

        if (this.map.itemId) {
          LayerInfos.getInstance(this.map, this.map.itemInfo)
            .then(lang.hitch(this, function(operLayerInfos) {
              this.operLayerInfos = operLayerInfos;
              this.showLayers();
              this.bindEvents();
              dom.setSelectable(this.layersSection, false);
            }));
        } else {
          var itemInfo = this._obtainMapLayers();
          LayerInfos.getInstance(this.map, itemInfo)
            .then(lang.hitch(this, function(operLayerInfos) {
              this.operLayerInfos = operLayerInfos;
              this.showLayers();
              this.bindEvents();
              dom.setSelectable(this.layersSection, false);
            }));
        }
      },

      destroy: function() {
        this._clearLayers();
        this.inherited(arguments);
      },

      _obtainMapLayers: function() {
        // summary:
        //    obtain basemap layers and operational layers if the map is not webmap.
        var basemapLayers = [],
          operLayers = [];
        // emulate a webmapItemInfo.
        var retObj = {
          itemData: {
            baseMap: {
              baseMapLayers: []
            },
            operationalLayers: []
          }
        };
        array.forEach(this.map.graphicsLayerIds, function(layerId) {
          var layer = this.map.getLayer(layerId);
          if (layer.isOperationalLayer) {
            operLayers.push({
              layerObject: layer,
              title: layer.label || layer.title || layer.name || layer.id || " ",
              id: layer.id || " "
            });
          }
        }, this);
        array.forEach(this.map.layerIds, function(layerId) {
          var layer = this.map.getLayer(layerId);
          if (layer.isOperationalLayer) {
            operLayers.push({
              layerObject: layer,
              title: layer.label || layer.title || layer.name || layer.id || " ",
              id: layer.id || " "
            });
          } else {
            basemapLayers.push({
              layerObject: layer,
              id: layer.id || " "
            });
          }
        }, this);

        retObj.itemData.baseMap.baseMapLayers = basemapLayers;
        retObj.itemData.operationalLayers = operLayers;
        return retObj;
      },

      showLayers: function() {
        // summary:
        //    create a LayerListView module used to draw layers list in browser.
        this.layerListView = new LayerListView({
          operLayerInfos: this.operLayerInfos,
          layerListWidget: this,
          config: this.config
        }).placeAt(this.layerListBody);
      },

      _clearLayers: function() {
        // summary:
        //   clear layer list
        //domConstruct.empty(this.layerListTable);
        if (this.layerListView && this.layerListView.destroyRecursive) {
          this.layerListView.destroyRecursive();
        }
      },

      _refresh: function() {
        this._clearLayers();
        this.showLayers();
      },

      /****************
       * Event
       ***************/
      bindEvents: function() {
        // summary:
        //    bind events are listened by this module
        this.own(on(this.operLayerInfos,
          'layerInfosChanged',
          lang.hitch(this, this._onLayerInfosChanged)));

        this.own(on(this.operLayerInfos,
          'tableInfosChanged',
          lang.hitch(this, this._onTableInfosChanged)));

        this.own(this.operLayerInfos.on('layerInfosIsVisibleChanged',
          lang.hitch(this, this._onLayerInfosIsVisibleChanged)));

        this.own(on(this.operLayerInfos,
          'updated',
          lang.hitch(this, this._onLayerInfosObjUpdated)));

        this.own(on(this.operLayerInfos,
          'layerInfosReorder',
          lang.hitch(this, this._onLayerInfosReorder)));

        this.own(on(this.map,
          'zoom-end',
          lang.hitch(this, this._onZoomEnd)));

        this.own(on(this.operLayerInfos,
          'layerInfosRendererChanged',
          lang.hitch(this, this._onLayerInfosRendererChanged)));

        this.own(on(this.operLayerInfos,
          'layerInfosOpacityChanged',
          lang.hitch(this, this._onLayerInfosOpacityChanged)));
      },

      _onLayerInfosChanged: function(layerInfo, changedType) {
        //this._refresh();

        if(changedType === "added") {
          var allLayers = this.map.layerIds.concat(this.map.graphicsLayerIds);

          var layerIndex = array.indexOf(allLayers, layerInfo.id);
          var refLayerId = null;
          var refLayerNode = null;
          var refHrNodeNonGraphic = null;
          for(var i = layerIndex - 1; i >= 0; i--) {
            refLayerId = allLayers[i];
            var layerId = parseInt(refLayerId.replace(window.layerIdPrefix, "").replace(window.layerIdBndrPrefix, "").replace(window.layerIdPBSPrefix, "").replace(window.layerIdTiledPrefix, "").replace(window.addedLayerIdPrefix, ""));
  			if (window.featureLyrNumber.indexOf(layerId) >= 0){
	            refLayerNode = query("[class~='layer-tr-node-" + refLayerId + "']", this.domNode)[0];	            
	            if(refLayerNode) {
	              break;
	            }
            }
          }
          refHrNode = query("[class~='hrClass']", this.domNode)[0];
          refHrNodeNonGraphic = query("[class~='hrClassNonGraphic']", this.domNode)[0];
    	  var layerId = parseInt(layerInfo.id.replace(window.layerIdPrefix, "").replace(window.layerIdBndrPrefix, "").replace(window.layerIdPBSPrefix, "").replace(window.layerIdTiledPrefix, "").replace(window.addedLayerIdPrefix, ""));

		  if ((layerInfo.layerObject.type) && (layerInfo.layerObject.type.toUpperCase() == "FEATURE LAYER")) {
	          if(refLayerNode) {	          	
	            this.layerListView.drawListNode(layerInfo, 0, refLayerNode, 'before');
	          } else {
	            this.layerListView.drawListNode(layerInfo, 0, refHrNode, 'before');
	          }
	       } else {
	       	  this.layerListView.drawListNode(layerInfo, 0, refHrNodeNonGraphic, 'before');
	       }

        } else {
          this.layerListView.destroyLayerTrNode(layerInfo);
        }
      },

      _onTableInfosChanged: function(tableInfoArray, changedType) {
        if(changedType === "added") {
          array.forEach(tableInfoArray, function(tableInfo) {
            this.layerListView.drawListNode(tableInfo, 0, this.layerListView.tableListTable);
          }, this);
        } else {
          array.forEach(tableInfoArray, function(tableInfo) {
            this.layerListView.destroyLayerTrNode(tableInfo);
          }, this);
        }
      },

      _onLayerInfosIsVisibleChanged: function(changedLayerInfos) {
        if(this._denyLayerInfosIsVisibleChangedResponseOneTime) {
          this._denyLayerInfosIsVisibleChangedResponseOneTime = false;
        } else {
          array.forEach(changedLayerInfos, function(layerInfo) {
            query("[class~='visible-checkbox-" + layerInfo.id + "']", this.domNode)
            .forEach(function(visibleCheckBoxDomNode) {
              var visibleCheckBox = registry.byNode(visibleCheckBoxDomNode);
              if(layerInfo.isVisible()) {
                visibleCheckBox.check();
              } else {
                visibleCheckBox.uncheck();
              }
            }, this);

          }, this);
        }
      },

      _onLayerInfosObjUpdated: function() {
        this._refresh();
      },

      _onZoomEnd: function() {
        this.operLayerInfos.traversal(lang.hitch(this, function(layerInfo) {
          query("[class~='layer-title-div-" + layerInfo.id + "']", this.domNode)
          .forEach(function(layerTitleDivIdDomNode) {
            try {
              var eaID = layerInfo.id.replace(window.layerIdPrefix, "").replace(window.layerIdPBSPrefix, "");
              if ((layerInfo.isInScale()) || (window.hashIDtoTileURL[eaID] != null)) {
                html.removeClass(layerTitleDivIdDomNode, 'grayed-title');
              } else {
                html.addClass(layerTitleDivIdDomNode, 'grayed-title');
              }
            } catch (err) {
              console.warn(err.message);
            }
          }, this);
        }));
      },

      _onLayerInfosReorder: function() {
        if(this._denyLayerInfosReorderResponseOneTime) {
          // denies one time
          this._denyLayerInfosReorderResponseOneTime = false;
        } else {
          this._refresh();
        }
      },

      _onLayerInfosRendererChanged: function(changedLayerInfos) {
        try {
          array.forEach(changedLayerInfos, function(layerInfo) {
            this.layerListView.redrawLegends(layerInfo);
          }, this);
        } catch (err) {
          this._refresh();
        }
      },

      _onLayerInfosOpacityChanged: function(changedLayerInfos) {
        array.forEach(changedLayerInfos, function(layerInfo) {
          var opacity = layerInfo.layerObject.opacity === undefined ? 1 : layerInfo.layerObject.opacity;
          var contentDomNode = query("[layercontenttrnodeid='" + layerInfo.id + "']", this.domNode)[0];
          query(".legends-div.jimu-legends-div-flag img", contentDomNode).style("opacity", opacity);
        }, this);
      },

      onAppConfigChanged: function(appConfig, reason, changedData){
        /*jshint unused: false*/
        this.appConfig = appConfig;
      },
  	  uncheckRelatedCheckbox: function (chkboxLayerId){
    	var chkSimpleSearch = document.getElementById(window.chkSelectableLayer + chkboxLayerId);
    	if((chkSimpleSearch != null) && (chkSimpleSearch.checked == true)){	
    		//chkSimpleSearch.checked = false;    		
    		chkSimpleSearch.click();
    	}
      },   
      _onRemoveLayersClick: function() {
		for (var j=0, jl=this.map.layerIds.length; j<jl; j++) {
			var currentLayer = this.map.getLayer(this.map.layerIds[j]);
			if(currentLayer != null){
				if ((currentLayer.id).indexOf(window.addedLayerIdPrefix) > -1) {
					this.map.removeLayer(currentLayer);
				}    
				if ((currentLayer.id).indexOf(window.uploadedFeatLayerIdPrefix) > -1) {
					this.map.removeLayer(currentLayer);
				} 
				if ((currentLayer.id).indexOf(window.layerIdTiledPrefix) > -1) {
					this.map.removeLayer(currentLayer);
				}  
				if ((currentLayer.id).indexOf(window.layerIdPrefix) > -1) {
					this.map.removeLayer(currentLayer);
				} 
				if ((currentLayer.id).indexOf(window.layerIdBndrPrefix) > -1) {
					this.map.removeLayer(currentLayer);
				} 
				if ((currentLayer.id).indexOf(window.layerIdPBSPrefix) > -1) {
					this.map.removeLayer(currentLayer);
				}    				
			} 
		}
		/*dojo.forEach(this.map.layerIds, function(aLayerId) {  
			 alert("aLayerId from dojo.forEach:" + aLayerId);
					   });  
		array.forEach(this.map.layerIds, function(aLayerId, i){
		    alert("aLayerId from array.forEach:" + aLayerId);
		});  */
		//remove all layers searchable from widget SimpleSearchFilter
    	for (i in window.allLayerNumber) {    		
		    pbsWidgetId = 'widgets_PeopleAndBuildSpaces_Widget';
            boundaryWidgetId = 'widgets_BoundaryLayer_Widget';
            simpleSearchFilterId = 'widgets_SimpleSearchFilter_Widget_37';
    		lyr = this.map.getLayer(window.layerIdPrefix + window.allLayerNumber[i]);
			if(lyr != null){
				this.openWidgetById(simpleSearchFilterId);
            	this.map.removeLayer(lyr);
            	this.uncheckRelatedCheckbox(window.allLayerNumber[i]);
          	}
    		lyr = this.map.getLayer(window.layerIdTiledPrefix + window.allLayerNumber[i]);
			if(lyr != null){
            	this.map.removeLayer(lyr);
          	}          	
    		lyr = this.map.getLayer(window.layerIdPBSPrefix + window.allLayerNumber[i]);
			if(lyr != null){
				this.openWidgetById(pbsWidgetId);
            	this.map.removeLayer(lyr);
            	this.uncheckRelatedCheckbox(window.allLayerNumber[i]);
          	}     
          	lyr = this.map.getLayer(window.layerIdBndrPrefix + window.allLayerNumber[i]);
			if(lyr != null){
				this.openWidgetById(boundaryWidgetId);
            	this.map.removeLayer(lyr);
            	this.uncheckRelatedCheckbox(window.allLayerNumber[i]);
          	}         	
        } 
       
        //remove all layers added from portal, webmapdata and upload data
    	for (i in window.layerID_Portal_WebMap) {	        
    		lyr = this.map.getLayer(window.layerID_Portal_WebMap[i]);
			if(lyr != null){
	    		this.map.removeLayer(lyr);        	
          	}          	
        }        
    	for (i in window.uploadedFileColl) {	        
    		lyr = this.map.getLayer(window.uploadedFileColl[i]);
			if(lyr != null){
	    		this.map.removeLayer(lyr);        	
          	}          	
        }                
        //remove community boundary layer   
        lyrCommunityBoundary = this.map.getLayer(window.idCommuBoundaryPoint);  
		if(lyrCommunityBoundary != null){
    		this.map.removeLayer(lyrCommunityBoundary);        	
      	} 
      }
    });

    return clazz;
  });
