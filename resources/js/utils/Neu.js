/**
 * This class makes it easier to interact with the Neutralino system.
 */
class Neu {
  async getAppConfig() {
    return await Neutralino.app.getConfig();
  }

  async readFile(path) {
    return await Neutralino.filesystem.readFile(path);
  }

  async readAppDirFile(path) {
    if (path.startsWith('/')) {
      path = path.replace('/', '');
    }

    return await Neutralino.filesystem.readFile(NL_PATH + '/' + path);
  }

  openFile(path) {
    Neutralino.os.execCommand('start ' + path);
  }

  async openDirectory(path) {
    if (NL_OS.includes('Windows')) {
      path = path.replaceAll('/', '\\');
    }

    Neutralino.os.execCommand(`explorer "${path}"`);
  }

  async openAppDirectory() {
    this.openDirectory(NL_PATH);
  }

  async getOperatingSystemInfo() {
    return await Neutralino.computer.getOSInfo();
  }

  /**
   * Equivalent to localStorage.setItem()
   * LocalStorage doesn't persist on Neutralino apps.
   * So we use Neutralino.storage.
   */
  async saveKey(name, value) {
    let stringValue;

    if (value === null || value === undefined) {
      stringValue = String(value); // will convert to "null" or "undefined"
    } else if (typeof value === 'object') {
      try {
        stringValue = JSON.stringify(value);
      } catch (err) {
        console.error(`Failed to stringify object: ${err.message}`);
        return;
      }
    } else {
      stringValue = String(value);
    }

    return await Neutralino.storage.setData(name, stringValue);
  }

  /**
   * Equivalent to localStorage.getItem()
   */
  async loadKey(name) {
    // if the key doesnt exist, Neutralino throws and error instead of returning null
    try {
      const data = await Neutralino.storage.getData(name);

      return data;
    } catch (error) {
      // do nothing
    }

    return null;
  }
}

export default new Neu();
