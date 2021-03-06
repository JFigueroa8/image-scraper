const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');

const SEARCH_TERM = process.env.SEARCH_TERM || 'turtle'

// 1. fetch the site
function fetchUnsplashData() {
  return axios.get(`https://unsplash.com/search/photos/${SEARCH_TERM}`)
    .then(res => res.data);
}

// 2. grabImages
function grabImages(data) {
  return new Promise((resolve, reject) => {
    if (data) {
      const $ = cheerio.load(data);
      const imageLinks = $('a[title="Download photo"]').map((index, image) => {
        return $(image).attr('href');
      })
      resolve(imageLinks);
    }
  })
}

// 3. saveImages
function saveImages(images) {
  images.map((index, image) => {
    axios({
      method: 'get',
      responseType: 'stream',
      url: image
    }).then((item) => {
      item.data.pipe(fs.createWriteStream(`./images/${SEARCH_TERM}${index}.jpg`));
    })
  })
}
// 4. put them all together
fetchUnsplashData()
  .then(grabImages)
  .then(saveImages)