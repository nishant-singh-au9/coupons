const express = require('express')
const app = express()
const port = process.env.PORT || 5300
const cors = require('cors')
const session = require('express-session')
const mongodb = require('mongodb')
let db;
const MongoClient = mongodb.MongoClient
const mongourl =
    "mongodb+srv://admin:admin@cluster0.ka8dm.mongodb.net/couponstore?retryWrites=true&w=majority";
const voucher_codes = require('voucher-code-generator');

const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(
    session({
        secret: "youCanGiveAnyValueHere",
    })
);
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user, cb)=> {
    cb(null, userprofile)
})
passport.deserializeUser((user, done) => {
    done(null, userprofile)
})

app.get('/', (req, res) => {
    res.send('app id working')
})

app.post('/addcoupon', (req, res) => {
    let code = voucher_codes.generate({length: 8,count: 1})
    let qrlink = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${code[0].toUpperCase()}`

    let coupon = {
        code : code[0].toUpperCase(),
        qrlink : qrlink,
        isActive : false,
        category : req.body.category,
        website: req.body.website,
        websitelink : req.body.websitelink,
        websiteimage : req.body.websiteimage,
        discount : req.body.discount
    }

    db.collection("coupons").insert(coupon, (err, result) => {
        return res.send('data added');
    });
})


//get all active coupons
app.get('/allcoupons', (req, res) => {
    let query = {isActive: true}
    db.collection("coupons").find(query).toArray((err, data) => {
        if(err) throw err
        return res.send(data)
    })
})

//get coupons by category
app.get('/category', (req, res) => {
    let query = {isActive: true, category: req.body.category}
    db.collection("coupons").find(query).toArray((err, data) => {
        if(err) throw err
        return res.send(data)
    })
})

//get coupons by website and category
app.get('/webcategory', (req, res) => {
    let query = {isActive: true, category: req.body.category, website: req.body.website}
    db.collection("coupons").find(query).toArray((err, data) => {
        if(err) throw err
        return res.send(data)
    })
})

//get all expired coupons
app.get('/allexpired', (req, res) => {
    let query = {isActive: false}
    db.collection("coupons").find(query).toArray((err, data) => {
        if(err) throw err
        return res.send(data)
    })
})

//get all expired coupons by category
app.get('/expiredcategory', (req, res) => {
    let query = {isActive: false, category: req.body.category}
    db.collection("coupons").find(query).toArray((err, data) => {
        if(err) throw err
        return res.send(data)
    })
})

MongoClient.connect(mongourl, (err, connection) => {
    if (err) throw err;
    db = connection.db("couponstore");
});


app.listen(port, (err) => {
    if (err) throw err;
    console.log(`server is ruuning on port ${port}`);
});