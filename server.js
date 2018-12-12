// Copyright (c) 2012 Mark Cavage. All rights reserved.

var path = require('path');
var util = require('util');

var commonUtil = require('mp-common-util');
var authHeaderParser = commonUtil.authHeaderParser;
var authCheck = commonUtil.authCheck;
var restify = require('restify');
var sysConfig = require('./config/SystemConfig.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Server.js');
var listOfValue = require('./util/ListOfValue.js');


var biz=require('./bl/Biz.js');
var bizCustomer=require('./bl/BizCustomer.js');
var bizCustomerPrice=require('./bl/BizCustomerPrice.js');
var bizPayment=require('./bl/BizPayment.js');
var bizPO=require('./bl/BizPO.js');
///--- API

/**
 * Returns a server with all routes defined on it
 */
function createServer() {
    // Create a server with our logger and custom formatter
    // Note that 'version' means all routes will default to
    // 1.0.0
    var server = restify.createServer({
        name: 'Product',
        version: '1.0.0'
    });

    var authUrl=sysConfig.loginModuleUrl.protocol+"://"+sysConfig.loginModuleUrl.host+":"+sysConfig.loginModuleUrl.port+"/api/auth/tokens";
    logger.debug(authUrl);

    // Ensure we don't drop data on uploads
    //server.pre(restify.pre.pause());

    // Clean up sloppy paths like //todo//////1//
    server.pre(restify.pre.sanitizePath());

    // Handles annoying user agents (curl)
    server.pre(restify.pre.userAgentConnection());

    // Set a per request bunyan logger (with requestid filled in)
    //server.use(restify.requestLogger());

    // Allow 50 requests/second by IP, and burst to 100
    server.use(restify.throttle({
        burst: 100,
        rate: 50,
        ip: true
    }));

    restify.CORS.ALLOW_HEADERS.push('auth-token');
    restify.CORS.ALLOW_HEADERS.push('tenant');
    restify.CORS.ALLOW_HEADERS.push('client-id');
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Origin");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Credentials");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods", "GET");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods", "POST");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods", "PUT");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods", "DELETE");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Headers", "accept,api-version, content-length, content-md5,x-requested-with,content-type, date, request-id, response-time");
    server.use(restify.CORS());
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.dateParser());
    server.use(restify.authorizationParser());
    server.use(restify.queryParser());
    server.use(restify.gzipResponse());
    server.use(restify.fullResponse());
    server.use(restify.bodyParser({uploadDir: __dirname + '/uploads/'}));
    server.use(authHeaderParser.authHeaderParser({logger:logger,authUrl:authUrl}));

    // Now our own handlers for authentication/authorization
    // Here we only use basic auth, but really you should look
    // at https://github.com/joyent/node-http-signature

    //server.use(authenticate);

    //server.use(apiUtil.save);

    var STATICS_FILE_RE = /\.(css|js|jpe?g|png|gif|less|eot|svg|bmp|tiff|ttf|otf|woff|pdf|ico|json|wav|ogg|mp3?|xml)$/i;
    var STATICS_HTML = /\.(pdf|json|xml|html)$/i;
    server.get(STATICS_FILE_RE, restify.serveStatic({ directory: './public/web', maxAge: sysConfig.maxAge }));
    server.get(STATICS_HTML, restify.serveStatic({ directory: './public/web', maxAge: 0 }));

    server.get(/\/apidoc\/?.*/, restify.serveStatic({
        directory: './public'
    }));

    server.get(/\/downloads\/?.*/, restify.serveStatic({
        directory: './static'
    }));

    /**
     * business module
     */

    //business
    //public?
    server.get('/api/biz', biz.listBiz);
    //for biz
    server.put({path:'/api/biz/:bizId', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_BIZ), biz.updateBiz);
    //for admin
    server.del('/api/biz/:bizId', authCheck.authCheck(listOfValue.PERMISSION_DEL_BIZ), biz.delBiz);
    server.put({path:'/api/biz', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_ALL_BIZ), biz.updateAllBiz);
    server.post({path:'/api/biz', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_CREATE_BIZ), biz.addBiz);
    server.post({path: '/api/bizstatus', contentType: 'application/json'},authCheck.authCheck(listOfValue.PERMISSION_UPDATE_ALL_BIZ),biz.updateBizStatus);

   //bizCustomer
    //for user
    server.get('api/custs/:custId/biz', authCheck.authCheck(),bizCustomer.getBizByCustId);
    //for biz
    server.get('api/biz/:bizId/customers', authCheck.authCheck(listOfValue.PERMISSION_GET_BIZCUSTOMERS),bizCustomer.getBizCustomers);
    server.del('api/biz/:bizId/customers', authCheck.authCheck(listOfValue.PERMISSION_DEL_BIZCUSTOMERS), bizCustomer.deleteBizCustomers);
    server.post({path:'/api/biz/:bizId/customers', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_CREATE_BIZCUSTOMERS), bizCustomer.addBizCustomers);
    server.put({path:'/api/biz/:bizId/customers', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_BIZCUSTOMERS), bizCustomer.updateBizCustomers);
    server.post({path:'/api/biz/:bizId/customerusers', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_BIZCUSTOMERS), bizCustomer.updateBizCustomersUser);


    //for admin
    server.get('api/customers', authCheck.authCheck(listOfValue.PERMISSION_GET_CUSTOMERS),bizCustomer.getCustomers);
    server.post({path:'/api/customers', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_CREATE_CUSTOMERS), bizCustomer.addCustomers);
    server.put({path:'/api/customers', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_CUSTOMERS), bizCustomer.updateCustomers);
    server.del({path:'/api/customers', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_DELETE_CUSTOMERS), bizCustomer.deleteCustomers);
    server.post({path:'/api/customerbiz', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_CUSTOMERS), bizCustomer.updateCustomersBiz);
    server.post({path:'/api/customerusers', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_CUSTOMERS), bizCustomer.updateCustomersUser);


    //CustomerPrice
    //for user
    server.get('api/custs/:custId/customerprices',authCheck.authCheck(), bizCustomerPrice.getCustomerPrices);
    //for admin
    server.get('api/customerprices',authCheck.authCheck(listOfValue.PERMISSION_GET_CUSTOMERPRICES), bizCustomerPrice.getAllCustomerPrices);
    server.post({path:'/api/customerprices', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_CREATE_CUSTOMERPRICES), bizCustomerPrice.addAllCustomerPrices);
    server.put({path:'/api/customerprices', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_CUSTOMERPRICES), bizCustomerPrice.updateAllCustomerPrices);
    server.del({path:'/api/customerprices', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_DELETE_CUSTOMERPRICES), bizCustomerPrice.deleteAllCustomerPrices);

    //for biz
    server.post({path:'/api/biz/:bizId/customerprices', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_CREATE_BIZCUSTOMERPRICES), bizCustomerPrice.addBizCustomerPrices);
    server.put({path:'/api/biz/:bizId/customerprices', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_BIZCUSTOMERPRICES), bizCustomerPrice.updateBizCustomerPrices);
    server.get('api/biz/:bizId/customerprices',authCheck.authCheck(listOfValue.PERMISSION_GET_BIZCUSTOMERPRICES), bizCustomerPrice.getBizCustomerPrices);
    server.del('api/biz/:bizId/customerprices', authCheck.authCheck(listOfValue.PERMISSION_DEL_BIZCUSTOMERPRICES), bizCustomerPrice.deleteBizCustomerPrices);

    //paymentSetting
    //for admin
    server.get('api/paysettings', authCheck.authCheck(listOfValue.PERMISSION_GET_PAYMENTSSETTING),bizPayment.getPayments);
   // server.put('api/paysettings', authCheck.authCheck(listOfValue.PERMISSION_GET_PAYMENTSSETTING),bizPayment.upDatePayments);
    server.post('api/paysettings', authCheck.authCheck(listOfValue.PERMISSION_POST_PAYMENTSSETTING),bizPayment.addPayments);//
    server.del('api/paysettings', authCheck.authCheck(listOfValue.PERMISSION_DEL_PAYMENTSSETTING), bizPayment.deletePayments);

    //for biz
    server.get('api/biz/:bizId/paysettings', authCheck.authCheck(listOfValue.PERMISSION_GET_BIZPAYMENTSSETTING),bizPayment.getBizPayments);
    server.post('api/biz/:bizId/paysettings', authCheck.authCheck(listOfValue.PERMISSION_POST_BIZPAYMENTSSETTING),bizPayment.addBizPayments);//
    server.put('api/biz/:bizId/paysettings', authCheck.authCheck(listOfValue.PERMISSION_PUT_BIZPAYMENTSSETTING),bizPayment.updateBizPayments);

    //for biz
    server.get('api/biz/:bizId/inventories', authCheck.authCheck(listOfValue.PERMISSION_GET_BIZINVENTORIES),bizCustomer.getBizCustomers);
    server.del('api/biz/:bizId/inventories', authCheck.authCheck(listOfValue.PERMISSION_DEL_BIZINVENTORIES), bizCustomer.deleteBizCustomers);
    server.post({path:'/api/biz/:bizId/inventories', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_CREATE_BIZINVENTORIES), bizCustomer.addBizCustomers);
    server.put({path:'/api/biz/:bizId/inventories', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_BIZINVENTORIES), bizCustomer.updateBizCustomers);


    //for channel biz
    server.get('api/biz/:bizId/pos', bizPO.getBizPOs);
    server.del('api/biz/:bizId/pos',  bizPO.deleteBizPOs);
    server.post({path:'/api/biz/:bizId/pos', contentType: 'application/json'},  bizPO.addBizPOs);
    server.put({path:'/api/biz/:bizId/pos', contentType: 'application/json'},  bizPO.updateBizPOs);
    server.post({path:'/api/biz/:bizId/postatus', contentType: 'application/json'},bizPO.updateBizPOStatus);

    server.get('api/biz/:bizId/poitems', bizPO.getBizPOItems);
    server.del('api/biz/:bizId/poitems', bizPO.deleteBizPOItems);
    server.post({path:'/api/biz/:bizId/poitems', contentType: 'application/json'},  bizPO.addBizPOItems);
 //   server.put({path:'/api/biz/:bizId/poitems', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_BIZPOS), bizPO.updateBizPOItems);
    server.post({path:'/api/biz/:bizId/poitemstatus', contentType: 'application/json'}, bizPO.updateBizPOItemStatus);
    server.post({path:'/api/biz/:bizId/poitempaystatus', contentType: 'application/json'},authCheck.authCheck(listOfValue.PERMISSION_UPDATE_BIZPOS), bizPO.updateBizPOItemPayStatus);
    server.get({path:'/api/biz/:bizId/exportpoitem'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_BIZPOS), bizPO.exportBizPOItem);

    //for supplier biz
    server.get('api/supplier/:supplierId/pos',bizPO.getSupplierPOs);
    server.get('api/supplier/:supplierId/poitems',bizPO.getSupplierPOItems);
    server.post({path:'/api/supplier/:supplierId/postatus', contentType: 'application/json'},authCheck.authCheck(listOfValue.PERMISSION_UPDATE_SUPPLIERPOS), bizPO.updateSupplierPOStatus);
    server.post({path:'/api/supplier/:supplierId/poitemstatus', contentType: 'application/json'},authCheck.authCheck(listOfValue.PERMISSION_UPDATE_SUPPLIERPOS), bizPO.updateSupplierPOItemStatus);
    server.post({path:'/api/supplier/:supplierId/poitemreceivestatus', contentType: 'application/json'},authCheck.authCheck(listOfValue.PERMISSION_UPDATE_SUPPLIERPOS), bizPO.updateSupplierPOItemReceiveStatus);
    server.get({path:'/api/supplier/:supplierId/exportpoitem'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_SUPPLIERPOS), bizPO.exportSupplierPOItem);


    //po status
    server.get('/api/postatus',bizPO.getPOStatus);
    server.get('/api/poitemstatus',bizPO.getPOItemStatus);

    //for admin
    server.get('api/pos', authCheck.authCheck(listOfValue.PERMISSION_GET_ALLPOS),bizPO.getPOs);
    server.get('api/poitems', bizPO.getPOItems);

    server.get('/api/getConnectState',bizPO.getConnectState);
    //server.put('api/biz/:bizId/paysettings', bizPayment.updateBizPayments);

    /* //bizComment
     server.get('/api/biz/:bizId/bizComments', bizComment.getBizComment); // TODO(rina2015): Put commentID in the query filter
     server.get('/api/biz/:bizId/ratings' ,bizComment.getBizRating);
     server.post({path:'/api/bizComments',contentType: 'application/json'}, authCheck.authCheck(), bizComment.addBizComment);
     server.del('/api/biz/:bizId/bizComments', authCheck.authCheck(listOfValue.PERMISSION_DEL_BIZCOMMENTS), bizComment.delBizComment);
     server.del('/api/biz/:bizId/users/:userId/bizComments', authCheck.authCheck(), bizComment.delBizCommentByUser);

     //bizImage
     server.get('api/biz/:bizId/bizImages', bizImage.getBizImage);
     server.post({path:'/api/bizImages', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_CREATE_BIZIMAGES), bizImage.addBizImage);
     server.del('api/biz/:bizId/bizImages', authCheck.authCheck(listOfValue.PERMISSION_DEL_BIZIMAGES), bizImage.delBizImage);
 */
    //server.on('after', apiUtil.save);
    return (server);
}

///--- Exports

module.exports = {
    createServer: createServer
};