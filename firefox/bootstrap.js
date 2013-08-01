Components.utils.import("resource://gre/modules/Services.jsm");
var timer;
function getProxy(){
    const XMLHttpRequest = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1");
    var req = XMLHttpRequest();
    req.open("GET", "http://api.proxy-ip-list.com/oneclickproxy.php", false);  
    req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
    req.send(null);
    if (req.status == 200){
        proxy = req.responseText;
    }
    else {
        proxy = "antizapret.prostovpn.ru:3128";
    }
}
function getBlockedIP() {
    const XMLHttpRequest = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1");
    var req = XMLHttpRequest();
    req.open("GET", "http://api.antizapret.info/all.php?type=json", false);  
    req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
    req.send(null);
    if (req.status == 200){
        var zapretJson = JSON.parse(req.responseText);
        zapretList = [];
        zapretDomainList = [];
        for (var i=0;i<zapretJson.register.length;i++) {
            zapretList.push(zapretJson.register[i].ip);
            zapretDomainList.push(zapretJson.register[i].domain);
        }
    }
}
function generatePacScript() {
    var pacScript = 'function FindProxyForURL(url, host) {\n' +
                    '  iplist = ["' + zapretList.join('", "') + '"];\n' +
                    '  domainlist = ["' + zapretDomainList.join('", "') + '"];\n' +
                    '  if (domainlist.indexOf(host)!=-1 || iplist.indexOf(dnsResolve(host))!=-1) {\n' +
                    '    return "PROXY ' + proxy + '";\n' +
                    '  }\n' +
                    '  return "DIRECT";\n' +
                    '}';
    uri = "data:text/javascript," + encodeURIComponent(pacScript);
}
function setPrefs() {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("network.proxy.");
    prefs.setIntPref("type", "2");
    prefs.setCharPref("autoconfig_url", uri);
}
function restorePrefs() {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("network.proxy.");
    prefs.setIntPref("type", "5");
    prefs.setCharPref("autoconfig_url", "");
    var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
    timer.cancel();
}
function startup(data, aReason) {
    var event = {
        notify: function(timer) {
            getProxy();
            getBlockedIP();
            generatePacScript();
            setPrefs();
        }
    }
    event.notify();
    var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
    // Every hour
    timer.initWithCallback(event, 1*60*60*1000, Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);

}
function shutdown(data, aReason) {
    restorePrefs();
}
function install(data, aReason) {}
function uninstall(data, aReason) {
    restorePrefs();
}
