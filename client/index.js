const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly',
                'https://www.googleapis.com/auth/drive.readonly'];


const csInterface = new CSInterface();
const extentionLocation = csInterface.getSystemPath(SystemPath.EXTENSION);

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = extentionLocation + '/token.json';

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


// Load client secrets from a local file.
fs.readFile(extentionLocation + '/credentials.json', (err, content) => {
  if (err) alert(err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), listFiles);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {


    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));

    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  //console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {

    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        //console.log('Token stored to', TOKEN_PATH);
      });

      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  /*-----------------------------------------------------------*/
  const drive = google.drive({version: 'v3', auth});

  
  // Retrieves the id, name, and thumbnailLink for each input file id and pipes the info into addImage()
  async function getFileInfo(fileId) {

    var response = await drive.files.get({
      fileId: fileId,
      fields: '*' // Only add necessary ones
    });

    // Retrieving metadata from the response
    var id = response.data.id;
    var name = response.data.name;
    var thumbnailLink = response.data.thumbnailLink;
    var mimeType = response.data.mimeType;

    addImage(id, name, thumbnailLink, mimeType);
    
  }

  function getFileIds(folderId) {
    drive.files.list({
      pageSize: 100, // <--- Decrease this and add pages functionality to the extension
      fields: 'nextPageToken, files(id, name)',
      q: `'${folderId}' in parents`,
      orderBy: 'name' // <---- Allow user to customize? ALso, this doesn't work atm.
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const files = res.data.files;

      for (file in files) {
        getFileInfo(files[file].id);
      }
    });
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
    newGridImage.className = 'thumbnail';
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

    getFileIds(folderId);
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
  /*-----------------------------------------------------------*/
}