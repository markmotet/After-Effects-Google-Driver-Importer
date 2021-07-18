const fs = require('fs');
const https = require('https');
const {google} = require('googleapis');

const drive = google.drive({
    version: 'v3', 
    auth: ''
});

var csInterface = new CSInterface();

var projectLocation;
csInterface.evalScript('getProjectLocation()', (result) => {
  projectLocation = result;
});

// setTimeout required otherwise result would be undefined
setTimeout(() => {

  // Modifies projectLocation to exlude the project file name
  projectLocation = projectLocation.split('\\');
  projectLocation.pop();
  projectLocation = projectLocation.join('/')

}, 100);

// Pipes all the file ids from a Google Drive folder to getDriveFiles()
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

// Retrieves the id, name, and thumbnailLink for each input file id and pipes the info into addImage()
async function getDriveFiles(fileIds) {

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
  }
}
// Creates a folder in the same directory as the AE project
function createFolder(folderName) {
  var dir = projectLocation + '/' + folderName;
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }
  return dir;
}

function importFile(fileLocation) {
  csInterface.evalScript('importFile(' + '"' + fileLocation + '"' + ')', (result) => {

  });
}

function downloadFile(fileId, saveLocation) {

  // I should check if it's already downloaded. Current implementation downloads every time

  drive.files.get(
    {fileId: fileId, alt: 'media'},
    {responseType: 'arraybuffer'}
  )
  .then((response) => {
    fs.writeFile(saveLocation, new Buffer.from(response.data), (err) => {})
    importFile(saveLocation);
  })
}


// Adds a thumbnail image to the extension that downloads the file when clicked
function addImage(id, name, thumbnailLink) {
  var gridContainer = document.getElementById('grid-container');

  var newGridElement = document.createElement('div');
  newGridElement.className = 'grid-item';
  newGridElement.onclick = function () {
    var newFolderLocation = createFolder('Google Drive Downloads');
    downloadFile(id, newFolderLocation + '/' + name);
  }

  var newGridImage = document.createElement('img');
  newGridImage.src = thumbnailLink;

  newGridElement.appendChild(newGridImage);
  gridContainer.appendChild(newGridElement);
}

var importButton = document.getElementById('import-button');

importButton.addEventListener('click', () => {
  
  var folderId = document.getElementById('url-input').value;
  var apiKey = '';
  var folderUrl = 'https://www.googleapis.com/drive/v3/files?q=%27' + folderId + '%27+in+parents&key=' + apiKey;

  getFileIds(folderUrl);
});




// function randomizeFrames() {
//   var inputString = "randomizeFrames(" + framesPerCut + "," + color + ")";
//   csInterface.evalScript(inputString, callback);
// }