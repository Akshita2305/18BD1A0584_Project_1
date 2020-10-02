const express=require('express');
const app=express();
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

const MongoClient=require('mongodb').MongoClient;
let server=require('./server');
let config=require('./config');
let middleware=require('./middleware');
const response=require('express');

const url='mongodb://127.0.0.1:27017';
const dbName='hospitalEquipments'; 
let db

MongoClient.connect(url,{useUnifiedTopology:true},(err,client)=>{
    if (err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Mongodb: ${url}`);
    console.log(`Database: ${dbName}`);
})
 
app.get('/hospitaldetails',middleware.checkToken, function(req,res){
    console.log("Fetching data from Hospital collection");
    var data=db.collection('hospital').find().toArray().then(result=>res.json(result));
});

app.get('/ventilatordetails',middleware.checkToken,(req,res)=>{
    console.log("Ventilator Information");
    var ventilatordetails=db.collection('ventilators').find().toArray().then(result=>res.json(result));
});

app.post('/searchventbystatus',middleware.checkToken,(req,res)=>{
    var status=req.body.status;
    console.log(status);
    var ventilatordetails=db.collection('ventilators').find({"status":status}).toArray().then(result=>res.json(result));
});

app.post('/searchventbyname',middleware.checkToken,(req,res)=>{
    var name=req.query.name;
    console.log(name);
    var ventilatordetails=db.collection('ventilators').find({'name':new RegExp(name,'i')}).toArray().then(result=>res.json(result));
});

app.post('/searchhospital',middleware.checkToken,(req,res)=>{
    var name=req.query.name;
    console.log(name);
    var hospitaldetails=db.collection('hospital').find({'Name':new RegExp(name,'i')}).toArray().then(result=>res.json(result));
});

app.put('/updateventilator',middleware.checkToken,(req,res)=>{
    var ventid={ventId:req.body.ventId};
    console.log(ventid);
    var newvalues={$set:{status:req.body.status}};
    db.collection("ventilators").updateOne(ventid,newvalues,function(err,result){
        res.json('1 document updated');
        if (err) throw err;
    });
});

app.post('/addventilatorbyuser',middleware.checkToken,(req,res)=>{
    var HId=req.body.hId;
    var ventilatorId=req.body.ventId;
    var status=req.body.status;
    var name=req.body.name;
    var item={
        hId:HId, ventId:ventilatorId, status:status, name:name
    };
    db.collection('ventilators').insertOne(item,function(err,result){
        res.json('1 item inserted');
        
    });
});

app.delete('/delete',middleware.checkToken,(req,res)=>{
    var myquery=req.query.ventId;
    console.log(myquery);
    var myquery1={ventiId:myquery};
    db.collection('ventilators').deleteOne(myquery1,function(err,obj){
        if (err) throw err;
        res.json('1 document deleted');
    });
});
app.listen(1100);