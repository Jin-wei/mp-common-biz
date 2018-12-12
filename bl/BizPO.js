/**
 * Created by jzou on 07/6/17.
 */
var sysConfig = require('../config/SystemConfig.js');
var bizPODao = require('../dao/BizPODao.js');
var commonUtil=require('mp-common-util');
var ReturnType = commonUtil.ReturnType;
var sysMsg = commonUtil.systemMsg; //this follows common checkout's order.js
var responseUtil = commonUtil.responseUtil;
var sysError = commonUtil.systemError;
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizCustomer.js');
var Seq = require('seq');
var listOfValue = require('../util/ListOfValue.js');
var iconv = require('iconv-lite');
const fs = require('fs');
const path = require('path');
const moment = require('moment');



function getPOs(req, res , next){
    return _getPOs(req,res,next);
}

function getPOItems(req, res , next){
    return _getPOItems(req,res,next);
}

//bizPO
function getBizPOs(req, res , next){
    var params=req.params;
    var bizId=params.bizId,authBiz=params.authUser.bizId;
    if (bizId ==null){
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    if(authBiz !=bizId){
        return responseUtil.resNoAuthorizedError(null,res,next);
    }
    return _getPOs(req,res,next);
}

function getBizPOItems(req, res , next){
    var params=req.params;
    var bizId=params.bizId,authBiz=params.authUser.bizId;
    // if (bizId ==null){
    //     return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    // }
    // if(authBiz !=bizId){
    //     return responseUtil.resNoAuthorizedError(null,res,next);
    // }

    return _getPOItems(req,res,next);
}

function getSupplierPOs(req, res , next){
    var params=req.params;
    var supplierId=params.supplierId,authBiz=params.authUser.bizId;
    if (supplierId ==null){
        return next(sysError.MissingParameterError("supplierId is missing", "supplierId is missing"));
    }
    if(authBiz !=supplierId){
        return responseUtil.resNoAuthorizedError(null,res,next);
    }
    return _getPOs(req,res,next);
}

function getSupplierPOItems(req, res , next){
    var params=req.params;
    var supplierId=params.supplierId,authBiz=params.authUser.bizId;
    if (supplierId ==null){
        return next(sysError.MissingParameterError("supplierId is missing", "supplierId is missing"));
    }
    if(authBiz !=supplierId){
        return responseUtil.resNoAuthorizedError(null,res,next);
    }
    return _getPOItems(req,res,next);
}

function _getPOs(req, res , next){
    var params=req.params;
    var tenant =params.tenant;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    var result = {};
    var total=0;
    bizPODao.getBizPOCount(params,function(error,rows){
        if(error){
            logger.error(' getBizPO ' + error.message);
            responseUtil.resInternalError(error,res,next);
        } else{
            if(rows != null && rows.length>0) {
                total = rows[0].count;
                if (total > 0) {
                    bizPODao.getBizPO(params, function (error, rows) {
                        if (error) {
                            logger.error(' getBizPO ' + error.message);
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

function _getPOItems(req, res , next){
    var params=req.params;
    var tenant =params.tenant;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    var result = {};
    var total=0;
    bizPODao.getBizPOItemCount(params,function(error,rows){
        if(error){
            logger.error(' getBizPOItem ' + error.message);
            responseUtil.resInternalError(error,res,next);
        } else{
            if(rows != null && rows.length>0) {
                total = rows[0].count;
                if (total > 0) {
                    bizPODao.getBizPOItem(params, function (error, rows) {
                        if (error) {
                            logger.error(' getBizPOItem ' + error.message);
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

function _addABizPO(tenant,bizId,authUserId,params,callback){
    var supplierId=params.supplierId;

    if (supplierId==null || supplierId==0){
        return callback(new ReturnType(false,"supplier id is missing"));
    }
    var po = {
        tenant:tenant,
        bizId: bizId,
        supplierId:supplierId,
        note: params.note,
        createdBy: authUserId,
        updatedBy: authUserId,
        status: listOfValue.PO_STATUS_PENDING
    };
    logger.info('po:');
    logger.info(po);
    bizPODao.addBizPO(tenant,po,function (error, result) {
        if (error) {
            logger.error(' addABizPO ' + error.message);
            return callback(new ReturnType(false,error.message));

        } else {
            if (result && result.insertId) {
                relationId = result.insertId;
                return callback(new ReturnType(true,null,relationId));
            } else {
                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });
}

function _addABizPOItem(tenant,poId,authUserId,params,callback){
    var prodId=params.prodId;
    var prodName = params.prodName;
    var quantity = params.quantity;
    var unitPrice = params.unitPrice;

    if (prodId==null || prodId==0){
        return callback(new ReturnType(false,"product id is missing"));
    }

    if (quantity==null || quantity==0){
        return callback(new ReturnType(false,"quantity is missing"));
    }

    if (unitPrice==null || unitPrice==0){
        return callback(new ReturnType(false,"unit price is missing"));
    }

    if (prodName==null){
        return callback(new ReturnType(false,"product name is missing"));
    }
    var po = {
        tenant:tenant,
        poId: poId,
        prodId:prodId,
        prodType:params.prodType,
        prodParentType:params.prodParentType,
        prodName:prodName,
        prodCode:params.prodCode,
        quantity: quantity,
        unitOfMeasure:params.unitOfMeasure,
        unitPrice:params.unitPrice,
        note: params.note,
        createdBy: authUserId,
        updatedBy: authUserId,
        status: listOfValue.PO_ITEM_STATUS_PENDING,
        payStatus: listOfValue.PO_ITEM_PAY_STATUS_UNPAID,
        receiveStatus: listOfValue.PO_ITEM_RECEIVE_STATUS_UNRECEIVED
    };

    po.amount=po.unitPrice*po.quantity;
    po.commissionRate=0.05; //todo put it into configuration
    po.commission=po.amount*po.commissionRate;


    bizPODao.addBizPOItem(tenant,po,function (error, result) {
        if (error) {
            logger.error(' addABizPOItem ' + error.message);
            return callback(new ReturnType(false,error.message));

        } else {
            if (result && result.insertId) {
                relationId = result.insertId;
                return callback(new ReturnType(true,null,relationId));
            } else {
                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });
}


function _updateABizPO(tenant,bizId,authUserId,params,callback){
    var supplierId=params.supplierId;
    var prodId=params.prodId;
    var prodName = params.prodName;
    var quantity = params.quantity;
    var unitPrice = params.unitPrice;

    if (supplierId==null || supplierId==0){
        return callback(new ReturnType(false,"supplier id is missing"));
    }

    if (prodId==null || prodId==0){
        return callback(new ReturnType(false,"product id is missing"));
    }

    if (quantity==null || quantity==0){
        return callback(new ReturnType(false,"quantity is missing"));
    }

    if (unitPrice==null || unitPrice==0){
        return callback(new ReturnType(false,"unit price is missing"));
    }

    if (prodName==null){
        return callback(new ReturnType(false,"product name is missing"));
    }
    var po = {
        tenant:tenant,
        bizId: bizId,
        prodId:prodId,
        prodType:params.prodType,
        prodParentType:params.prodParentType,
        prodName:prodName,
        prodCode:params.prodCode,
        quantity: quantity,
        unitOfMeasure:params.unitOfMeasure,
        unitPrice:params.unitPrice,
        supplierId:supplierId,
        note: params.note,
        createdBy: authUserId,
        updatedBy: authUserId,
        status: listOfValue.PO_STATUS_PENDING
    };

    po.amount=po.unitPrice*po.quantity;
    po.commissionRate=0.05; //todo put it into configuration
    po.commission=po.amount*po.commissionRate;


    bizPODao.updateBizPO(tenant,po,function (error, result) {
        if (error) {
            logger.error(' updateABizPO ' + error.message);
            return callback(new ReturnType(false,error.message));

        } else {
            if (result && result.insertId) {
                relationId = result.insertId;
                return callback(new ReturnType(true,null,relationId));
            } else {
                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });
}

function addBizPOs(req, res, next) {
    var bizId = req.params.bizId,authBiz=req.params.authUser.bizId,authUserId=req.params.authUser.userId;
    // if (bizId == null) {
    //     return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    // }
    // if (authBiz != bizId) {
    //     return responseUtil.resNoAuthorizedError(null, res, next);
    // }

    return _addBizPOs(bizId,authUserId,req, res, next);
}

function addBizPOItems(req, res, next) {
    var bizId = req.params.bizId,authBiz=req.params.authUser.bizId,authUserId=req.params.authUser.userId;
    if (bizId == null) {
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    if (authBiz != bizId) {
        return responseUtil.resNoAuthorizedError(null, res, next);
    }

    return _addBizPOItems(bizId,authUserId,req, res, next);
}

function  _addBizPOItems(bizId,authUserId,req,res,next){
    var params = req.params;
    var tenant = params.tenant;
    var poId = params.poId;
    var result=[];
    var poItems = params.poItems;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (poId == null || poId<=0) {
        return next(sysError.MissingParameterError("poId is missing", "poId is missing"));
    }
    if (poItems == null) {
        return next(sysError.MissingParameterError("poItems are missing", "poItems are missing"));
    }

    //check it is a valid po or not
    bizPODao.getBizPO({tenant:tenant,id:poId,bizId:bizId},function(err, result){
        if (err){
            responseUtil.resInternalError(null, res, next);
        }else{
            if (result.length !=1){
                return next(sysError.MissingParameterError("po is not found", "po is not found"));
            }else{
                if (listOfValue.PO_STATUS_PENDING !=(result[0].status)){
                    return next(sysError.MissingParameterError("invalid operation", "invalid operation"));
                }else{
                    //add the item
                    Seq(poItems).seqEach(function(poitem,i){
                        var that=this;
                        _addABizPOItem(tenant,poId,authUserId, poitem, function(returnResult) {
                            result[i] = returnResult;
                            that(null, i);
                        });
                    }).seq(function(){
                        responseUtil.resetQueryRes(res,result,null);
                        return next();
                    })
                }
            }
        }
    })
}

function  _addBizPOs(bizId,authUserId,req,res,next){
    var params = req.params;
    var tenant = params.tenant;
    var result=[];
    var pos = params.pos;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (pos == null) {
        return next(sysError.MissingParameterError("pos are missing", "pos are missing"));
    }
    Seq(pos).seqEach(function(po,i){
        var that=this;
        _addABizPO(tenant,bizId,authUserId, po, function(returnResult) {
            result[i] = returnResult;
            that(null, i);
         });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function deleteBizPOs(req, res, next) {
    var bizId = req.params.bizId,authBiz=req.params.authUser.bizId;
    if (bizId == null) {
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    if (authBiz != bizId) {
        return responseUtil.resNoAuthorizedError(null, res, next);
    }
    return  _deletePOs(bizId,req,res,next);
}

function deleteBizPOItems(req, res, next) {
    var bizId = req.params.bizId,authBiz=req.params.authUser.bizId;
    if (bizId == null) {
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    if (authBiz != bizId) {
        return responseUtil.resNoAuthorizedError(null, res, next);
    }
    return  _deletePOItems(bizId,req,res,next);
}

function _deletePOs(bizId,req, res, next) {
    var ids=req.params.ids,tenant=req.params.tenant,result=[];
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (ids == null) {
        return next(sysError.MissingParameterError("ids are missing", "ids are missing"));
    }
    Seq(ids).seqEach(function(id,i){
            var that=this;
            _deleteABizPO(tenant,bizId,id, function (returnResult) {
                result[i] = returnResult;
                that(null, i);

    })}).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function  _deleteABizPO(tenant, bizId,id, callback){
    bizPODao.delBizPO(tenant,{id:id, bizId:bizId,status:listOfValue.PO_STATUS_PENDING},function(error, result){
        if (error) {
            logger.error(' delABizPO ' + error.message);
            return callback(new ReturnType(false,error.message));

        } else {
            if (result && result.affectedRows>0) {
                return callback(new ReturnType(true,null,id));
            } else {
                return callback(new ReturnType(false,"invalid operation",id));
            }
        }
    })
}

function  _deleteABizPOItem(tenant,poId, id, callback){
    bizPODao.delBizPOItem(tenant,{id:id, poId:poId,status:listOfValue.PO_ITEM_STATUS_PENDING},function(error, result){
        if (error) {
            logger.error(' delABizPOItem ' + error.message);
            return callback(new ReturnType(false,error.message));
        } else {
            if (result && result.affectedRows>0) {
                return callback(new ReturnType(true,null,id));
            } else {
                return callback(new ReturnType(false,"invalid operation",id));
            }
        }
    })
}



function _deletePOItems(bizId,req, res, next) {
    var params=req.params;
    var poId=params.poId,itemIds=params.itemIds,tenant=params.tenant,result=[];
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (poId == null || poId<=0) {
        return next(sysError.MissingParameterError("poId is missing", "poId is missing"));
    }
    if (itemIds == null) {
        return next(sysError.MissingParameterError("itemIds are missing", "itemIds are missing"));
    }

    //check it is a valid po or not
    bizPODao.getBizPO({tenant:tenant,id:poId,bizId:bizId},function(err, result){
        if (err){
            responseUtil.resInternalError(null, res, next);
        }else{
            if (result.length !=1){
                return next(sysError.MissingParameterError("po is not found", "po is not found"));
            }else{
                if (listOfValue.PO_STATUS_PENDING !=(result[0].status)){
                    return next(sysError.MissingParameterError("invalid operation", "invalid operation"));
                }else{
                    //add the item
                    Seq(itemIds).seqEach(function(id,i){
                        var that=this;
                        _deleteABizPOItem(tenant,poId,id, function(returnResult) {
                            result[i] = returnResult;
                            that(null, i);
                        });
                    }).seq(function(){
                        responseUtil.resetQueryRes(res,result,null);
                        return next();
                    })
                }
            }
        }
    })
}


function updateBizPOs(req, res, next) {
    var bizId = req.params.bizId,authBiz=req.params.authUser.bizId;
    var authUserId=req.params.authUser.userId;
    if (bizId == null) {
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    if (authBiz != bizId) {
        return responseUtil.resNoAuthorizedError(null, res, next);
    }
    return _updatePOs(bizId,authUserId,req,res,next);
}

function updateBizPOItems(req, res, next) {
    var bizId = req.params.bizId,authBiz=req.params.authUser.bizId;
    var authUserId=req.params.authUser.userId;
    if (bizId == null) {
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    if (authBiz != bizId) {
        return responseUtil.resNoAuthorizedError(null, res, next);
    }
    return _updatePOItems(bizId,authUserId,req,res,next);
}

function updatePOs(req, res, next) {
    return _updatePOs(null,req,res,next);

}

function _updatePOs(bizId,authUserId,req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var result=[];
    var pos = params.pos;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (pos == null) {
        return next(sysError.MissingParameterError("pos are missing", "pos are missing"));
    }
    Seq(pos).seqEach(function(po,i){
        var that=this;
        if (bizId !=null && po.bizId !=bizId){
            result[i]=new ReturnType(false,"not authorized",bizId);
            that(null,i);
        }else {
            _updateABizPO(tenant, po, function (returnResult) {
                result[i] = returnResult;
                that(null, i);
            });
        }
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function _updatePOItems(bizId,authUserId,req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var result=[];
    var pos = params.pos;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (pos == null) {
        return next(sysError.MissingParameterError("pos are missing", "pos are missing"));
    }
    Seq(pos).seqEach(function(po,i){
        var that=this;
        if (bizId !=null && po.bizId !=bizId){
            result[i]=new ReturnType(false,"not authorized",bizId);
            that(null,i);
        }else {
            _updateABizPO(tenant, po, function (returnResult) {
                result[i] = returnResult;
                that(null, i);
            });
        }
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function getPOStatus(req,res,next){
    var status=
        [listOfValue.PO_STATUS_PENDING,
            listOfValue.PO_STATUS_CONFIRMED,
            listOfValue.PO_STATUS_COMPLETED,
            listOfValue.PO_STATUS_CANCELED];
    responseUtil.resetQueryRes(res,status,null);
}

function getPOItemStatus(req,res,next){
    var status=
        [listOfValue.PO_ITEM_STATUS_PENDING,
            listOfValue.PO_ITEM_STATUS_SHIPPED,
            listOfValue.PO_ITEM_STATUS_RECEIVED
        ];
    responseUtil.resetQueryRes(res,status,null);
}
//change po status for channel
function updateBizPOStatus(req,res,next){
    var params = req.params;
    var tenant = params.tenant;

    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    return _updateBizPOStatus(tenant, params, req,res,next);
}

function _updateBizPOStatus(tenant, params,req, res, callback) {
    var bizId = params.bizId;
    var id = req.params.id;
    var status = req.params.status;
    if (bizId == null || bizId == 0){
        return callback(sysError.MissingParameterError("biz id is missing", "biz id is missing"));
    }
    if (id == null || id == 0){
        return callback(sysError.MissingParameterError("purchase id is missing", "purchase id is missing"));
    }
    if (status == null) {
        return callback(sysError.MissingParameterError("order state is missing", "order state is missing"));
    }

    bizPODao.updateBizPOStatus(tenant, params, function (error, result) {
        if (error) {
            logger.error(' updateBizPOStatus ' + error.message);
            responseUtil.resInternalError(error, res, callback);
        } else {
            if (result) {
                responseUtil.resetQueryRes(res,result,null);
                return callback();
            } else {
                responseUtil.resetQueryRes(res,error?error.message:null,null);
                return callback();
            }
        }
    });
}
//change po item status for channel
function updateBizPOItemStatus(req,res,next){
    var params = req.params;
    var tenant = params.tenant;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    return _updateBizPOItemStatus(tenant, params, req, res, next);
}

function _updateBizPOItemStatus(tenant, params,req, res, callback) {
    var bizId = params.bizId;
    var id = req.params.id;
    var status = req.params.status;
    if (bizId == null || bizId == 0){
        return callback(sysError.MissingParameterError("biz id is missing", "biz id is missing"));
    }
    if (id == null || id == 0){
        return callback(sysError.MissingParameterError("purchase id is missing", "purchase id is missing"));
    }
    if (status == null) {
        return callback(sysError.MissingParameterError("order state is missing", "order state is missing"));
    }

    bizPODao.updateBizPOItemStatus(tenant, params, function (error, result) {
        if (error) {
            logger.error(' updateBizPOItemStatus ' + error.message);
            responseUtil.resInternalError(error, res, callback);
        } else {
            if (result) {
                responseUtil.resetQueryRes(res,result,null);
                return callback();
            } else {
                responseUtil.resetQueryRes(res,error?error.message:null,null);
                return callback();
            }
        }
    });
}
//change po status for supplier
function updateSupplierPOStatus(req,res,next){
    var params = req.params;
    var tenant = params.tenant;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    return _updateSupplierPOStatus(tenant, params, req,res,next);
}

function _updateSupplierPOStatus(tenant, params,req, res, callback) {
    var supplierId = params.supplierId;
    var id = req.params.id;
    var status = req.params.status;
    if (supplierId == null || supplierId == 0){
        return callback(sysError.MissingParameterError("supplier id is missing", "supplier id is missing"));
    }
    if (id == null || id == 0){
        return callback(sysError.MissingParameterError("purchase id is missing", "purchase id is missing"));
    }
    if (status !== listOfValue.PO_STATUS_CONFIRMED) {
        return callback(sysError.MissingParameterError("incorrect order state", "incorrect order state"));
    }

    bizPODao.updateBizPOStatus(tenant, params, function (error, result) {
        if (error) {
            logger.error(' updateSupplierPOStatus ' + error.message);
            responseUtil.resInternalError(error, res, callback);
        } else {
            if (result) {
                responseUtil.resetQueryRes(res,result,null);
                return callback();
            } else {
                responseUtil.resetQueryRes(res,error?error.message:null,null);
                return callback();
            }
        }
    });
}
//change po item status for supplier
function updateSupplierPOItemStatus(req,res,next){
    var params = req.params;
    var tenant = params.tenant;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    return _updateSupplierPOItemStatus(tenant, params, req, res, next);
}

function _updateSupplierPOItemStatus(tenant, params,req, res, callback) {
    var supplierId = params.supplierId;
    var id = req.params.id;
    var status = req.params.status;
    if (supplierId == null || supplierId == 0){
        return callback(sysError.MissingParameterError("supplier id is missing", "supplier id is missing"));
    }
    if (id == null || id == 0){
        return callback(sysError.MissingParameterError("purchase id is missing", "purchase id is missing"));
    }
    if (status !== listOfValue.PO_ITEM_STATUS_SHIPPED) {
        return callback(sysError.MissingParameterError("incorrect order state", "incorrect order state"));
    }

    bizPODao.updateBizPOItemStatus(tenant, params, function (error, result) {
        if (error) {
            logger.error(' updateSupplierPOItemStatus ' + error.message);
            responseUtil.resInternalError(error, res, callback);
        } else {
            if (result) {
                responseUtil.resetQueryRes(res,result,null);
                return callback();
            } else {
                responseUtil.resetQueryRes(res,error?error.message:null,null);
                return callback();
            }
        }
    });
}
//change po item pay status for channel
function updateBizPOItemPayStatus(req, res, callback) {
    var params = req.params;
    var tenant = params.tenant;
    var bizId = params.bizId;
    var id = req.params.id;
    var payStatus = req.params.payStatus;

    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (bizId == null || bizId == 0){
        return callback(sysError.MissingParameterError("biz id is missing", "biz id is missing"));
    }
    if (id == null || id == 0){
        return callback(sysError.MissingParameterError("purchase id is missing", "purchase id is missing"));
    }
    if (payStatus == null) {
        return callback(sysError.MissingParameterError("pay state is missing", "pay state is missing"));
    }

    return _updateBizPOItemPayStatus(params, req, res, callback);
}

function _updateBizPOItemPayStatus(params, req, res, callback) {
    var tenant = params.tenant;
    bizPODao.updateBizPOItemPayStatus(tenant, params, function (error, result) {
        if (error) {
            logger.error(' updateBizPOItemPayStatus ' + error.message);
            responseUtil.resInternalError(error, res, callback);
        } else {
            if (result) {
                responseUtil.resetQueryRes(res,result,null);
                return callback();
            } else {
                responseUtil.resetQueryRes(res,error?error.message:null,null);
                return callback();
            }
        }
    });
}

//change po item receive status for supplier
function updateSupplierPOItemReceiveStatus(req, res, callback) {
    var params = req.params;
    var tenant = params.tenant;
    var supplierId = params.supplierId;
    var id = req.params.id;
    var receiveStatus = req.params.receiveStatus;

    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (supplierId == null || supplierId == 0){
        return callback(sysError.MissingParameterError("supplier id is missing", "supplier id is missing"));
    }
    if (id == null || id == 0){
        return callback(sysError.MissingParameterError("purchase id is missing", "purchase id is missing"));
    }
    if (receiveStatus == null) {
        return callback(sysError.MissingParameterError("receive state is missing", "receive state is missing"));
    }

    return _updateSupplierPOItemReceiveStatus(params, req, res, callback);
}

function _updateSupplierPOItemReceiveStatus(params, req, res, callback) {
    var tenant = params.tenant;
    bizPODao.updateSupplierPOItemReceiveStatus(tenant, params, function (error, result) {
        if (error) {
            logger.error(' updateSupplierPOItemReceiveStatus ' + error.message);
            responseUtil.resInternalError(error, res, callback);
        } else {
            if (result) {
                responseUtil.resetQueryRes(res,result,null);
                return callback();
            } else {
                responseUtil.resetQueryRes(res,error?error.message:null,null);
                return callback();
            }
        }
    });
}


//change po item receive status for supplier
function updateSupplierPOItemReceiveStatus(req, res, callback) {
    var params = req.params;
    var tenant = params.tenant;
    var supplierId = params.supplierId;
    var id = req.params.id;
    var receiveStatus = req.params.receiveStatus;

    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (supplierId == null || supplierId == 0){
        return callback(sysError.MissingParameterError("supplier id is missing", "supplier id is missing"));
    }
    if (id == null || id == 0){
        return callback(sysError.MissingParameterError("purchase id is missing", "purchase id is missing"));
    }
    if (receiveStatus == null) {
        return callback(sysError.MissingParameterError("receive state is missing", "receive state is missing"));
    }

    return _updateSupplierPOItemReceiveStatus(params, req, res, callback);
}

//export biz po item
function exportBizPOItem(req, res, callback) {
    var params = req.params;
    bizPODao.getBizPOItem(params, function (error, rows) {
        if (error) {
            logger.error(' exportBizPOItem ' + error.message);
            responseUtil.resInternalError(error, res, callback);
        } else {
            if (rows != null && rows.length > 0) {
                var str = '供应商,采购单号,应付金额,支付状态,提交日期\r\n';
                for(var i = 0; i < rows.length; i++) {
                    var data = rows[i];
                    str += (data.supplierName||'')+',';
                    str += (data.id||'')+',';
                    str += ((data.unitPrice*data.quantity)||'')+',';
                    str += ((data.payStatus === 'paid'? '已支付':'未支付')||'')+',';
                    str += (moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss') || '' ) + ',';
                    str += '\r\n';
                }
                var filename = 'channel_bill.csv';
                var tempfile = path.join(__dirname, '../static/downloads/' + filename);
                var csvBuffer = iconv.encode(str, 'gb2312');
                fs.writeFile(tempfile, csvBuffer, function (err) {
                    if (err) throw err;
                    responseUtil.resetQueryRes(res,'/downloads/'+filename,null);
                    return callback();
                });
            }
        }
    });
}

//export supplier po item
function exportSupplierPOItem(req, res, callback) {
    var params = req.params;
    bizPODao.getBizPOItem(params, function (error, rows) {
        if (error) {
            logger.error(' exportSupplierPOItem ' + error.message);
            responseUtil.resInternalError(error, res, callback);
        } else {
            if (rows != null && rows.length > 0) {
                var str = '经销商,采购单号,应收金额,收款状态,提交日期\r\n';
                for(var i = 0; i < rows.length; i++) {
                    var data = rows[i];
                    str += (data.bizName||'')+',';
                    str += (data.id||'')+',';
                    str += ((data.unitPrice*data.quantity)||'')+',';
                    str += ((data.receiveStatus === 'received'? '已收款':'未收款')||'')+',';
                    str += (moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss') || '' ) + ',';
                    str += '\r\n';
                }
                var filename = 'supplier_bill.csv';
                var tempfile = path.join(__dirname, '../static/downloads/' + filename);
                var csvBuffer = iconv.encode(str, 'gb2312');
                fs.writeFile(tempfile, csvBuffer, function (err) {
                    if (err) throw err;
                    responseUtil.resetQueryRes(res,'/downloads/'+filename,null);
                    return callback();
                });
            }
        }
    });
}
function getConnectState(req,res,next){
    res.send(200,{success: true});
}
module.exports = {
    getConnectState:getConnectState,
    getPOs: getPOs,
    getPOItems: getPOItems,
    getBizPOs: getBizPOs,
    getBizPOItems: getBizPOItems,
    getSupplierPOs: getSupplierPOs,
    getSupplierPOItems: getSupplierPOItems,
    getPOStatus: getPOStatus,
    getPOItemStatus:getPOItemStatus,
    addBizPOs:addBizPOs,
    addBizPOItems:addBizPOItems,
    updateBizPOs:updateBizPOs,
    deleteBizPOs:deleteBizPOs,
    deleteBizPOItems:deleteBizPOItems,
    updateBizPOStatus:updateBizPOStatus,
    updateBizPOItemStatus:updateBizPOItemStatus,
    updateSupplierPOStatus:updateSupplierPOStatus,
    updateSupplierPOItemStatus:updateSupplierPOItemStatus,
    updateBizPOItemPayStatus:updateBizPOItemPayStatus,
    updateSupplierPOItemReceiveStatus:updateSupplierPOItemReceiveStatus,
    exportBizPOItem:exportBizPOItem,
    exportSupplierPOItem:exportSupplierPOItem
};
