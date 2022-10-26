require("dotenv").config();

const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const app = express();
const multer = require('multer');
var fs = require('fs');


let storage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null,"./public/uploads/");
  },
  filename: (req, file, cb)=>{
    cb(null, Date.now()+file.originalname);
  }
});

let fileFilter = (req, file, cb)=>{
  if(file.formFile ==='image/jpeg'||file.formFile ==='image/jpg'||file.formFile ==='image/png'){
    cb(null, true);
  }else{
    cb(null, false);
  }
}

let upload = multer({
  storage: storage
});


app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

let EnvDomain = process.env.APIDOMAIN||'http://127.0.0.1:5000';
let EnvPort = process.env.PORT||8080;

app.get('/', (req, res)=> {
  res.render('index');
});

app.get('/Dashboard', (req, res)=>{

  axios({ 
    method: 'GET',
    url:EnvDomain+'/api/plants?ascending=true'
  })
  .then(response => {
    let number = Math.floor(Math.random() * response.data.length);
    console.log(number);
    res.render('dashboardNew.ejs', {allplants: response.data, topPlant: response.data[number], result: null});
  })
  .catch(error => {
    console.log(error);
     res.render("Handler", {error: error.message})
  })
  
});

app.get('/Dashboard/:PlantID', (req, res)=> {
  
  //Renders website with plant chosen on dashboard
  axios({ 
    method: 'GET',
    url:EnvDomain+'/api/plants?ascending=true'
  })
  .then(response => {
    let QueryPlant = req.params.PlantID;
    let number = parseInt(QueryPlant) - 1;
    res.render('dashboardNew.ejs', {allplants: response.data, topPlant: response.data[number], result: null});
  })
  .catch(error => {
    console.log(error);
     res.render("Handler", {error: error.message})
  })
});

app.get('/test', (req, res)=> {
    res.render('ImageUp', {result: null});
});


app.post('/TestImage',upload.single('file'), (req, res)=> {
  if(req.file){
   //console.log(resData);

   //Generate new FormConstructor
   let form = new FormData();
   //generate file form from the files which we have uploaded and stored
   form.append('data', fs.createReadStream(req.file.destination+req.file.filename))
 
   //send new form to api on the specified path
   axios({ 
     method: 'POST',
     url:EnvDomain+'/ML/Prediction',
     data: form
   })
   .then(response1 => {
     console.log(response1.data)
     ///////////// Start: Render Dashboard content //////////
     axios({ 
      method: 'GET',
      url:EnvDomain+'/api/plants?ascending=true'
    })
    .then(response => {
      let QueryPlant = req.params.PlantID;
      let number = parseInt(QueryPlant) - 1;
      res.render('dashboardNew.ejs', {allplants: response.data, topPlant: response.data[number], result: response1.data});
    })
    .catch(error => {
      console.log(error);
      res.render("Handler", {error: error.message})
    })
     ///////////// Start: Render Dashboard content //////////
   })
   .catch(error => {
     console.log(error);
     res.render("Handler", {error: error.message})
   });

   
 
   //deletes file after upload to keep storage clear under uploads
   let deleteFile = ()=>{
     fs.rmSync(req.file.destination+req.file.filename, { recursive: true })
   }
   setTimeout(deleteFile,500);
    
  };
  
});

app.use((req, res)=>{
res.status(404).render("404")
})

app.listen(EnvPort, ()=> {
  console.log(`Your app is listening on localhost:${EnvPort}`);
});