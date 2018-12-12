/**
 * Created by ling xue  on 15-8-28.
 */

var mysqlConnectOptions ={
    user: 'root',
    password: '123456',
    database:'common-biz',
    host: '127.0.0.1' ,
    charset : 'utf8mb4'
    //,dateStrings : 'DATETIME'
};

var loggerConfig = {
    level : 'DEBUG',
    config : {
        appenders: [
            { type: 'console' },
            {
                "type": "file",
                "filename": "../common-biz.log",
                "maxLogSize": 2048000,
            "backups": 10
}
]
}
};

var elasticSearchOption ={
    host: '127.0.0.1:9200',
    log: 'trace'
};

var bizCustomer={
    defaultBizId:2
};

var loginModuleUrl = {protocol:"http",host:"59.111.97.208", port:18091};

var auth={
    tenant:   "jjc",
    userName:"jjcadmin",
    password:"jjcadmin"
};


function getMysqlConnectOptions (){
    return mysqlConnectOptions;
}

function getElasticSearchOption(){
    return elasticSearchOption;
}

var maxAge=0;

module.exports = {
    getMysqlConnectOptions : getMysqlConnectOptions,
    loggerConfig : loggerConfig,
    getElasticSearchOption: getElasticSearchOption,
    loginModuleUrl:loginModuleUrl,
    bizCustomer:bizCustomer,
    auth:auth,
    maxAge:maxAge
}