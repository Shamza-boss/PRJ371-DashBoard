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
    //console.log(number);
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
  let form;
  if(req.file){

    form = new FormData();
   //generate file form from the files which we have uploaded and stored
   form.append('image', fs.createReadStream(req.file.destination+req.file.filename))
 
   //deletes file after upload to keep storage clear under uploads
   let deleteFile = ()=>{
    fs.rmSync(req.file.destination+req.file.filename, { recursive: true })
  }

//new/////////////////////////
let link1 = EnvDomain+'/api/plants?ascending=true';
let link2 = EnvDomain+'/api/ML/Prediction';

let request1 = axios.get(link1);
let request2 = axios({method:'post',url: link2, data: form, params: { device_id: 10125909 }, headers: {'Content-Type': 'multipart/form-data' }});

axios.all([request1, request2]).then(axios.spread((...responses)=>{
  const responseOne = responses[0];//get
  const responseTwo = responses[1];//post


  if(responseTwo.data.prediction.Plant=="Apple"){
    res.render('dashboardNew.ejs', {allplants: responseOne.data, topPlant: responseOne.data[0], result: responseTwo});

  }else if(responseTwo.data.prediction.Plant=="Blueberry"){
    res.render('dashboardNew.ejs', {allplants: responseOne.data, topPlant: responseOne.data[1], result: responseTwo});

  }else if(responseTwo.data.prediction.Plant=="Cherry"){
    res.render('dashboardNew.ejs', {allplants: responseOne.data, topPlant: responseOne.data[2], result: responseTwo});

  }else if(responseTwo.data.prediction.Plant=="Corn"){
    res.render('dashboardNew.ejs', {allplants: responseOne.data, topPlant: responseOne.data[3], result: responseTwo});

  }else if(responseTwo.data.prediction.Plant=="Grape"){
    res.render('dashboardNew.ejs', {allplants: responseOne.data, topPlant: responseOne.data[4], result: responseTwo});

  }else if(responseTwo.data.prediction.Plant=="Orange"){
    res.render('dashboardNew.ejs', {allplants: responseOne.data, topPlant: responseOne.data[5], result: responseTwo});

  }else if(responseTwo.data.prediction.Plant=="Peach"){
    res.render('dashboardNew.ejs', {allplants: responseOne.data, topPlant: responseOne.data[6], result: responseTwo});

  }else if(responseTwo.data.prediction.Plant=="Bell pepper"){
    res.render('dashboardNew.ejs', {allplants: responseOne.data, topPlant: responseOne.data[7], result: responseTwo});

  }else if(responseTwo.data.prediction.Plant=="Potato"){
    res.render('dashboardNew.ejs', {allplants: responseOne.data, topPlant: responseOne.data[8], result: responseTwo});

  }else if(responseTwo.data.prediction.Plant=="Raspberry"){
    res.render('dashboardNew.ejs', {allplants: responseOne.data, topPlant: responseOne.data[9], result: responseTwo});

  }else if(responseTwo.data.prediction.Plant=="Soybean"){
    res.render('dashboardNew.ejs', {allplants: responseOne.data, topPlant: responseOne.data[10], result: responseTwo});

  }else if(responseTwo.data.prediction.Plant=="Squash"){
    res.render('dashboardNew.ejs', {allplants: responseOne.data, topPlant: responseOne.data[11], result: responseTwo});

  }else if(responseTwo.data.prediction.Plant=="Strawberry"){
    res.render('dashboardNew.ejs', {allplants: responseOne.data, topPlant: responseOne.data[12], result: responseTwo});

  }else if(responseTwo.data.prediction.Plant=="Tomato"){
    res.render('dashboardNew.ejs', {allplants: responseOne.data, topPlant: responseOne.data[13], result: responseTwo});

  }else{
    let number = Math.floor(Math.random() * responseOne.data.length);
    res.render('dashboardNew.ejs', {allplants: responseOne.data, topPlant: responseOne.data[number], result: responseTwo});
  }
  
  //console.log("Form data",responseTwo);
  //console.log("Response from API 1",number);
 
})).catch(errors=>{
  res.render("Handler", {error: errors.message})
}).then(()=>{
  deleteFile();
})

//new/////////////////////////


   
 
   
    
  };
  
});

app.use((req, res)=>{
res.status(404).render("404")
})

app.listen(EnvPort, ()=> {
  console.log(`Your app is listening on localhost:${EnvPort}`);
});