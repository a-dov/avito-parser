module.exports = {
  start: (fileName) => {
    const fs = require('fs');
    const path = fileName || 'db.json';

    try {
      let content;
      if (fs.existsSync(path)) {
        content = fs.readFileSync(path);
      }

      const obj = {};
      obj.content = content ? JSON.parse(content) : {};
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
        fs.writeFile(path, JSON.stringify(this.content), (err) => {
          if (err) console.error('Something with your FS');
        });
      };
      return obj;
    } catch(err) {
      console.error(err)
    }
  }
};
