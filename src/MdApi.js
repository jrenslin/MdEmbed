"use strict";

class MdApi {

    baseUrl;
    lang;
    instId;

    /**
     * @param {URL} url
     */
    async fetchJsonApi(url) {

        url.searchParams.set("navlang", this.lang);

        const response = await fetch(url,
        {
            method: "GET",
            headers: {
                "X-VIA": "md api client; " + location.hostname
            }
        });

        if (!response.ok) {
            const message = `An error has occured: ${response.status}`;
            throw new Error(message);
        }

        const output = await response.json();
        Object.freeze(output)
        return output;

    }

    /**
     * @param {integer} objectId
     */
    async getObject(objectId) {

        const api = new URL(this.baseUrl + '/json/object/' + encodeURIComponent(objectId));
        // pageParams = pageUrl.searchParams;
        const output = await this.fetchJsonApi(api);

        if (this.instId !== null && output.object_institution.institution_id !== this.instId) {
            throw "This object does not belong to the selected institution";
        }

        return output;

    }

    /*
     * @param {string} apiPath
     * @param {string | {s: string, extend: string}} query
     * @param {integer} limit
     * @param {integer} offset
     */
    _getObjectSearchUrl(apiPath, query, limit = 24, offset = 0) {

        const api = new URL(this.baseUrl + apiPath);

        // Define search query. API parameter s describes an already transformed and
        // correctly formulated query.
        // Passing extendQuery allows one to pass strings that will then be checked for
        // their availability as actors, times, etc. If they represent any of those more
        // specific types, the search will proceed based on that result (e.g. the time
        // "1902"). If no specific result could be found, the query will be extended by a
        // fulltext search parameter.
        if (typeof query === 'object') {
            api.searchParams.set("s", query.s);
            if (query.extend !== '') api.searchParams.set("extendQuery", query.extend);
        }
        else if (query.includes(":")) {
            api.searchParams.set("s", query);
        }
        else {
            api.searchParams.set("extendQuery", query);
        }

        if (this.instId !== null) api.searchParams.set("instnr", this.instId);

        if (offset !== 0) api.searchParams.set("startwert", offset);
        if (limit > 100) {
            throw "You were trying to query more than the maximum 100 objects at a time";
        }
        api.searchParams.set("gbreitenat", limit);
        return api;

    }

    /**
     * @param {string | {s: string, extend: string}} query
     * @param {integer} limit
     * @param {integer} offset
     */
    async searchObjects(query, limit = 24, offset = 0) {

        // Build API call

        const api = this._getObjectSearchUrl('/json/objects', query, limit, offset)

        // Run and return API call

        const output = await this.fetchJsonApi(api);
        return output;

    }

    /**
     * @param {string | {s: string, extend: string}} query
     */
    async getObjectQueryStrings(query) {

        // Build API call

        const api = this._getObjectSearchUrl('/json/objects_get_query_string', query)

        // Run and return API call

        const output = await this.fetchJsonApi(api);
        return output.results;

    }

    /**
     * @param {string | {s: string, extend: string}} query
     */
    async getObjectsFacetSearchOptions(query) {

        // Build API call

        let negotiatedQueryStr;
        if (typeof query === 'object' || (query.includes(":") === false && query !== '')) {
            negotiatedQueryStr = await this.getObjectQueryStrings(query);
        }
        else {
            negotiatedQueryStr = query;
            if (this.instId !== null) negotiatedQueryStr += ' institution:' + this.instId;
        }

        const api = new URL(this.baseUrl + '/json/object-facet-search/' + encodeURIComponent(negotiatedQueryStr))

        // Run and return API call

        const output = await this.fetchJsonApi(api);
        return output;

    }

    /**
     * @param {string | {s: string, extend: string}} query
     * @param {integer} limit Maximum number of tiles/entries to display
     */
    async getObjectsFacetSearchOptionsFlat(query, limit = 20) {

        const apiOutput = await this.getObjectsFacetSearchOptions(query);

        // Add all entries to a flat list that can be sorted and filtered afterwards

        const facets = [];
        for (const type in apiOutput) {

            // On institution-specific pages, skip inclusion in list
            if (this.instId !== null && type === 'institution') continue;

            for (const entry of apiOutput[type]) {
                entry.type = type;
                facets.push(entry);
            }

        }

        // Sort by count and keep only the first {limit} number of entries
        facets.sort((a, b) => b.count - a.count);
        const output = facets.slice(0, limit);

        output.sort((a, b) => ('' + a.name).localeCompare(b.name));

        return output;

    }

    /**
     * @param {string} query
     */
    async getObjectsLinkedEntities(query) {

        const api = new URL(this.baseUrl + '/json/search-linked-entries-by-name/' + encodeURIComponent(query));
        // pageParams = pageUrl.searchParams;
        const output = await this.fetchJsonApi(api);
        return output;

    }

    /**
     * @param {integer} institutionId
     */
    async getInstitution(institutionId) {

        const api = new URL(this.baseUrl + '/json/institution/' + encodeURIComponent(institutionId));
        // pageParams = pageUrl.searchParams;
        const output = await this.fetchJsonApi(api);
        return output;

    }

    /**
     * @param {string} query
     * @param {integer} limit
     * @param {integer} offset
     */
    async listCollectionsByInst(institutionId) {

        const api = new URL(this.baseUrl + '/json/collections_by_institution/' + encodeURIComponent(institutionId));
        // pageParams = pageUrl.searchParams;
        const output = await this.fetchJsonApi(api);
        return output;

    }

    /**
     * @param {string} query
     * @param {integer} limit
     * @param {integer} offset
     */
    async searchCollections(query, limit = 100, offset = 0) {

        if (this.instId !== null) {
            throw "You set an institution ID. Please use listCollectionsByInst()";
        }

        const api = new URL(this.baseUrl + '/json/collections_by_institutions');
        api.searchParams.set("q", query);
        api.searchParams.set("limit", limit);
        api.searchParams.set("offset", offset);
        // pageParams = pageUrl.searchParams;
        const output = await this.fetchJsonApi(api);
        return output;

    }

    /**
     * @param {integer} collectionId
     */
    async getCollection(collectionId) {

        const api = new URL(this.baseUrl + '/json/collection/' + encodeURIComponent(collectionId));
        // pageParams = pageUrl.searchParams;
        const output = await this.fetchJsonApi(api);
        return output;

    }

    /**
     * @param {integer} seriesId
     */
    async getSeries(seriesId) {

        const api = new URL(this.baseUrl + '/json/series/' + encodeURIComponent(seriesId));
        // pageParams = pageUrl.searchParams;
        const output = await this.fetchJsonApi(api);
        return output;

    }

    /**
     * @param {{start_before: Date, start_after: Date, end_before: Date, end_after: Date, permanent: boolean, place: string}} queryParams exhibitionId
     * @param {string} sortBy
     * @param {string} sortOrder
     */
    async searchExhibition(queryParams, sortBy = "start", sortOrder = "DESC") {

        const api = new URL(this.baseUrl + '/json/list_exhibitions');

        if (this.instId !== null) {
            api.searchParams.set("institution_id", this.instId);
        }

        if (queryParams.start_before !== undefined && queryParams.start_before !== null) {
            api.searchParams.set("start_before", queryParams.start_before.toString());
        }
        if (queryParams.start_after !== undefined && queryParams.start_after !== null) {
            api.searchParams.set("start_after", queryParams.start_after.toString());
        }
        if (queryParams.end_before !== undefined && queryParams.end_before !== null) {
            api.searchParams.set("end_before", queryParams.end_before.toString());
        }
        if (queryParams.end_after !== undefined && queryParams.end_after !== null) {
            api.searchParams.set("end_after", queryParams.end_after.toString());
        }
        if (queryParams.permanent !== undefined && queryParams.permanent !== null) {
            api.searchParams.set("permanent", queryParams.permanent);
        }
        if (queryParams.place !== undefined && queryParams.place !== null) {
            api.searchParams.set("place", queryParams.place);
        }
        api.searchParams.set("sort_by", sortBy);
        api.searchParams.set("sort_order", sortOrder);

        // pageParams = pageUrl.searchParams;
        const output = await this.fetchJsonApi(api);
        return output;

    }

    /**
     * @param {integer} exhibitionId
     */
    async getExhibition(exhibitionId) {

        const api = new URL(this.baseUrl + '/json/exhibition/' + encodeURIComponent(exhibitionId));
        // pageParams = pageUrl.searchParams;
        const output = await this.fetchJsonApi(api);
        return output;

    }

    /**
     * @param {{start_before: Date, start_after: Date, end_before: Date, end_after: Date, place: string}} queryParams exhibitionId
     * @param {string} sortBy
     * @param {string} sortOrder
     */
    async searchEvents(queryParams, sortBy = "start", sortOrder = "DESC") {

        const api = new URL(this.baseUrl + '/json/list_exhibitions');

        if (this.instId !== null) {
            api.searchParams.set("institution_id", this.instId);
        }

        if (queryParams.start_before !== undefined && queryParams.start_before !== null) {
            api.searchParams.set("start_before", queryParams.start_before.toString());
        }
        if (queryParams.start_after !== undefined && queryParams.start_after !== null) {
            api.searchParams.set("start_after", queryParams.start_after.toString());
        }
        if (queryParams.end_before !== undefined && queryParams.end_before !== null) {
            api.searchParams.set("end_before", queryParams.end_before.toString());
        }
        if (queryParams.end_after !== undefined && queryParams.end_after !== null) {
            api.searchParams.set("end_after", queryParams.end_after.toString());
        }
        if (queryParams.place !== undefined && queryParams.place !== null) {
            api.searchParams.set("place", queryParams.place);
        }
        api.searchParams.set("sort_by", sortBy);
        api.searchParams.set("sort_order", sortOrder);

        // pageParams = pageUrl.searchParams;
        const output = await this.fetchJsonApi(api);
        return output;

    }

    /**
     * @param {integer} eventId
     */
    async getEvent(eventId) {

        const api = new URL(this.baseUrl + '/json/event/' + encodeURIComponent(eventId));
        // pageParams = pageUrl.searchParams;
        const output = await this.fetchJsonApi(api);
        return output;

    }

    /**
     * @param {integer} instId
     */
    setInstitutionId(instId) {

        this.instId = instId;

    }

    constructor(baseUrl, lang) {
        this.baseUrl = baseUrl;
        this.lang = lang;
        this.instId = null;
    }

}
