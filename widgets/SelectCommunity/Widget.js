//////////////////////////////////////////////////////////
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare', 
		'jimu/BaseWidget', 
		"dojo/on",
		"dojo/dom-style",
		"dojo/request/xhr",
		"dojo/dom",
		"dojo/dom-class",
		'esri/geometry/Extent',
		'esri/layers/FeatureLayer',
		'dojo/_base/array'
		],
function(declare, 
		BaseWidget, 
		on,
		domStyle,
		 xhr,
		dom,
		 domClass,
		Extent,
		FeatureLayer,
		array
	    ) {

  var communitySelected = "";
  var prefixRadioCommunity = "radio_";
  
  var minXCombinedExtent = 9999999999999;
  var minYCombinedExtent = 9999999999999;
  var maxXCombinedExtent = -9999999999999;
  var maxYCombinedExtent = -9999999999999;  
  var spatialReference;

  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {
    // DemoWidget code goes here 

    //please note that this property is be set by the framework when widget is loaded.
    //templateString: template,

    baseClass: 'jimu-widget-selectcommunity',

    postCreate: function() {
      this.inherited(arguments);
      console.log('postCreate');
    },
    

    startup: function() {
    	
      this.inherited(arguments);
	  this.displayCommunitySelection();  
      console.log('startup');
    },
    addRowButton: function(radioId, radioName, labelForRadio, direction) {
    	var tableOfRelationship = document.getElementById('communityTable' + direction);
	    var tableRef = tableOfRelationship.getElementsByTagName('tbody')[0];    	
	    indexImage = 0;
	    var newRow   = tableRef.insertRow(tableRef.rows.length);
	    
       	newRow.style.height = "20px";

       	var newCheckboxCell  = newRow.insertCell(0);
		var radioCommunity = document.createElement("input");
		radioCommunity.setAttribute("type", "radio");
		radioCommunity.setAttribute("id", radioId);			
		
		radioCommunity.setAttribute("name", radioName);
        newCheckboxCell.appendChild(radioCommunity);    
        var label = document.createElement('label');
        label.setAttribute('style', 'vertical-align: top');
        label.setAttribute("for", radioId);
		label.innerHTML = "  " + labelForRadio;
		newCheckboxCell.appendChild(label);
		
		radioCommunity.addEventListener('click', function() {
			communitySelected = this.id.replace(prefixRadioCommunity, "");
			document.getElementById('butSelectCommunity').click();
			
	    });
    },
    _onSelectCommunityClick: function() {

		window.communitySelected = communitySelected;
        this.publishData({
	        message: communitySelected
	    });
	    this.i ++;
	    var nExtent;
	    if (communitySelected != window.strAllCommunity) {
	    	commnunityWholeName = window.communityDic[communitySelected];
	    	extentForCommunity = window.communityExtentDic[window.communityDic[communitySelected]];
	    	nExtent = Extent(extentForCommunity);

	    } else {
	    	nExtent = Extent({
			    "xmin":minXCombinedExtent,"ymin":minYCombinedExtent,"xmax":maxXCombinedExtent,"ymax":maxYCombinedExtent,
			    "spatialReference":spatialReference
			});

	    }
	    this.map.setExtent(nExtent);
	    
	    document.getElementById('butUpdateCommunityLayers').click();	    

    },    
    displayCommunitySelection: function() {
    	//this.addRowButton(prefixRadioCommunity + window.strAllCommunity, "community", "Combined Communities", "R");
    	var i = -1;
    	var half = Math.ceil((Object.keys(window.communityDic).length / 2));

    	for (var key in window.communityDic) {
    		if (i<half) {
    			direction = 'L';
    		} else {
    			direction = 'R';
    		}
    		i++;
    		this.addRowButton(prefixRadioCommunity + key, "community", window.communityDic[key], direction);
    	}
    	this.addRowButton(prefixRadioCommunity + window.strAllCommunity, "community", "Combined Communities", "R");
    	
    },

    onOpen: function(){
      console.log('onOpen');
    },

    onClose: function(){
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

