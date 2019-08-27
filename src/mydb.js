module.exports = {
  start: (fileName) => {
    const fs = require('fs');
    const path = './' + fileName || './db.json';

    try {
      if (!fs.existsSync(path)) {
        fs.writeFileSync(fileName || 'db.json','{}', (err) => {
          if (err) console.error('Something with your FS');
        });
      }

      const content = fs.readFileSync(fileName ||"db.json");
      const obj = {};
      obj.content = JSON.parse(content);
      obj.has = function (key) {
        return !!this.content[key];
      };
      obj.get = function (key) {
        return this.content[key];
      };
      obj.set = function (id, value) {
        this.content[id] = value;
      };
      obj.write = function () {
        fs.writeFile(fileName || 'db.json', JSON.stringify(this.content), (err) => {
          if (err) console.error('Something with your FS');
        });
      };
      return obj;
    } catch(err) {
      console.error(err)
    }
  }
};
