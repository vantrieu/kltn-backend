const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const moment = require('moment');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

exports.saveBakToDrive = function () {
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Drive API.
        authorize(JSON.parse(content), storeFiles);
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
            return getAccessToken(oAuth2Client, callback);
        }
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
    console.log('Authorize this app by visiting this url:', authUrl);
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
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Save file backup to drive api
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function storeFiles(auth) {
    const drive = google.drive({ version: 'v3', auth });
    const date = moment();
    var fileMetadata = {
        'name': `musicsocialnetwork_${date}.gz`
    };
    var media = {
        mimeType: 'application/gzip',
        body: fs.createReadStream('backup/musicsocialnetwork.gz')
    };
    // save file to drive api
    drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    }, function (err, file) {
        // if (err) {
        //     console.log(err);
        // } else {
        //     // Get list file to drive api
        //     drive.files.list({
        //         pageSize: 10,
        //         fields: 'nextPageToken, files(id, name)',
        //     }, (err, res) => {
        //         if (err) return console.log('The API returned an error: ' + err);
        //         const files = res.data.files;
        //         if (files.length = 3) {
        //             // Delete file use drive api
        //             drive.files
        //                 .delete({
        //                     fileId: `${files[2].id}`,
        //                 })
        //                 .then(
        //                     async function (response) {
        //                         console.log('status: success');
        //                     },
        //                     function (err) {
        //                         console.log(err);
        //                     }
        //                 );
        //         } else {
        //             console.log('No files found.');
        //         }
        //     });
        // }
    });
}