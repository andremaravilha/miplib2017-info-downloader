'use strict';

const cheerio = require('cheerio');
const { requestPageContent } = require('./utils');


// Some constants
const MIPLIB_URL = 'https://miplib.zib.de/';


/**
 * Class that offers some static methods to get information from MIPLIB 
 * 2017 instances.
 */
class MIPLIB2017Info {

    /**
     * Names of instances in MIPLIB 2017.
     */
    static instances = require('./instances');

    /**
     * Get the updated information for an instance from its name.
     * @param {string} name - Instance name.
     * @returns {Promise} A promisse to an object with all information about the instance.
     */
    static async getInstanceInfo(name) {

        // Checks whether it is a valid name.
        if (this.instances.indexOf(name) < 0) {
            throw new Error('Invalid instance name.');
        }

        // Gets content of the page with information about the instance
        const url = `${MIPLIB_URL}/instance_details_${name}.html`;
        const data = await requestPageContent(url);
        const $ = cheerio.load(data);

        // Parse data
        let info = {
            name: name,
            status: '',
            objective: null,
            is_infeasible: false,
            is_unbounded: false,
            is_optimal: false,
            is_benchmark: false,
            size: {},
            constraints: {},
            tags: [],
            url_download: '',
            url_info: url,
        };

        // Tags and flags
        $('h3').first().children('a').each((i, e) => info.tags.push($(e).text().trim()));
        info.is_infeasible = (info.tags.findIndex(e => e === 'infeasible') >= 0);
        info.is_benchmark = (info.tags.findIndex(e => e === 'benchmark') >= 0);

        // Statistics (size)
        $('#instance-statistics > div > div:first').children('table').children('tbody').children('tr').each((i, e) => {
            let aux = $(e).children('td');
            let attr = $(aux.get(0)).text().trim().replace(' ', '_').toLowerCase();
            info.size[attr] = {
                original: Number($(aux.get(1)).text().trim()),
                presolved: Number($(aux.get(2)).text().trim())
            };
        });

        // Statistics (constraints)
        $('#instance-statistics > div > div:last').children('table').children('tbody').children('tr').each((i, e) => {
            let aux = $(e).children('td');
            let attr = $(aux.get(0)).text().trim().replace(' ', '_').toLowerCase();
            info.constraints[attr] = {
                original: Number($(aux.get(1)).text().trim()),
                presolved: Number($(aux.get(2)).text().trim())
            };
        });

        // Status, objective and URL to download
        $('#instance-statistics').prev().find('table > tbody > tr').each((i, e) => {
            let aux = $(e).children('td');
            let objective = $(aux.get(6)).text().trim().toLowerCase().replace('*', '');

            info.is_unbounded = (objective === 'unbounded');
            info.status = $(aux.get(4)).text().trim();        
            info.url_download = MIPLIB_URL + $(aux.get(7)).children('a').attr('href').trim();

            // Objective
            let has_known_solution = (info.tags.findIndex(e => e === 'no_solution') < 0);
            if (!info.is_infeasible && !info.is_unbounded && has_known_solution) {
                info.objective = Number(objective);
                info.is_optimal = (info.status != 'open');
            }
        });

        // Returns the object with instance data
        return info;
    }

}


// Exports
module.exports = MIPLIB2017Info;
