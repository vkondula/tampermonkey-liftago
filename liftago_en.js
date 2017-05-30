// ==UserScript==
// @name         Liftago rides counter (en)
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  get information from your gmail mailbox about liftago rides and process
// @author       Vaclav Kondula
// @match        https://mail.google.com/*
// @require https://code.jquery.com/jquery-1.12.4.js
// @require https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @grant none
// ==/UserScript==
console.log("running like a monkey");
$(document).ready(function()  {
    'use strict';
    // match is not working properly
    if(window.location.href.indexOf("liftago") === -1) return;
    // wait to load everything
    setTimeout(function(){
        var parse_message = function(message) {
            var regex = "([A-Z]{3})([0-9.]+).*THANK YOU FOR YOUR (.*) RIDE[^0-9]*([0-9]{1,2}\.([0-9]{1,2})\.[0-9]{4} [0-9]{2}:[0-9]{2})";
            var parsed = message.match(regex);
            if(parsed === null) return null;
            return {"currency": parsed[1], "price": parseFloat(parsed[2]), "type":parsed[3] ,"id":parsed[4], "month":parseInt(parsed[5])};
        };

        var create_alert_message = function(expensis, current_month) {
            var monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            var text = "Your rides in " + monthNames[current_month-1]+ ":\n";
            for (var type in expenses){
                text += type + ": ";
                for (var key in expenses[type]) {
                    if (!expenses[type].hasOwnProperty(key)) continue;
                    text += expenses[type][key] + "(" + key + "),";
                }
                text += "\n";
            }
            return text;
        };

        var elements = document.getElementsByClassName("y2");
        var expenses = {};
        var ids = [];
        var current_month = new Date().getMonth() + 1;
        // Find liftago mails
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].innerHTML.indexOf("THANK YOU FOR YOUR") !== -1){
                var parsed = parse_message(elements[i].innerHTML);
                if(parsed && current_month == parsed.month && !ids.includes(parsed.id)){
                    if (!(parsed.type in expenses)) {
                        expenses[parsed.type] = {};
                    }
                    ids.push(parsed.id); // remove duplicity
                    if (!(parsed.currency in expenses[parsed.type])){
                        expenses[parsed.type][parsed.currency] = 0;
                    }
                    expenses[parsed.type][parsed.currency] += parsed.price;
                }
            }
        }
        console.log(expenses);
        if (jQuery.isEmptyObject(expenses)) return;
        // show result
        var text = create_alert_message(expenses, current_month);
        alert(text);
    },3000);
})();

