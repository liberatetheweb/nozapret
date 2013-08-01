function getProxy(){
    var req = new XMLHttpRequest();
    req.open("GET", "http://api.proxy-ip-list.com/oneclickproxy.php", false);
    req.onreadystatechange = function () {
        if (req.readyState == 4){
            proxy = req.responseText;
        }
        else {
            proxy = "antizapret.prostovpn.ru:3128";
        }
    }
    req.send();
}
function getBlockedIP() {
    var req = new XMLHttpRequest();
    req.open("GET", "http://api.antizapret.info/all.php?type=json", false);
    req.onreadystatechange = function () {
        if (req.readyState == 4){
            var zapretJson = JSON.parse(req.responseText);
            zapretList = [];
            zapretDomainList = [];
            for (var i=0;i<zapretJson.register.length;i++) {
                zapretList.push(zapretJson.register[i].ip);
                zapretDomainList.push(zapretJson.register[i].domain);
            }
        }
    }
    req.send();
}
function makeEverything() {
    getProxy();
    getBlockedIP();
    var config = {
      mode: "pac_script",
      pacScript: {
      data: 'function FindProxyForURL(url, host) {\n' +
                    '  iplist = ["' + zapretList.join('", "') + '"];\n' +
                    '  domainlist = ["' + zapretDomainList.join('", "') + '"];\n' +
                    '  if (domainlist.indexOf(host)!=-1 || iplist.indexOf(dnsResolve(host))!=-1) {\n' +
                    '    return "PROXY ' + proxy + '";\n' +
                    '  }\n' +
                    '  return "DIRECT";\n' +
                    '}'
      }
    };
    chrome.proxy.settings.set(
        {value: config, scope: 'regular'},
        function() {});
}
makeEverything();
chrome.alarms.create('nozapret', {
    periodInMinutes : 60.0
});
chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name == 'nozapret') {
        createListener();
    }
});
chrome.runtime.onStartup.addListener(function () {
    makeEverything();
});
