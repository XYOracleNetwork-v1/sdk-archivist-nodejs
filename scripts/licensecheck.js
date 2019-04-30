/*
 * File: licensecheck.js
 * Project: @xyo-network/sdk-archivist-nodejs
 * File Created: Tuesday, 30th April 2019 9:51:44 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 30th April 2019 10:02:02 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

var checker = require('license-checker');
 
const allowedLicense = [
  'MIT',
  'BSD',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'Apache-2.0',
  'ISC',
  'Unlicense',
  'BSD*',
  'CC0-1.0',
  'LGPL-3.0',
  'WTFPL',
  'CC-BY-3.0'
]

const allowedLibraries = [
]

return new Promise((resolve, reject) => {
  checker.init({
    start: './',
    onlyAllow: allowedLicense.join(';'),
    excludePackages: allowedLibraries.join(';'),
    production: true,
    direct: true
  }, function(err, packages) {
      if (err) {
          reject(err)
      } else {
          console.log('License Check Passed')
          resolve(packages)
      }
  })
})