/**
 * Created by Rina on 10/6/16.
 */

var bizImageDao = require('../dao/BizImageDao.js');
var commonUtil=require('mp-common-util');
var ReturnType = commonUtil.ReturnType;
var sysMsg = commonUtil.systemMsg; //this follows common checkout's order.js
var responseUtil = commonUtil.responseUtil;
var sysError = commonUtil.systemError;
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizImage.js');
var Seq = require('seq');

//bizImage
function getBizImage(req, res , next){
    var biz_id=req.params.bizId;
    var tenant=req.params.tenant;
    var start=req.params.start;
    var size=req.params.size;
    var result = {};
    bizImageDao.getBizImage({biz_id:biz_id,tenant:tenant,start:start,size:size},function(error,rows){
        if(error){
            logger.error(' getBizImage ' + error.message);
            responseUtil.resInternalError(error,res,next);
        } else{
            if(rows != null && rows.length>0){
                result = rows;
            }
            responseUtil.resetQueryRes(res,result,null);
            return next();
        }
    });
}

function _addABizImage(tenant,params,callback){
    var bizId=params.bizId;
    var imgUrl = params.imgUrl;
    var description = params.description;
    var active = params.active;

    if (bizId==null){
        return callback(new ReturnType(false,"biz id is missing"));
    }
    if (imgUrl==null){
        return callback(new ReturnType(false,"imgUrl is missing"));
    }
    var bizImage = {
        tenant: tenant,
        bizId: bizId,
        imgUrl: imgUrl,
        description: description,
        active: active
    };
    bizImageDao.addBizImage(bizImage, function (error, result) {
        if (error) {
            logger.error(' addABizImage ' + error.message);
            if (error.message !=null && error.message.indexOf("ER_DUP_ENTRY")>-1){
                return callback(new ReturnType(false,"Image exists already"));
            }else{
                return callback(new ReturnType(false,error.message));
            }
        } else {
            if (result && result.insertId) {
                imgId = result.insertId;
                return callback(new ReturnType(true,null,imgId));
            } else {
                logger.error(' addBizImage ' + error.message);
                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });
}

function addBizImage(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;

    var result=[];
    var bizImages = params.bizImages;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (bizImages == null) {
        return next(sysError.MissingParameterError("images are missing", "images are missing"));
    }
    Seq(bizImages).seqEach(function(bizImage,i){
        var that=this;
        _addABizImage(tenant,bizImage,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function delBizImage(req, res , next){
    var params=req.params;

    bizImageDao.delBizImage(req.params, function(error , result){
        if(error){
            logger.error(' delBizImage ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        }
        if(result.affectedRows<=0){
            logger.error(' delBizImage ' + 'failure');
            return responseUtil.resInternalError(error,res,next);
        }else{
            logger.error(' delBizImage ' + ' success');
            res.send(200,{success:true});
            next();
        }
    });

}


module.exports = {
    getBizImage: getBizImage,
    addBizImage: addBizImage,
    delBizImage: delBizImage
};