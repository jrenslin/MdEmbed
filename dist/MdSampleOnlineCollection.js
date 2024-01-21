"use strict";class MdSampleOnlineCollection{apiClient;viewer;wrap;objectSearchByFacet(e,t){console.log("Searching by facet: "+e+": "+t);function o(e){const t={tags:"tag",actor:"persinst",actors:"persinst"};return t[e]!==void 0?t[e]:e}const n=new URL(window.location.toLocaleString());let s=n.searchParams.get("q");(s==null)&&(s=""),n.searchParams.forEach((e,t)=>{n.searchParams.delete(t)}),n.searchParams.set("page","objects"),s+=" "+o(e)+":"+t,n.searchParams.set("q",s.trim()),window.history.pushState("",document.title,n),window.dispatchEvent(new CustomEvent("md-request-routing"))}getSearchForm(){const e=this.viewer.generateSearchForm(!1),t=this;return e.addEventListener("md-object-search-submitted",async function(e){e.preventDefault(),e.stopPropagation();const s=document.getElementById("md-typeahead-list");s!=null&&s.parentElement.removeChild(s);const n=new URL(window.location.toLocaleString());let o=n.searchParams.get("q");(o==null)&&(o=""),n.searchParams.forEach((e,t)=>{n.searchParams.delete(t)});const i=await t.apiClient.getObjectQueryStrings({s:o,extend:e.detail.value});n.searchParams.set("page","objects"),n.searchParams.set("q",i),window.history.pushState("",document.title,n),window.dispatchEvent(new CustomEvent("md-request-routing"))}),e}genOverviewPage(){console.log(this),this.wrap.appendChild(this.getSearchForm());const e=mdEmbed.generateFacetBubbles(""),t=this;e.addEventListener("md-facet-triggered",function(e){t.objectSearchByFacet(e.detail.type,e.detail.id)},{passive:!0,once:!0}),this.wrap.appendChild(e)}genObjectsSearchPage(){const s=new URL(window.location.toLocaleString()).searchParams;let e=s.get("q");(e==null)&&(e="");const o=this,t=this.getSearchForm();t.addEventListener("click",function(){const n=mdEmbed.generateFacetBubbles(e);n.addEventListener("md-facet-triggered",function(e){console.log(e),o.objectSearchByFacet(e.detail.type,e.detail.id)},{passive:!0,once:!0}),t.appendChild(n)},{passive:!0,once:!0}),t.addEventListener("md-object-search-reset",function(){const e=new URL(window.location.toLocaleString());e.searchParams.delete("q"),window.history.pushState("",document.title,e),window.dispatchEvent(new CustomEvent("md-request-routing"))}),this.wrap.appendChild(t);const n=this.viewer.generateObjectResultsList(e);n.addEventListener("md-pagination-triggered",function(e){const t=new URL(window.location.toLocaleString());t.searchParams.set("limit",e.detail.limit),t.searchParams.set("offset",e.detail.offset),window.history.pushState("",document.title,t)}),n.addEventListener("md-fully-loaded",function(e){for(const n of e.detail.links){const t=new URL(window.location.toLocaleString());t.searchParams.forEach((e,n)=>{t.searchParams.delete(n)}),t.searchParams.set("page","object"),t.searchParams.set("id",n.getAttribute("data-id")),n.href=t.toString(),n.addEventListener("click",function(e){e.preventDefault(),e.stopPropagation(),window.history.pushState("",document.title,t),window.dispatchEvent(new CustomEvent("md-request-routing"))})}console.log(e.detail)}),this.wrap.appendChild(n)}genObjectDetailPage(){const s=new URL(window.location.toLocaleString()).searchParams;let n=s.get("id");if(n==null){alert("Opening object pages requires an ID");const e=new URL(window.location.toLocaleString());return e.searchParams.forEach((t,n)=>{e.searchParams.delete(n)}),window.history.pushState("",document.title,e),window.dispatchEvent(new CustomEvent("md-request-routing")),!1}function t(e,t,n){e.addEventListener(t,function(e){const s=e.detail.elem,t=new URL(window.location.toLocaleString());t.searchParams.forEach((e,n)=>{t.searchParams.delete(n)}),t.searchParams.set("page","objects"),t.searchParams.set("q",n+":"+encodeURIComponent(s.getAttribute("data-id"))),s.href=t.toString(),s.addEventListener("click",function(e){e.preventDefault(),e.stopPropagation(),window.history.pushState("",document.title,t),window.dispatchEvent(new CustomEvent("md-request-routing"))})})}const e=this.viewer.generateObjectPage(n);t(e,"md-generated-ref-tag","tag"),t(e,"md-generated-ref-collection","collection"),t(e,"md-generated-ref-series","series"),t(e,"md-generated-ref-actor","persinst"),t(e,"md-generated-ref-place","place"),t(e,"md-generated-ref-time","time"),this.wrap.appendChild(e)}route(){for(;this.wrap.firstChild;)this.wrap.removeChild(this.wrap.firstChild);const e=new URL(window.location.toLocaleString()).searchParams;switch(e.get("page")){case void 0:case null:case"start":this.genOverviewPage();break;case"objects":this.genObjectsSearchPage();break;case"object":this.genObjectDetailPage();break}}setRouter(){const e=this;window.addEventListener("popstate",function(t){t.isTrusted===!0&&(t.preventDefault(),e.route())}),window.addEventListener("md-request-routing",function(){e.route()})}constructor(e,t){this.viewer=e,this.apiClient=e.apiClient,this.wrap=t}}