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
app.set('view engine', 'ejs');


app.get('/', (req, res)=> {
  res.render('DashBoard');
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
     url:'http://localhost:8081/ML/Prediction',
     data: form
   })
   .then(response => {
     console.log(response.data)
     res.render('ImageUp',{result: response.data});
   })
   .catch(error => {
     console.log(error.message);
   })
 
   //deletes file after upload to keep storage clear under uploads
   let deleteFile = ()=>{
     fs.rmSync(req.file.destination+req.file.filename, { recursive: true })
   }
   setTimeout(deleteFile,500);
    
  };
  
});

app.listen(port, ()=> {
  console.log(`Your app is listening on localhost:${port}`);
});