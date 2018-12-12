/**
 * Created by Rina on 10/13/16.
 */
var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizCustomerPriceDao.js');

//bizCustomerRelDao
function getBizCustomerPrice(params,callback){
    var query = "select b.name bizName, bc.cust_id custId,bc.name custName, " +
        "bcp.price_id priceId,bcp.biz_id bizId,bcp.relation_id relationId,bcp.prod_id prodId,bcp.tenant," +
        "bcp.prod_code prodCode,bcp.prod_name prodName, bcp.start_date startDate,bcp.end_date endDate,bcp.price, " +
        "bcp.description, bcp.created_on createdOn, bcp.updated_on updatedOn from biz_customer_price bcp, biz_customer bc,business b" +
        " where bcp.tenant= ?  and bcp.biz_id=b.biz_id and bcp.relation_id=bc.relation_id";

    var paramArr = [], i = 0;
    paramArr[i++] =params.tenant;

    if (params.custId !=null){
        query+= ' and bc.cust_id=?';
        paramArr[i++] = params.custId;
    }

    if (params.relationId !=null){
        query+= ' and bcp.relation_id=?';
        paramArr[i++] = params.relationId;
    }

    if (params.prodId!=null){
        query+= ' and bcp.prod_id=?'
        paramArr[i++] = params.prodId;
    }
    if (params.priceId!=null){
        query+= ' and bcp.price_id=?'
        paramArr[i++] = params.priceId;
    }
    if (params.bizId!=null){
        query+= ' and bcp.biz_id=?'
        paramArr[i++] = params.bizId;
    }

    if(params.start!=null && params.size){
        paramArr[i++] = Number(params.start);
        paramArr[i++] = Number(params.size);
        query = query + " limit ? , ? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizCustomerPrice ')
        return callback(error,rows);
    })
}

function addBizCustomerPrice(tenant,params,callback){
    var query = "insert into biz_customer_price (tenant,biz_id,relation_id,prod_id,prod_name,prod_code," +
        "start_date,end_date,price,description) values(?,?,?,?,?,?,?,?,?,?)";
    var paramArr = [], i = 0;
    paramArr[i++] = tenant;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.relationId;
    paramArr[i++] = params.prodId;
    paramArr[i++] = params.prodName;
    paramArr[i++] = params.prodCode;
    paramArr[i++] = params.startDate;
    paramArr[i++] = params.endDate;
    paramArr[i++] = params.price;
    paramArr[i++] = params.description;


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizCustomerPrice ')
        return callback(error,rows);
    });
}

function updateBizCustomerPrice(tenant, bizCustomerPrice , callback){

    var query='update biz_customer_price set start_date = ?, end_date = ?, price = ?, description = ?,prod_name=?,prod_code=? ,prod_id=?' +
        ' where tenant=? and biz_id=? and price_id=?;'

    //Set mysql query parameters array
    var paramArr = [] , i = 0;
    paramArr[i++] = bizCustomerPrice.startDate;
    paramArr[i++] = bizCustomerPrice.endDate;
    paramArr[i++] = bizCustomerPrice.price;
    paramArr[i++] = bizCustomerPrice.description;
    paramArr[i++] = bizCustomerPrice.prodName;
    paramArr[i++] = bizCustomerPrice.prodCode;
    paramArr[i++] = bizCustomerPrice.prodId;

    paramArr[i++] = tenant;
    paramArr[i++] = bizCustomerPrice.bizId;
    paramArr[i++] = bizCustomerPrice.priceId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizCustomerPrice ')
        return callback(error,rows);
    })

}

function delBizCustomerPrice(tenant, params,callback){
    var query='delete FROM biz_customer_price where biz_id=? and tenant=?'
    var paramArr = [] , i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = tenant;

    if(params.relationId){
        query+= ' and relation_id=?';
        paramArr[i++] = params.relationId;
    }

    if(params.prodId){
        query+= ' and prod_id=?';
        paramArr[i++] = params.prodId;
    }

    if(params.priceId != null){
        paramArr[i++] = params.priceId;
        query = query + " and price_id=?  "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delBizCustomerPrice ')
        return callback(error,rows);
    })

}


module.exports = {
    getBizCustomerPrice: getBizCustomerPrice,
    addBizCustomerPrice: addBizCustomerPrice,
    updateBizCustomerPrice: updateBizCustomerPrice,
    delBizCustomerPrice: delBizCustomerPrice
};