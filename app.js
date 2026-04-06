const express = require('express');
const path = require('path');
const session = require("express-session");
require("dotenv").config();
const mongoose = require('mongoose');

const app = express();

const authRouter = require('./routes/authRoutes');
const homeRouter = require("./routes/homeRoutes");
const hostRouter = require('./routes/hostRoutes');
const userRouter = require('./routes/userRoutes');
const profileRouter = require("./routes/profileRoutes")
const errorsController = require('./controllers/errors');
const bookRouter = require('./routes/bookRoutes');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use("/uploads", express.static("uploads"));

app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');

app.use(session({
  secret: process.env.Session_Secret_Key,
  resave: false,
  saveUninitialized: false,
  cookie:{
    httpOnly: true
  }
}));

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  res.locals.user = req.session.user;
  next();
});

app.use(homeRouter);
app.use(authRouter);
app.use(profileRouter);
app.use(bookRouter);
app.use("/host",hostRouter);
app.use("/user",userRouter);

app.use(errorsController.pageNotFound);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to Mongo');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})
.catch(err => {
  console.log('Error while connecting to Mongo: ', err);
});