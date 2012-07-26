const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

Cu.import("resource://services-sync/engines.js");
Cu.import("resource://services-sync/record.js");
Cu.import("resource://services-sync/util.js");
Cu.import("resource://services-sync/main.js");
Cu.import("resource://services-sync/constants.js");

const label = "Tabs From Other Computers";

function alltabsPopupShowing(document) {
  Services.console.logStringMessage("popupshowing");

  let popup = document.getElementById("alltabs-popup");
  if (!popup || !Weave.Service.isLoggedIn || !Weave.Engines.get("tabs").enabled)
    return;

  Services.console.logStringMessage("adding item");

  let menuitem = document.createElement("menuitem");
  menuitem.setAttribute("id", "sync-tabs-menuitem");
  menuitem.setAttribute("label", label);
  menuitem.setAttribute("class", "alltabs-item");
  menuitem.setAttribute("oncommand", "BrowserOpenSyncTabs();");

  menuitem.tab = { "linkedBrowser": { "currentURI": { "spec": label } } };

  let sep = document.getElementById("alltabs-popup-separator");
  popup.insertBefore(menuitem, sep);
}

function loadIntoWindow(window) {
  if (!window) return;
  let button = window.document.getElementById("alltabs-button");
  if (!button) return;
  button.style.visibility = "visible";

  let popup = window.document.getElementById("alltabs-popup");
  if (popup)
    popup.addEventListener("popupshowing", alltabsPopupShowing(window.document), true);
}

function unloadFromWindow(window) {
  if (!window) return;
  let button = window.document.getElementById("alltabs-button");
  if (!button) return;
  button.style.visibility = "";

  let popup = window.document.getElementById("alltabs-popup");
  if (!popup)
    popup.removeEventListener("popupshowing", alltabsPopupShowing(window.document), true);
}

var windowListener = {
  onOpenWindow: function(aWindow) {
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function() {
      domWindow.removeEventListener("load", arguments.callee, false);
      loadIntoWindow(domWindow);
    }, false);
  },
  onCloseWindow: function(aWindow) { },
  onWindowTitleChange: function(aWindow, aTitle) { }
};

function startup(aData, aReason) {
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

  let enumerator = wm.getEnumerator("navigator:browser");
  while (enumerator.hasMoreElements()) {
    let win = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(win);
  }

  wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
  if (aReason == APP_SHUTDOWN) return;

  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
  wm.removeListener(windowListener);

  let enumerator = wm.getEnumerator("navigator:browser");
  while (enumerator.hasMoreElements()) {
    let win = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(win);
  }
}

function install(aData, aReason) { }

function uninstall(aData, aReason) { }