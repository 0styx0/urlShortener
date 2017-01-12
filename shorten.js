 var mongo = require('mongodb').MongoClient;



var express = require('express');


    var app = express();
    
    app.use(function(req, res) {

		var url = decodeURI(req.url.slice(1));

        if (/^https?:\/\/www\..+\.[a-z]{2,3}/.test(url)) {
            return insert(res, url);
        }
        
        find(res, url);

    });

    app.listen(8080);



function insert(res, original) {
    
    var short;

    mongo.connect("mongodb://localhost:27017/urlShorten", function(err, db) {

        if (err) {
            return console.log(err);
        }

        db.collection("urls").find().sort(
            {
                shortened:-1
            }
        ).limit(1).toArray(function(err, doc) {

            if (err) {
                return console.log(err);
            }
            
            // if nothing in db, start at 0
            short = (doc[0]) ? +doc[0].shortened + 1 : 0;


            db.collection("urls").insert({
                    
                        'original':original,
                        'shortened': short
                    
                },function(err, docs) {

                if (err) {
                    return console.log(err);
                }

                res.end(short.toString());
                
                db.close();

            });	     

        });

    }); 
}




function find(res, url) {

       mongo.connect("mongodb://localhost:27017/urlShorten", function(err, db) {

        if (err) {
            return console.log(err);
        }

        db.collection("urls").find({
                
                    'shortened':+url
                
            }).toArray(function(err, docs) {

            if (err) {
                return console.log(err);
            }
            
             if (docs[0]) {
                 res.redirect(docs[0].original.toString());
             }
             else {
                 res.end("Shortener not found.");
             }
        });	     

        db.close();
    }); 
}