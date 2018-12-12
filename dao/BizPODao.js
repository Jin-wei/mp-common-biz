/**
 * Created by Rina on 10/6/16.
 */

var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizPODao.js');

function getBizPO(params,callback){
    var query = "select biz_po.id, biz_po.biz_id AS bizId, c.name bizName,supplier_id supplierId, s.name supplierName, " +
        "biz_po.note,biz_po.status, sum(pi.commission) commission, sum(pi.amount) amount, sum(pi.quantity) quantity," +
        " biz_po.created_on AS createdOn, biz_po.updated_on AS updatedOn " +
        "from biz_po left join business c on biz_po.biz_id=c.biz_id " +
        "left join business s on biz_po.supplier_id=s.biz_id left join biz_po_item pi on biz_po.id=pi.po_id ";

    var paramArr = [], i = 0;
    var whereclause=_getBizPOWhereClause(paramArr,params);
    query+=whereclause;
    query+=" group by biz_po.id,bizId, bizName, supplierId,supplierName,biz_po.note,biz_po.status,createdOn,updatedOn ";
    query+=" order by biz_po.updated_on desc";

    i=paramArr.length;

    if(params.start!=null && params.size){
        query = query + " limit ?,? ";
        paramArr[i++] = Number(params.start);
        paramArr[i++] = Number(params.size);
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizPO ')
        return callback(error,rows);
    })
}

function getBizPOItem(params,callback){
    var query = "select pi.id, biz_po.biz_id AS bizId, c.name bizName, pi.prod_id AS prodId, pi.prod_type prodType, " +
        "pi.prod_parent_type prodParentType , pi.prod_name prodName, pi.prod_code prodCode, pi.quantity," +
        "pi.unit_price unitPrice, pi.unit_of_measure unitOfMeasure, biz_po.supplier_id supplierId, s.name supplierName, " +
        "pi.note,pi.status,pi.commission_rate commissionRate, pi.commission, pi.created_on AS createdOn, pi.updated_on AS updatedOn, " +
        "pi.pay_status as payStatus, pi.receive_status as receiveStatus " +
        "from biz_po left join business c on biz_po.biz_id=c.biz_id left join business s " +
        "on biz_po.supplier_id=s.biz_id join biz_po_item pi on biz_po.id=pi.po_id ";
    var paramArr = [], i = 0;
    var whereclause=_getBizPOItemWhereClause(paramArr,params);
    query+=whereclause;
    query+=" order by pi.updated_on desc";

    i=paramArr.length;

    if(params.start!=null && params.size){
        query = query + " limit ?,? ";
        paramArr[i++] = Number(params.start);
        paramArr[i++] = Number(params.size);
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizPOItem ')
        return callback(error,rows);
    })
}

function getBizPOCount(params,callback){
    var query = "select count(*) count from biz_po left join business c on biz_po.biz_id=c.biz_id left join business s " +
        "on biz_po.supplier_id=s.biz_id ";
    var paramArr = [], i = 0;
    var whereclause=_getBizPOWhereClause(paramArr,params);

    db.dbQuery(query+whereclause,paramArr,function(error,rows){
        logger.debug(' getBizPOCount ')
        return callback(error,rows);
    })
}

function getBizPOItemCount(params,callback){
    logger.info('-----------------')
    var query = "select count(*) count from biz_po left join business c on biz_po.biz_id=c.biz_id left join business s " +
        "on biz_po.supplier_id=s.biz_id join biz_po_item pi on biz_po.id=pi.po_id ";
    var paramArr = [], i = 0;
    var whereclause=_getBizPOItemWhereClause(paramArr,params);

    db.dbQuery(query+whereclause,paramArr,function(error,rows){
        logger.debug(' getBizPOItemCount ')
        return callback(error,rows);
    })
}

function _getBizPOWhereClause(paramArr,params){
    var query=" where biz_po.tenant= ? ";
    var i=0;
    paramArr[i++] =params.tenant;

    if (params.bizId){
        query+= ' and biz_po.biz_id=?';
        paramArr[i++] = params.bizId;
    }

    if (params.supplierId){
        query+= ' and biz_po.supplier_id=?';
        paramArr[i++] = params.supplierId;
    }

    if (params.id){
        query+= ' and biz_po.id=?';
        paramArr[i++] = params.id;
    }
    return query;
}

function _getBizPOItemWhereClause(paramArr,params){
    var query=" where biz_po.tenant= ? ";
    var i=0;
    paramArr[i++] =params.tenant;

    if (params.bizId){
        query+= ' and biz_po.biz_id=?';
        paramArr[i++] = params.bizId;
    }

    if (params.supplierId){
        query+= ' and supplier_id=?';
        paramArr[i++] = params.supplierId;
    }

    if (params.prodName){
        query+= ' and pi.prod_name like ?';
        paramArr[i++] = '%'+params.prodName+'%';
    }

    if (params.prodCode){
        query+= ' and pi.prod_code like ?';
        paramArr[i++] = '%'+params.prodCode+'%';
    }

    if (params.prodId){
        query+= ' and pi.prod_id = ?';
        paramArr[i++] = params.prodId;
    }

    if (params.id){
        query+= ' and pi.id = ?';
        paramArr[i++] = params.id;
    }

    if (params.poId){
        query+= ' and pi.po_id = ?';
        paramArr[i++] = params.poId;
    }
    if (params.startDate){
        query+= ' and pi.created_on >= ?';
        paramArr[i++] = params.startDate + ' 00:00:00';
    }
    if (params.endDate){
        query+= ' and pi.created_on <= ?';
        paramArr[i++] = params.endDate + ' 23:59:59';
    }
    if (params.supplierName){
        query+= ' and s.name = ?';
        paramArr[i++] = params.supplierName;
    }
    if (params.bizName){
        query+= ' and c.name = ?';
        paramArr[i++] = params.bizName;
    }
    if (params.payStatus) {
        query+=' and pay_status = ?';
        paramArr[i++] = params.payStatus;
    }
    if (params.receiveStatus) {
        query+=' and receive_status = ?';
        paramArr[i++] = params.receiveStatus;
    }

    return query;
}


function addBizPO(tenant,params ,callback){
    var query = "insert into biz_po (tenant,biz_id,supplier_id,note, status," +
        "created_by,updated_by) " +
        "values(?,?,?,?,?,?,?)";
    var paramArr = [], i = 0;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.supplierId;
    paramArr[i++] = params.note;
    paramArr[i++] = params.status;
    paramArr[i++] = params.createdBy;
    paramArr[i++] = params.updatedBy;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizPO ')
        return callback(error,rows);
    });
}

function addBizPOItem(tenant,params ,callback){
    var query = "insert into biz_po_item (tenant,po_id,prod_id,prod_type,prod_parent_type,prod_name," +
        "prod_code,quantity,unit_price,unit_of_measure,note, status," +
        "created_by,updated_by,amount,commission,commission_rate,pay_status,receive_status) " +
        "values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    var paramArr = [], i = 0;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.poId;
    paramArr[i++] = params.prodId;
    paramArr[i++] = params.prodType;
    paramArr[i++] = params.prodParentType;
    paramArr[i++] = params.prodName;
    paramArr[i++] = params.prodCode;
    paramArr[i++] = params.quantity;
    paramArr[i++] = params.unitPrice;
    paramArr[i++] = params.unitOfMeasure;
    paramArr[i++] = params.note;
    paramArr[i++] = params.status;
    paramArr[i++] = params.createdBy;
    paramArr[i++] = params.updatedBy;
    paramArr[i++] = params.amount;
    paramArr[i++] = params.commission;
    paramArr[i++] = params.commissionRate;
    paramArr[i++] = params.payStatus;
    paramArr[i++] = params.receiveStatus;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizPOItem ')
        return callback(error,rows);
    });
}

function delBizPO(tenant,params ,callback){
    var query='delete FROM biz_po where tenant=?'
    var paramArr = [] , i = 0;
    paramArr[i++] = tenant;

    if(params.id){
        query+= ' and id=?';
        paramArr[i++] = params.id;
    }

    if(params.bizId){
        query+= ' and biz_id=?';
        paramArr[i++] = params.bizId;
    }

    if(params.status){
        query+= ' and status=?';
        paramArr[i++] = params.status;
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delBizPO ')
        return callback(error,rows);
    })
}

function delBizPOItem(tenant,params ,callback){
    var query='delete FROM biz_po_item where tenant=?'
    var paramArr = [] , i = 0;
    paramArr[i++] = tenant;

    if(params.id){
        query+= ' and id=?';
        paramArr[i++] = params.id;
    }

    if(params.poId){
        query+= ' and po_id=?';
        paramArr[i++] = params.poId;
    }

    if(params.status){
        query+= ' and status=?';
        paramArr[i++] = params.status;
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delBizPOItem ')
        return callback(error,rows);
    })
}

function updateBizPO(tenant, po , callback){
    var query='update biz_po set supplier_id = ? ,note = ? ' +
        'where tenant=? and id=? and biz_Id=?';

    //Set mysql query parameters array
    var paramArr = [] , i = 0;
    paramArr[i++] = po.supplierId;
    paramArr[i++] = po.note;
    paramArr[i++] = po.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizPO ')
        return callback(error,rows);
    })
}

function updateBizPOItem(tenant, po , callback){
    var query='update biz_po_item set prod_id = ? ,prod_type = ?,prod_parent_type = ? ,prod_name = ? , ' +
        'prod_code = ?, quantity = ? ,unit_price = ?, unit_of_measure = ?, commission_rate=?, commission, amount=?,note = ? ' +
        'where tenant=? and id=? and po_id=? ';

    //Set mysql query parameters array
    var paramArr = [] , i = 0;
    paramArr[i++] = po.prodId;
    paramArr[i++] = po.prodType;
    paramArr[i++] = po.prodParentType;
    paramArr[i++] = po.prodName;
    paramArr[i++] = po.prodCode;
    paramArr[i++] = po.quantity;
    paramArr[i++] = po.unitPrice;
    paramArr[i++] = po.unitOfMeasure;
    paramArr[i++] = po.commissionRate;
    paramArr[i++] = po.commission;
    paramArr[i++] = po.amount;
    paramArr[i++] = po.note;
    paramArr[i++] = tenant;
    paramArr[i++] = po.id;
    paramArr[i++] = po.poId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizPOItem ')
        return callback(error,rows);
    })
}

function updateBizPOStatus(tenant,params,callback){
    var query='update biz_po set status=? where id=? and tenant=?';
    var paramArr = [] , i = 0;
    paramArr[i++] = params.status;
    paramArr[i++] = params.id;
    paramArr[i++] = tenant;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizPOStatus ')
        return callback(error,rows);
    })
}

function updateBizPOItemStatus(tenant,params,callback){
    var query='update biz_po_item set status=? where id=? and tenant=?';
    var paramArr = [] , i = 0;
    paramArr[i++] = params.status;
    paramArr[i++] = params.id;
    paramArr[i++] = tenant;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizPOItemStatus ')
        return callback(error,rows);
    })
}

function updateBizPOItemPayStatus(tenant,params,callback){
    var query='update biz_po_item set pay_status=? where id=? and tenant=?';
    var paramArr = [] , i = 0;
    paramArr[i++] = params.payStatus;
    paramArr[i++] = params.id;
    paramArr[i++] = tenant;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizPOItemPayStatus ');
        return callback(error,rows);
    })
}

function updateSupplierPOItemReceiveStatus(tenant,params,callback){
    var query='update biz_po_item set receive_status=? where id=? and tenant=?';
    var paramArr = [] , i = 0;
    paramArr[i++] = params.receiveStatus;
    paramArr[i++] = params.id;
    paramArr[i++] = tenant;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateSupplierPOItemReceiveStatus ');
        return callback(error,rows);
    })
}

module.exports = {
    getBizPO: getBizPO,
    getBizPOItem: getBizPOItem,
    addBizPO:addBizPO,
    addBizPOItem:addBizPOItem,
    updateBizPO:updateBizPO,
    delBizPO:delBizPO,
    delBizPOItem:delBizPOItem,
    updateBizPOStatus:updateBizPOStatus,
    getBizPOCount:getBizPOCount,
    getBizPOItemCount:getBizPOItemCount,
    updateBizPOItemStatus:updateBizPOItemStatus,
    updateBizPOItemPayStatus:updateBizPOItemPayStatus,
    updateSupplierPOItemReceiveStatus:updateSupplierPOItemReceiveStatus
};