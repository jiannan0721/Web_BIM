var viewer;
var md_doc;
var md_viewables;

var options = {
    env: 'AutodeskProduction',
    api: 'derivativeV2', // TODO: for models uploaded to EMEA change this option to 'derivativeV2_EU'
    getAccessToken: getForgeToken,
};
var documentId = 'urn:' + getUrlParameter('urn');
// var documentId = 'urn:' + 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YWNkcHd3Zmp3OHprc2MwbWJpbmxpYmw1OTVwMHdhdnFfdHV0b3JpYWxfYnVja2V0L1NhbXBsZS5ydnQ';

// Run this when the page is loaded
Autodesk.Viewing.Initializer(options, function onInitialized(){

    // var config3d = {
    //   extensions: ['highlightExtension', 'findRoomExtension', 'selectiveExplodeExtension'],
    //   loaderExtensions: { svf: "Autodesk.MemoryLimited" }
    // };

    // Find the element where the 3d viewer will live.
    // var htmlElement = document.getElementById('MyViewerDiv');
    // if (htmlElement) {
        // Create and start the viewer in that element
        // viewer = new Autodesk.Viewing.GuiViewer3D(htmlElement, config3d);
        // viewer.start();
        // Load the document into the viewer.
        Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    // }
});

/**
* Autodesk.Viewing.Document.load() success callback.
* Proceeds with model initialization.
*/
function onDocumentLoadSuccess(doc) {
    // Load the default viewable geometry into the viewer.
    // Using the doc, we have access to the root BubbleNode,
    // which references the root node of a graph that wraps each object from the Manifest JSON.
    var viewables = doc.getRoot().search({'type':'geometry'});

    md_doc = doc;
    md_viewables = viewables;

    var initView = viewables[1];

    var htmlElement = document.getElementById('MyViewerDiv');
    var config3d = {
      extensions: ['highlightExtension', 'findRoomExtension', 'selectiveExplodeExtension'],
      loaderExtensions: { svf: "Autodesk.MemoryLimited" }
    };
    viewer = new Autodesk.Viewing.Private.GuiViewer3D(htmlElement, config3d);

    // if (viewables) {
    //     // populate the Choose viewables drop down with the viewable name
    //     var sel = document.getElementById('viewables');
    //     var newConstructionIndex = 0;
    //     for(var i = 0; i < viewables.length; i++) {
    //         var opt = document.createElement('option');
    //         console.log(viewables[i].data.name);
    //         if (viewables[i].data.name === "New Construction") newConstructionIndex = i;
    //         opt.innerHTML = viewables[i].data.name;
    //         opt.value = viewables[i].data.name;
    //         sel.appendChild(opt);
    //     }
    //
    //     viewer.loadDocumentNode(doc, viewables[newConstructionIndex]).then(function(result) {
    //         console.log('Viewable Loaded!');
    //     }).catch(function(err) {
    //         console.log('Viewable failed to load.');
    //         console.log(err);
    //     }
    //   )

    var svfUrl = doc.getViewablePath(initView);
    var modelOptions = {
      sharedPropertyDbPath: doc.getPropertyDbPath()
    };
    viewer.start(svfUrl, modelOptions, onLoadModelSuccess, onLoadModelError);
      // Make the Choose viewable drop-down visible, if and only if only there are more than one viewables to display

      // if (viewables.length > 1) {
      //     var viewablesDIV= document.getElementById("viewables_dropdown");
      //     viewablesDIV.style.display = "block";
      // }
    // }
}

/**
* Autodesk.Viewing.Document.load() failure callback.
*/
function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode: ' + viewerErrorCode);
    jQuery('#MyViewerDiv').html('<p>Translation in progress... Please try refreshing the page.</p>');
}

/**
 * viewer.loadModel() success callback.
 * Invoked after the model's SVF has been initially loaded.
 * It may trigger before any geometry has been downloaded and displayed on-screen.
 */
function onLoadModelSuccess(model) {
    console.log('onLoadModelSuccess()!');
    console.log('Validate model loaded: ' + (viewer.model === model));
    console.log(model);
}

/**
 * viewer.loadModel() failure callback.
 * Invoked when there's an error fetching the SVF file.
 */
function onLoadModelError(viewerErrorCode) {
    console.error('onLoadModelError() - errorCode:' + viewerErrorCode);
}

function selectViewable() {
    var indexViewable = document.getElementById("viewables").selectedIndex;
    // Load another viewable from selectedIndex of drop-down.
    viewer.loadDocumentNode(md_doc, md_viewables[indexViewable]);
}

// Get Query string from URL,
// we will use this to get the value of 'urn' from URL
function getUrlParameter(name) {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Get public access token for read only,
// using ajax to access route /api/forge/oauth/public in the background
function getForgeToken(callback) {
    jQuery.ajax({
        url: '/api/forge/oauth/public',
        success: function (res) {
            callback(res.access_token, res.expires_in);
        }
    });
}
