#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ArgumentParser } = require('argparse');
const MIPLIB2017Info = require('../lib/miplib2017-info');
const { download, exportToJSON, exportToCSV } = require('../lib/utils');

// Version
const { version, description } = require('../package.json');

// Parse input arguments
const parser = new ArgumentParser({
    description: description,
    add_help: true,
    exit_on_error: true
});

parser.add_argument('-v', '--version', { 
    action: 'version', 
    version: version });

parser.add_argument('--download', { 
    metavar: 'PATH',
    help: 'If set, download instance files.'});

const group = parser.add_mutually_exclusive_group();

group.add_argument('--csv-only', { 
    action: 'store_true',
    help: 'Exports information about MIPLIB 2017 instances only to a JSON file.' });

group.add_argument('--json-only', { 
    action: 'store_true',
    help: 'Exports information about MIPLIB 2017 instances only to a CSV file.' });

const args = parser.parse_args();

// Create directory to save instance files (if download is required)
if (args['download']) {
    fs.mkdirSync(args['download'], {recursive: true});
}

// Get data about instances and download them (if required)
let total = MIPLIB2017Info.instances.length;
let count = 0;
let promises = [];

for (let name of MIPLIB2017Info.instances) {
    promises.push(new Promise((resolve, reject) => {
        MIPLIB2017Info.getInstanceInfo(name)
            .then((info) => {
                count += 1;
                process.stdout.write(`\rGetting instance data... ${count} of ${total} (${(100*(count/total)).toFixed(2)}%)`);
                resolve(info);
            }).catch((e) => {
                const message = `Failed to get information from instance "${name}."\nError: ${e.message}`;
                reject(new Error(message));
            });
    }));
}

// Process data
Promise.all(promises)
    .then((data) => {
        process.stdout.write('\rGetting instance data... Done!                        \n');
        return data;
    })
    .then((data) => {

        // Export data to JSON
        if (!args['csv-only']) {
            process.stdout.write('Exporting data to JSON... ');
            fs.writeFileSync('miplib2017.json', exportToJSON(data), 'utf8');
            process.stdout.write('Done!\n');
        }

        // Export data to CSV
        if (!args['json-only']) {
            process.stdout.write('Exporting data to CSV... ');
            fs.writeFileSync('miplib2017.csv', exportToCSV(data), 'utf8');
            process.stdout.write('Done!\n');
        }

        // Download instance files, if required
        if (args['download']){
            process.stdout.write(`Downloading instance files to folder ${args['download']}... `);
            const downloadPromises = [];
            count = 0;
            for (let info of data) {
                downloadPromises.push(new Promise((resolve, reject) => {
                    const dest = path.resolve(args['download'], info.name + '.mps.gz');
                    download(info.url_download, dest)
                        .then(() => {
                            count += 1;
                            process.stdout.write(`\rDownloading instance files... ${count} of ${total} (${(100*(count/total)).toFixed(2)}%)`);
                            resolve();
                        })
                        .catch((e) => {
                            const message = `Failed to get download instance "${info.name}."\nError: ${e.message}`;
                            reject(new Error(message));
                        });
                }));
            }

            Promise.all(downloadPromises)
                .then(() => {
                    process.stdout.write('\rDownloading instance files... Done!                        \n');
                })
                .catch((e) => {
                    console.log(`\n${e.message}`);
                });
        }

    })
    .catch((e) => {
        console.log(`\n${e.message}`);
    });
