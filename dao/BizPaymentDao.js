/**
 * Created by Rina on 10/6/16.
 */
var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizPaymentDao.js');

function getBizPayment(params,callback){
    var query = "select bi.id, bi.biz_id bizId, bi.tenant,bi.type,bi.partner,bi.key," +
        "bi.seller_email sellerEmail,bi.created_on createdOn,bi.created_by createdBy," +
        "bi.updated_on updatedOn, bi.updated_by updatedBy from biz_payment bi" +
        " where bi.tenant= ? ";

    var paramArr = [], i = 0;
    paramArr[i++] =params.tenant;

    if(params.bizId != null){
        query += " and bi.biz_id = ? ";
        paramArr[i++] =params.bizId;
    }

    if(params.type != null){
        query += " and bi.type = ? ";
        paramArr[i++] =params.type;
    }

    if(params.start!=null && params.size){
        paramArr[i++] = Number(params.start);
        paramArr[i++] = Number(params.size);
        query = query + " limit ? , ? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizPayment ')
        return callback(error,rows);
    })
}

function addBizPayment(params,callback){
    var query = "insert into biz_payment(biz_id,tenant,type,partner,`key`,seller_email,created_by,updated_by) values(?,?,?,?,?,?,?,?) ";
    var paramArr = [], i = 0;
    paramArr[i++] = Number(params.bizId);
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.type;
    paramArr[i++] = params.partner;
    paramArr[i++] = params.key;
    paramArr[i++] = params.sellerEmail;
   // paramArr[i++] = params.active==null?1:params.active;
  //  paramArr[i++] = params.authUser.userId;
  //  paramArr[i++] = params.authUser.userId;
    paramArr[i++] = params.createdBy;
    paramArr[i++] = params.updatedBy;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizPayment ')
        return callback(error,rows);
    });
}

function delBizPayment(param ,callback){
    var query='delete FROM biz_payment where biz_id=? and tenant=? '
    var paramArr = [] , i = 0;
    paramArr[i++] = param.bizId;
    paramArr[i++] = param.tenant;

    if(param.type != null){
        paramArr[i++] = param.type;
        query = query + " and type=? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delBizPayment ')
        return callback(error,rows);
    })

}

function updateBizPayment(params ,callback){
    var query='update biz_payment set `type`=?,`partner`=?,`key`=?,`seller_email`=? where `biz_id`=? and `tenant`=? and `id`=? '
    var paramArr = [] , i = 0;

    if (params.type == null) {
        return next(sysError.MissingParameterError("type are missing", "type are missing"));
    }
    if (params.partner == null) {
        return next(sysError.MissingParameterError("partner are missing", "partner are missing"));
    }

    if (params.key == null) {
        return next(sysError.MissingParameterError("key are missing", "key are missing"));
    }

    if (params.sellerEmail == null) {
        return next(sysError.MissingParameterError("sellerEmail are missing", "sellerEmail are missing"));
    }
    paramArr[i++] = params.type;
    paramArr[i++] = params.partner;
    paramArr[i++] = params.key;
    paramArr[i++] = params.sellerEmail;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.id;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizPayment ')
        return callback(error,rows);
    })

}

function changeBizPaymentStatus(param ,callback){
    var query='update biz_payment set active=? where biz_id=? and tenant=? and id=? '
    var paramArr = [] , i = 0;
    paramArr[i++] = Number(param.active);
    paramArr[i++] = Number(param.bizId);
    paramArr[i++] = param.tenant;
    paramArr[i++] = Number(param.id);

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizPaymentStatus ')
        return callback(error,rows);
    })

}



module.exports = {
    getBizPayment: getBizPayment,
    addBizPayment: addBizPayment,
    delBizPayment: delBizPayment,
    updateBizPayment: updateBizPayment,
    changeBizPaymentStatus:changeBizPaymentStatus

};