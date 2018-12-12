/**
 * Created by Rina on 10/6/16.
 */

var bizDao = require('../dao/BizDao.js');
var bizCommentDao = require('../dao/BizCommentDao.js');
var bizImageDao = require('../dao/BizImageDao.js');
var commonUtil=require('mp-common-util');
var ReturnType=commonUtil.ReturnType;
var sysMsg = commonUtil.systemMsg; //this follows common checkout's order.js
var responseUtil = commonUtil.responseUtil;
var sysError = commonUtil.systemError;
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('Biz.js');
var Seq = require('seq');

//biz
function listBiz(req, res, next) {
    var params=req.params;
    var biz_type=params.bizType;
    var name=params.bizName;
    var tenant=params.tenant;
    var active=params.active;
    var biz_id=params.bizId;
    var start=params.start;
    var size=params.size;

    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }

    bizDao.searchBiz({biz_type:biz_type,name:name,tenant:tenant,active:active,biz_id:biz_id,start:start,size:size}, function (error, rows) {
        if (error) {
            logger.error(' listBiz ' + error.message);
            return responseUtil.resetFailedRes(res,error.message);
        } else {
            logger.info(' listBiz ' + ' success ');
            responseUtil.resetQueryRes(res,rows,null);
        }
    });

}

function _addABiz(tenant,params,callback){
    var bizType=params.bizType;
    var name=params.bizName;
    var nameLang=params.nameLang;
    var description=params.description;
    var imgUrl=params.imgUrl;
    var note=params.note;
    var options=params.options;
    var active=params.active;
    var ownerName=params.ownerName;
    var phoneNo=params.phoneNo;
    var province=params.province;
    var city=params.city;
    var address=params.address;
    var latitude=params.latitude;
    var longitude= params.longitude;
    var email=params.email;
    var zipcode= params.zipcode;
    var bizCode= params.bizCode;

    if (name==null){
        return callback(new ReturnType(false,"bizName is missing"));
    }
    if (bizType==null){
        return callback(new ReturnType(false,"biz type is missing"));
    }

    var business = {
        tenant: tenant,
        bizType: bizType,
        name: name,
        nameLang: nameLang,
        description: description,
        imgUrl: imgUrl,
        note: note,
        options: options,
        active: active,
        ownerName: ownerName,
        phoneNo: phoneNo,
        province: province,
        city: city,
        address: address,
        latitude: latitude,
        longitude: longitude,
        email: email,
        zipcode: zipcode,
        bizCode: bizCode
    };
    bizDao.addBiz(business, function (error, result) {
        if (error) {
            logger.error(' addABiz ' + error.message);
            if (error.message !=null && error.message.indexOf("ER_DUP_ENTRY")>-1){
                return callback(new ReturnType(false,"Business exists already"));
            }else{
                return callback(new ReturnType(false,error.message));
            }
        } else {
            if (result && result.insertId) {
                bizId = result.insertId;
                return callback(new ReturnType(true,null,bizId));
            } else {
                logger.error(' addBiz ' + error.message);
                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });
}

function addBiz(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;

    var result=[];
    var biz = params.biz;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (biz == null) {
        return next(sysError.MissingParameterError("biz are missing", "biz are missing"));
    }
    Seq(biz).seqEach(function(business,i){
        var that=this;
        _addABiz(tenant,business,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function updateAllBiz(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var result=[];
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    Seq(biz).seqEach(function(business,i){
        var that=this;
        _updateABiz(tenant,business,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function updateBiz(req, res, next) {
    var params=req.params;
    var bizId=params.bizId;
    var authUser=params.authUser;
    var tenant=params.tenant;
    var bizName=params.bizName;
    if (tenant == null) {
        resUtil.resTenantNotFoundError(null, res, next);
    }
    if (bizId == null) {
        return callback(new ReturnType(false,"bizId is missing",null));
    }

    if(bizId != authUser.bizId){
        return responseUtil.resNoAuthorizedError(null,res,next);
    }

    if (bizName == null) {
        return callback(new ReturnType(false,"bizName is missing",bizId));
    }

    bizDao.updateBiz(tenant,bizId,req.params, function (error, rows) {
        if (error) {
            logger.error(' updateBiz ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        } else {
            logger.info(' updateBiz ' + ' success ');
            responseUtil.resetSuccessRes(res)
            return next();
        }
    });
}

function _updateABiz(tenant, business, callback) {
    var bizId=business.bizId;
    var bizName=business.bizName;
    if (bizId == null) {
        return callback(new ReturnType(false,"bizId is missing",null));
    }
    if (bizName == null) {
        return callback(new ReturnType(false,"bizName is missing",bizId));
    }
    bizDao.updateBiz(tenant,bizId,business, function (error, rows) {
        if (error) {
            logger.error(' updateBiz ' + error.message);
            return callback(new ReturnType(false,error.message,bizId));
        } else if (rows.affectedRows<=0) {
            return callback(new ReturnType(false,"biz is not found",bizId));
        }
        else{
                logger.info(' updateBiz ' + ' success ');
                return callback(new ReturnType(true,null,bizId));
            }

    });
}

function delBiz(req, res , next){
    var params=req.params;
    var tenant=params.tenant;
    if (tenant == null) {
        resUtil.resTenantNotFoundError(null, res, next);
    }

    bizDao.delBiz(req.params, function(error , result){
        if(error){
            logger.error(' delBiz ' + error.message);
            return responseUtil.resetFailedRes(res,error.message);
        }
        if(result.affectedRows<=0){
            logger.error(' delBiz ' + 'failure');
            return responseUtil.resetFailedRes(res,"no biz is deleted");
        }
        if(params.bizId){
            bizImageDao.delBizImage(params.bizId,function (err,value){
                if (err) {
                    return responseUtil.resetFailedRes(res,err.message);
                }else {
                    logger.info(' delBizImage ' + ' success ');
                    responseUtil.resetSuccessRes(res)
                    return next();
                }
            });

        } else{
            logger.error(' delBizProd ' + ' success');
            responseUtil.resetSuccessRes(res)
            return next();
        }
    });

}

function updateAllBiz(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var result = [];
    var biz = params.biz;
    if (tenant == null) {
        resUtil.resTenantNotFoundError(null, res, next);
    }
    if (biz == null) {
        return next(sysError.MissingParameterError("biz is missing", "biz is missing"));
    }
    Seq(biz).seqEach(function (business, i) {
        var that = this;
        _updateABiz(tenant, business, function (returnResult) {
            result[i] = returnResult;
            that(null, i);
        });
    }).seq(function () {
        responseUtil.resetQueryRes(res, result, null);
        return next();
    })
}

function updateBizStatus(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var result = [];
    var biz = params.biz;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (biz == null) {
        return next(sysError.MissingParameterError("biz are missing", "biz are missing"));
    }
    Seq(biz).seqEach(function (aBiz, i) {
        var that = this;
        _updateABizStatus(tenant, aBiz, function (returnResult) {
            result[i] = returnResult;
            that(null, i);
        });
    }).seq(function () {
        responseUtil.resetQueryRes(res, result, null);
        return next();
    })
}

function _updateABizStatus(tenant, aBiz, callback) {
    var bizId=aBiz.bizId,status=aBiz.status;
    if (bizId == null) {
        return callback(new ReturnType(false, "bizId is missing"));
    }
    if (status == null) {
        return callback(new ReturnType(false, "status is missing"));
    }

        bizDao.updateBizStatus({tenant:tenant,bizId:bizId,status:status}, function(error, result) {
            if (error) {
                logger.error(' updateBizStatus ' + error.message);
                return callback(new ReturnType(false, error.message,bizId));
            } else {
                if (result && result.affectedRows>0) {
                    return callback(new ReturnType(true, null,bizId));
                } else {
                    //logger.error(' addUser ' + error.message);
                    return callback(new ReturnType(false, "biz is not found",bizId));
                }
            }
        })

}

module.exports = {
    listBiz: listBiz,
    addBiz: addBiz,
    updateBiz: updateBiz,
    delBiz: delBiz,
    updateAllBiz: updateAllBiz,
    updateBizStatus:updateBizStatus
};

