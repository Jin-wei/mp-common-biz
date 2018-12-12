/**
 * Created by Rina on 10/6/16.
 */

var bizCommentDao = require('../dao/BizCommentDao.js');
var commonUtil=require('mp-common-util');
var ReturnType = commonUtil.ReturnType;
var sysMsg = commonUtil.systemMsg; //this follows common checkout's order.js
var responseUtil = commonUtil.responseUtil;
var sysError = commonUtil.systemError;
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizComment.js');
var Seq = require('seq');

//bizComment
function getBizComment(req, res , next){
    var biz_id=req.params.bizId;
    var tenant=req.params.tenant;
    var start=req.params.start;
    var size=req.params.size;
    var comment_id= req.params.commentId;
    var result = {};
    bizCommentDao.getBizComment({biz_id:biz_id,tenant:tenant,start:start,size:size,comment_id:comment_id},function(error,rows){
        if(error){
            logger.error(' getBizComment ' + error.message);
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

function getBizRating(req, res , next){
    var biz_id=req.params.bizId;
    var tenant=req.params.tenant;
    var result = {};
    bizCommentDao.getBizRating({biz_id:biz_id,tenant:tenant},function(error,rows){
        if(error){
            logger.error(' getBizRating ' + error.message);
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

function _addABizComment(tenant,userId,params,callback){
    var bizId=params.bizId;
    var comment= params.comment;
    var rating = params.rating;
    var userName = params.userName;
    var city = params.city;
    var active = params.active;

    if (bizId==null){
        return callback(new ReturnType(false,"biz id is missing"));
    }
    if (comment==null){
        return callback(new ReturnType(false,"comment is missing"));
    }
    var bizComment = {
        tenant: tenant,
        bizId: bizId,
        comment: comment,
        rating: rating,
        userId: userId,
        userName: userName,
        city: city,
        active: active
    };
    bizCommentDao.addBizComment(bizComment, function (error, result) {
        if (error) {
            logger.error(' addABizComment ' + error.message);
            if (error.message !=null && error.message.indexOf("ER_DUP_ENTRY")>-1){
                return callback(new ReturnType(false,"Comment exists already"));
            }else{
                return callback(new ReturnType(false,error.message));
            }
        } else {
            if (result && result.insertId) {
                commentId = result.insertId;
                return callback(new ReturnType(true,null,commentId));
            } else {
                logger.error(' addUser ' + error.message);
                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });
}

function addBizComment(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var authUser=params.authUser;

    var result=[];
    var bizComments = params.bizComments;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (bizComments == null) {
        return next(sysError.MissingParameterError("comments are missing", "comments are missing"));
    }
    Seq(bizComments).seqEach(function(bizComment,i){
        var that=this;
        _addABizComment(tenant,authUser.userId,bizComment,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function delBizComment(req, res , next){
    var params=req.params;

    bizCommentDao.delBizComment(req.params, function(error , result){
        if(error){
            logger.error(' delBizComment ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        }
        if(result.affectedRows<=0){
            logger.error(' delBizComment ' + 'failure');
            return responseUtil.resInternalError(error,res,next);
        }else{
            logger.error(' delBizComment ' + ' success');
            res.send(200,{success:true});
            next();
        }
    });

}

function delBizCommentByUser(req, res , next){
    var params=req.params;
    var userId=params.userId;
    var authUser=params.authUser;

    if(userId != authUser.userId){
        return responseUtil.resNoAuthorizedError(null,res,next);
    }

    bizCommentDao.delBizCommentByUser(authUser.userId,req.params, function(error , result){
        if(error){
            logger.error(' delBizCommentByUser ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        }
        if(result.affectedRows<=0){
            logger.error(' delBizCommentByUser ' + 'failure');
            return responseUtil.resInternalError(error,res,next);
        }else{
            logger.error(' delBizCommentByUser ' + ' success');
            res.send(200,{success:true});
            next();
        }
    });

}

module.exports = {
    getBizComment: getBizComment,
    getBizRating: getBizRating,
    addBizComment: addBizComment,
    delBizComment: delBizComment,
    delBizCommentByUser: delBizCommentByUser
};
