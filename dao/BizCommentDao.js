/**
 * Created by Rina on 10/6/16.
 */

var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizCommentDao.js');

//bizCommentDao
function getBizComment(params,callback){
    var query = "select bc.* from biz_comment bc" +
        " where bc.biz_id = ? and bc.tenant= ? ";

    var paramArr = [], i = 0;
    paramArr[i++] =params.biz_id;
    paramArr[i++] =params.tenant;

    if (params.comment_id){
        query+= ' and bc.comment_id=?'
        paramArr[i++] = params.comment_id;
    }

    if(params.active != null || params.active ==1){
        query += " and bc.active = 1 ";
    }

    if(params.start!=null && params.size){
        paramArr[i++] = Number(params.start);
        paramArr[i++] = Number(params.size);
        query = query + " limit ? , ? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizComment ')
        return callback(error,rows);
    })
}

function getBizRating(params,callback){
    var query = "select count(*) total_count,AVG(rating) avg_rating from biz_comment bc" +
        " where bc.biz_id = ? and bc.tenant= ? ";

    var paramArr = [], i = 0;
    paramArr[i++] =params.biz_id;
    paramArr[i++] =params.tenant;

    if (params.active){
        query+= "and bc.active=? ";
        paramArr[i++] = params.active;
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizRating ')
        return callback(error,rows);
    })
}

function addBizComment(params,callback){
    var query = "insert into biz_comment (biz_id,tenant,comment,rating,user_id,user_name,city,active) values(?,?,?,?,?,?,?,?)";
    var paramArr = [], i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.comment;
    paramArr[i++] = params.rating;
    paramArr[i++] = params.userId;
    paramArr[i++] = params.userName;
    paramArr[i++] = params.city;
    paramArr[i++] = params.active;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizComment ')
        return callback(error,rows);
    });
}

function delBizComment(params ,callback){
    var query='delete FROM biz_comment where biz_id=? and tenant=?'
    var paramArr = [] , i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.tenant;

    if(params.commentId != null){
        paramArr[i++] = params.commentId;
        query = query + " and comment_id=?  "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delBizComment ')
        return callback(error,rows);
    })

}

function delBizCommentByUser(userId,params ,callback){
    var query='delete FROM biz_comment where biz_id=? and tenant=? and user_id=?'
    var paramArr = [] , i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.tenant;
    paramArr[i++] = userId;

    if(params.commentId != null){
        paramArr[i++] = params.commentId;
        query = query + " and comment_id=?  "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delBizCommentByUser ')
        return callback(error,rows);
    })

}

module.exports = {
    getBizComment: getBizComment,
    getBizRating: getBizRating,
    addBizComment: addBizComment,
    delBizComment: delBizComment,
    delBizCommentByUser: delBizCommentByUser
};