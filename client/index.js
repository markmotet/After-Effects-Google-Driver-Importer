const fs = require('fs');
const https = require('https');
const {google} = require('googleapis');

const CLIENT_ID = '';
const CLIENT_SECRET = '';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const REFRESH_TOKEN = '';

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

const drive = google.drive({
    version: 'v3', 
    auth: oAuth2Client
});

function getFileIds(theFolderUrl) {
  https.get(theFolderUrl, (response) => {
  
    var data = '';
  
    response.on('data', (chunk) => {
      data += chunk;
    });
  
    response.on('end', () => {

      var files = JSON.parse(data).files;
      var ids = [];

      for (var i = 0; i < files.length; i++) {
        ids[i] = files[i].id;
      }

      getDataFromFileId(ids);
    });
  })
}

async function getDataFromFileId(ids) {
  for(var i = 0; i < ids.length; i++) {
      const response = await drive.files.get({
        fileId: ids[i],
        fields: '*' // Only add necessary ones
      });
      addImage(response.data.thumbnailLink);
  }
}

function addImage(imageUrl) {
  const gridContainer = document.getElementById('grid-container');

  const newGridElement = document.createElement('div');
  newGridElement.className = 'grid-item';

  const newGridImage = document.createElement('img');
  newGridImage.src = imageUrl;

  newGridElement.appendChild(newGridImage);
  gridContainer.appendChild(newGridElement);
}

function downloadFile(fileId, saveLocation) {
  drive.files.get(
    {fileId: fileId, alt: 'media'},
    {responseType: 'arraybuffer'}
  )
  .then((response) => {
    fs.writeFile(saveLocation, new Buffer.from(response.data), (err) => {})
  })
}

downloadFile('1hKmhAE7Ggg81L32iyABoET0keMufJqFZ', 'B:/Desktop/test.mp4');


// /* 1) Create an instance of CSInterface. */
// var csInterface = new CSInterface();
// /* 2) Make a reference to your HTML button and add a click handler. */
// var importButton = document.getElementById('import-button');

// importButton.addEventListener('click', () => {
//   alert(document.getElementById('url-input').value);
  
//   const folderId = document.getElementById('url-input').value; //271MuAMCgwtfi5m9MGXXsQDBEn3AR6R7uED //Doesn't work with other folders?
//   const apiKey = 'AIzaSyDsrn8JHxDN7wKLMDborhElW4hC65RnSLE';
//   const folderUrl = 'https://www.googleapis.com/drive/v3/files?q=%27' + folderId + '%27+in+parents&key=' + apiKey;

//   getFileIds(folderUrl);
// });

