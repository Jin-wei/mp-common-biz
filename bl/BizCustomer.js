/**
 * Created by Rina on 10/6/16.
 */
var sysConfig = require('../config/SystemConfig.js');
var bizCustomerDao = require('../dao/BizCustomerDao.js');
var commonUtil=require('mp-common-util');
var ReturnType = commonUtil.ReturnType;
var sysMsg = commonUtil.systemMsg; //this follows common checkout's order.js
var responseUtil = commonUtil.responseUtil;
var sysError = commonUtil.systemError;
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizCustomer.js');
var Seq = require('seq');
var apiClient = require('./APIClient.js');

//bizCustomer
function getBizCustomers(req, res , next){
    var bizId=req.params.bizId,authBiz=req.params.authUser.bizId;
    if (bizId ==null){
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    if(authBiz !=bizId){
        return responseUtil.resNoAuthorizedError(null,res,next);
    }
    return _getCustomers(req,res,next);
}

function getCustomers(req, res , next){
    return _getCustomers(req,res,next);
}

function _getCustomers(req, res , next){
    var bizId=req.params.bizId;
    var custId=req.params.custId;
    var tenant=req.params.tenant;
    var start=req.params.start;
    var size=req.params.size;
    var name=req.params.name;
    var relationId= req.params.relationId;
    var city=req.params.city;
    var province=req.params.province;
    var bizName=req.params.bizName;
    var phoneNo=req.params.phoneNo;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }

    var params={bizId:bizId,custId:custId,tenant:tenant,
        relationId:relationId,name:name,city:city,province:province,bizName:bizName,phoneNo:phoneNo};
    var result = {};
    var total=0;
    bizCustomerDao.getBizCustomerCount(params,function(error,rows){
        if(error){
            logger.error(' getBizCustomer ' + error.message);
            responseUtil.resInternalError(error,res,next);
        } else{
            if(rows != null && rows.length>0) {
                total = rows[0].count;
                if (total > 0) {
                    params.size = size;
                    params.start = start;
                    bizCustomerDao.getBizCustomer(params, function (error, rows) {
                        if (error) {
                            logger.error(' getBizCustomer ' + error.message);
                            responseUtil.resInternalError(error, res, next);
                        } else {
                            if (rows != null && rows.length > 0) {
                                result = rows;
                            }
                            responseUtil.resetQueryResWithTotal(res, result, total, null);
                            return next();
                        }
                    });
                } else {
                    responseUtil.resetQueryResWithTotal(res, [], 0, next);
                }
            }
        }
    })

}

function _addABizCustomer(tenant,params,callback){
    var custId=params.custId;
    var name=params.name;
    var bizId=params.bizId;
    var phoneNo=params.phoneNo;
    var active = params.active;
    var address=params.address;
    var city=params.city;
    var province=params.province;
    var zipcode= params.zipcode;
    var latitude=params.latitude;
    var longitude= params.longitude;
    var custType=params.custType;
    var note=params.note;
    var ownerName=params.ownerName;
    var description=params.description;
    var custSince=params.custSince;
    var chainName=params.chainName;
    var supportPayLater=params.supportPayLater;
    var contactName=params.contactName;

    if (custId==0){
        custId=null;
    }

    if (bizId==null){
        return callback(new ReturnType(false,"biz id is missing"));
    }
    if (phoneNo==null){
        return callback(new ReturnType(false,"phoneNo is missing"));
    }

    var bizCustomer = {
        custId: custId,
        name: name,
        bizId: bizId,
        tenant: tenant,
        phoneNo: phoneNo,
        active: active,
        address: address,
        city: city,
        province: province,
        zipcode: zipcode,
        latitude: latitude,
        longitude: longitude,
        custType: custType,
        note: note,
        ownerName: ownerName,
        description: description,
        custSince:custSince,
        chainName:chainName,
        supportPayLater:supportPayLater,
        contactName: contactName

    };
    bizCustomerDao.addBizCustomer(bizCustomer, function (error, result) {
        if (error) {
            logger.error(' addABizCustomer ' + error.message);
            if (error.message !=null && error.message.indexOf("ER_DUP_ENTRY")>-1){
                return callback(new ReturnType(false,"Customer exists already"));
            }else{
                return callback(new ReturnType(false,error.message));
            }
        } else {
            if (result && result.insertId) {
                relationId = result.insertId;
                return callback(new ReturnType(true,null,relationId));
            } else {
                logger.error(' addBizCustomer ' + error.message);
                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });
}

function addBizCustomers(req, res, next) {
    var bizId = req.params.bizId,authBiz=req.params.authUser.bizId;
    if (bizId == null) {
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    if (authBiz != bizId) {
        return responseUtil.resNoAuthorizedError(null, res, next);
    }

    return _addCustomers(bizId,req, res, next);
}

function _addCustomers(bizId,req,res,next){
    var params = req.params;
    var tenant = params.tenant;
    var result=[];
    var bizCustomers = params.bizCustomers;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (bizCustomers == null) {
        return next(sysError.MissingParameterError("bizCustomers are missing", "bizCustomers are missing"));
    }
    Seq(bizCustomers).seqEach(function(bizCustomer,i){
        var that=this;
        if (bizId !=null && bizCustomer.bizId !=bizId){
            result[i]=new ReturnType(false,"not authorized",null);
            that(null,i);
        }else {
            _addABizCustomer(tenant, bizCustomer, function (returnResult) {
                result[i] = returnResult;
                that(null, i);
            });
        }
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function addCustomers(req, res, next) {
    return  _addCustomers(null,req,res,next);
}


function deleteCustomers(req, res, next) {
    return  _deleteCustomers(null,req,res,next);
}

function deleteBizCustomers(req, res, next) {
    var bizId = req.params.bizId,authBiz=req.params.authUser.bizId;
    if (bizId == null) {
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    if (authBiz != bizId) {
        return responseUtil.resNoAuthorizedError(null, res, next);
    }
    return  _deleteCustomers(bizId,req,res,next);
}

function _deleteCustomers(bizId,req, res, next) {
    var bizCustomers=req.params.bizCustomers,tenant=req.params.tenant,result=[];
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (bizCustomers == null) {
        return next(sysError.MissingParameterError("bizCustomers are missing", "bizCustomers are missing"));
    }
    Seq(bizCustomers).seqEach(function(bizCustomer,i){
        var that=this;
        if (bizId !=null && bizCustomer.bizId !=bizId){
            result[i]=new ReturnType(false,"not authorized",bizCustomer.relationId);
            that(null,i);
        }
        if (bizCustomer.relationId ==null){
            result[i]=new ReturnType(false,"relationId is missing",null);
            that(null,i);
        }
        else {
            _deleteABizCustomer(tenant, bizCustomer, function (returnResult) {
                result[i] = returnResult;
                that(null, i);
            });
        }
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function _deleteABizCustomer(tenant,bizCustomer , callback){
    bizCustomerDao.delBizCustomer(tenant,bizCustomer, function(error , result){
        if(error){
            logger.error(' delBizCustomer ' + error.message);
            return callback(new ReturnType(false,error.message,bizCustomer.relationId));
        }
        if(result.affectedRows<=0){
            logger.error(' delBizCustomer ' + 'failure');
            return callback(new ReturnType(false,"customer is not found",bizCustomer.relationId));
        }else{
            return callback(new ReturnType(true,null,bizCustomer.relationId));
        }
    });

}

function _getBizInfoByCustId(tenant,custId,callback){
    bizCustomerDao.getCustomerBiz({cust_id:custId,tenant:tenant},function(error,rows){
        if (error) {
            logger.error(' getCustomerBiz ' + error.message);
            callback(error);
        } else {
            if (rows != null && rows.length > 0) {
                callback(null, rows[0]);
            } else {
                callback(null, null);
            }
        }
    })
}

function addUserAsCustomer(tenant,user,callback){
    var phone=user.phone;
    var email=user.email;
    if (phone==null && email==null){
        return callback(new Error("user phone number or email is missing"));
    }
    //find customer by phone
    bizCustomerDao.getBizCustomer({tenant:tenant,phoneNo:phone,email:email},function(error,customer){
        if (error){
            return callback(error);
        }else{
            if (customer !=null && customer.length>0){
                if (customer[0].custId !=null){
                    return callback(new Error("customer exists for another biz"));
                }else{
                    bizCustomerDao.updateCustomerUser(tenant,{relationId:customer[0].relationId, custId:user.userId},function(error){
                        if (error){
                            return callback(error);
                        }else{
                            return callback(null,customer[0].relationId);
                        }
                    })
                }
            }else{
                //add this customer
                bizCustomerDao.addBizCustomer({
                    custId: user.userId,
                    name: user.name,
                    bizId:  sysConfig.bizCustomer.defaultBizId,
                    tenant: tenant,
                    phoneNo:user.phone,
                    email:user.email,
                    address: user.address,
                    city: user.city,
                    province: user.state,
                    zipcode: user.zipcode,
                    custType : user.att1String,
                    supportPaylater:0
                },function(error, result) {
                    if (error){
                        return callback(error);
                    }else{
                        return callback(null,result.insertId);
                    }
                });
            }
        }
    })
}

function getBizByCustId(req, res , next){
    var params=req.params;
    var tenant=params.tenant;
    var authUserId=params.authUser.userId;
    var cust_id=req.params.custId;
    var token = req.headers["auth-token"];
    if (tenant == null) {
        return responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (cust_id == null) {
        return next(sysError.MissingParameterError("custId is missing", "custId is missing"));
    }
    if (cust_id != authUserId){
        return responseUtil.resNoAuthorizedError(null,res,next);
    }
    Seq().seq(function(){
        var that=this;
        _getBizInfoByCustId(tenant,cust_id,function(error, biz){
            if (error){
                return responseUtil.resetFailedRes(res,error.message,next);
            }else{
                if(biz !=null){
                    return responseUtil.resetQueryRes(res,biz,null,next);
                }else{
                    that();
                }
            }
        })
    }).seq(function(){
        var that=this;
        //not a customer yet, add this customer to default biz!!! how high is the chance
        apiClient.getUserByUser(tenant,token,cust_id, function(error,user){
            if (error){
                return responseUtil.resetFailedRes(res,error.message,next);
            }else{
                if(user !=null){
                    addUserAsCustomer(tenant,user,function(error){
                        if (error){
                            return responseUtil.resetFailedRes(res,error.message,next);
                        }else{
                            that();
                        }
                    });
                }else{
                    return responseUtil.resetFailedRes(res,"invalid user",next);
                }
            }
        });
    }).seq(function(){
        //get once again
        _getBizInfoByCustId(tenant,cust_id,function(error, biz){
            if (error){
                return responseUtil.resetFailedRes(res,error.message,next);
            }else{
                if (biz !=null){
                    return responseUtil.resetQueryRes(res,biz,null,next);
                }else{
                    return responseUtil.resetFailedRes(res,"biz is not found",next);
                }
            }
        })
    })
}

function updateBizCustomers(req, res, next) {
    var bizId = req.params.bizId,authBiz=req.params.authUser.bizId;
    if (bizId == null) {
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    if (authBiz != bizId) {
        return responseUtil.resNoAuthorizedError(null, res, next);
    }
    return _updateCustomers(bizId,req,res,next);

}

function updateBizCustomersUser(req, res, next) {
    var bizId = req.params.bizId,authBiz=req.params.authUser.bizId;
    if (bizId == null) {
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    if (authBiz != bizId) {
        return responseUtil.resNoAuthorizedError(null, res, next);
    }
    return updateCustomersUser(req,res,next);

}

function updateCustomers(req, res, next) {
    return _updateCustomers(null,req,res,next);

}

function _updateCustomers(bizId,req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var result=[];
    var bizCustomers = params.bizCustomers;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (bizCustomers == null) {
        return next(sysError.MissingParameterError("bizCustomers are missing", "bizCustomers are missing"));
    }
    Seq(bizCustomers).seqEach(function(bizCustomer,i){
        var that=this;
        if (bizId !=null && bizCustomer.bizId !=bizId){
            result[i]=new ReturnType(false,"not authorized",bizId);
            that(null,i);
        }else {
            _updateABizCustomer(tenant, bizCustomer, function (returnResult) {
                result[i] = returnResult;
                that(null, i);
            });
        }
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

//update customer's biz
function updateCustomersBiz(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var result=[];
    var bizCustomers = params.bizCustomers;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (bizCustomers == null) {
        return next(sysError.MissingParameterError("bizCustomers are missing", "bizCustomers are missing"));
    }
    Seq(bizCustomers).seqEach(function(bizCustomer,i){
        var that=this;
        _updateACustomerBiz(tenant, bizCustomer, function (returnResult) {
            result[i] = returnResult;
            that(null, i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function updateCustomersUser(req, res, next) {
    var token = req.headers["auth-token"];
    var params = req.params;
    var tenant = params.tenant;
    var bizId = params.bizId;
    var result=[];
    var bizCustomers = params.bizCustomers;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (bizCustomers == null) {
        return next(sysError.MissingParameterError("bizCustomers are missing", "bizCustomers are missing"));
    }
    Seq(bizCustomers).seqEach(function(bizCustomer,i){
        var that=this;
        bizCustomer.bizId=bizId;
        _updateACustomerUser(token,tenant, bizCustomer, function (returnResult) {
            result[i] = returnResult;
            that(null, i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}
function _updateACustomerBiz(tenant,bizCustomer,callback){
    if (! bizCustomer.bizId){
        return callback(new ReturnType(false,"bizId is missing"));
    }
    if (! bizCustomer.relationId){
        return callback(new ReturnType(false,"relationId is missing"));
    }
    bizCustomerDao.updateCustomerBiz(tenant,bizCustomer, function (error, rows) {
        if (error) {
            logger.error(' updateCustomerBiz ' + error.message);
            return callback(new ReturnType(false,error.message,bizCustomer.relationId));
        }
        else if (rows.affectedRows<=0) {
            logger.error(' updateCustomerBiz: customer is not found');
            return callback(new ReturnType(false,"customer is not found",bizCustomer.relationId));
        }
        else {
            logger.info(' updateCustomerBiz ' + ' success ');
            return callback(new ReturnType(true,null,bizCustomer.relationId));
        }
    });
}
function _updateACustomerUser(token,tenant,bizCustomer,callback){
    var relationId=bizCustomer.relationId;
    var customer;
    if (! relationId){
        return callback(new ReturnType(false,"relationId is missing",relationId));
    }
    Seq().seq(function(){
        var that=this;
        bizCustomerDao.getBizCustomer({tenant:tenant,relationId:relationId},function(error,result){
            if (error){
                return callback(new ReturnType(false,error.message,relationId));
            }
            if (result==null || result.length<=0){
                return callback(new ReturnType(false,"customer is not found",relationId));
            }
            customer=result[0];
            if (customer.custId !=null){
                return callback(new ReturnType(false,"customer already has custId",relationId));
            }
            that();
        })
    }).seq(function(){
        var that=this;
        apiClient.inviteCustomerToRegister(tenant,token,customer,function(error,userId) {
            if (error){
                return callback(new ReturnType(false,error.message,relationId));
            }
            if (!userId){
                return callback(new ReturnType(false,"user is not found",relationId));
            }
            customer.custId=userId;
            that();
        })
    }).seq(function() {
        bizCustomerDao.updateCustomerUser(tenant, {custId: customer.custId, relationId: relationId}, function (error, rows) {
            if (error) {
                logger.error(' updateCustomerUser ' + error.message);
                return callback(new ReturnType(false, error.message, relationId));
            }
            else if (rows.affectedRows <= 0) {
                logger.error(' updateCustomerUser: customer is not found');
                return callback(new ReturnType(false, "customer is not found", relationId));
            }
            else {
                logger.info(' updateCustomerUser ' + ' success ');
                return callback(new ReturnType(true, null, relationId));
            }
        });
    })
}

function _updateABizCustomer(tenant,bizCustomer,callback){
    if (! bizCustomer.bizId){
        return callback(new ReturnType(false,"bizId is missing"));
    }
    if (! bizCustomer.relationId){
        return callback(new ReturnType(false,"relationId is missing"));
    }
    bizCustomerDao.updateBizCustomer(tenant,bizCustomer, function (error, rows) {
        if (error) {
            logger.error(' updateBizCustomer ' + error.message);
            return callback(new ReturnType(false,error.message,bizCustomer.custId));
        }
        else if (rows.affectedRows<=0) {
            logger.error(' updateBizCustomer: biz customer is not found');
            return callback(new ReturnType(false,"biz customer is not found",bizCustomer.custId));
        }
        else {
            logger.info(' updateBizCustomer ' + ' success ');
            return callback(new ReturnType(true,null,bizCustomer.custId));
        }
    });
}

module.exports = {
    getBizCustomers: getBizCustomers,
    getCustomers: getCustomers,
    deleteBizCustomers: deleteBizCustomers,
    deleteCustomers: deleteCustomers,
    addCustomers: addCustomers,
    addBizCustomers: addBizCustomers,
    updateBizCustomers: updateBizCustomers,
    updateBizCustomersUser:updateBizCustomersUser,
    updateCustomers: updateCustomers,
    getBizByCustId: getBizByCustId,
    updateCustomersBiz:updateCustomersBiz,
    updateCustomersUser:updateCustomersUser,
    addUserAsCustomer:addUserAsCustomer

};
