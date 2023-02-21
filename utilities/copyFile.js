const fs = require('fs')

const copyFile = (source, target) => {
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, fs.readFileSync(source));
  }
}

module.exports = copyFile