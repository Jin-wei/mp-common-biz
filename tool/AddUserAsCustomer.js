var bizCustomer=require('../bl/BizCustomer.js');
var apiClient=require('../bl/APIClient.js');
var Seq = require('seq');
//command line tool to add register user as customer
//todo change this to rabbit mq listener
(function main() {
    var token = null,users=null;
    Seq().seq(function(){
        var that=this;
        apiClient.getAuthToken(function(error,result){
            if (error){
                console.log("get token failed");
                process.exit(0);
            }else{
                token=result;
                that();
            }
        })
    }).seq(function(){
        var that=this;
        apiClient.getUsers("jjc",token,function(error,results){
            if (error){
                console.log("fail to get user");
                process.exit(0);
            }else{
                users=results;
                that();
            }
        });
    }).seq(function() {
        Seq(users).seqEach(function (user, i) {
                var that = this;
                bizCustomer.addUserAsCustomer("jjc", user, function (error, result) {
                    if (error) {
                        console.log("add a user as customer failed:" + error.message);
                    } else {
                        console.log("add a user as customer succeed:" + result);

                    }
                    that(null, i);
                });
            }
        ).seq(function () {
                process.exit(0);
            })
    })
})();