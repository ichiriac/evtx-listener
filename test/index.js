const log = require('../index');
const filename = 'c:\\Windows\\System32\\Winevt\\Logs\\Security.evtx';
const security = new log(filename);
security.onChange(function(event) {
  if (event.data.EventId == 4663) {
    if (event.data.details.AccessMask == 0x2) {
      console.log(event.id +  '\tFlush '+ event.data.details.ObjectName +' (' + event.data.ProviderName + ')');
      console.log(event.data.details);
    } else if (event.data.details.AccessMask == 0x4) {
      console.log(event.id +  '\tFlush '+ event.data.details.ObjectName +' (' + event.data.ProviderName + ')');
      console.log(event.data.details);
    } else {
      console.log(event.id +  '\tAccess ' + event.data.details.AccessMask + ' on ' + event.data.details.ObjectName);
    }
  } else {
    console.log(event.id +  '\tReceived ' + event.data.EventId + ' (' + event.data.ProviderName + ')');
    console.log(event.data.details);

  }
});