//>>built
define(["require","exports","../../core/Accessor","../../core/Collection","../../core/accessorSupport/utils"],function(y,g,r,h,v){function t(a){return a instanceof h?Object.keys(a.items):a instanceof r?v.getProperties(a).keys():a?Object.keys(a):[]}function p(a,b){return a instanceof h?a.items[b]:a[b]}function w(a,b){return!(!Array.isArray(a)||!Array.isArray(b))&&a.length!==b.length}function u(a,b){var e=a.diff;if(e&&"function"==typeof e)return e(a,b);var k=t(a),l=t(b);if(0!==k.length||0!==l.length){if(!k.length||
!l.length||w(a,b))return{type:"complete",oldValue:a,newValue:b};var m=l.filter(function(a){return-1===k.indexOf(a)}),n=k.filter(function(a){return-1===l.indexOf(a)}),m=k.filter(function(c){return-1<l.indexOf(c)&&p(a,c)!==p(b,c)}).concat(m,n).sort();if((n=a?a.declaredClass:null)&&-1<x.indexOf(n)&&m.length)return{type:"complete",oldValue:a,newValue:b};var q,n=a instanceof r&&b instanceof r,g;for(g in m){var f=m[g],c=p(a,f),d=p(b,f),h=void 0;(n||"function"!=typeof c&&"function"!=typeof d)&&c!==d&&(null==
c&&null==d||(h=e&&e[f]&&"function"==typeof e[f]?e[f](c,d):"object"==typeof c&&"object"==typeof d&&(c?c.declaredClass:null)===(d?d.declaredClass:null)?u(c,d):{type:"complete",oldValue:c,newValue:d})&&(q=q||{type:"partial",diff:{}},q.diff[f]=h))}return q}}Object.defineProperty(g,"__esModule",{value:!0});var x=["esri.Color","esri.portal.Portal"];g.diff=function(a,b){if("function"!=typeof a&&"function"!=typeof b&&(a||b))return!a||!b||"object"==typeof a&&"object"==typeof b&&(a?a.declaredClass:null)!==
(b?b.declaredClass:null)?{type:"complete",oldValue:a,newValue:b}:u(a,b)}});