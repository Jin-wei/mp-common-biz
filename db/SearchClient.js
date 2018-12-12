var elasticsearch = require('elasticsearch');
var sysConfig = require('../config/SystemConfig.js');


var searchClient = new elasticsearch.Client(sysConfig.getElasticSearchOption());

function getSearchClient(){
    return searchClient;
}

module.exports = {
    getSearchClient: getSearchClient
};