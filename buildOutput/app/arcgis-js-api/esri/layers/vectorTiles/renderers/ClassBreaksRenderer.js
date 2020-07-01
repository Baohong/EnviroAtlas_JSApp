//>>built
define("../core/declare ../core/lang ../core/kebabDictionary ../core/Error ../core/Logger ../core/accessorSupport/ensureType ../support/arcadeUtils ../symbols/Symbol ../symbols/PolygonSymbol3D ../symbols/support/jsonUtils ../symbols/support/typeUtils ./Renderer ./support/LegendOptions ./support/ClassBreakInfo".split(" "),function(r,l,t,u,v,n,h,w,x,e,k,y,m,g){var z=v.getLogger("esri.renderers.ClassBreaksRenderer");m=m.LegendOptions;g=g.ClassBreakInfo;var p=t({esriNormalizeByLog:"log",esriNormalizeByPercentOfTotal:"percent-of-total",
esriNormalizeByField:"field"}),A=n.ensureType(g),q=r(y,{declaredClass:"esri.renderers.ClassBreaksRenderer",properties:{backgroundFillSymbol:{types:{base:w,key:"type",typeMap:{"simple-fill":k.types.typeMap["simple-fill"],"picture-fill":k.types.typeMap["picture-fill"],"polygon-3d":k.types.typeMap["polygon-3d"]}},value:null,json:{origins:{"web-scene":{read:e.read,write:{target:{backgroundFillSymbol:{type:x}},writer:e.writeTarget}}},read:e.read,write:e.writeTarget}},classBreakInfos:{type:[g],json:{read:function(a,
b,c){if(Array.isArray(a)){var d=b.minValue;return a.map(function(a){var b=new g;return b.read(a,c),null==b.minValue&&(b.minValue=d),null==b.maxValue&&(b.maxValue=b.minValue),d=b.maxValue,b})}},write:function(a,b,c,d){a=a.map(function(a){return a.write({},d)});this._areClassBreaksConsecutive()&&a.forEach(function(a){delete a.classMinValue});b[c]=a}}},minValue:{type:Number,readOnly:!0,dependsOn:["classBreakInfos"],get:function(){return this.classBreakInfos[0]&&this.classBreakInfos[0].minValue||0},json:{read:!1,
write:{overridePolicy:function(){return 0!==this.classBreakInfos.length&&this._areClassBreaksConsecutive()?{enabled:!0}:{enabled:!1}}}}},defaultLabel:{type:String,value:null,json:{write:!0}},defaultSymbol:{types:k.rendererTypes,value:null,json:{origins:{"web-scene":{read:e.read,write:{target:{defaultSymbol:{types:k.rendererTypes3D}},writer:e.writeTarget}}},read:e.read,write:e.writeTarget}},valueExpression:{type:String,value:null,json:{write:!0}},valueExpressionTitle:{type:String,value:null,json:{write:!0}},
compiledFunc:{dependsOn:["valueExpression"],get:function(){return h.createFunction(this.valueExpression)}},legendOptions:{type:m,value:null,json:{write:!0}},field:{value:null,cast:function(a){return null==a?a:"function"==typeof a?a:n.ensureString(a)},json:{type:String,write:function(a,b,c,d){"string"==typeof a?b[c]=a:d&&d.messages?d.messages.push(new u("property:unsupported","ClassBreaksRenderer.field set to a function cannot be written to JSON")):z.error(".field: cannot write field to JSON since it's not a string value")}}},
isMaxInclusive:!0,normalizationField:{type:String,value:null,json:{write:!0}},normalizationTotal:{type:Number,value:null,json:{write:!0}},normalizationType:{type:String,value:null,dependsOn:["normalizationField","normalizationTotal"],get:function(){var a=this._get("normalizationType"),b=!!this.normalizationField,c=null!=this.normalizationTotal;return b||c?(a=b&&"field"||c&&"percent-of-total",b&&c&&console.warn("warning: both normalizationField and normalizationTotal are set!")):"field"!==a&&"percent-of-total"!==
a||(a=null),a},json:{read:p.fromJSON,write:function(a,b){(a=p.toJSON(a))&&(b.normalizationType=a)}}},requiredFields:{dependsOn:["field","normalizationField","valueExpression"]},type:{value:"class-breaks",json:{write:function(a,b){b.type="classBreaks"}}}},constructor:function(){this.classBreakInfos=[]},addClassBreakInfo:function(a,b,c){a="number"==typeof a?new g({minValue:a,maxValue:b,symbol:c}):A(l.clone(a));this.classBreakInfos.push(a);1===this.classBreakInfos.length&&this.notifyChange("minValue")},
removeClassBreakInfo:function(a,b){var c,d,f=this.classBreakInfos.length;for(d=0;d<f;d++)if(c=[this.classBreakInfos[d].minValue,this.classBreakInfos[d].maxValue],c[0]==a&&c[1]==b){this.classBreakInfos.splice(d,1);break}},getBreakIndex:function(a,b){var c,d,f=this.field;c=a.attributes;var e=this.classBreakInfos.length,g=this.isMaxInclusive;if(this.valueExpression)a=h.executeFunction(this.compiledFunc,h.createExecContext(a,h.getViewInfo(b)));else if("function"==typeof f)a=f(a);else if(a=parseFloat(c[f]),
f=this.normalizationType)if(b=parseFloat(this.normalizationTotal),c=parseFloat(c[this.normalizationField]),"log"===f)a=Math.log(a)*Math.LOG10E;else if("percent-of-total"!==f||isNaN(b)){if("field"===f&&!isNaN(c)){if(isNaN(a)||isNaN(c))return-1;a/=c}}else a=a/b*100;if(null!=a&&!isNaN(a)&&"number"==typeof a)for(c=0;c<e;c++)if(d=[this.classBreakInfos[c].minValue,this.classBreakInfos[c].maxValue],d[0]<=a&&(g?a<=d[1]:a<d[1]))return c;return-1},getClassBreakInfo:function(a,b){a=this.getBreakIndex(a,b);return-1!==
a?this.classBreakInfos[a]:null},getSymbol:function(a,b){a=this.getBreakIndex(a,b);return-1<a?this.classBreakInfos[a].symbol:this.defaultSymbol},getSymbols:function(){var a=[];return this.classBreakInfos.forEach(function(b){b.symbol&&a.push(b.symbol)}),this.defaultSymbol&&a.push(this.defaultSymbol),a},clone:function(){return new q({field:this.field,backgroundFillSymbol:this.backgroundFillSymbol&&this.backgroundFillSymbol.clone(),defaultLabel:this.defaultLabel,defaultSymbol:this.defaultSymbol&&this.defaultSymbol.clone(),
valueExpression:this.valueExpression,valueExpressionTitle:this.valueExpressionTitle,classBreakInfos:l.clone(this.classBreakInfos),isMaxInclusive:this.isMaxInclusive,normalizationField:this.normalizationField,normalizationTotal:this.normalizationTotal,normalizationType:this.normalizationType,visualVariables:l.clone(this.visualVariables),legendOptions:l.clone(this.legendOptions),authoringInfo:this.authoringInfo&&this.authoringInfo.clone()})},collectRequiredFields:function(a){this.inherited(arguments);
[this.field,this.normalizationField].forEach(function(b){b&&(a[b]=!0)});this.valueExpression&&h.extractFieldNames(this.valueExpression).forEach(function(b){a[b]=!0})},_areClassBreaksConsecutive:function(){for(var a=this.classBreakInfos,b=1;b<a.length;b++)if(a[b-1].maxValue!==a[b].minValue)return!1;return!0}});return q});