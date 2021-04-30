'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');


/**
 * Get the content of a web page.
 * @param {string} url - URL to perform the request.
 * @returns {string} A promise to a string with the content of the response to the request.
 */
function requestPageContent(url) {
    return new Promise((resolve, reject) => {
        const get = (url.startsWith('http:') ? http.get : https.get);
        let data = '';
        get(url, (res) => {
            if (res.statusCode < 200 || res.statusCode > 299) {
                reject(new Error(`Request failed. Status Code: ${res.statusCode}.`));
            } else {
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => { resolve(data); });
            }
        }).on('error', (e) => {
            reject(new Error(`Request failed. ${e.message}.`));
        });
    });
}


/**
 * Download a file.
 * @param {string} url - URL to the file to download.
 * @param {string} dest - Path to save the downloaded file.
 * @returns A promise.
 */
function download(url, dest) {
    return new Promise((resolve, reject) => {
        const get = (url.startsWith('http:') ? http.get : https.get);
        get(url, (res) => {
            if (res.statusCode < 200 || res.statusCode > 299) {
                reject(new Error(`Request failed. Status Code: ${res.statusCode}.`));
            } else {
                res.pipe(fs.createWriteStream(dest, { flags: 'w+' }).on('close', () => resolve()));
            }
        }).on('error', (e) => {
            fs.unlink(dest, () => {});
            reject(new Error(`Request failed.`));
        });
    });
}


function exportToJSON(data) {
    return JSON.stringify(data, null, 2);
}

/**
 * Export data to CSV format.
 * @param {array} data 
 * @return {string} A string with the data in CSV format.
 */
function exportToCSV(data) {

    // Header
    let header = [
        'NAME', 'STATUS', 'OBJECTIVE', 
        'IS.INFEASIBLE', 'IS.UNBOUNDED', 'IS.OPTIMAL', 'IS.BENCHMARK', 
        'VARIABLES.ORIGINAL', 'VARIABLES.PRESOLVED',
        'BINARIES.ORIGINAL', 'BINARIES.PRESOLVED',
        'INTEGERS.ORIGINAL', 'INTEGERS.PRESOLVED',
        'CONTINUOUS.ORIGINAL', 'CONTINUOUS.PRESOLVED',
        'CONSTRAINTS.ORIGINAL', 'CONSTRAINTS.PRESOLVED',
        'NONZERO.DENSITY.ORIGINAL', 'NONZERO.DENSITY.PRESOLVED',
        'AGGREGATION.ORIGINAL', 'AGGREGATION.PRESOLVED',
        'PRECEDENCE.ORIGINAL', 'PRECEDENCE.PRESOLVED',
        'VARIABLE.BOUND.ORIGINAL', 'VARIABLE.BOUND.PRESOLVED',
        'SET.PARTITIONING.ORIGINAL', 'SET.PARTITIONING.PRESOLVED',
        'SET.PACKING.ORIGINAL', 'SET.PACKING.PRESOLVED',
        'SET.COVERING.ORIGINAL', 'SET.COVERING.PRESOLVED',
        'CARDINALITY.ORIGINAL', 'CARDINALITY.PRESOLVED',
        'INVARIANT.KNAPSACK.ORIGINAL', 'INVARIANT.KNAPSACK.PRESOLVED',
        'EQUATION.KNAPSACK.ORIGINAL', 'EQUATION.KNAPSACK.PRESOLVED',
        'BINPACKING.ORIGINAL', 'BINPACKING.PRESOLVED',
        'KNAPSACK.ORIGINAL', 'KNAPSACK.PRESOLVED',
        'INTEGER.KNAPSACK.ORIGINAL', 'INTEGER.KNAPSACK.PRESOLVED',
        'MIXED.BINARY.ORIGINAL', 'MIXED.BINARY.PRESOLVED',
        'TAGS', 'URL.INFO', 'URL.DOWNLOAD'
    ].join(',');

    let rows = [header];
    data.forEach((d, idx) => {
        let row = [
            `"${d.name}"`, d.status, d.objective, 
            d.is_infeasible, d.is_unbounded, d.is_optimal, d.is_benchmark,
            d.size.variables.original, d.size.variables.presolved,
            d.size.binaries.original, d.size.binaries.presolved,
            d.size.integers.original, d.size.integers.presolved,
            d.size.continuous.original, d.size.continuous.presolved,
            d.size.constraints.original, d.size.constraints.presolved,
            d.size.nonzero_density.original, d.size.nonzero_density.presolved,
            d.constraints.aggregations.original, d.constraints.aggregations.presolved,
            d.constraints.precedence.original, d.constraints.precedence.presolved,
            d.constraints.variable_bound.original, d.constraints.variable_bound.presolved,
            d.constraints.set_partitioning.original, d.constraints.set_partitioning.presolved,
            d.constraints.set_packing.original, d.constraints.set_packing.presolved,
            d.constraints.set_covering.original, d.constraints.set_covering.presolved,
            d.constraints.cardinality.original, d.constraints.cardinality.presolved,
            d.constraints.invariant_knapsack.original, d.constraints.invariant_knapsack.presolved,
            d.constraints.equation_knapsack.original, d.constraints.equation_knapsack.presolved,
            d.constraints.bin_packing.original, d.constraints.bin_packing.presolved,
            d.constraints.knapsack.original, d.constraints.knapsack.presolved,
            d.constraints.integer_knapsack.original, d.constraints.integer_knapsack.presolved,
            d.constraints.mixed_binary.original, d.constraints.mixed_binary.presolved,
            `"${d.tags}"`, `"${d.url_info}"`, `"${d.url_download}"`
        ].join(',');
        rows.push(row);
    });

    return rows.join('\n');
}

// Exports
exports.requestPageContent = requestPageContent;
exports.download = download;
exports.exportToJSON = exportToJSON;
exports.exportToCSV = exportToCSV;
