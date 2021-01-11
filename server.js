const express = require('express');
const mysql = require('mysql');
const uuid = require('uuid').v4;
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const port = process.env.PORT || 3000; 

//EXPRESS SETUP---------------------------------------------------------------------------------------------------
const app = express();
app.use(bodyParser.urlencoded({ extended : false }));
app.use('/public', express.static('public'));



//PUG SETUP-------------------------------------------------------------------------------------------------------
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));



//SQL DATABASE SETUP----------------------------------------------------------------------------------------------
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'database_name'

});

db.connect((err) =>{
    if(err) throw err;
    console.log('Connected to Database');
})



//MULTER SETUP----------------------------------------------------------------------------------------------------
const storage = multer.diskStorage({
    destination : (req, file, cb) =>{
        cb(null, './public/uploads')
    },
    filename : (req, file, cb) =>{
        cb(null, `${uuid()}-${file.originalname}`)
    } 
});


const upload = multer({ storage: storage });



//END POINTS------------------------------------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.status(200).render('home.pug');
});

app.get('/register', (req, res) => {
    res.status(200).render('register.pug');
})

app.get('/searchUser', (req, res) =>{
    res.status(200).render('search.pug');
});

app.post('/submit', upload.fields([{name: 'aadharFront', maxCount: 1}, {name: 'aadharBack', maxCount: 1}, {name: 'driving', maxCount: 1}]), (req, res) => {

    let sql = `INSERT INTO userlist values(null, '${req.body.name}', '${req.body.number}', '${req.body.addressl1}', '${req.body.addressl2}', '${req.body.city}', '${req.body.state}', '${req.body.pin}', '${req.body.aadharNo}', '${req.files['aadharFront'][0].filename}', '${req.files['aadharBack'][0].filename}', '${req.body.drivingNumber}', '${req.files['driving'][0].filename}', '${req.body.drivingExpiry}')`;

    db.query(sql, (err, rows, fields) =>{
        if(err){
            res.render('duplicate.pug');
        }
        res.render('display.pug', {
            name : req.body.name,
            mobile : req.body.number,
            addressl1 : req.body.addressl1,
            addressl2 : req.body.addressl2,
            city : req.body.city,
            state : req.body.state,
            pin : req.body.pin,
            aadharNo : req.body.aadharNo,
            aadharFront : req.files['aadharFront'][0].filename,
            aadharBack : req.files['aadharBack'][0].filename,
            drivingNumber : req.body.drivingNumber,
            driving: req.files['driving'][0].filename,
            drivingExpiry: req.body.drivingExpiry

        });
    });

});

app.post('/search', (req, res) =>{
    let sql = `SELECT * FROM userlist WHERE Mobile_no = '${req.body.mobile}'`;

    db.query(sql, (err, rows, fields) =>{
        if(err) throw err;

        if(rows.length > 0){
            res.status(200).render('display.pug', {
                name: rows[0].Name,
                mobile : rows[0].Mobile_no,
                addressl1 : rows[0].Address_l1,
                addressl2 : rows[0].Address_l2,
                city : rows[0].City,
                state : rows[0].State,
                pin : rows[0].Pin_code,
                aadharNo : rows[0].Aadhar_no,
                aadharFront : rows[0].Aadhar_front_pid,
                aadharBack : rows[0].Aadhar_back_pid,
                drivingNumber : rows[0].Driving_licence_no,
                driving: rows[0].Driving_licence_pid,
                drivingExpiry: rows[0].Driving_Expiry
            });
        }else{
            res.status(200).render('nouser.pug');
        }
    })
});

app.listen(port, () => {
    console.log(`The app is running on the port: ${port}`);
});
