var assert = require("assert");
var request1= require('supertest');
var sysConfig=require("../config/SystemConfig.js");

exports.test=function(client){describe('service: prod', function() {

    describe('Test get prod list', function () {
        it('should get a list of prod', function (done) {
            client.get('/api/biz/0/prod', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length > 0, "prod list length>0");
                    done();
                }
            });
        });

        it('should get a prod', function (done) {
            client.get('api/biz/0/prod/2010015', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.prod_id == 2010015, "product id found");
                    done();
                }
            });
        });

        it('should get a list of prod by type', function (done) {
            client.get('api/biz/0/prodType/103/prod', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.type_id == 103, "type id found");
                    done();
                }
            });
        });

        it('should prod with comment', function (done) {
            client.get('/api/biz/0/prod/2010015/prod', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.prod_id == 2010015, "product id found");
                    done();
                }
            });
        });

        it('should get comment by prod', function (done) {
            client.get('/api/biz/0/prod/2010015/prodComment', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.prod_id == 2010015, "product id found");
                    done();
                }
            });
        });
    });

    describe('Test  product comment api', function () {
        it('should add a product comment ', function (done) {
            client.post('/api/biz/0/prod/2010015/prodComment', {'comment': 'wonderful', 'rating': 3}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.affectedRows > 0, "prod list length>0");
                    done();
                }
            });
        });
    });
    /*describe('Test CRUD a prod', function () {

        var prodId = null;


        it('-- create new product', function (done) {
            request
                .post('/biz/0/prod')
                .type('form').field('name', 'aa1')
                .field('description', 'bb')
                .field('type_id', 1)
                .field('price', 1000)
                .field('note', 'xxyybb')
                .end(function(err, res) {
                    prodId = res.body.prod_id;
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(prodId > 0, "prod should be created");
                        done();
                    }
                });
            client.post('/biz/0/prod', {name: "aa", description: "bb", type: "abc", price: 123, note: "aabb"}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    prodId = data.prod_id;
                    assert(prodId > 0, "prod should be created");
                    done();
                }
            });
        });

        it('-- get new created product', function (done) {
            client.get('/biz/0/prod/' + prodId, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert('aa1' == data.name, "name match");
                    assert('bb' == data.description, "description match");
                    assert(1 == data.type_id, "type match");
                    assert(1000 == data.price, "price match");
                    assert('aabb' == data.note, "note match");
                    assert(1 == data.active, "active match");
                    done();
                }


            });
        });

        it('-- update product', function (done) {
            client.put('/biz/0/prod/' + prodId, {name: "aa1", description: "bb1", type_id: 1, price: 1234, note: "aabb1", active: 0}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.succeed == true, "prod should be updated ");
                    done();
                }
            });
        });

        it('-- verify updated product', function (done) {
            client.get('/biz/0/prod/' + prodId, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert('aa1' == data.name, "name match");
                    assert('bb1' == data.description, "description match");
                    assert(1 == data.type_id, "type match");
                    assert(1234 == data.price, "price number match");
                    assert('aabb1' == data.note, "note match");
                    assert(0 == data.active, "active match");
                    done();
                }

            });
        });

        it('-- verify delete product', function (done) {
            client.del('/biz/0/prod/' + prodId, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.succeed == true, "prod should be deleted ");
                    done();
                }

            });
        });

        it('-- verify get top product', function (done) {
            client.get('/biz/get/topDish'+"?size=10&latitude=37.533&longitude=-121.920&distance=1000", function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length >=0, "Top dishes list should be not empty ");
                    done();
                }

            });
        });

        it('-- verify get top product without size', function (done) {
            client.get('/biz/get/topDish?latitude=37.533&longitude=-121.920&distance=1000', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length >=0, "Top dishes list should be not empty ");
                    done();
                }

            });
        });

        it('-- update product active', function (done) {
            client.put('/biz/0/prodActive/100001', {active:"0"}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {

                    assert(data.success == true, "prod active should be updated");
                    done();
                }
            });
        });
    });*/


    /*describe('Test product count by biz id', function () {
        it('-- get business active product count', function (done) {
            client.get('/biz/0/productCount', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {

                    assert(data.productCount > 0, "product count should be get");
                    done();
                }
            });
        });

        it('-- get business  product type count', function (done) {
            client.get('/biz/0/productTypeCount', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {

                    assert(data.productTypeCount > 0, "product type count should be get");
                    done();
                }
            });
        });
    });*/


    /*describe('Test get product type list', function () {
        it('should get a list of prodType', function (done) {
            client.get('/biz/0/prodType', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length > 0, "prod type list length>0");
                    done();
                }
            });
        });

        it('should get a prod type', function (done) {
            client.get('/biz/0/prodType/1', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data[0].type_id == 1, "product id found");
                    done();
                }
            });
        });


        it('-- create new product type', function (done) {
            client.post('/biz/0/prodType', {name: "productType",  name_lang: "菜品类型"}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    var type_id = data.prodTypeId;
                    assert(type_id > 0, "prod type should be created");
                    done();
                }
            });

        });

        it('-- update a product type', function (done) {
            client.put('/biz/0/prodType/1', {name: "productType",  nameLang: "菜品类型" , active:"1"}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {

                    assert(data.success == true, "prod type should be updated");
                    done();
                }
            });

        });

        it('-- delete a product type', function (done) {
            client.del('/biz/100001/prodType/1',  function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {

                    assert(data.success == true, "prod type should be deleted");
                    done();
                }
            });

        });
    });*/

});
}