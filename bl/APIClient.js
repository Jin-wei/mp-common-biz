/**
 * client to call remote api
 * @type {exports}
 */
var sysConfig = require('../config/SystemConfig.js');
var httpreq = require('httpreq');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('APIClient.js');
var loginUrl=sysConfig.loginModuleUrl.protocol+"://"+sysConfig.loginModuleUrl.host+":"+sysConfig.loginModuleUrl.port;
var authUrl=loginUrl+"/api/auth/tokens"
var inviteUserUrl=loginUrl+"/api/invitedusers";
var getUserByUserUrl=loginUrl+"/api/users/";
var getUsersUrl=loginUrl+"/api/users";


var authToken={
    accessToken:null,
    expireAt:null
};

//get auth token of this sevice module
function getAuthToken(callback) {
    if (authToken.accessToken && authToken.expireAt>(new Date()).getTime()) {
        callback(null,authToken.accessToken);
    }
    //validate the token against server and get user information
    var result,tokenInfo=null;
    httpreq.post(authUrl, {
        body: '{"method": "usernamepassword","userName":"'+sysConfig.auth.userName+ '","password":"'+sysConfig.auth.password+'"}',
        headers:{
            'tenant': sysConfig.auth.tenant,
            'Content-Type': 'application/json'
        }
    }, function (err, res){
        if (err){
            logger.error("get auth token failed",err);
            callback(err,null);
        }else{
            if (res.statusCode==200){
                result=JSON.parse(res.body);
                if (result.success==true){
                    tokenInfo = result.result;
                    if (tokenInfo && tokenInfo.accessToken) {
                        authToken.accessToken = tokenInfo.accessToken;
                        authToken.expireAt =tokenInfo.expireAt;
                        return callback(null,authToken.accessToken);
                    }
                }
            }
            return callback(new Error("fail to authenticate",500),null);
        }
    });
}

function getUsers(tenant,token,callback){
    httpreq.get(getUsersUrl+"?type=user&status=1", {
        headers:{
            'tenant': tenant,
            'auth-token':token,
            'Content-Type': 'application/json'
        }
    }, function (err, response) {
        if (err) {
            return callback(err);
        } else {
            var resObj = JSON.parse(response.body);
            if (response.statusCode == 200) {
                if (resObj.success == true) {
                    return callback(null,resObj.result);
                }else{
                    return callback(new Error("failed to get users"));
                }
            }else{
                return callback(new Error("get users failed"));
            }
        }
    });
}

function inviteCustomerToRegister(tenant, token,customer,callback){
    httpreq.post(inviteUserUrl, {
        body: JSON.stringify({
            "phone": customer.phoneNo,
            "email": customer.email,
            "name": customer.name,
            "address": customer.address,
            "state": customer.province,
            "city": customer.city,
            "zipcode": customer.zipcode,
            "att1String": customer.custType
        }),
        headers:{
            'tenant': tenant,
            'auth-token':token,
            'Content-Type': 'application/json'
        }
    }, function (err, response) {
        if (err) {
            return callback(err);
        } else {
            var resObj = JSON.parse(response.body);
            if (response.statusCode == 200) {
                if (resObj.success == true) {
                    return callback(null,resObj.id);
                }else{
                    return callback(new Error(resObj.msg));
                }
            }else{
                return callback(new Error("Invite customer to register failed"));
            }
        }
    });
}

function getUserByUser(tenant,token,userId,callback){
    httpreq.get(getUserByUserUrl+userId, {
        headers:{
            'tenant': tenant,
            'auth-token':token,
            'Content-Type': 'application/json'
        }
    }, function (err, response) {
        if (err) {
            return callback(err);
        } else {
            var resObj = JSON.parse(response.body);
            if (response.statusCode == 200) {
                if (resObj.success == true) {
                    return callback(null,resObj.result);
                }else{
                    return callback(new Error("failed to get user"));
                }
            }else{
                return callback(new Error("get user failed"));
            }
        }
    });
}

module.exports = {
    inviteCustomerToRegister: inviteCustomerToRegister,
    getUserByUser:getUserByUser,
    getAuthToken:getAuthToken,
    getUsers:getUsers
}