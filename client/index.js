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
      var mimeType = response.data.mimeType;

      addImage(id, name, thumbnailLink, mimeType);
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
  csInterface.evalScript('importFile(' + '"' + fileLocation + '"' + ')');
}

function downloadFile(fileId, saveLocation) {
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
function addImage(id, name, thumbnailLink, mimeType) {
  var gridContainer = document.getElementById('grid-container');

  var newGridElement = document.createElement('div');
  newGridElement.className = 'grid-item';



  newGridElement.onclick = function () {
    var newFolderLocation = createFolder('Google Drive Downloads');
    downloadFile(id, newFolderLocation + '/' + name);
  }

  

  //mimeType = mimeType.split('/')[0];
  // if(thumbnailLink == undefined && mimeType == 'audio') {
  //   newGridImage.src = 'C:/Users/Mark/AppData/Roaming/Adobe/CEP/extensions/google-drive-importer/client/audio_icon.svg';
  // }
  // else {
  // newGridImage.src = thumbnailLink;
  // }

  // Adds thumbnail
  var newGridImage = document.createElement('img');
  newGridImage.src = thumbnailLink;
  newGridElement.appendChild(newGridImage);
  
  // Adds transparent download icon
  var downloadIcon = document.createElement('img');
  downloadIcon.className = 'hidden-icon';
  downloadIcon.src = 'C:/Users/Mark/AppData/Roaming/Adobe/CEP/extensions/google-drive-importer/client/download-icon.svg';
  //downloadIcon.style.opacity = 0;
  newGridElement.appendChild(downloadIcon);

  gridContainer.appendChild(newGridElement);
}

function clearThumbnails() {
  var gridContainer = document.getElementById('grid-container');
  gridContainer.innerHTML = ''
}

var importButton = document.getElementById('import-button');

importButton.addEventListener('click', () => {

  clearThumbnails();
  
  var userInput = document.getElementById('url-input').value;
  var folderId = urlToId(userInput);
  var apiKey = '';
  var folderUrl = 'https://www.googleapis.com/drive/v3/files?q=%27' + folderId + '%27+in+parents&key=' + apiKey;

  getFileIds(folderUrl);
});

function urlToId(url) {
  
  // If the input doesn't contain a '/', either the input is bad or the input is already the folder ID
  if (!url.includes('/')) {
    return url;
  }

  // Isolates the last part of the url that has the folder ID
  url = url.split('/').pop();
  
  // Chops off the url sharing bit from the url
  if (url.includes('?usp=sharing')) {
    url = url.substring(0, url.length - '?usp=sharing'.length);
  }
  return(url);
}
