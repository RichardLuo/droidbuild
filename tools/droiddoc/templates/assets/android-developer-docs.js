var resizePackagesNav;
var classesNav;
var devdocNav;
var sidenav;
var content;
var HEADER_HEIGHT = 117;
var cookie_style = 'android_developer';
var NAV_PREF_TREE = "tree";
var NAV_PREF_PANELS = "panels";
var nav_pref;
var toRoot;


function addLoadEvent(newfun) {
  var current = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = newfun;
  } else {
    window.onload = function() {
      current();
      newfun();
    }
  }
}

window.onresize = resizeAll;

function setToRoot(root) {
  toRoot = root;
  // note: toRoot also used by carousel.js
}

function restoreWidth(navWidth) {
  var windowWidth = $(window).width() + "px";
  content.css({marginLeft:parseInt(navWidth) + 6 + "px", //account for 6px-wide handle-bar
               width:parseInt(windowWidth) - parseInt(navWidth) - 6 + "px"});
  sidenav.css({width:navWidth});
  resizePackagesNav.css({width:navWidth});
  classesNav.css({width:navWidth});
  $("#packages-nav").css({width:navWidth});
}

function restoreHeight(packageHeight) {
  var windowHeight = ($(window).height() - HEADER_HEIGHT);
  var swapperHeight = windowHeight - 13;
  $("#swapper").css({height:swapperHeight + "px"});
  sidenav.css({height:windowHeight + "px"});
  content.css({height:windowHeight + "px"});
  resizePackagesNav.css({maxHeight:swapperHeight + "px", height:packageHeight});
  classesNav.css({height:swapperHeight - parseInt(packageHeight) + "px"});
  $("#packages-nav").css({height:parseInt(packageHeight) - 6 + "px"}); //move 6px to give space for the resize handle
  devdocNav.css({height:sidenav.css("height")});
  $("#nav-tree").css({height:swapperHeight + "px"});
}

function getCookie(cookie) {
  var myCookie = cookie_style+"_"+cookie+"=";
  if (document.cookie) {
    var index = document.cookie.indexOf(myCookie);
    if (index != -1) {
      var valStart = index + myCookie.length;
      var valEnd = document.cookie.indexOf(";", valStart);
      if (valEnd == -1) {
        valEnd = document.cookie.length;
      }
      var val = document.cookie.substring(valStart, valEnd);
      return val;
    }
  }
  return 0;
}

function writeCookie(cookie, val, path, expiration) {
  if (!val) return;  
  var date = new Date();
  date.setTime(date.getTime()+(10*365*24*60*60*1000)); // default expiration is one week
  expiration = expiration ? expiration : date.toGMTString();
  if (location.href.indexOf("/reference/") != -1) {
    document.cookie = cookie_style+'_reference_'+cookie+'='+val+'; expires='+expiration+'; path='+'/'+path;
  } else if (location.href.indexOf("/guide/") != -1) {
    document.cookie = cookie_style+'_guide_'+cookie+'='+val+'; expires='+expiration+'; path='+'/'+path;
  }
} 

function init() {
  $("#resize-packages-nav").resizable({handles: "s", resize: function(e, ui) { resizeHeight(); } });
  $(".side-nav-resizable").resizable({handles: "e", resize: function(e, ui) { resizeWidth(); } });

  $("#side-nav").css({position:"absolute",left:0});
  content = $("#doc-content");
  resizePackagesNav = $("#resize-packages-nav");
  classesNav = $("#classes-nav");
  sidenav = $("#side-nav");
  devdocNav = $("#devdoc-nav");

  if (location.href.indexOf("/reference/") != -1) {
    var cookiePath = "reference_";
  } else if (location.href.indexOf("/guide/") != -1) {
    var cookiePath = "guide_";
  }
  var cookieWidth = getCookie(cookiePath+'width');
  var cookieHeight = getCookie(cookiePath+'height');
  if (cookieWidth) {
    restoreWidth(cookieWidth);
  } else {
    resizeWidth();
  }
  if (cookieHeight) {
    restoreHeight(cookieHeight);
  } else {
    resizeHeight();
  }

  if (devdocNav.length) { // only dev guide and sdk 
    highlightNav(location.href); 
  }
}

function highlightNav(fullPageName) {
  var lastSlashPos = fullPageName.lastIndexOf("/");
  var firstSlashPos = (fullPageName.indexOf("/guide/") != -1) ?
                       fullPageName.indexOf("/guide/") : 
                       fullPageName.indexOf("/sdk/"); // first slash after /guide or /sdk
  if (lastSlashPos == (fullPageName.length - 1)) { // if the url ends in slash (add 'index.html')
    fullPageName = fullPageName + "index.html";
  }
  var htmlPos = fullPageName.lastIndexOf(".html", fullPageName.length);
  var pathPageName = fullPageName.slice(firstSlashPos, htmlPos + 5);
  var link = $("#devdoc-nav a[href$='"+ pathPageName+"']");
  if ((link.length == 0) && (fullPageName.indexOf("/guide/") != -1)) { // if there's no match, then let's backstep through the directory until we find an index.html page that matches our ancestor directories (only for dev guide)
    lastBackstep = pathPageName.lastIndexOf("/");
    while (link.length == 0) {
      backstepDirectory = pathPageName.lastIndexOf("/", lastBackstep);
      link = $("#devdoc-nav a[href$='"+ pathPageName.slice(0, backstepDirectory + 1)+"index.html']");
      lastBackstep = pathPageName.lastIndexOf("/", lastBackstep - 1);
      if (lastBackstep == 0) break;
    }
  }
  link.parent().addClass('selected');
  if (link.parent().parent().is(':hidden')) {
    toggle(link.parent().parent().parent(), false);
  } else if (link.parent().parent().hasClass('toggle-list')) {
    toggle(link.parent().parent(), false);
  }
}

function resizeHeight() {
  var windowHeight = ($(window).height() - HEADER_HEIGHT);
  var swapperHeight = windowHeight - 13;
  $("#swapper").css({height:swapperHeight + "px"});
  sidenav.css({height:windowHeight + "px"});
  content.css({height:windowHeight + "px"});
  resizePackagesNav.css({maxHeight:swapperHeight + "px"});
  classesNav.css({height:swapperHeight - parseInt(resizePackagesNav.css("height")) + "px"});
  $("#packages-nav").css({height:parseInt(resizePackagesNav.css("height")) - 6 + "px"}); //move 6px for handle
  devdocNav.css({height:sidenav.css("height")});
  $("#nav-tree").css({height:swapperHeight + "px"});
  writeCookie("height", resizePackagesNav.css("height"), "", null);
}

function resizeWidth() {
  var windowWidth = $(window).width() + "px";
  if (sidenav.length) {
    var sidenavWidth = sidenav.css("width");
  } else {
    var sidenavWidth = 0;
  }
  content.css({marginLeft:parseInt(sidenavWidth) + 6 + "px", //account for 6px-wide handle-bar
               width:parseInt(windowWidth) - parseInt(sidenavWidth) - 6 + "px"});
  resizePackagesNav.css({width:sidenavWidth});
  classesNav.css({width:sidenavWidth});
  $("#packages-nav").css({width:sidenavWidth});
  writeCookie("width", sidenavWidth, "", null);
}

function resizeAll() {
  resizeHeight();
  resizeWidth();
}

function loadLast(cookiePath) {
  var location = window.location.href;
  if (location.indexOf("/"+cookiePath+"/") != -1) {
    return true;
  }
  var lastPage = getCookie(cookiePath + "_lastpage");
  if (lastPage) {
    window.location = lastPage;
    return false;
  }
  return true;
}

$(window).unload(function(){
  var href = location.href;
  if (href.indexOf("/reference/") != -1) {
    writeCookie("lastpage", href, "", null);
  } else if (href.indexOf("/guide/") != -1) {
    writeCookie("lastpage", href, "", null);
  }
});



function toggle(obj, slide) {
  var ul = $("ul", obj);
  var li = ul.parent();
  if (li.hasClass("closed")) {
    if (slide) {
      ul.slideDown("fast");
    } else {
      ul.show();
    }
    li.removeClass("closed");
    li.addClass("open");
    $(".toggle-img", li).attr("title", "hide pages");
  } else {
    ul.slideUp("fast");
    li.removeClass("open");
    li.addClass("closed");
    $(".toggle-img", li).attr("title", "show pages");
  }
}



function buildToggleLists() {
  $(".toggle-list").each(
    function(i) {
      $("div", this).append("<a class='toggle-img' href='#' title='show pages' onClick='toggle(this.parentNode.parentNode, true); return false;'></a>");
      $(this).addClass("closed");
    });
}

function getNavPref() {
  var v = getCookie('reference_nav');
  if (v != NAV_PREF_TREE) {
    v = NAV_PREF_PANELS;
  }
  return v;
}

function chooseDefaultNav() {
  nav_pref = getNavPref();
  if (nav_pref == NAV_PREF_TREE) {
    $("#nav-panels").toggle();
    $("#panel-link").toggle();
    $("#nav-tree").toggle();
    $("#tree-link").toggle();
  }
}

function swapNav() {
  if (nav_pref == NAV_PREF_TREE) {
    nav_pref = NAV_PREF_PANELS;
  } else {
    nav_pref = NAV_PREF_TREE;
    init_navtree("nav-tree", toRoot, NAVTREE_DATA);
  }
  var date = new Date();
  date.setTime(date.getTime()+(10*365*24*60*60*1000)); // keep this for 10 years
  writeCookie("nav", nav_pref, "", date.toGMTString());

  $("#nav-panels").toggle();
  $("#panel-link").toggle();
  $("#nav-tree").toggle();
  $("#tree-link").toggle();

  if ($("#nav-tree").is(':visible')) scrollIntoView("nav-tree");
  else {
    scrollIntoView("packages-nav");
    scrollIntoView("classes-nav");
  }
}

function scrollIntoView(nav) {
  var navObj = $("#"+nav);
  if (navObj.is(':visible')) {
    var selected = $(".selected", navObj);
    if (selected.length == 0) return;
    if (selected.is("div")) selected = selected.parent();

    var scrolling = document.getElementById(nav);
    var navHeight = navObj.height();
    var offsetTop = selected.position().top;
    if (selected.parent().parent().is(".toggle-list")) offsetTop += selected.parent().parent().position().top;
    if(offsetTop > navHeight - 92) {
      scrolling.scrollTop = offsetTop - navHeight + 92;
    }
  }
}

function toggleAllInherited(linkObj, expand) {
  var a = $(linkObj);
  var table = $(a.parent().parent().parent());
  var expandos = $(".jd-expando-trigger", table);
  if ( (expand == null && a.text() == "[Expand]") || expand ) {
    expandos.each(function(i) {
      toggleInherited(this, true);
    });
    a.text("[Collapse]");
  } else if ( (expand == null && a.text() == "[Collapse]") || (expand == false) ) {
    expandos.each(function(i) {
      toggleInherited(this, false);
    });
    a.text("[Expand]");
  }
  return false;
}

function toggleAllSummaryInherited(linkObj) {
  var a = $(linkObj);
  var content = $(a.parent().parent().parent());
  var toggles = $(".toggle-all", content);
  if (a.text() == "[Expand All]") {
    toggles.each(function(i) {
      toggleAllInherited(this, true);
    });
    a.text("[Collapse All]");
  } else {
    toggles.each(function(i) {
      toggleAllInherited(this, false);
    });
    a.text("[Expand All]");
  }
  return false;
}