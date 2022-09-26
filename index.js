require("dotenv").config();

let port = process.env.PORT;

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
app.set('view engine', 'ejs')
//app.use(upload.array()); 


app.get('/', (req, res)=> {
  res.render('DashBoard');
});

app.get('/test', (req, res)=> {
    res.render('ImageUp');
});


app.post('/TestImage',upload.single('file'), (req, res)=> {
  console.log("line 49")
  if(req.file){
   let resData = TestAgainstAPI(req);
   //console.log(resData);
   let respond = ()=>{
    res.send(resData);
   }

   setTimeout(respond, 600);
    
  };
  
});

//fix API query
let TestAgainstAPI = (dataI) => {
  let result;

  //Generate new FormConstructor
  let form = new FormData();

  //generate file form from the files which we have uploaded and stored
  form.append('data', fs.createReadStream(dataI.file.destination+dataI.file.filename))

  //send new form to api on the specified path
  axios({ 
    method: 'POST',
    url:'http://localhost:8081/ML/Prediction',
    data: form
  })
  .then(res => {
    result = res.data;
    //console.log(result);
  })
  .catch(error => {
    result = error;
    //console.log(result);
  })
  let getResult = ()=>{
    console.log(result);
    return result;
  }
  setTimeout(getResult,500);

  //deletes file after upload to keep storage clear under uploads
  let deleteFile = ()=>{
    fs.rmSync(dataI.file.destination+dataI.file.filename, { recursive: true })
  }
  setTimeout(deleteFile,500);
}

  

app.listen(port, ()=> {
  console.log('Your app is listening on port',port);
});