"use strict";

const apiClient = new MdApi('https://hessen.museum-digital.de/', "de");
apiClient.setInstitutionId(1);
const mdEmbed = new MdEmbed(apiClient, null, tls_de);

/*
const wrapper = document.createElement("div");
document.body.appendChild(wrapper);
*/
const wrapper = document.getElementById("md-wrapper");
const onlineCollection = new MdSampleOnlineCollection(mdEmbed, wrapper);
onlineCollection.setRouter();
onlineCollection.route();

// Facet bubbles

/*
const facetBubbles = mdEmbed.generateFacetBubbles("");
facetBubbles.addEventListener("md-fully-loaded", function(e) {
    console.log("Loaded bubbles");
    console.log(e.detail);
}, {passive: true, once: true});

wrapper.appendChild(facetBubbles);
*/

// Objects search results list
/*
const rList = mdEmbed.generateObjectResultsList("");
rList.addEventListener("md-fully-loaded", function(e) {
    console.log(e.detail);
}, {passive: true, once: true});

rList.addEventListener("md-pagination-triggered", function(e) {
    console.log(e);
}, {passive: true});

wrapper.appendChild(rList);
*/

// Object page
/*
const objPage = mdEmbed.generateObjectPreview(162058);
wrapper.appendChild(objPage);
*/

/*
const objPage = mdEmbed.generateObjectPage(15);
objPage.addEventListener("md-generated-ref-time", function(e) {
    const link = e.detail.elem;
    link.href = link.getAttribute("data-id");
}, {passive: true});
objPage.addEventListener("md-generated-ref-tag", function(e) {
    const link = e.detail.elem;
    link.href = link.getAttribute("data-id");
}, {passive: true});
objPage.addEventListener("md-generated-ref-collection", function(e) {
    const link = e.detail.elem;
    link.href = link.getAttribute("data-id");
}, {passive: true});
wrapper.appendChild(objPage);
*/


