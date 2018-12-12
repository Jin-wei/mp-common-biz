/**
 * Created by Rina on 10/6/16.
 */

var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizCustomerDao.js');

//bizCustomerDao
function getBizCustomer(params,callback){
    var query = "select bc.relation_id AS relationId, bc.name, bc.cust_id AS custId, bc.phone_no AS phoneNo, bc.province, bc.city, bc.address, " +
        " bc.created_on AS createdOn, bc.zipcode, bc.active, bc.latitude, bc.longitude, bc.cust_type custType, " +
        "bc.note, bc.biz_id AS bizId, " +
        "bc.owner_name AS ownerName, bc.owner_phone ownerPhone, bc.cust_since custSince,bc.chain_name chainName," +
        "bc.support_paylater supportPayLater,bc.contact_name contactName," +
        "bc.description, bc.updated_on AS updatedOn,b.name bizName from biz_customer bc,business b" +
        " where bc.biz_id=b.biz_id and bc.tenant= ? ";

    var paramArr = [], i = 0;
    paramArr[i++] =params.tenant;

    if (params.relationId){
        query+= ' and bc.relation_id=?';
        paramArr[i++] = params.relationId;
    }

    if (params.bizId){
        query+= ' and bc.biz_id=?';
        paramArr[i++] = params.bizId;
    }

    if (params.custId){
        query+= ' and bc.cust_id=?';
        paramArr[i++] = params.custId;
    }

    if (params.name){
        query+= ' and bc.name like ?';
        paramArr[i++] = '%'+params.name+'%';
    }

    if (params.active){
        query+= "and bc.active=? ";
        paramArr[i++] = params.active;
    }

    if (params.province){
        query+= "and bc.province=? ";
        paramArr[i++] = params.province;
    }

    if (params.city){
        query+= "and bc.city=? ";
        paramArr[i++] = params.city;
    }
    if (params.phoneNo){
        query+= "and bc.phone_No=? ";
        paramArr[i++] = params.phoneNo;
    }

    if (params.email){
        query+= "and bc.email=? ";
        paramArr[i++] = params.email;
    }


    if (params.bizName){
        query+= "and b.Name=? ";
        paramArr[i++] = params.bizName;
    }

    query+=" order by bc.updated_on desc";


    if(params.start!=null && params.size){
        paramArr[i++] = Number(params.start);
        paramArr[i++] = Number(params.size);
        query = query + " limit ? , ? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizCustomer ')
        return callback(error,rows);
    })
}


function getBizCustomer(params,callback){
    var query = "select bc.relation_id AS relationId, bc.name, bc.cust_id AS custId, bc.phone_no AS phoneNo, bc.province, bc.city, bc.address, " +
        " bc.created_on AS createdOn, bc.zipcode, bc.active, bc.latitude, bc.longitude, bc.cust_type custType, " +
        "bc.note, bc.biz_id AS bizId, " +
        "bc.owner_name AS ownerName, bc.owner_phone ownerPhone, bc.cust_since custSince,bc.chain_name chainName," +
        "bc.support_paylater supportPayLater,bc.contact_name contactName," +
        "bc.description, bc.updated_on AS updatedOn,b.name bizName from biz_customer bc,business b" +
        " where bc.biz_id=b.biz_id";

    var paramArr = [], i = 0;
    var whereClause=_getBizCustomerWhereClause(paramArr,params);
    i=paramArr.length;
    query+=whereClause;
    query+=" order by bc.updated_on desc";
    if(params.start!=null && params.size){
        paramArr[i++] = Number(params.start);
        paramArr[i++] = Number(params.size);
        query = query + " limit ? , ? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizCustomer ')
        return callback(error,rows);
    })
}

function getBizCustomerCount(params,callback){
    var query = "select count(*) count from biz_customer bc,business b" +
        " where bc.biz_id=b.biz_id ";

    var paramArr = [], i = 0;
    var whereclause=_getBizCustomerWhereClause(paramArr,params);

    db.dbQuery(query+whereclause,paramArr,function(error,rows){
        logger.debug(' getBizCustomerCount ')
        return callback(error,rows);
    })
}

function _getBizCustomerWhereClause(paramArr,params){
    var query=" and bc.tenant= ? ";
    var i=0;
    paramArr[i++] =params.tenant;

    if (params.relationId){
        query+= ' and bc.relation_id=?';
        paramArr[i++] = params.relationId;
    }

    if (params.bizId){
        query+= ' and bc.biz_id=?';
        paramArr[i++] = params.bizId;
    }

    if (params.custId){
        query+= ' and bc.cust_id=?';
        paramArr[i++] = params.custId;
    }

    if (params.name){
        query+= ' and bc.name like ?';
        paramArr[i++] = '%'+params.name+'%';
    }

    if (params.active){
        query+= "and bc.active=? ";
        paramArr[i++] = params.active;
    }

    if (params.province){
        query+= "and bc.province=? ";
        paramArr[i++] = params.province;
    }

    if (params.city){
        query+= "and bc.city=? ";
        paramArr[i++] = params.city;
    }
    if (params.phoneNo){
        query+= "and bc.phone_No=? ";
        paramArr[i++] = params.phoneNo;
    }

    if (params.email){
        query+= "and bc.email=? ";
        paramArr[i++] = params.email;
    }


    if (params.bizName){
        query+= "and b.Name=? ";
        paramArr[i++] = params.bizName;
    }
    return query;

}


function getCustomerBiz(params,callback){
    var query = " SELECT biz_customer.cust_id custId,biz_customer.relation_id relationId,biz_customer.support_paylater supportPayLater," +
        " business.biz_id bizId, business.name AS bizName, business.description, " +
        " business.name_lang AS nameLang, business.owner_name AS ownerName, business.phone_no AS phoneNo,business.province, business.city, business.address, " +
        " business.options, business.biz_type AS bizType, business.note, business.active, business.zipcode, business.latitude, " +
        " business.longitude, business.email, business.biz_code AS bizCode, business.created_on AS createdOn, business.updated_on AS updatedOn from business" +
        " inner join  biz_customer on business.biz_id= biz_customer.biz_id " +
        " where  biz_customer.tenant= ? ";

    var paramArr = [], i = 0;
    paramArr[i++] =params.tenant;

    if (params.biz_id){
        query+= ' and biz_customer.biz_id=?';
        paramArr[i++] = Number(params.biz_id);
    }

    if (params.cust_id){
        query+= ' and biz_customer.cust_id=?';
        paramArr[i++] = Number(params.cust_id);
    }

    if (params.relation_id){
        query+= ' and biz_customer.relation_id=?';
        paramArr[i++] = params.relation_id;
    }

    if (params.active !=null){
        query+= " and business.active=? ";
        paramArr[i++] = params.active;
    }

    if(params.start!=null && params.size){
        paramArr[i++] = Number(params.start);
        paramArr[i++] = Number(params.size);
        query = query + " limit ? , ? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizCustomer ')
        return callback(error,rows);
    })
}
function addBizCustomer(params,callback){
    var query = "insert into biz_customer (cust_id,name,biz_id,tenant,phone_no,active,address,city,province,zipcode,latitude,longitude,"+
        "cust_type,note,owner_name,description,owner_phone, cust_since,chain_name,support_payLater,contact_name,email) " +
        "values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    var paramArr = [], i = 0;
    paramArr[i++] = params.custId;
    paramArr[i++] = params.name;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.phoneNo;
    //always active for now
    paramArr[i++] = 1;
    paramArr[i++] = params.address;
    paramArr[i++] = params.city;
    paramArr[i++] = params.province;
    paramArr[i++] = params.zipcode;
    paramArr[i++] = params.latitude;
    paramArr[i++] = params.longitude;
    paramArr[i++] = params.custType;
    paramArr[i++] = params.note;
    paramArr[i++] = params.ownerName;
    paramArr[i++] = params.description;
    paramArr[i++] = params.ownerPhone;
    paramArr[i++] = params.custSince;
    paramArr[i++] = params.chainName;
    paramArr[i++] = (params.supportPaylater == null) ? 1:params.supportPaylater;
    paramArr[i++] = params.contactName,
    paramArr[i++] = params.email

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizCustomer ')
        return callback(error,rows);
    });
}

function delBizCustomer(tenant,params ,callback){
    var query='delete FROM biz_customer where biz_id=? and tenant=?'
    var paramArr = [] , i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = tenant;

    if(params.custId){
        query+= ' and cust_id=?';
        paramArr[i++] = params.custId;
    }

    if(params.relationId){
        query+= ' and relation_id=?';
        paramArr[i++] = params.relationId;
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delBizCustomer ')
        return callback(error,rows);
    })

}

function updateBizCustomer(tenant, customer , callback){

    var query='update biz_customer set name = ? ,description = ?,cust_type = ? ,note = ? , ' +
        'active = ?, owner_name = ? ,phone_no = ?, province = ? ,city = ? ,address = ? ,latitude = ? , longitude = ?, ' +
        'zipcode = ?, owner_phone=?, cust_since=?, chain_name=?, support_paylater=?,contact_name=? where tenant=? and relation_id=?'

    //Set mysql query parameters array
    var paramArr = [] , i = 0;
    paramArr[i++] = customer.name;
    paramArr[i++] = customer.description;
    paramArr[i++] = customer.custType;
    paramArr[i++] = customer.note;
    paramArr[i++] = customer.active;
    paramArr[i++] = customer.ownerName;
    paramArr[i++] = customer.phoneNo;
    paramArr[i++] = customer.province;
    paramArr[i++] = customer.city;
    paramArr[i++] = customer.address;
    paramArr[i++] = customer.latitude;
    paramArr[i++] = customer.longitude;
    paramArr[i++] = customer.zipcode;
    paramArr[i++] = customer.ownerPhone;
    paramArr[i++] = customer.custSince;
    paramArr[i++] = customer.chainName;
    paramArr[i++] = customer.supportPayLater;
    paramArr[i++] = customer.contactName;
    paramArr[i++] = tenant;
    paramArr[i++] = customer.relationId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizCustomer ')
        return callback(error,rows);
    })

}

function updateCustomerBiz(tenant,params,callback){
    var query='update biz_customer set biz_id=? where relation_id=? and tenant=?';
    var paramArr = [] , i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.relationId;
    paramArr[i++] = tenant;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateCustomerBiz ')
        return callback(error,rows);
    })
}

function updateCustomerUser(tenant,params,callback){
    var query='update biz_customer set cust_id=? where relation_id=? and tenant=?';
    var paramArr = [] , i = 0;
    paramArr[i++] = params.custId;
    paramArr[i++] = params.relationId;
    paramArr[i++] = tenant;
    if (params.bizId !=null){
        query+=" and biz_id=?";
    }
    paramArr[i++] = params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateCustomerCust ')
        return callback(error,rows);
    })

}

module.exports = {
    getCustomerBiz:getCustomerBiz,
    getBizCustomer: getBizCustomer,
    getBizCustomerCount: getBizCustomerCount,
    addBizCustomer: addBizCustomer,
    delBizCustomer: delBizCustomer,
    updateBizCustomer: updateBizCustomer,
    updateCustomerBiz:updateCustomerBiz,
    updateCustomerUser:updateCustomerUser
};