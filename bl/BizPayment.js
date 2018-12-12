/**
 * Created by Rina on 10/6/16.
 */

var bizPaymentDao = require('../dao/BizPaymentDao.js');
var commonUtil=require('mp-common-util');
var ReturnType = commonUtil.ReturnType;
var responseUtil = commonUtil.responseUtil;
var sysError = commonUtil.systemError;
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizPayment.js');
var Seq = require('seq');

//admin user
function _updateAPayment(tenant,bizId,params,callback){

    var type= params.type;
    var partner = params.partner;
    var key = params.key;
    var sellerEmail = params.sellerEmail;
    var id=params.id;


    if (bizId==null){
        return callback(new ReturnType(false,"biz id is missing"));
    }
    if (type==null){
        return callback(new ReturnType(false,"type is missing"));
    }

    var payment = {
        tenant: tenant,
        bizId: bizId,
        type: type,
        partner: partner,
        key: key,
        sellerEmail: sellerEmail,
        id:id

    };
    bizPaymentDao.updateBizPayment(payment, function (error, result) {
        if (error) {
            logger.error(' updateAPayment ' + error.message);

                return callback(new ReturnType(false,error.message));

        } else {
            if (result && result.affectedRows) {

                return callback(new ReturnType(true,null,bizId));
            } else {

                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });

}


function _addAPayment(tenant,params,callback){//
    var bizId=params.bizId;
    var type= params.type;
    var partner = params.partner;
    var key = params.key;
    var sellerEmail = params.sellerEmail;
    var createdBy = params.createdBy;
    var updatedBy=params.updatedBy;

    if (bizId==null){
        return callback(new ReturnType(false,"biz id is missing"));
    }
    if (type==null){
        return callback(new ReturnType(false,"type is missing"));
    }
    var payment = {
        tenant: tenant,
        bizId: bizId,
        type: type,
        partner: partner,
        key: key,
        sellerEmail: sellerEmail,
        createdBy: createdBy,
        updatedBy: updatedBy
    };
    bizPaymentDao.addBizPayment(payment, function (error, result) {
        if (error) {
            logger.error(' addAPayment ' + error.message);
            if (error.message !=null && error.message.indexOf("ER_DUP_ENTRY")>-1){
                return callback(new ReturnType(false,"Payments exists already"));
            }else{
                return callback(new ReturnType(false,error.message));
            }
        } else {
            if (result && result.insertId) {
                bizId = result.insertId;
                return callback(new ReturnType(true,null,bizId));
            } else {
                logger.error(' addPayment ' + error.message);//
                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });
}

function getPayments(req, res , next){
    return _getPayments(req.params,res,next);
}

function  addPayments(req, res , next) {
    var params = req.params;
    var tenant = params.tenant;
   // var authUser=params.authUser;

    var result=[];
    var payments = params.payments;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (payments == null) {
        return next(sysError.MissingParameterError("payments are missing", "payments are missing"));
    }

    Seq(payments).seqEach(function(payments,i){
        var that=this;
        _addAPayment(tenant,payments,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}
//biz user
function getBizPayments(req, res , next){
    var params = req.params;
    var authUser = params.authUser;
    var bizId=params.bizId;
    if (bizId != authUser.bizId) {
        return responseUtil.resNoAuthorizedError(null,res,next);
    }
   return _getPayments(params,res,next);
}

function _getPayments(params,res,next){
    var tenant = params.tenant;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    bizPaymentDao.getBizPayment(params,function(error,rows) {
        if (error) {
            logger.error(' getPayment ' + error.message);
            return responseUtil.resInternalError(error, res, next);
        } else {
            responseUtil.resetQueryRes(res, rows, null);
        }
    });
}

function addBizPayments(req, res , next){
    var params = req.params;
    var tenant = params.tenant;

    var authUser = params.authUser;
    var bizId=params.bizId;
    if (bizId != authUser.bizId) {
        return responseUtil.resNoAuthorizedError(null,res,next);
    }
    var result=[];
    var payments = params.payments;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (payments == null) {
        return next(sysError.MissingParameterError("payments are missing", "payments are missing"));
    }

    Seq(payments).seqEach(function(payments,i){
        var that=this;
        _addAPayment(tenant,payments,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })

}

function upDatePayments(req, res , next){


}

function updateBizPayments(req,res,next){
    var params = req.params;
    var tenant = params.tenant;

    var authUser = params.authUser;
    var bizId=params.bizId;


    if (bizId != authUser.bizId) {
        return responseUtil.resNoAuthorizedError(null,res,next);
    }

    var result=[];
    var payments = params.payments;

    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (payments == null) {
        return next(sysError.MissingParameterError("payments are missing", "payments are missing"));
    }
  Seq(payments).seqEach(function(payments,i){
        var that=this;
        _updateAPayment(tenant,bizId,payments,function(returnResult){
            result[i]=returnResult;

            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })

}

function deletePayments(req, res , next){
    var params=req.params;

    bizPaymentDao.delBizPayment(req.params, function(error , result){
        if(error){
            logger.error(' delBizPayment ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        }
        if(result.affectedRows<=0){
            logger.error(' delBizPayment ' + 'failure');
            return responseUtil.resInternalError(error,res,next);
        }else{
            logger.error(' delBizPayment ' + ' success');
           // res.send(200,{success:true});
            responseUtil.resetSuccessRes(res);
            next();
        }
    });


}

module.exports = {
    getPayments: getPayments,
    getBizPayments: getBizPayments,
    addPayments:addPayments,
    addBizPayments:addBizPayments,
    upDatePayments:upDatePayments,
    deletePayments:deletePayments,
    updateBizPayments:updateBizPayments
};