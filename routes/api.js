var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:3001/";

router.get('/v1/account/txs/:account_address', function(req, res, next) {
    MongoClient.connect(url, function(err, cli) {
        if (err) throw err;
        var db = cli.db("meteor");
        var query = {"events.attributes.value":req.params['account_address']};

        var sort_rule = {"height":-1}
        db.collection("transactions").find(query).sort(sort_rule).limit(50).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            res.send(result);
            cli.close();
        });
    });
});

router.get('/v1/account/transfer_txs/:account_address', function(req, res, next) {
    MongoClient.connect(url, function(err, cli) {
        if (err) throw err;
        var db = cli.db("meteor");
        var query = {
            $and: [
                {"tx.value.msg.type":"dip/MsgSend"},
                {$or: [
                    {"tx.value.msg.value.from_address":req.params['account_address']},
                    {"tx.value.msg.value.to_address":req.params['account_address']}
                ]}
            ]
        };
        var sort_rule = {"height":-1}
        db.collection("transactions").find(query).sort(sort_rule).limit(50).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            res.send(result);
            cli.close();
        });
    });
});

router.get('/v1/account/staking_txs/:account_address/:validator_address', function(req, res, next) {
    MongoClient.connect(url, function(err, cli) {
        if (err) throw err;
        var db = cli.db("meteor");

        var query = {
            $or: [
                {$and: [
                        {"tx.value.msg.type":"dip/MsgDelegate"},
                        {"tx.value.msg.value.delegator_address":req.params['account_address']},
                        {"tx.value.msg.value.validator_address":req.params['validator_address']},
                    ]},
                {$and: [
                        {"tx.value.msg.type":"dip/MsgUndelegate"},
                        {"tx.value.msg.value.delegator_address":req.params['account_address']},
                        {"tx.value.msg.value.validator_address":req.params['validator_address']},
                    ]},
                {$and: [
                        {"tx.value.msg.type":"dip/MsgBeginRedelegate"},
                        {"tx.value.msg.value.delegator_address":req.params['account_address']},
                        {$or: [
                            {"tx.value.msg.value.validator_src_address":req.params['validator_address']},
                            {"tx.value.msg.value.validator_dst_address":req.params['validator_address']},
                            ]}
                    ]}
            ]
        }

        var sort_rule = {"height":-1}
        db.collection("transactions").find(query).sort(sort_rule).limit(50).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            res.send(result);
            cli.close();
        });
    });
});

module.exports = router;
