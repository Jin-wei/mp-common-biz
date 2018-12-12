/**
 * Created by ling xue  on 15-8-28.
 */

var mysqlConnectOptions ={
    user: '@@mysqlUser',
    password: '@@mysqlPass',
    database:'@@mysqlDB',
    host: '@@mysqlHost' ,
    charset : 'utf8mb4'
    //,dateStrings : 'DATETIME'
};

var loggerConfig = {
    level : '@@logLevel',
    config : {
        appenders: [
            { type: 'console' },
            {
                "type": "file",
                "filename": "@@logFileFullName",
                "maxLogSize": @@logMaxSize,
            "backups": @@logBackups
}
]
}
};

var elasticSearchOption ={
    host: '@@elasticUrl',
    log: '@@elasticLogLevel'
};

var bizCustomer={
    defaultBizId:@@defaultCustomerBizId
};

var loginModuleUrl = {protocol:"@@loginModuleProtocol",host:"@@loginModuleHost", port:@@loginModulePort};

var auth={
    tenant:   "@@authTenant",
    userName:"@@authUserName",
    password:"@@authPassword"
};


function getMysqlConnectOptions (){
    return mysqlConnectOptions;
}

function getElasticSearchOption(){
    return elasticSearchOption;
}

var maxAge=@@maxAge;

module.exports = {
    getMysqlConnectOptions : getMysqlConnectOptions,
    loggerConfig : loggerConfig,
    getElasticSearchOption: getElasticSearchOption,
    loginModuleUrl:loginModuleUrl,
    bizCustomer:bizCustomer,
    auth:auth,
    maxAge:maxAge
}