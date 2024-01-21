"use strict";

const apiClient = new MdApi("https://hessen.museum-digital.de/", "de");

/*
///////////////////////////////// Object information
apiClient.getObject(14545)
.then((objectData) => {
    console.log(objectData);
})
.catch(err => {
    console.error(err);
});
*/

/*
/////////////////////////// Object search

apiClient.searchObjects("helm")
.then((objectData) => {
    console.log(objectData);
})
.catch(err => {
    console.error(err);
});
*/

/*
apiClient.searchObjects({s: "place:61", extend: "foto"})
.then((objectData) => {
    console.log(objectData);
})
.catch(err => {
    console.error(err);
    console.log("There are no results for this query");
});
*/

/*
////////////////////////// Object search query string
apiClient.getObjectQueryStrings("helm")
.then((objectData) => {
    console.log(objectData);
})
.catch(err => {
    console.error(err);
});
 */

/*
////////////////////////// Facet search
 */
apiClient.getObjectsFacetSearchOptions("helm")
.then((objectData) => {
    console.log(objectData);
})
.catch(err => {
    console.error(err);
});
