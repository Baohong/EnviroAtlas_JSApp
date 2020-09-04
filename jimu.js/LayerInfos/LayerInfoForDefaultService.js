// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/3.15/esri/copyright.txt and http://www.arcgis.com/apps/webappbuilder/copyright.txt for details.
//>>built
define("dojo/_base/declare dojo/_base/array dojo/_base/lang dojo/Deferred dojo/topic dojo/dom-construct ./LayerInfoForDefault ./LayerObjectFacory ../utils".split(" "),function(k,h,e,f,l,g,m,n,p){return k(m,{_legendsNode:null,_layerObjectFacory:null,constructor:function(){this._layerObjectFacory=new n(this)},_resetLayerObjectVisiblity:function(){},_loadLegends:function(a){var b=new f;this.originOperLayer.mapService.layerInfo.getLegendInfo(a).then(e.hitch(this,function(a){b.resolve(a)}));return b},
drawLegends:function(a,b){this._loadLegends(b).then(e.hitch(this,function(b){this._initLegendsNode(b,a)}))},_initLegendsNode:function(a,b){var c=this.originOperLayer.mapService;if(a){g.empty(b);for(var d=null,e=0;e<a.length;e++)if(a[e].layerId===c.subId){d=a[e];break}if(d){var f=g.create("table",{"class":"legend-table",style:"font-size: 12px"},b);h.forEach(d.legend,function(a){if("\x3call other values\x3e"!==a.label){var b=g.create("tr",{"class":"legend-tr",style:"border: 1px solid"},f),c=g.create("td",
{"class":"legend-symbol-td",style:""},b),d=null,d=a.imageData?"data:"+a.contentType+";base64,"+a.imageData:a.url;g.create("img",{"class":"legend-symbol-image",style:"overflow:auto;margin:auto;top:0;left:0;bottom:0;right:0",src:d},c);g.create("td",{"class":"legend-label-td",innerHTML:p.sanitizeHTML(a.label)||" ",style:"padding-left: 5px"},b)}},this)}}},_initControlPopup:function(){var a=this.originOperLayer.mapService.layerInfo.layerObject,b=this.originOperLayer.mapService.subId;this.controlPopupInfo=
{enablePopup:a.infoTemplates&&a.infoTemplates[b]?!0:!1,infoTemplates:void 0}},_afterSetInfoTemplates:function(){var a=this.originOperLayer.mapService.layerInfo.layerObject,b=this.originOperLayer.mapService.subId;!this.controlPopupInfo.enablePopup&&a.infoTemplates&&delete a.infoTemplates[b]},_getShowLegendOfWebmap:function(){return this.originOperLayer.mapService.layerInfo._getSublayerShowLegendOfWebmap(this.originOperLayer.mapService.subId)},_getServiceDefinition:function(){return this.originOperLayer.mapService.layerInfo._getSubserviceDefinition(this.originOperLayer.mapService.mapServiceSubId)},
_getLayerObject:function(a){var b=new f;(a?this._layerObjectFacory.getLayerObjectWithUrl(a):this._layerObjectFacory.getLayerObject()).then(e.hitch(this,function(a){this.layerObject.empty&&a&&(this.layerObject=a);b.resolve(a)}));return b},getLayerObject:function(){return this._getLayerObject()},getLayerObjectTryUsingFeatureService:function(){var a;return this.isItemLayer()?this.getItemInfo().then(e.hitch(this,function(b){b&&b.getItemData()&&b.getItemData().layers&&h.some(b.getItemData().layers,function(b){if(b.id===
this.subId)return a=b.layerUrl,!0},this);return a?this._getLayerObject(a):this._getLayerObject()})):this.getLayerObject()},getPopupInfo:function(){var a=null,b=this.originOperLayer.mapService.layerInfo.originOperLayer.layers;if(b)for(var c=0;c<b.length;c++)if(b[c].id===this.originOperLayer.mapService.subId){a=b[c].popupInfo;break}return a},getFilterOfWebmap:function(){var a=null,b=this.originOperLayer.mapService.layerInfo.originOperLayer.layers;if(b)for(var c=0;c<b.length;c++)if(b[c].id===this.originOperLayer.mapService.subId){a=
b[c].layerDefinition?b[c].layerDefinition.definitionExpression:null;break}return a},getFilter:function(){var a=this.originOperLayer.mapService;return a.layerInfo.layerObject&&a.layerInfo.layerObject.layerDefinitions?a.layerInfo.layerObject.layerDefinitions[a.subId]:null},setFilter:function(a,b){var c,d=this.originOperLayer.mapService;d.layerInfo.layerObject&&d.layerInfo.layerObject.setLayerDefinitions&&(c=d.layerInfo.layerObject.layerDefinitions?h.map(d.layerInfo.layerObject.layerDefinitions,function(a){return a}):
[],b=e.mixin({},b),e.setObject("_wabProperties.objectPassWithFilterChangeEvent",b,d.layerInfo.layerObject),c[d.subId]=a,d.layerInfo.layerObject.setLayerDefinitions(c))},getLayerType:function(){var a=new f;0<this.getSubLayers().length?a.resolve("GroupLayer"):this._getServiceDefinition().then(e.hitch(this,function(b){b?a.resolve(b.type.replace(/\ /g,"")):a.resolve(null)}),function(){a.resolve(null)});return a},getSupportTableInfo:function(){var a=new f,b={isSupportedLayer:!1,isSupportQuery:!1,layerType:null};
this.getLayerType().then(e.hitch(this,function(c){b.layerType=c;0<=this._getLayerTypesOfSupportTable().indexOf(c)&&(b.isSupportedLayer=!0);this._getServiceDefinition().then(e.hitch(this,function(c){c&&0<=c.capabilities.indexOf("Data")&&(b.isSupportQuery=!0);a.resolve(b)}),function(){a.resolve(b)})}),function(){a.resolve(b)});return a},enablePopup:function(){var a=this.originOperLayer.mapService.layerInfo,b=a.layerObject,c=this.originOperLayer.mapService.subId;return this.loadInfoTemplate().then(e.hitch(this,
function(){return a.controlPopupInfo.infoTemplates&&a.controlPopupInfo.infoTemplates[c]?(this.controlPopupInfo.enablePopup=!0,b.infoTemplates||(b.infoTemplates={}),b.infoTemplates[c]=a.controlPopupInfo.infoTemplates[c],!0):!1}))},disablePopup:function(){var a=this.originOperLayer.mapService.layerInfo.layerObject,b=this.originOperLayer.mapService.subId;this.controlPopupInfo.enablePopup=!1;a.infoTemplates&&delete a.infoTemplates[b]},loadInfoTemplate:function(){var a=new f,b=this.originOperLayer.mapService.layerInfo,
c=this.originOperLayer.mapService.subId;b.controlPopupInfo.infoTemplates&&b.controlPopupInfo.infoTemplates[c]&&b.controlPopupInfo.infoTemplates[c].infoTemplate?a.resolve(b.controlPopupInfo.infoTemplates[c].infoTemplate):(b.controlPopupInfo.infoTemplates||(b.controlPopupInfo.infoTemplates={}),this.getLayerObject().then(e.hitch(this,function(d){d=this._getDefaultPopupTemplate(d);b.controlPopupInfo.infoTemplates[c]={infoTemplate:d,layerUrl:null};a.resolve(d)}),e.hitch(this,function(){a.resolve(null)})));
return a},getInfoTemplate:function(){var a=this.originOperLayer.mapService.layerInfo,b=this.originOperLayer.mapService.subId;return a.controlPopupInfo.infoTemplates&&a.controlPopupInfo.infoTemplates[b]&&a.controlPopupInfo.infoTemplates[b].infoTemplate?a.controlPopupInfo.infoTemplates[b].infoTemplate:null},getScaleRange:function(){var a=this.originOperLayer.mapService;return(a=a.layerInfo._getJsapiLayerInfoById(a.subId))&&0<=a.minScale&&0<=a.maxScale?{minScale:a.minScale,maxScale:a.maxScale}:{minScale:0,
maxScale:0}},setScaleRange:function(a,b){var c=this.originOperLayer.mapService,d=c.layerInfo._getJsapiLayerInfoById(c.subId);c.layerInfo.layerObject&&c.layerInfo.layerObject.supportsDynamicLayers&&c.layerInfo.layerObject.setDynamicLayerInfos&&d&&(d.minScale!==a||d.maxScale!==b)&&(d.minScale=a,d.maxScale=b,c.layerInfo.layerObject.setDynamicLayerInfos(c.layerInfo._jsapiLayerInfos),l.publish("layerInfos/layerInfo/scaleRangeChanged",[this]))},_onVisibilityChanged:function(){}})});