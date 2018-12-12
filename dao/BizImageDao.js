/**
 * Created by Rina on 10/6/16.
 */


var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizImageDao.js');

//bizImageDao
function getBizImage(params,callback){
    var query = "select bi.* from biz_image bi" +
        " where bi.biz_id = ? and bi.tenant= ? ";

    var paramArr = [], i = 0;
    paramArr[i++] =params.biz_id;
    paramArr[i++] =params.tenant;

    if(params.active != null || params.active ==1){
        query += " and bi.active = 1 ";
    }

    if(params.start!=null && params.size){
        paramArr[i++] = Number(params.start);
        paramArr[i++] = Number(params.size);
        query = query + " limit ? , ? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizImage ')
        return callback(error,rows);
    })
}

function addBizImage(params,callback){
    var query = "insert into biz_image (biz_id,tenant,img_url,description,active) values(?,?,?,?,?)";
    var paramArr = [], i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.imgUrl;
    paramArr[i++] = params.description;
    paramArr[i++] = params.active;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizImage ')
        return callback(error,rows);
    });
}

function delBizImage(param ,callback){
    var query='delete FROM biz_image where biz_id=? and tenant=? '
    var paramArr = [] , i = 0;
    paramArr[i++] = param.bizId;
    paramArr[i++] = param.tenant;

    if(param.imgId != null){
        paramArr[i++] = param.imgId;
        query = query + " and img_id=? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delBizImage ')
        return callback(error,rows);
    })

}


module.exports = {
    getBizImage: getBizImage,
    addBizImage: addBizImage,
    delBizImage: delBizImage
};