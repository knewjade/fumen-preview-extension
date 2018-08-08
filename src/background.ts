/**
 chrome.runtime.onMessage.addListener((request, sender, callback) => {
        console.log(request);
        // $.ajax({
        //     type: "GET",
        //     url: "APIのurl",
        //     dataType: "json",
        //     data: {path: path},
        //     success: function(datas){
        //         console.log("send");
        //         sendResponse({datas: datas});
        //     }
        // });
        callback("completed");
        return true;
    }
 );
 **/

console.log('hello');