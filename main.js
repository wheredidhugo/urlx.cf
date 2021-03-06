const express = require('express'),
  rateLimit = require("express-rate-limit"),
  mongoose = require('mongoose'),
  path = require("path"),
  { customAlphabet } = require('nanoid'),
  app = express();
require("dotenv").config();

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true, useUnifiedTopology: true 
});

const urlSchema = mongoose.Schema({
  fullUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
    default: nanoid()
  }
});

const urlModel = mongoose.model("urls", urlSchema);

const urlRegex = new RegExp("^https?://");
const urlxcfRegex = new RegExp("^https?://urlx.cf"); 
const notFound = path.join(__dirname, 'public/404.html');

const urlLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 50,
	message: "You're spamming the API, try again in a few minutes.",
	standardHeaders: true,
	legacyHeaders: false,
})


app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.get('/:id', async (req, res) => {
  const shortUrl = await urlModel.findOne({shortUrl: req.params.id})
  if (shortUrl == null) return res.status(404).sendFile(notFound)
  res.redirect(shortUrl.fullUrl)
});

app.post('/url', urlLimiter, async (req, res) => {
  if (req.body.fullUrl !== null || req.body.fullUrl !== "")  {
    if (urlRegex.test(req.body.fullUrl) == true) {
      if (urlxcfRegex.test(req.body.fullUrl) == false) {
        const fullUrl = new urlModel({fullUrl: req.body.fullUrl, shortUrl: nanoid()});
        const findFullUrl = await urlModel.findOne({fullUrl: req.body.fullUrl})
        if (findFullUrl == null) {
          fullUrl.save()
          res.json({"shortUrl": fullUrl.shortUrl})
        } else {
          res.json({"shortUrl": findFullUrl.shortUrl})
        }
      } else {
        res.json({"message": "Your link cannot start with urlx.cf"})
      }
    } else {
      res.json({"message": "This isn't a link. Your link needs to start with http:// or https://"})
    }
  } else {
    res.json({"message": "Not Found"})
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
