import joplin from 'api';

const fs = joplin.require('fs-extra');

import {homedir} from 'os'
import * as path from 'path'

const defaultCookiePath = path.join(homedir(), '.hackmd', 'cookies.json')

const cookieDirPath = path.dirname(defaultCookiePath)
try {
  fs.mkdirSync(cookieDirPath)
} catch (err) {
  if (err.code !== 'EEXIST') {
    throw new Error(`

Could not create dir for cookie file at ${cookieDirPath}. Encountered exception:

${err}

`)
  }
  // at this point, the directory exists.  if the cookie file does not exist,
  // ensure the dir is writable (because we will create the file); otherwise
  // ensure the file itself is writable.
  let hasExistingCookieFile = false
  try {
    fs.existsSync(defaultCookiePath)
    hasExistingCookieFile = true
  // tslint:disable-next-line: no-unused
  } catch (ignored) {}

  if (hasExistingCookieFile) {
    try {
      fs.accessSync(defaultCookiePath, fs.constants.W_OK)
    } catch (err) {
      throw new Error(`

Cookie file ${defaultCookiePath} is not writable. Encountered exception:

${err}

`)
    }
  } else {
    try {
      fs.accessSync(cookieDirPath, fs.constants.W_OK)
    } catch (err) {
      throw new Error(`

Dir for cookie file at ${cookieDirPath} is not writable. Encountered exception:

${err}

`)
    }
  }
}

export default {
    cookiePath: defaultCookiePath,
    serverUrl: 'https://hackmd.io',
    enterprise: true,
}