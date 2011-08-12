// ==UserScript==
// @name          Steamgifts Giveaway Filter
// @description   Enhances the steamgifts.com exprience by providing additional features.
// @version       1.2.9
// @namespace 	  http://www.steamgifts.com/user/Zo
// @author        Zo
// ==/UserScript==

// fades background and shows+centre the popup
gafPopupShow = function() {
	$("#gafPopup").css({
				"top": document.documentElement.clientHeight / 2 - 200,
				"left": document.documentElement.clientWidth / 2 - 200
				}); 
	$('#gafPopup').show('slow');
	$('#gafPopupBackground').fadeIn('slow');
}

// hide popup and background
gafPopupHide = function() {
	$('#gafPopup').hide('slow');
	$('#gafPopupBackground').fadeOut('slow');
}

// function is called everytime there is a change to textarea for the filter
// and contents mirrored in the cookie
gafFormUpdate = function() {
	document.cookie = "gafFilter=" + $('#gafFilterInput').val().replace(";","") + "; expires=Fri, 27 Jul 2030 02:47:11 UTC; path=/";
  gafFilter = $('#gafFilterInput').val().split(',');
}

// called then ignore button is pressed
// * adds name of the game to the filter and updates the cookie
// * hides all giveaways for the same game
// * slide up animantion
gafIgnore = function(elm) {
  var node = elm.parentNode.parentNode.parentNode.parentNode;
  $(elm).remove();
  var name = $(node).find('.title').find('a').text();
	$('#gafFilterInput').append(',' + $(node).find('.title').find('a').html());
	gafFormUpdate();
	
	$($.grep($('.post').find('.title').find('a'), function(a) { 
    return $(a).text() == name; 
    })).parent().parent().parent().slideUp(function() {
      gafLoadingCheck();
    });

}

// removes giveaway matching the filter
gafApplyFilter = function(gafs) {
  var gaflist = gafFilter;
  var gafstr;
   
  for(i = 0; i < gafs.length; i++) {
  	var elm = $(gafs[i]).find('a')[0];
  
  	for(j = 0; j < gaflist.length; j++) {
  	    gafstr = $.trim(gaflist[j]).toLowerCase().replace(/&/g,'&amp;');
  	    
  	    if(elm.innerHTML.toLowerCase() == $.trim(gafstr.substr(3))) {
          $(gafs[i]).find('.description').css({background: '#aaFFa8'});
  	    }
  	    else if(elm.innerHTML.toLowerCase() == gafstr) {
          $(gafs[i]).remove();
        }
  	}
  }
}
// add ignore buttons to all giveaways :)
gafAddIgnoreButton = function(elms) {
  var gafs = $(elms).find('a');
  
  for(i = 0; i < gafs.length; i++) {
  	if(gafs[i].href.match(/\/giveaway.*?entries$/))
  	{
  		$(gafs[i].parentNode.parentNode).append("<span style='margin-right: 10px;'><a href='#' name='gafbutton' class='gafignore'>Ignore</a></span>")
  	}
  }
}

$(".gafignore").live('click',function(){
	gafIgnore(this); return false;
})

// function is called by iframe onLoad
// filters new giveaways and adds them to the current page for endless scroll
gafPageLoaded = function() {
    if(window.location.href.match(/forum/)) {
      if(gafHrefPart.length > 5) {
        if(gafReverse) {
          $('#gafWindow').contents().find('.parent_container').reverse().insertAfter($('.parent_container').last());
        }
        else {
          $('#gafWindow').contents().find('.parent_container').insertAfter($('.parent_container').last());        
        }
      }
      else {
        $('#gafWindow').contents().find('.row a').each(function(key,obj) {
              if($(obj).attr('href').match(/^\/forum/)) {
                var newURL = $(obj).attr('href') + "/page31337";
                $(obj).attr('href',newURL);
              }
            });
        $('#gafWindow').contents().find('.row').appendTo('.discussions');
      }
    }
    else
    {
      var elms = $('#gafWindow').contents().find('div.post');
      
      gafApplyFilter(elms);
      
      elms = $('#gafWindow').contents().find('div.post');
      
      gafAddIgnoreButton(elms);
      
      if(elms.length > 0)
      { 
        if($('div.post').length > 0) { $('div.post').last().after(elms); }
        else { $('div.pagination').first().after(elms); }
      }
    }
    
    if( (!gafReverse && gafPage == gafMaxPage)
            || (gafReverse && gafPage == 1) ) {
      $('#gafLoading').html("<p>You've reached the end.</p>");
  
      if(gafShowSettings && $('.post').length == 0) {
        $('#gafLoading').html("<p>There seem to be no giveaways matching your settings.</p>");
      }
    }
    gafLoading = false;
    gafLoadingCheck();
}

// function runs when gafLoading is in veiw
gafLoadNextPage = function() {
  if(!gafLoading
     && ( (!gafReverse && gafPage < gafMaxPage)
          || (gafReverse && gafPage > 1) )){
          
    gafLoading = true;
    gafPage += (gafReverse) ? -1 : 1;
    
    if(window.location.href.match(/forum/)) {
      if(gafHrefPart.length > 5) {
        if(gafReverse) {
          $('#gafWindow').attr('src',window.location.href.replace(/\d+$/,gafPage));
        } 
        else {
          $('#gafWindow').attr('src',window.location.href + '/page' + gafPage);
        }
      }
      else {
        $('#gafWindow').attr('src','http://www.steamgifts.com/forum/page' + gafPage);
      }
    }
    else if(window.location.href.match(/new$/)) {
      $('#gafWindow').attr('src','http://www.steamgifts.com/new/page' + gafPage);
    }
    else {
      $('#gafWindow').attr('src','http://www.steamgifts.com/open/page' + gafPage);
    }
  }
}
 
// credit for code goes to creators to the reddit enchancement suit
// check if obj in the view
gafElementInSight = function(obj) {
    var top = obj.offsetTop;
		var left = obj.offsetLeft;
		var width = obj.offsetWidth / 4;
		var height = obj.offsetHeight / 4;
		while(obj.offsetParent) {
			obj = obj.offsetParent;
			top += obj.offsetTop;
			left += obj.offsetLeft;
		}
		return top >= window.pageYOffset &&
			left >= window.pageXOffset &&
			(top + height) <= (window.pageYOffset + window.innerHeight) &&
			(left + width) <= (window.pageXOffset + window.innerWidth);
}

// called when sync button is pressed
// adds all sync games to the filter
gafSync = function() {
  $('#gafSyncButton').attr('disabled','1').attr('value','Wait');
  $.get('http://www.steamgifts.com/sync', function(data) {
                 $('#gafFilterInput').val(data.match(/\"code\">(.*?)<\//g).toString().replace(/\"code\">/g,'').replace(/<\//g,''));
                 gafFormUpdate();
                 $('#gafSyncButton').attr('value',"Sync'd");
                  });
}

// check if gafLoading is in sight
gafLoadingCheck = function() {
    if(gafElementInSight( document.getElementById('gafLoading') )) {
      gafLoadNextPage();
    }
}

// toggle endless scroll on various pages
gafToggleScroll = function(obj) {
  if(obj.innerHTML == "on") {
    obj.innerHTML = 'off';
    
    if(window.location.href.match(/\/forum/)) {
      if(gafHrefPart.length > 5) { gafOptions = gafOptions.replace(/D/g,''); }
      else { gafOptions = gafOptions.replace(/F/g,''); }
    }
    else { gafOptions = gafOptions.replace(/G/g,''); }
  }
  else {
    obj.innerHTML = 'on';

    if(window.location.href.match(/\/forum/)) {
      if(gafHrefPart.length > 5) { gafOptions += 'D'; }
      else { gafOptions += 'F'; }
    }
    else { gafOptions += 'G'; }
  }

	document.cookie = "gafOptions=" + gafOptions + "; expires=Fri, 27 Jul 2030 02:47:11 UTC; path=/";
  
  if(!window.location.href.match(/page31337$/)
      && window.location.href.match(/page\d+$/)
      && !gafReverse  ) {
      window.location.href = window.location.href.replace(/\/page\d+/,'');
  }
  else {
      if(obj.innerHTML == 'on' && gafReverse) {
        window.location.href = window.location.href.replace(/\/page\d+/,'') + '/page31337';
      }
      else {
        window.location.href = window.location.href;
      }
  }
}

// toggle reverse order
gafToggleRev = function(obj) {
  if(obj.innerHTML.match(/newest/)) {
    obj.innerHTML = 'oldest first';
    gafOptions = gafOptions.replace(/R/g,'');
    gafReverse = false;
  }
  else {
    obj.innerHTML = 'newest first';
    gafOptions += 'R';
    gafReverse = true;
  }

	document.cookie = "gafOptions=" + gafOptions + "; expires=Fri, 27 Jul 2030 02:47:11 UTC; path=/";
  
  if(gafScrollOn && gafReverse) {
      window.location.href = window.location.href.replace(/\/page\d+/,'');
  }
  else if(gafScrollOn) {
      window.location.href = window.location.href + '/page31337';
  }
  else {
      $('.parent_container').reverse().appendTo('.comment_container');
  }
}

// main code
gafFilter = {};

// flags for options
// G - giveaway endless scroll turned on
// F - forum endless scroll turned on
// D - dicussion endless scroll
// R - reverse order of comments
gafOptions = "GFDR";

//var $ = jQuery;
$.fn.reverse = [].reverse;

// add popup elements
$('body').append("<div id='gafPopupBackground' style='position:fixed;display:none;top:0;left:0;height:100%;width:100%;background:#000000;z-index:20;opacity: 0.4;' class='gafhidepop'></div><div id='gafPopup' style='position:fixed;float:left;left:50%;top:50%;background:#FFFFFF;display:none;border:1px solid #cccccc;z-index:21;padding:8px;height:284px;width:408px;border-radius: 10px 10px 10px 10px;box-shadow: 0 0 20px #000000;'><h1 style='color: #347DB5;font-size: 22px;'>Giveaway Filter</h1><p style='color: #4F565A;font-size: 12px;'>Enter the games you want filtered out from the giveaway list separated by commas. (eg 'Portal 2, Half-Life 2') <b>/Save by clicking on the background/</b></p><textarea id='gafFilterInput' style='width:400px;height:200px;' class='gafformupdate'></textarea><p style='color: #4F565A;font-size: 12px;'><input type='button' value='Sync' id='gafSyncButton' class='gafsync'> Add sync library games to filter. (Update <a href='http://www.steamgifts.com/sync'>here</a> before sync)</p></div>");

$(".gafsync").live('click',function(){
	gafSync();
})

$(".gafformupdate").live('click',function(){
	gafFormUpdate();
})

$(".gafhidepop").live('click',function(){
	gafPopupHide();
})

// read cookie        
var i,j,val='',c=document.cookie.split(";");

for (i=0;i<c.length;i++) {
  var testStr = $.trim(c[i].substr(0,c[i].indexOf("=")));
	if("gafFilter" == testStr) {
		val = c[i].substr(c[i].indexOf("=")+1);
		$('#gafFilterInput').text(val);
		gafFilter = val.split(",");
	}
	else if(testStr == "gafOptions") {
	  gafOptions = c[i].substr(c[i].indexOf("=")+1);
  }
}

gafLoading = false;
gafPage = 1;
gafMaxPage = 1;
gafPerPage = 10;
gafFloatMenuOn = false;
gafScrollOn = true;
gafReverse = false;

gafShowSettings = true;
gafShowReverse = false;
gafRepReverse = false;

gafHrefPart = window.location.href.split('/');

switch(gafHrefPart[3]) {
  case "forum":
      if(gafHrefPart.length > 5) {
        if( gafOptions.match('R')
            || window.location.href.match(/page31337$/)) { gafReverse = true; }
        if( !gafOptions.match('D') ) { gafScrollOn = false; }        
        
        gafPerPage = 20;
        gafShowReverse = true;
      }
      else {
        if( !gafOptions.match('F') ) { gafScrollOn = false; }
        if( gafOptions.match('R') ) { gafRepReverse = true; }
        
        gafPerPage = 25;
      }
      gafShowSettings = false;
      break;
  case "":
  case "new":
  case "open":
      if( !gafOptions.match('G') ) { gafScrollOn = false; }
      gafReverse = false;
    break;
}
// remove giveaways and add ignore buttons
if(gafShowSettings) {  
      val = $('.post');
      gafApplyFilter(val);  
      gafAddIgnoreButton(val);
      
      $('ol')[1].innerHTML  = "<li class='selected' id='gafMenu'><a href='#' class='gafshowpop'>[Giveaway Filter Settings]</a></li>";
}

$(".gafshowpop").live('click',function(){
	gafPopupShow();
})

// get rows per page, total rows, and calculate max page
gafMaxPage = Math.ceil($('.results').first().text().match(/(\d+) result/)[1] / gafPerPage);
gafPage = (gafReverse) ? gafMaxPage : 1;


// move the comment box at the top for less frustration
$('.discussions').after($('#comment_form'));

// endless scroll settings on page
$('.results:first').html("Endless scrolling is <a style='color:#347DB5;' href='#' class='gaftogglescroll' >"+((gafScrollOn)?'on':'off')+"</a>");

$(".gaftogglescroll").live('click',function(){
	gafToggleScroll(this);
})

// reverse order settings on page
if(gafShowReverse) {
  $('.results:first').append(" and order <a style='color:#347DB5;' href='#' class='gaftoggleres' >"+((gafReverse)?'newest first':'oldest first')+"</a>");
}

$(".gaftoggleres").live('click',function(){
	gafToggleRev(this);
})

if(gafScrollOn) {
  // endless scrolling elements and adjustments
  $('.numbers').remove()

  // turn off scrolling if there is only one page  
  if(gafMaxPage == 1) {
    gafScrollOn = false;
    $('.results:last').parent().html("<div style='text-align: center;'><p>You've reached the end.</p></div>");
  }
  else {
    $('.results:last').parent().html("<div id='gafLoading' style='text-align: center;'><img src='data:image/gif;base64,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' /><p>Gremlins are fetching more stuff. Please standby...</p></div>");
  }
  
  $('body').append("<iframe id='gafWindow' style='display: none' src='about:blank'></iframe>");
}

$("#gafWindow").load(function(){ gafPageLoaded(); });


// reverse order
if(gafReverse) {
  $('.parent_container').reverse().appendTo('.comment_container');
}

// fix urls for discussions in the forum page for reverse order
if(gafRepReverse) {
  $('.row a').each(function(key,obj) {
      if($(obj).attr('href').match(/^\/forum/)) {
        var newURL = $(obj).attr('href') + "/page31337";
        $(obj).attr('href',newURL);
      }
    });
}
  
  // replicate nagivation bar to use as float menu
  $('#navigation').clone().prependTo($('#navigation').parent()).hide();
  $('#navigation:first').attr('style','box-shadow:0 0 8px #000000;z-index:19;background:#25303A url(http://www.steamgifts.com/img/bg_gradient.png) no-repeat;background-position:center top;position:fixed;top:-23px;left:0px;height:67px;width:100%;').hide();
  $('#navigation:first').find('.logo').attr('style','height:67px;');
  // float menu alignment wrapper, fixes issue 3
  $('#navigation:first').prepend("<div style='margin:0 auto;width:1000px;' id='gafMenuWrapper'></div>");
  $('#navigation:first>.logo,#navigation:first>.right').appendTo("#gafMenuWrapper");
  
  $(window).bind('scroll', function() {
      if(gafScrollOn) { gafLoadingCheck(); }
  		
  		if(!gafFloatMenuOn && window.pageYOffset > 200) {
  		  gafFloatMenuOn = true;
  		  $('#navigation').first().slideDown('slow');
      }
      else if(gafFloatMenuOn && window.pageYOffset < 200) {
  		  $('#navigation').first().slideUp();
  		  gafFloatMenuOn = false;
      }
  });
  
  // if first page is empty, start loading next page
  gafLoadingCheck();
