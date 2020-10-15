const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const fileupload = require('express-fileupload');
const admin = require('firebase-admin');


const port = process.env.DB_PORT || 4000;


var serviceAccount = require("./configs/creative-agency-b3e0e-firebase-adminsdk-66cnr-98360a74ce");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
});

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qulux.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true  });


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());
app.use(express.static('uploads'));
app.use(fileupload());


client.connect(err => {
    const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("services");
    const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");
    const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");
    const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admins");
    console.log('database connected');

    app.post('/allService',(req,res)=>{
        const allServices = req.body;
        serviceCollection.insertOne(allServices)
        .then((result)=>{
            res.send('added',result)
        })
    });
    app.get('/allService',(req,res)=>{
        serviceCollection.find({})
        .toArray((err,documents)=>{
            res.send(documents)
        })
    });
    app.post('/allOrder',(req,res)=>{
        const allOrder=req.body
        orderCollection.insertOne(allOrder)
        .then(result=>{
            res.send('added',result)
        })
    });
    app.get('/allOrder/',(req,res)=>{
        const bearer = req.headers.authorization;
        if(bearer && bearer.startsWith('Bearer ')){
            const idToken = bearer.split(' ')[1];
            console.log(idToken);
            admin.auth().verifyIdToken(idToken)
            .then(function(decodedToken) {
            let tokenEmail = decodedToken.email;
            let queryEmail= req.query.email;
            console.log(tokenEmail,queryEmail);
            if(tokenEmail == queryEmail){
                orderCollection.find({email:queryEmail})
                .toArray((err,documents)=>{
                res.send(documents)
                })
            }
            }).catch(function(error) {
                res.status(401).send('Unauthorized access')
            });
            }
            else{
                res.send('Access denied')
            }
    });
    app.post('/allReview',(req,res)=>{
        const allReview=req.body;
        reviewCollection.insertOne(allReview)
        .then(result=>{
            res.send('added',result)
        })
    });
    app.get('/allReview',(req,res)=>{
        reviewCollection.find({})
        .toArray((err,documents)=>{
            res.send(documents)
        })
    });
    app.post('/addAdmin',(req,res)=>{
        const addAdmin=req.body
        adminCollection.insertOne(addAdmin)
        .then((result)=>{
            res.send('added',result)
        })
    });
    app.post('/admin',(req,res)=>{
        const admin=req.body
        adminCollection.find({email:admin.email})
        .toArray((err,documents)=>{
            res.send(documents.length >0)
        })
    });
    app.get('/orders',(req,res)=>{
        orderCollection.find({})
        .toArray((err,documents)=>{
            res.send(documents)
        })
    })
});






// app.get('/',(req,res)=>{
//     res.sendFile(__dirname + '/index.html')
// })

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
    
})