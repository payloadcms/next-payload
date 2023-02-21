const path = require('path')
const copyRecursiveSync = require('./utilities/copyRecursiveSync');

module.exports = () => {  
  // Copy handlers into /api
  copyRecursiveSync(path.resolve(__dirname, './handlers/api'), path.resolve(process.cwd(), './pages/api'))
  
  // Copy admin into /app
  copyRecursiveSync(path.resolve(__dirname, './handlers/app'), path.resolve(process.cwd(), './app'))
  process.exit(0)
}