

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const app = express()
const mongoose = require('mongoose')
const port = 3000
const User = require('./Model/user')
const bcrypt = require('bcryptjs')
const { json } = require('express/lib/response')
const { resolveObjectURL } = require('buffer')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'sadifhikl;asnf89-23g89qtg bp0uio58ernasdklnfshg980w3r90w[sdanslgh89023 r89ye4uywhq3@#r4#R$#E5432';
mongoose.connect('mongodb://localhost:27017/login-app-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})


app.use('/', express.static(path.join(__dirname, 'static')))
app.use(bodyParser.json())

app.get('/',(req,res)=>{
  
})

app.post('/api/change-password',async(req,res)=>{
  const {newpassword:plainTextPassword,token}=req.body
  if (!plainTextPassword || typeof plainTextPassword !== 'string') {
    return res.json({ status: 'error', error: "Invalid password" });
  }
  if (plainTextPassword.length < 5) {
    return res.json({
      status: 'error',
      error: "Password too small. Should be atleast 6 character"
    })
  }

  try{

    const user=jwt.verify(token,JWT_SECRET)
    const _id=user.id

    const password = await bcrypt.hash(plainTextPassword, 10)

    await User.updateOne(
      {_id},
      {
        $set:{password}
      }
    )
    res.json({status:'ok'})
  }catch(error){
      res.json({ status:'JWT decoded:',error:';))'})
  }

})


app.post('/api/login', async (req, res) => {

  const { username, password } = req.body
  const user = await User.findOne({ username }).lean()
  if (!user) {
    return res.json({ status: 'error', error: "Invalid username/password" })
  }
  if (await bcrypt.compare(password, user.password)) {
    // the username and password  is matched

    const token = jwt.sign({
      id: user._id,
      username: user.username
    },
      JWT_SECRET
    )

    return res.json({ status: 'ok', data:token })

  }

  res.json({ status: 'error', error: "Invalid username/password" })
})

app.post('/api/register', async (req, res) => {

  // console.log(req.body);

  // destructuring
  const { username, password: plainTextPassword } = req.body

  // CONDITION for username and passwords
  if (!username || typeof username !== 'string') {
    return res.json({ status: 'error', error: "Invalid username" });
  }
  if (!plainTextPassword || typeof plainTextPassword !== 'string') {
    return res.json({ status: 'error', error: "Invalid password" });
  }
  if (plainTextPassword.length < 5) {
    return res.json({
      status: 'error',
      error: "Password too small. Should be atleast 6 character"
    })
  }

  // password hashing
  const password = await bcrypt.hash(plainTextPassword, 10)

  // inserting into the databse
  try {
    const respond = await User.create({
      username,
      password
    })
    console.log("User created succesfully :", respond)
  }
  catch (error) {
    //console.log(JSON.stringify(error))
    //{"index":0,"code":11000,"keyPattern":{"username":1},"keyValue":{"username":"tapas"}}
    if (error.code === 11000) {
      return res.json({ status: 'error', error: 'Username alredy is use' })
    }
    throw error

  }


  res.json({ status: 'ok' })
})



app.listen(port, () => {
  console.log(`server started at : http://localhost:${port}`)
})
