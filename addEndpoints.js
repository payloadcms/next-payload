const path = require('path')
const copyRecursiveSync = require('./utilities/copyRecursiveSync');

module.exports = () => {
  const args = process.argv.slice(2); // nodejs command line args are an array that begin at the third item
  const apiOutputPath = args[0] || './pages/api'
  
  // Copy handlers into /api
  copyRecursiveSync(path.resolve(__dirname, './handlers/api'), path.resolve(process.cwd(), apiOutputPath))
  
  process.exit(0)
}