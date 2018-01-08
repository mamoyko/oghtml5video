const schedule = require('node-schedule'),
    async = require('async'),
    fs = require('fs');

exports.cronSchedule = function() {

    schedule.scheduleJob('00 00 00 * * *', function () {
        createReadStream('logs/log.json');
    });
}


  function createReadStream(filename){
      return new Promise(function(resolve, reject){
        var stream = fs.createReadStream(filename);
          stream.on('readable', () => {
            copyLogs()
            deleteLogs()
          })
          function copyLogs() {
            fs.createReadStream(filename).pipe(fs.createWriteStream('logs/'+Date.now()+'.json'))
          }
          function deleteLogs(){
            fs.writeFile(filename, ' ', function () {
              console.log('created new file')
            })
          }
      });
      return 'success';
}
