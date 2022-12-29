/* eslint no-console: 1 */

const request = require('request');

/**
 * @param {string} email
 * @param {string} password
 * @param {string | undefined} apiKey
 */
function getPasswordCloud (email, password, apiKey) {
  return new Promise((resolve, reject) => {
    apiKey = apiKey || process.env.GIGYA_API_KEY || '3_rWtvxmUKwgOzu3AUPTMLnM46lj-LxURGflmu5PcE_sGptTbD-wMeshVbLvYpq01K';

    const gigyaLoginOptions = {
      'method': 'POST',
      'uri': 'https://accounts.us1.gigya.com/accounts.login',
      'json': true,
      'qs': {
        'apiKey': apiKey,
        'targetenv': 'mobile',
        'loginID': email,
        'password': password,
        'format': 'json',
        'targetEnv': 'mobile'
      },
      'headers': {
        'Connection': 'close'
      }
    };

    request(gigyaLoginOptions, loginGigyaResponseHandler);

    /**
     * @param {any} error
     * @param {{ statusCode: number; }} response
     * @param {{ statusCode: number; errorCode: number; UID: any; UIDSignature: any; signatureTimestamp: any; sessionInfo: { sessionToken: any; }; }} body
     */
    function loginGigyaResponseHandler (error, response, body) {
      if (error) {
        reject({ name: 'Fatal error login into Gigya API. Please check your credentials or Gigya API Key.', message: error });
      }

      if (response.statusCode === 401 || response.statusCode === 403) {
        reject({ name: 'Authentication error. Check your credentials.', message: response });
      } else if (response.statusCode === 400) {
        reject({message: response});
      } else if (response.statusCode === 200) {
        if (body && body.statusCode && body.statusCode === 403) {
          reject({ name: 'Authentication error. Please Check your credentials.', message: body });
        }
        if (body && body.statusCode && body.statusCode === 400) {
          reject({ name: 'Error loging into Gigya API.', message: body });
        }
        if (body && body.statusCode && body.statusCode === 200 && body.errorCode === 0 && body.UID && body.UIDSignature && body.signatureTimestamp && body.sessionInfo && body.sessionInfo.sessionToken) {
          const iRobotLoginOptions = {
            'method': 'POST',
            'uri': 'https://unauth2.prod.iot.irobotapi.com/v2/login',
            'json': true,
            'body': {
              'app_id': 'ANDROID-C7FB240E-DF34-42D7-AE4E-A8C17079A294',
              'assume_robot_ownership': 0,
              'gigya': {
                'signature': body.UIDSignature,
                'timestamp': body.signatureTimestamp,
                'uid': body.UID
              }
            },
            'headers': {
              'Connection': 'close'
            }
          };
          request(iRobotLoginOptions, loginIrobotResponseHandler);
        } else {
          reject({ name: 'Error loging into iRobot account. Missing fields in login response.', message: body });
        }
      } else {
        // console.log('Unespected response. Checking again...');
      }
    }

    /**
     * @param {any} error
     * @param {any} response
     * @param {{ robots: { [x: string]: Record<string, any>; }; }} body
     */
    function loginIrobotResponseHandler (error, response, body) {
      if (error) {
        reject({ name: 'Fatal error loging into iRobot account. Please check your credentials or API Key.', message: error });
      }
      if (body && body.robots) {
        // const robotCount = Object.keys(body.robots).length;
        const robots = [];
        // console.log('Found ' + robotCount + ' robot(s)!');
        Object.keys(body.robots).map(function (r) {
          robots.push(Object.assign({ blid: r }, body.robots[r]));
          // robots[r] = body.robots[r];
          /* console.log('Robot "' + body.robots[r].name + '" (sku: ' + body.robots[r].sku + ' SoftwareVer: ' + body.robots[r].softwareVer + '):');
          console.log('BLID=> ' + r);
          console.log('Password=> ' + body.robots[r].password + ' <= Yes, all this string.');
          console.log(''); */
        });
        // console.log('Use this credentials in dorita980 lib :)');
        resolve(robots);
      } else {
        reject({ name: 'Fatal error login into iRobot account. Please check your credentials or API Key.', message: body });
      }
    }
  });
}
module.exports = { getPasswordCloud };
