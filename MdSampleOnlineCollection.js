"use strict";

class MdSampleOnlineCollection {

    apiClient;
    viewer;
    wrap;

    objectSearchByFacet(type, id) {

        console.log("Searching by facet: " + type + ': ' + id);

        function translateType(type) {

            const IDS_TO_QUERY_PARAM = {
                tags: 'tag',
                actor: 'persinst',
                actors: 'persinst',
            };

            if (IDS_TO_QUERY_PARAM[type] !== undefined) {
                return IDS_TO_QUERY_PARAM[type];
            }
            else {
                return type;
            }

        }

        const url = new URL(window.location.toLocaleString());

        let q = url.searchParams.get('q');
        if (q === undefined || q === null) q = '';

        url.searchParams.forEach((value, key) => { url.searchParams.delete(key); });
        url.searchParams.set('page', 'objects');

        q += ' ' +  translateType(type) + ':' + id;
        url.searchParams.set('q', q.trim());

        window.history.pushState('', document.title, url);
        window.dispatchEvent(new CustomEvent("md-request-routing"));

    }

    getSearchForm() {

        const searchForm = this.viewer.generateSearchForm(false);
        const app = this;

        /*
        searchForm.addEventListener("md-typeahead-triggered", function(e) {

            const typeaheadList = document.getElementById("md-typeahead-list");
            if (typeaheadList !== undefined || typeaheadList !== null) {
                typeaheadList.parentElement.removeChild(typeaheadList);
            }

            app.objectSearchByFacet(e.detail.type, e.detail.id);

        });
        */

        searchForm.addEventListener('md-object-search-submitted', async function(e) {

            e.preventDefault();
            e.stopPropagation();

            const typeaheadList = document.getElementById("md-typeahead-list");
            if (typeaheadList !== undefined && typeaheadList !== null) {
                typeaheadList.parentElement.removeChild(typeaheadList);
            }

            const url = new URL(window.location.toLocaleString());

            let q = url.searchParams.get('q');
            if (q === undefined || q === null) q = '';
            url.searchParams.forEach((value, key) => { url.searchParams.delete(key); });

            const queryStr = await app.apiClient.getObjectQueryStrings({ s: q, extend: e.detail.value });

            url.searchParams.set('page', 'objects');
            url.searchParams.set('q', queryStr);
            window.history.pushState('', document.title, url);
            window.dispatchEvent(new CustomEvent("md-request-routing"));

        });

        return searchForm;

    }

    genOverviewPage() {

        console.log(this);
        this.wrap.appendChild(this.getSearchForm());

        const facetBubbles = mdEmbed.generateFacetBubbles("");
        const app = this;
        facetBubbles.addEventListener("md-facet-triggered", function(e) {
            app.objectSearchByFacet(e.detail.type, e.detail.id);
        }, {passive: true, once: true});
        this.wrap.appendChild(facetBubbles);

    }

    genObjectsSearchPage() {

        const pageParams = (new URL(window.location.toLocaleString())).searchParams;
        let q = pageParams.get('q');
        if (q === undefined || q === null) q = '';

        const app = this;

        const searchForm = this.getSearchForm();
        searchForm.addEventListener('click', function() {
            const facetBubbles = mdEmbed.generateFacetBubbles(q);
            facetBubbles.addEventListener("md-facet-triggered", function(e) {
                console.log(e);
                app.objectSearchByFacet(e.detail.type, e.detail.id);
            }, {passive: true, once: true});
            searchForm.appendChild(facetBubbles);
        }, {passive: true, once: true})

        searchForm.addEventListener('md-object-search-reset', function() {
            const url = new URL(window.location.toLocaleString());
            url.searchParams.delete("q");
            window.history.pushState('', document.title, url);
            window.dispatchEvent(new CustomEvent("md-request-routing"));
        });

        this.wrap.appendChild(searchForm);

        const resultsList = this.viewer.generateObjectResultsList(q);
        resultsList.addEventListener("md-pagination-triggered", function(e) {
            const url = new URL(window.location.toLocaleString());
            url.searchParams.set('limit', e.detail.limit);
            url.searchParams.set('offset', e.detail.offset);
            window.history.pushState('', document.title, url);
        });

        resultsList.addEventListener("md-fully-loaded", function(e) {

            for (const elem of e.detail.links) {
                const url = new URL(window.location.toLocaleString());
                url.searchParams.forEach((value, key) => { url.searchParams.delete(key); });
                url.searchParams.set('page', 'object');
                url.searchParams.set('id', elem.getAttribute("data-id"));
                elem.href = url.toString();

                elem.addEventListener('click', function(ev) {
                    ev.preventDefault(); ev.stopPropagation();
                    window.history.pushState('', document.title, url);
                    window.dispatchEvent(new CustomEvent("md-request-routing"));
                });
            }

            console.log(e.detail);
        });

        this.wrap.appendChild(resultsList);

    }

    genObjectDetailPage() {

        const pageParams = (new URL(window.location.toLocaleString())).searchParams;
        let id = pageParams.get('id');

        if (id === undefined || id === null) {
            alert("Opening object pages requires an ID");
            const url = new URL(window.location.toLocaleString());
            url.searchParams.forEach((value, key) => { url.searchParams.delete(key); });
            window.history.pushState('', document.title, url);
            window.dispatchEvent(new CustomEvent("md-request-routing"));
            return false;
        }

        function bindSearchLinks(objectPage, eventName, queryType) {

            objectPage.addEventListener(eventName, function(e) {
                const elem = e.detail.elem;
                const url = new URL(window.location.toLocaleString());
                url.searchParams.forEach((value, key) => { url.searchParams.delete(key); });
                url.searchParams.set('page', 'objects');
                url.searchParams.set('q', queryType + ':' + encodeURIComponent(elem.getAttribute("data-id")));

                elem.href = url.toString();
                elem.addEventListener('click', function(ev) {
                    ev.preventDefault(); ev.stopPropagation();
                    window.history.pushState('', document.title, url);
                    window.dispatchEvent(new CustomEvent("md-request-routing"));
                });
            });

        }

        const objectPage = this.viewer.generateObjectPage(id);
        bindSearchLinks(objectPage, "md-generated-ref-tag", "tag");
        bindSearchLinks(objectPage, "md-generated-ref-collection", "collection");
        bindSearchLinks(objectPage, "md-generated-ref-series", "series");
        bindSearchLinks(objectPage, "md-generated-ref-actor", "persinst");
        bindSearchLinks(objectPage, "md-generated-ref-place", "place");
        bindSearchLinks(objectPage, "md-generated-ref-time", "time");

        this.wrap.appendChild(objectPage);

    }

    route() {

        // Clean wrapper
        while (this.wrap.firstChild) {
            this.wrap.removeChild(this.wrap.firstChild);
        }

        // Negotiate current page bay
        const pageParams = (new URL(window.location.toLocaleString())).searchParams;
        switch (pageParams.get('page')) {

            case undefined:
            case null:
            case "start":
                this.genOverviewPage();
                break;
            case "objects":
                this.genObjectsSearchPage();
                break;
            case "object":
                this.genObjectDetailPage();
                break;

        }

    }

    setRouter() {
        const app = this;
        window.addEventListener('popstate', function(e) {
            if (e.isTrusted === true) {
                e.preventDefault();
                app.route();
            }
        });

        window.addEventListener('md-request-routing', function(e) {
            app.route();
        });
    }

    /**
     * @param {MdEmbed} viewer
     * @param {DOMElement} wrap
     */
    constructor(viewer, wrap) {
        this.viewer = viewer;
        this.apiClient = viewer.apiClient;
        this.wrap = wrap;
    }
}
