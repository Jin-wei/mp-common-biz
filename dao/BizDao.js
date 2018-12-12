/**
 * Created by Rina on 9/27/16.
 */

var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizDao.js');

//bizDao
function searchBiz(sc,callback){
    var query = " SELECT business.biz_id bizId, business.name AS bizName, business.description, " +
        " business.name_lang AS nameLang, business.owner_name AS ownerName, business.phone_no AS phoneNo, business.province, business.city, business.address, " +
        " business.options, business.biz_type AS bizType, biz_image.img_url AS imgUrl, business.note, business.active, business.zipcode, business.latitude, " +
        " business.longitude, business.email, business.biz_code AS bizCode, business.created_on AS createdOn, business.updated_on AS updatedOn, " +
        " count(biz_comment.comment) commentCount,avg(biz_comment.rating) avgRating " +
        " FROM business left join biz_image on (business.biz_id= biz_image.biz_id and biz_image.primary_flag=1)" +
        " left join biz_comment on business.biz_id=biz_comment.biz_id " +
        " where business.tenant= ? " ;

    //Set mysql query parameters array
    var paramArr=[],i=0;
    paramArr[i++] =sc.tenant;

    if (sc.active){
        query+= "and business.active=? ";
        paramArr[i++] = sc.active;
    }

    if (sc.name){
        query+= ' and business.name=?';
        paramArr[i++] = sc.name;
    }
    if (sc.biz_id){
        query+= 'and business.biz_id=?';
        paramArr[i++] = sc.biz_id;
    }
    if (sc.biz_type){
        query+= " and business.biz_type=?"
        paramArr[i++] = sc.biz_type;
    }

    query += " group by business.biz_id, biz_image.img_url";
    query += " order by business.biz_id";

    if(sc.start!=null && sc.size){
        paramArr[i++] = Number(sc.start);
        paramArr[i++] = Number(sc.size);
        query = query + " limit ? , ? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchBiz');
        return callback(error,rows);
    })
}

function addBiz(params,callback){

    var query = "insert into business(tenant,name,name_lang,description,biz_type,options,note,img_url,active,owner_name," +
        "phone_no,province,city,address,latitude,longitude,email,zipcode,biz_code) " +
        "values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);" ;

    //Set mysql query parameters array
    var paramArr = [] , i = 0;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.name;
    paramArr[i++] = params.nameLang;
    paramArr[i++] = params.description;
    paramArr[i++] = params.bizType;
    paramArr[i++] = params.options;
    paramArr[i++] = params.note;
    paramArr[i++] = params.imgUrl;
    paramArr[i++] = params.active;
    paramArr[i++] = params.ownerName;
    paramArr[i++] = params.phoneNo;
    paramArr[i++] = params.province;
    paramArr[i++] = params.city;
    paramArr[i++] = params.address;
    paramArr[i++] = params.latitude;
    paramArr[i++] = params.longitude;
    paramArr[i++] = params.email;
    paramArr[i++] = params.zipcode;
    paramArr[i++] = params.bizCode;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBiz ')
        return callback(error,rows);
    })
}

function updateBiz(tenant,bizId,business , callback){
    var query='update business set name = ? ,name_lang = ? ,description = ?,options = ? ,note = ? ,img_url = ?, ' +
        'owner_name = ? ,phone_no = ?, province = ? ,city = ? ,address = ? ,latitude = ? , longitude = ?, email = ? ,' +
        'zipcode = ? ,biz_code = ? where tenant=? and biz_id=? ;'

    //Set mysql query parameters array
    var paramArr = [] , i = 0;
    paramArr[i++] = business.bizName;
    paramArr[i++] = business.nameLang;
    paramArr[i++] = business.description;
    //paramArr[i++] = business.bizType;//need a separate method to update biz type
    paramArr[i++] = business.options;
    paramArr[i++] = business.note;
    paramArr[i++] = business.imgUrl;
    //paramArr[i++] = business.active; //need a separate method to update active status
    paramArr[i++] = business.ownerName;
    paramArr[i++] = business.phoneNo;
    paramArr[i++] = business.province;
    paramArr[i++] = business.city;
    paramArr[i++] = business.address;
    paramArr[i++] = business.latitude;
    paramArr[i++] = business.longitude;
    paramArr[i++] = business.email;
    paramArr[i++] = business.zipcode;
    paramArr[i++] = business.bizCode;
    paramArr[i++] = tenant;
    paramArr[i++] = bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBiz ')
        return callback(error,rows);
    })
}

function delBiz(params , callback){

    var query='delete FROM business where tenant=? and biz_id=?;'

    var paramArr = [] , i = 0;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delBiz ')
        return callback(error,rows);
    })
}

function updateBizStatus(params, callback) {
    var query = 'update business set active = ? where biz_id=? and tenant=? '
    var paramArr = [], i = 0;
    paramArr[i++] = params.status;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.tenant;
    db.dbQuery(query, paramArr, function (error, rows) {
        logger.debug(' updateBizStatus ');
        return callback(error, rows);
    })
}

module.exports = {
    searchBiz: searchBiz,
    addBiz: addBiz,
    updateBiz: updateBiz,
    delBiz: delBiz,
    updateBizStatus:updateBizStatus
};