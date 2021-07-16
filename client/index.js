const fs = require('fs');
const https = require('https');
const {google} = require('googleapis');

const drive = google.drive({
    version: 'v3', 
    auth: 'API_KEY'
});

async function getDriveFiles(fileIds) {

  // Stores the important metadata of each file in the Drive folder
  //var driveFileList = [];

  for (fileId in fileIds) {
      var response = await drive.files.get({
        fileId: fileIds[fileId],
        fields: '*' // Only add necessary ones
      });
  
      // Retrieving metadata from the response
      var id = response.data.id;
      var name = response.data.name;
      var thumbnailLink = response.data.thumbnailLink;

      addImage(id, name, thumbnailLink)
      //driveFileList.push(new DriveFile(id, name, thumbnailLink));
  }
  
}

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
      getDriveFiles(ids);
    });
  })
}

function addImage(id, name, thumbnailLink) {
  const gridContainer = document.getElementById('grid-container');

  const newGridElement = document.createElement('div');
  newGridElement.className = 'grid-item';
  newGridElement.onclick = function () {
    downloadFile(id, 'B:/Desktop/' + name);
  }

  const newGridImage = document.createElement('img');
  newGridImage.src = thumbnailLink;

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

var csInterface = new CSInterface();

var importButton = document.getElementById('import-button');

importButton.addEventListener('click', () => {
  
  const folderId = document.getElementById('url-input').value;
  const apiKey = 'API_KEY';
  const folderUrl = 'https://www.googleapis.com/drive/v3/files?q=%27' + folderId + '%27+in+parents&key=' + apiKey;

  getFileIds(folderUrl);
});

