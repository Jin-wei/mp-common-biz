/**
 * Created by Rina on 10/13/16.
 */
var bizCustomerPriceDao = require('../dao/BizCustomerPriceDao.js');
var commonUtil=require('mp-common-util');
var ReturnType = commonUtil.ReturnType;
var sysMsg = commonUtil.systemMsg; //this follows common checkout's order.js
var responseUtil = commonUtil.responseUtil;
var sysError = commonUtil.systemError;
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizCustomerPrice.js');
var Seq = require('seq');

//for user
function getCustomerPrices(req,res,next){
    var params=req.params;
    var custId=params.custId,authUserId=params.authUser.userId;
    if (custId !=authUserId){
        return responseUtil.resNoAuthorizedError(null,res,next);
    }
    return _getCustomerPrices(params,res,next)
}

function _getCustomerPrices(params,res,next){
    var tenant = params.tenant;
    if (tenant==null){
        return responseUtil.resTenantNotFoundError(null, res, next);
    }

    var result = {};
    bizCustomerPriceDao.getBizCustomerPrice(params,function(error,rows){
        if(error){
            logger.error(' getBizCustomerPrice ' + error.message);
            responseUtil.resInternalError(error,res,next);
        } else{
            if(rows != null && rows.length>0){
                result = rows;
            }
            responseUtil.resetQueryRes(res,result,null);
            return next();
        }
    })
}

//only biz prices
function getBizCustomerPrices(req, res , next){
    var params=req.params;
    var biz_id=params.bizId;
    var authBizId=params.authUser.bizId;
    if (biz_id!=authBizId){
        return responseUtil.resNoAuthorizedError(null,res,next);
    }
    return _getCustomerPrices(params,res,next);
}

//all prices
function getAllCustomerPrices(req, res , next){
    var params=req.params;
    return _getCustomerPrices(params,res,next);
}

function _addABizCustomerPrice(tenant,params,callback){
    var bizId=params.bizId;
    var relationId=params.relationId;
    var prodId=params.prodId;

    if (bizId==null){
        return callback(new ReturnType(false,"biz id is missing"));
    }
    if (relationId==null){
        return callback(new ReturnType(false,"relation id is missing"));
    }
    if (prodId==null){
        return callback(new ReturnType(false,"prod id is missing"));
    }

    bizCustomerPriceDao.addBizCustomerPrice(tenant,params, function(error, result) {
        if (error) {
            logger.error(' addABizCustomerPrice ' + error.message);
            if (error.message !=null && error.message.indexOf("ER_DUP_ENTRY")>-1){
                return callback(new ReturnType(false,"Price exists already"));
            }else{
                return callback(new ReturnType(false,error.message));
            }
        } else {
            if (result && result.insertId) {
                priceId = result.insertId;
                return callback(new ReturnType(true,null,priceId));
            } else {
                logger.error(' addBizCustomerPrice: no price is added ' );
                return callback(new ReturnType(false,"no price is added",null));
            }
        }
    });
}

function addAllCustomerPrices(req, res, next) {
    var params = req.params;
    return _addCustomerPrices(null,params,res,next);
}

function addBizCustomerPrices(req, res, next) {
    var params = req.params;
    var bizId=params.bizId;
    var authBizId=params.authUser.bizId;

    if (bizId != authBizId){
        return responseUtil.resNoAuthorizedError(null,res,next);
    }
    if (bizId == null){
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    return _addCustomerPrices(bizId,params, res,next);
}

function _addCustomerPrices(bizId,params, res,next){
    var tenant = params.tenant;
    var result=[];
    var bizCustomerPrices = params.bizCustomerPrices;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (bizCustomerPrices == null) {
        return next(sysError.MissingParameterError("bizCustomerPrices are missing", "bizCustomerPrices are missing"));
    }
    Seq(bizCustomerPrices).seqEach(function(bizCustomerPrice,i){
        var that=this;
        if (bizId !=null && bizCustomerPrice.bizId !=bizId){
            result[i]=new ReturnType(false,"not authorized",bizId);
            that(null,i);
        }else {
            _addABizCustomerPrice(tenant, bizCustomerPrice, function(returnResult) {
                result[i] = returnResult;
                that(null, i);
            });
        }
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function updateAllCustomerPrices(req, res, next) {
    var params = req.params;
    return _updateCustomerPrices(null,params,res,next);
}

function updateBizCustomerPrices(req, res, next) {
    var params = req.params;
    var bizId=params.bizId;
    var authBizId=params.authUser.bizId;

    if (bizId != authBizId){
        return responseUtil.resNoAuthorizedError(null,res,next);
    }
    if (bizId == null){
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    return _updateCustomerPrices(bizId,params, res,next);
}

function _updateCustomerPrices(bizId,params, res,next){
    var tenant = params.tenant;
    var result=[];
    var bizCustomerPrices = params.bizCustomerPrices;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (bizCustomerPrices == null) {
        return next(sysError.MissingParameterError("bizCustomerPrices are missing", "bizCustomerPrices are missing"));
    }
    Seq(bizCustomerPrices).seqEach(function(bizCustomerPrice,i){
        var that=this;
        if (bizId !=null && bizCustomerPrice.bizId !=bizId){
            result[i]=new ReturnType(false,"not authorized",bizId);
            that(null,i);
        }else {
            _updateACustomerPrice(tenant, bizCustomerPrice, function(returnResult) {
                result[i] = returnResult;
                that(null, i);
            });
        }
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function _updateACustomerPrice(tenant,params, callback) {
    var bizId=params.bizId, priceId=params.priceId;
    if (bizId==null){
        return callback(new ReturnType(false,"bizId is missing",null));
    }
    if (priceId==null){
        return callback(new ReturnType(false,"priceId is missing",null));
    }
    bizCustomerPriceDao.updateBizCustomerPrice(tenant,params, function(error, rows) {
        if (error) {
            logger.error(' updateBizCustomerPrice ' + error.message);
            return callback(new ReturnType(false,error.message,priceId));
        }else if (rows.affectedRows<=0){
            return callback(new ReturnType(false,"no price found",priceId));
        }
        else {
            logger.info(' updateBizCustomerPrice ' + ' success ');
            return callback(new ReturnType(true,null,priceId));
        }
    });
}

function deleteAllCustomerPrices(req, res, next) {
    var params = req.params;
    return _deleteCustomerPrices(null,params,res,next);
}

function deleteBizCustomerPrices(req, res, next) {
    var params = req.params;
    var bizId=params.bizId;
    var authBizId=params.authUser.bizId;

    if (bizId != authBizId){
        return responseUtil.resNoAuthorizedError(null,res,next);
    }
    if (bizId == null){
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    return _deleteCustomerPrices(bizId,params, res,next);
}

function _deleteCustomerPrices(bizId,params, res,next){
    var tenant = params.tenant;
    var result=[];
    var bizCustomerPrices = params.bizCustomerPrices;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (bizCustomerPrices == null) {
        return next(sysError.MissingParameterError("bizCustomerPrices are missing", "bizCustomerPrices are missing"));
    }
    Seq(bizCustomerPrices).seqEach(function(bizCustomerPrice,i){
        var that=this;
        if (bizId !=null && bizCustomerPrice.bizId !=bizId){
            result[i]=new ReturnType(false,"not authorized",bizId);
            that(null,i);
        }else {
            _deleteABizCustomerPrice(tenant, bizCustomerPrice, function(returnResult) {
                result[i] = returnResult;
                that(null, i);
            });
        }
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}



function _deleteABizCustomerPrice(tenant,params, callback) {
    var bizId=params.bizId, priceId=params.priceId;
    if (bizId==null){
        return callback(new ReturnType(false,"bizId is missing",priceId));
    }
    if (priceId==null){
        return callback(new ReturnType(false,"priceId is missing",priceId));
    }
    bizCustomerPriceDao.delBizCustomerPrice(tenant,params, function(error, rows) {
        if (error) {
            logger.error(' deleteBizCustomerPrice ' + error.message);
            return callback(new ReturnType(false,error.message,priceId));
        }else if (rows.affectedRows<=0){
            return callback(new ReturnType(false,"no price found",priceId));
        }
        else {
            logger.info(' deleteBizCustomerPrice ' + ' success ');
            return callback(new ReturnType(true,null,priceId));
        }
    });
}

module.exports = {
    getCustomerPrices:getCustomerPrices,
    getAllCustomerPrices:getAllCustomerPrices,
    addAllCustomerPrices:addAllCustomerPrices,
    updateAllCustomerPrices:updateAllCustomerPrices,
    deleteAllCustomerPrices:deleteAllCustomerPrices,
    addBizCustomerPrices: addBizCustomerPrices,
    updateBizCustomerPrices: updateBizCustomerPrices,
    deleteBizCustomerPrices: deleteBizCustomerPrices,
    getBizCustomerPrices: getBizCustomerPrices

};
