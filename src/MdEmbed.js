"use strict";

class MdEmbed {

    apiClient;
    assetsUrl;
    tls;

    _getDefaultTls() {

        return {
            search                      : 'Search',
            reset_search                : 'Reset search',
            events                      : 'Events',
            literature                  : 'Literature',
            tags                        : 'Tags',
            tag                         : 'Tag',
            actor                       : 'Actor',
            place                       : 'Place',
            time                        : 'Time',
            series                      : 'Series',
            collection                  : 'Collection',
            object_material_technique   : 'Material / Technique',
            object_dimensions           : 'Dimensions',
            inscription                 : 'Inscription',
            comparable_objects          : 'Comparable objects',
            object_last_updated         : 'Last updated',
            objects_found               : 'Objects found',
            view_in_md                  : 'View this entry on museum-digital',
        };

    }

    /**
     * @param {string} type
     * @param {string} content
     * @param {string} cssClass
     */
    _genTextElem(type, content, cssClass = "") {

        const output = document.createElement(type);
        output.textContent = content;
        if (cssClass !== '') output.classList.add(cssClass);
        return output;

    }

    /**
     * @param {string} path
     * @param {integer} width
     * @param {integer} height
     */
    _genPreviewImg(path, width = null, height = null) {

        const apiDomain = this.apiClient.baseUrl;
        const output = document.createElement("img");

        output.src = this.assetsUrl + '/' + path.replace("data", "");
        output.alt = "";
        output.setAttribute("loading", "lazy");
        if (width !== null) output.width = width;
        if (height !== null) output.height = height;
        output.onerror = function() {
            console.log("Falling back to loading image from current domain");
            output.src = apiDomain + '/' + path;
        }

        return output;

    }

    /**
     * @param {string} path
     * @param {integer} width
     * @param {integer} height
     */
    _genPreviewImgLarge(path, width = null, height = null) {

        const apiDomain = this.apiClient.baseUrl;
        const output = document.createElement("img");

        output.src = this.assetsUrl + '/' + path.replace("data", "").replace("200w_", "500w_");;
        output.alt = "";
        output.setAttribute("loading", "lazy");
        if (width !== null) output.width = width;
        if (height !== null) output.height = height;
        output.onerror = function() {
            console.log("Falling back to loading image from current domain");
            output.src = apiDomain + '/' + path.replace("500w_", "200w_");
        }

        return output;

    }

    /**
     * @param {DOMElement} parentElem Element to bind event listener to.
     * @param {integer} limit  Maximum number of tiles/entries to display
     * @param {integer} offset Offset in pagination.
     */
    _genPagination(parentElem, total, limit, offset) {

        function genPaginationLink(targetPos, rel = "") {

            const text = Math.floor(targetPos / limit) + 1;

            const url = new URL(window.location.toLocaleString());
            url.searchParams.set('offset', targetPos);

            const link = document.createElement("a");
            link.classList.add("md-pag");
            link.textContent = text;
            link.href = url;
            if (rel !== '') link.setAttribute('rel', rel);

            link.addEventListener('click', function(e) {
                e.preventDefault();
                parentElem.dispatchEvent(new CustomEvent("md-pagination-triggered", { detail: {offset: targetPos, limit: limit} }));
            });

            return link;

        }

        function genPaginationPeriod() {

            const output = document.createElement("span");
            output.textContent = "...";
            return output;

        }

        const pos = offset;
        const lastPos = total - limit;

        const pagination = document.createElement("div");
        pagination.classList.add("md-pagination");

        if (pos - limit * 2 > 0) {
            pagination.appendChild(genPaginationLink(0, "1"));
            pagination.appendChild(genPaginationPeriod());
        }


        const linkedPosB = [
            [pos - limit * 2, ''],
            [pos - limit * 1,     'prev'],
        ];
        for (const e of linkedPosB) {
            if (e[0] >= 0) pagination.appendChild(genPaginationLink(e[0], e[1]));
        }

        const cur = document.createElement("span");
        cur.classList.add("selected");
        cur.textContent = Math.floor(pos / limit) + 1;
        pagination.appendChild(cur);

        const linkedPosAfter = [
            [pos + limit * 1,     'next'],
            [pos + limit * 2, ''],
        ];
        for (const e of linkedPosAfter) {
            if (e[0] < total) pagination.appendChild(genPaginationLink(e[0], e[1]));
        }

        if (lastPos > pos + limit * 2) {
            pagination.appendChild(genPaginationPeriod());
            const lastPage = Math.ceil(limit * Math.floor(total / limit)) - 1;
            pagination.appendChild(genPaginationLink(lastPage));
        }

        return pagination;

    }

    /**
     * @param {DOMElement} th
     * @param {DOMElement} td
     */
    _genTableRowLr(th, td) {

        const tr = document.createElement("tr");
        tr.appendChild(th);
        tr.appendChild(td);
        return tr;

    }

    /**
     * @param {{mixed}} lit
     */
    _formatLiteratureEntry(lit) {

        console.log(lit);
        const output = document.createElement("span");
        output.classList.add("md-object-literature-entry");

        if (lit.literature_author !== '') {
            output.appendChild(this._genTextElem("span", lit.literature_author, "md-literature-author"));
            output.appendChild(document.createTextNode(". "));
        }

        if (lit.literature_year !== '') {
            output.appendChild(this._genTextElem("time", lit.literature_year, "md-literature-year"));
            output.appendChild(document.createTextNode(". "));
        }

        if (lit.literature_title !== '') {
            output.appendChild(this._genTextElem("em", lit.literature_title, "md-literature-title"));
            output.appendChild(document.createTextNode(". "));
        }

        if (lit.literature_place_publisher !== '') {
            output.appendChild(this._genTextElem("span", lit.literature_place_publisher, "md-literature-place-publisher"));
            output.appendChild(document.createTextNode(". "));
        }

        if (lit.literature_inlit !== '') {
            output.appendChild(this._genTextElem("span", ': ' + lit.literature_inlit, "md-literature-inlit"));
        }

        return output;

    }

    /**
     * @param {DOMElement} w Element to bind event listeners to
     * @param {{mixed}} entry
     */
    _formatEventEntry(w, entry) {

        console.log(entry);
        const output = document.createElement("div");
        output.classList.add("md-object-event");

        output.appendChild(this._genTextElem("span", entry.event_type_name));

        if (entry.people !== undefined) {
            const peopleElem = document.createElement("div");
            peopleElem.appendChild(this._genTextElem("span", this.tls.actor));

            const actorLink = document.createElement("a");
            actorLink.classList.add("md-ref-actor");
            actorLink.setAttribute("data-id", entry.people.people_id);
            actorLink.textContent = entry.people.displayname;
            peopleElem.appendChild(actorLink);

            output.appendChild(peopleElem);

            w.dispatchEvent(new CustomEvent("md-generated-ref-actor", { detail: {elem: actorLink} }));
        }

        if (entry.place !== undefined) {
            const placeElem = document.createElement("div");
            placeElem.appendChild(this._genTextElem("span", this.tls.place));

            const placeLink = document.createElement("a");
            placeLink.classList.add("md-ref-place");
            placeLink.setAttribute("data-id", entry.place.place_id);
            placeLink.textContent = entry.place.place_name;
            placeElem.appendChild(placeLink);

            output.appendChild(placeElem);
            w.dispatchEvent(new CustomEvent("md-generated-ref-place", { detail: {elem: placeLink} }));
        }

        if (entry.time !== undefined) {
            const timeElem = document.createElement("div");
            timeElem.appendChild(this._genTextElem("span", this.tls.time));

            const timeLink = document.createElement("a");
            timeLink.classList.add("md-ref-time");
            timeLink.setAttribute("data-id", entry.time_id);
            timeLink.textContent = entry.time.time_name;
            timeElem.appendChild(timeLink);

            output.appendChild(timeElem);
            w.dispatchEvent(new CustomEvent("md-generated-ref-time", { detail: {elem: timeLink} }));
        }

        return output;

    }

    /**
     * @param {DOMElement} w Element to bind event listeners to
     * @param {{mixed}} entry
     */
    _formatTagEntry(w, entry) {

        console.log(entry);
        const output = document.createElement("a");
        output.classList.add("md-object-ref-tag");
        output.setAttribute("data-id", entry.tag_id);
        output.textContent = entry.tag_name;
        w.dispatchEvent(new CustomEvent("md-generated-ref-tag", { detail: {elem: output} }));

        return output;

    }

    /**
     * @param {DOMElement} w Element to bind event listeners to
     * @param {{mixed}} entry
     */
    _formatCollectionEntry(w, entry) {

        console.log(entry);
        const output = document.createElement("a");
        output.classList.add("md-object-ref-collection");
        output.setAttribute("data-id", entry.collection_id);
        output.textContent = entry.collection_name;
        w.dispatchEvent(new CustomEvent("md-generated-ref-collection", { detail: {elem: output} }));

        return output;

    }

    /**
     * @param {DOMElement} w Element to bind event listeners to
     * @param {{mixed}} entry
     */
    _formatSeriesEntry(w, entry) {

        console.log(entry);
        const output = document.createElement("a");
        output.classList.add("md-object-ref-series");
        output.setAttribute("data-id", entry.series_id);
        output.textContent = entry.series_name;
        w.dispatchEvent(new CustomEvent("md-generated-ref-series", { detail: {elem: output} }));

        return output;

    }

    // List objects

    /**
     * @param {DOMElement} w
     * @param {string} query
     * @param {integer} limit  Maximum number of tiles/entries to display
     * @param {integer} offset Offset in pagination.
     */
    _fillObjectResultsList(w, query, limit = 24, offset = 0) {

        /**
         * @param {DOMElement} o
         * @param {{objekt_id: integer, objekt_name: string, objekt_inventarnr: string, image: string, image_height: integer}} entry
         */
        function generateObjectTile(app, o, entry) {

            o.classList.add("md-object-tile");
            o.setAttribute("data-id", entry.objekt_id);

            const img = app._genPreviewImg(entry.image,
                200,
                Math.min(entry.image_height, 300));
            o.appendChild(img);

            o.appendChild(app._genTextElem("span", entry.objekt_name, "md-object-name"));
            o.appendChild(app._genTextElem("span", entry.objekt_inventarnr, "md-invno"));

            o.addEventListener('click', function() {
                w.dispatchEvent(new CustomEvent("md-ref-object-triggered", { detail: {id: entry.objekt_id} }));
            });

        }

        this.apiClient.searchObjects(query, limit, offset)
        .then((apiOutput) => {

            w.classList.remove("md-loading");

            if (apiOutput.length === 0) {
                w.textContent = "There were no results for this query";
                return false;
            }

            const links = [];

            const meta = document.createElement("div");
            meta.classList.add("md-objects-result-meta");
            meta.appendChild(this._genTextElem("span", this.tls.objects_found + " " + apiOutput[0].total));
            w.appendChild(meta);

            if (apiOutput[0].total > limit) {
                w.appendChild(this._genPagination(w, apiOutput[0].total, limit, offset));
            }

            const list = document.createElement("div");
            list.classList.add("md-objects-result-list");

            for (const entry of apiOutput) {

                // Generate a tile for each object
                const o = document.createElement("a");
                generateObjectTile(this, o, entry);

                links.push(o);
                list.appendChild(o);

            }
            w.appendChild(list);

            w.dispatchEvent(new CustomEvent("md-fully-loaded", { detail: {links: links} }));

        })
        .catch(err => {
            w.classList.remove("md-loading");
            w.textContent = "Failed to load objects search results";
            console.error(err);
        });

    }

    _generateTypeaheadSearch(searchBar, value, elements) {

        function highlightSubstr(name, value) {
            const nameLower = name.toLowerCase();
            const markPos = nameLower.indexOf(value);
            const markPosEnd = value.length + markPos;

            const linkName = document.createElement("span");

            const spanBefore = document.createElement("span");
            spanBefore.textContent = name.substring(0, markPos);
            linkName.appendChild(spanBefore);

            const spanMain = document.createElement("mark");
            spanMain.textContent = name.substring(markPos, markPosEnd);
            linkName.appendChild(spanMain);

            const spanAfter = document.createElement("span");
            spanAfter.textContent = name.substring(markPosEnd);
            linkName.appendChild(spanAfter);

            return linkName;

        }

        const ID_SEARCH_APIS = {

        };

        let wrap = document.getElementById("md-typeahead-list");

        if (searchBar.form.valid === false && wrap !== undefined && wrap !== null) {
            wrap.parentElem.removeChild(wrap);
            return false;
        }

        if (wrap === undefined || wrap === null) {
            wrap = document.createElement("div");
            wrap.id = "md-typeahead-list";
            wrap.classList.add("md-typeahead-list");
            wrap.style.position = "absolute";
            wrap.style.top = searchBar.offsetTop + searchBar.offsetHeight + "px";
            wrap.style.left = searchBar.offsetLeft + "px";
            wrap.style.minWidth = searchBar.offsetWidth + "px";
            document.body.appendChild(wrap);
        }

        while (wrap.firstChild) {
            wrap.removeChild(wrap.firstChild);
        }

        for (const elem of elements.hits) {

            const link = document.createElement("a");
            link.appendChild(highlightSubstr(elem.name, value));
            link.addEventListener('click', function() {
                console.log(searchBar.form);
                searchBar.form.dispatchEvent(new CustomEvent("md-typeahead-triggered",
                    { detail: {type: elem.type, id: elem.id} }));
            });

            wrap.appendChild(link);
        }



    }

    /**
     * @param {string} query
     * @param {integer} limit  Maximum number of tiles/entries to display
     * @param {integer} offset Offset in pagination.
     */
    generateObjectResultsList(query, limit = 24, offset = 0) {

        const w = document.createElement("div");
        w.classList.add("md-objects-result-wrap", "md-loading");

        this._fillObjectResultsList(w, query, limit, offset);

        const app = this;
        w.addEventListener("md-pagination-triggered", function(e) {

            while (w.firstChild) {
                w.removeChild(w.firstChild);
            }
            app._fillObjectResultsList(w, query, limit, e.detail.offset);

        }, {passive: true});

        return w;

    }

    // Facets as bubbles

    /**
     * @param {string} query
     * @param {integer} limit Maximum number of tiles/entries to display
     */
    generateFacetBubbles(query, limit = 20) {

        const w = document.createElement("div");
        w.classList.add("md-facet-bubbles-wrap", "md-loading");

        this.apiClient.getObjectsFacetSearchOptionsFlat(query, limit)
        .then((apiOutput) => {

            w.classList.remove("md-loading");

            const links = [];

            for (const entry of apiOutput) {

                const link = document.createElement("a");
                link.classList.add("md-facet-bubbles");
                link.setAttribute("data-type", entry.type);
                link.setAttribute("data-id", entry.id);
                link.setAttribute("data-count", entry.count);
                link.textContent = entry.name;
                link.addEventListener('click', function() {
                    w.dispatchEvent(new CustomEvent("md-facet-triggered", { detail: {type: entry.type, id: entry.id} }));
                });

                links.push(link);
                w.appendChild(link);

            }

            w.dispatchEvent(new CustomEvent("md-fully-loaded", { detail: {links: links} }));

        })
        .catch(err => {
            w.classList.remove("md-loading");
            w.textContent = "Failed to load facet data";
            console.error(err);
        });

        return w;

    }

    // Display preview of object

    /**
     * @param {integer} id
     */
    generateObjectPreview(id) {

        const w = document.createElement("div");
        w.classList.add("md-object-preview", "md-loading");

        this.apiClient.getObject(id)
        .then((apiOutput) => {

            w.classList.remove("md-loading");

            console.log(apiOutput);
            w.setAttribute("data-id", apiOutput.object_id);

            for (const imgData of apiOutput.object_images) {
                if (imgData.is_main === 'j') {
                    const img = this._genPreviewImg('data/' + apiOutput.md_subset + '/' + imgData.folder + '/' + imgData.preview);
                    w.appendChild(img);
                    break;
                }
            }

            w.appendChild(this._genTextElem("span", apiOutput.object_name, "md-object-name"));
            w.appendChild(this._genTextElem("span", apiOutput.object_inventory_number, "md-invno"));

            const event = new CustomEvent("md-fully-loaded");
            w.dispatchEvent(event);

        })
        .catch(err => {
            w.classList.remove("md-loading");
            w.textContent = "Failed to load object data";
            console.error(err);
        });

        return w;

    }

    /**
     * @param {integer} id
     */
    generateObjectPage(id) {

        const objectTextFields = [
            'object_material_technique',
            'object_dimensions',
            'inscription',
            'comparable_objects',

            // 'object_last_updated',
        ];

        const w = document.createElement("div");
        w.classList.add("md-object-page", "md-loading");

        this.apiClient.getObject(id)
        .then((apiOutput) => {

            w.classList.remove("md-loading");

            console.log(apiOutput);
            w.setAttribute("data-id", apiOutput.object_id);
            w.setAttribute("lang", apiOutput.expected_language);

            // Image section

            const imgSec = document.createElement("div");
            imgSec.classList.add("md-object-img-section");

            for (const imgData of apiOutput.object_images) {
                if (imgData.is_main === 'j') {
                    const img = this._genPreviewImgLarge('data/' + apiOutput.md_subset + '/' + imgData.folder + '/' + imgData.preview);
                    imgSec.appendChild(img);
                    break;
                }
            }
            w.appendChild(imgSec);

            w.appendChild(this._genTextElem("h1", apiOutput.object_name, "md-object-name"));

            const summary = document.createElement("div");
            summary.classList.add("md-object-page-summary");
            summary.appendChild(this._genTextElem("span", apiOutput.object_inventory_number, "md-invno"));
            summary.appendChild(this._genTextElem("span", apiOutput.object_type, "md-object-type"));
            w.appendChild(summary);

            const desc = document.createElement("div");
            desc.classList.add("md-main-desc");
            desc.style.whiteSpace = "pre-wrap";
            desc.textContent = apiOutput.object_description;
            w.appendChild(desc);

            // Table: object details

            const table = document.createElement("table");
            table.classList.add("md-object-details-table");

            for (const fieldName of objectTextFields) {

                if (apiOutput[fieldName] === undefined || apiOutput[fieldName] === "") continue;

                table.appendChild(this._genTableRowLr(
                    this._genTextElem("th", this.tls[fieldName]),
                    this._genTextElem("td", apiOutput[fieldName]),
                ));
            }

            // Literature

            if (apiOutput.object_literature.length > 0) {

                const litTd = document.createElement("td");
                for (const litEntry of apiOutput.object_literature) {
                    litTd.appendChild(this._formatLiteratureEntry(litEntry));
                }
                table.appendChild(this._genTableRowLr(
                    this._genTextElem("th", this.tls.literature),
                    litTd,
                ));

            }

            // Events

            if (apiOutput.object_events.length > 0) {

                const eventTd = document.createElement("td");
                for (const eventEntry of apiOutput.object_events) {
                    eventTd.appendChild(this._formatEventEntry(w, eventEntry));
                }
                table.appendChild(this._genTableRowLr(
                    this._genTextElem("th", this.tls.events),
                    eventTd,
                ));

            }

            // Related ...
            // TODO

            // Tags

            if (apiOutput.object_tags.length > 0) {

                const tagTd = document.createElement("td");
                for (const tagEntry of apiOutput.object_tags) {
                    tagTd.appendChild(this._formatTagEntry(w, tagEntry));
                }
                table.appendChild(this._genTableRowLr(
                    this._genTextElem("th", this.tls.tags),
                    tagTd,
                ));

            }

            // Collections

            if (apiOutput.object_collection.length > 0) {

                const colTd = document.createElement("td");
                for (const colEntry of apiOutput.object_collection) {
                    colTd.appendChild(this._formatCollectionEntry(w, colEntry));
                }
                table.appendChild(this._genTableRowLr(
                    this._genTextElem("th", this.tls.collection),
                    colTd,
                ));

            }

            // Series

            if (apiOutput.object_series.length > 0) {

                const serTd = document.createElement("td");
                for (const serEntry of apiOutput.object_series) {
                    serTd.appendChild(this._formatSeriesEntry(w, serEntry));
                }
                table.appendChild(this._genTableRowLr(
                    this._genTextElem("th", this.tls.series),
                    serTd,
                ));

            }

            w.appendChild(table);

            const mdLink = document.createElement("a");
            mdLink.classList.add("md-link-to-entity-in-md");
            mdLink.href = this.apiClient.baseUrl + '/object/' + id;
            mdLink.textContent = this.tls.view_in_md;
            w.appendChild(mdLink);

            w.dispatchEvent(new CustomEvent("md-fully-loaded"));

        })
        .catch(err => {
            w.classList.remove("md-loading");
            w.textContent = "Failed to load object data";
            console.error(err);
        });

        return w;

    }

    // Generates a search bar

    /**
     * @param {boolean} useTypeAheadSearch
     */
    generateSearchForm(useTypeAheadSearch = true) {

        const form = document.createElement("form");
        form.classList.add("md-search-form");

        const searchBar = document.createElement("input");
        searchBar.type = "search";
        searchBar.classList.add("md-searchbar");
        searchBar.setAttribute("minlength", "3");
        searchBar.placeholder = this.tls.search;
        form.appendChild(searchBar);

        const submitB = document.createElement("button");
        submitB.classList.add("md-search-button");
        submitB.type = "submit";
        form.appendChild(submitB);

        if (useTypeAheadSearch === true) {
            const app = this;
            (function() {

                // Querycache: null for loading, undefined for values to query, object = result
                const queryCache = {};

                searchBar.addEventListener('keyup', function() {

                    if (form.valid === false) {
                        app._generateTypeaheadSearch(searchBar, '', {});
                        return false;
                    }

                    const value = searchBar.value;

                    if (queryCache[value] === undefined) {

                        queryCache[value] = false;

                        app.apiClient.getObjectsLinkedEntities(value).then((apiOutput) => {
                            queryCache[value] = apiOutput;
                            app._generateTypeaheadSearch(searchBar, value, apiOutput);
                        })
                        .catch(err => {
                            console.error(err);
                        });

                    }
                    if (typeof query === 'object') {
                        app._generateTypeaheadSearch(searchBar, value, queryCache[value]);
                    }

                });

            })();
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            form.dispatchEvent(new CustomEvent('md-object-search-submitted', { detail: { value: searchBar.value} }));
        });

        const resetB = document.createElement("span");
        resetB.classList.add('md-object-search-reset-span');
        resetB.textContent = this.tls.reset_search;
        resetB.addEventListener('click', function(e) {
            form.dispatchEvent(new CustomEvent('md-object-search-reset'));
        });
        form.appendChild(resetB);

        return form;

    }

    // Display single object page

    // List collections of an institution

    // Collection page

    // List of exhibitions

    // Exhibition page

    /**
     * @param {MdApi}       apiClient
     * @param {null|string} assetsUrl
     * @param {{mixed}}     tls
     */
    constructor(apiClient, assetsUrl = null, tls = {}) {

        this.apiClient = apiClient;

        if (assetsUrl === null) {
            this.assetsUrl = "https://asset.museum-digital.org/";
        }
        else {
            this.assetsUrl = assetsUrl;
        }

        this.tls = this._getDefaultTls();
        for (const key in tls) {
            this.tls[key] = tls[key];
        }

    }

}
