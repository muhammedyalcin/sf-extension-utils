<a name="module_WevViewBridge"></a>

## WevViewBridge : <code>function</code>
Smartface WevView Bridge for bidirectional communication

**Author**: Alper Ozisik <alper.ozisik@smartface.io>  
**Copyright**: Smartface 2018  

* [WevViewBridge](#module_WevViewBridge) : <code>function</code>
    * [~WebViewBridge](#module_WevViewBridge..WebViewBridge) ⇐ <code>EventEmitter</code>
        * [new WebViewBridge(options)](#new_module_WevViewBridge..WebViewBridge_new)
    * [~webView](#module_WevViewBridge..webView)
    * [~loadedScriptNames](#module_WevViewBridge..loadedScriptNames)
    * [~ready](#module_WevViewBridge..ready)
    * [~source](#module_WevViewBridge..source)
    * [~parseResponses](#module_WevViewBridge..parseResponses)
    * [~loadScripts()](#module_WevViewBridge..loadScripts)
    * [~refresh()](#module_WevViewBridge..refresh)
    * [~evaluateJS()](#module_WevViewBridge..evaluateJS)

<a name="module_WevViewBridge..WebViewBridge"></a>

### WevViewBridge~WebViewBridge ⇐ <code>EventEmitter</code>
**Kind**: inner class of [<code>WevViewBridge</code>](#module_WevViewBridge)  
**Extends**: <code>EventEmitter</code>  
**Access**: public  
**Params**: <code>string</code> [options.scheme = "msg"] - URI scheme in wevView to communicate with webview  
**Params**: <code>string\|IO.File</code> source - source to inject bridge code  
**Params**: <code>boolean</code> [parseResponses = false] - when false, the WebView.evaluateJS runs faster without parsing the executed JS code response  
**Params**: <code>boolean</code> [bounceEnabled = false] - when false bounce effect of the WebView is disabled  
<a name="new_module_WevViewBridge..WebViewBridge_new"></a>

#### new WebViewBridge(options)
WebViewBridge is used for bi-directional communication with WebView. Events from WebView are captured with [EventEmiter](https://www.npmjs.com/package/wolfy87-eventemitter)<br />
This bridge creates window.**boubleEvent** function inside WebPage of the WebView<br />
boubleEvent - Has two arguments: **eventName** (required), **data** (optional)<br />
Data is JSON.stringify'ied transfered to Smartface over URI with the designated URI scheme (msg is default). data of the event is object parsed form of the stringified data from WebView<br />
It is possible to load additional scripts with **loadScripts** method of the WebViewBridge<br />
Use WebViewBridge.**on** or WebViewBridge.**once** methods to capture the calls of window.boubleEvent calls from WebPage with given eventName<br />
Following eventNames are reserved for WebViewBridge internal usage: "addScript", "scriptLoaded", "window.onload"
The inserted code is also setting the window.onload event of the WebPage


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  | base options object |
| [options.webView] | <code>UI.WebView</code> | <code>new WebView()</code> | If not provided, it creates a new empty WebView instance. onChangedURL and onShow events of the WebView are set |

**Example**  
```js
//Bridge Creation with AM-Charts
const WebViewBridge = require("sf-extension-utils").WebViewBridge;

page.webView.visible = false;
page.aiWait.visible = true;
const wvb = page.wvb = new WebViewBridge({
    webView: page.webView,
    source: "assets://amcharts_index.html"
});

wvb.loadScripts("amcharts/amcharts/amcharts.js", "amcharts/amcharts/serial.js")
    .then((loadedScriptNames) => {
        wvb.evaluateJS(chartScript, () => {
            page.webView.visible = true;
            page.aiWait.visible = false;
        });
    });

const chartScript = `
AmCharts.makeChart("chartdiv", {
     "type": "serial",
     "categoryField": "category",
     "startDuration": 1,
     "categoryAxis": {
         "gridPosition": "start"
     },
     "trendLines": [],
     "graphs": [{
             "balloonText": "[[title]] of [[category]]:[[value]]",
             "bullet": "round",
             "id": "AmGraph-1",
             "title": "graph 1",
             "valueField": "column-1"
         },
         {
             "balloonText": "[[title]] of [[category]]:[[value]]",
             "bullet": "square",
             "id": "AmGraph-2",
             "title": "graph 2",
             "valueField": "column-2"
         }
     ],
     "guides": [],
     "valueAxes": [{
         "id": "ValueAxis-1",
         "title": "Axis title"
     }],
     "allLabels": [],
     "balloon": {},
     "legend": {
         "enabled": true,
         "useGraphSettings": true
     },
     "titles": [{
         "id": "Title-1",
         "size": 15,
         "text": "Chart Title"
     }],
     "dataProvider": [{
             "category": "category 1",
             "column-1": 8,
             "column-2": 5
         },
         {
             "category": "category 2",
             "column-1": 6,
             "column-2": 7
         },
         {
             "category": "category 3",
             "column-1": 2,
             "column-2": 3
         },
         {
             "category": "category 4",
             "column-1": 1,
             "column-2": 3
         },
         {
             "category": "category 5",
             "column-1": 2,
             "column-2": 1
         },
         {
             "category": "category 6",
             "column-1": 3,
             "column-2": 2
         },
         {
             "category": "category 7",
             "column-1": 6,
             "column-2": 8
         }
     ]
 });
`
```
**Example**  
```js
//bi-directional communication
const WebViewBridge = require("sf-extension-utils").WebViewBridge;

const wvb = page.wvb = new WebViewBridge({
    webView: page.webView,
    source: "assets://index.html"
});

wvb.once("myEventName", function() { console.log("myEventName fired from WebView"); });

wvb.evaluateJS(`setTimeout(function() { window.boubleEvent("myEventName");})');

wvb.on("messageRecieved", (function(data) {
     console.log(`
        Message on webview is from: $ { data.from } and saying: $ { data.value }
        `);
 };
 
 wvb.evaluateJS(`
        // Create WebSocket connection.
        const socket = new WebSocket('ws://example.com:8080');

        // Connection opened
        socket.addEventListener('open', function(event) {
            var message = 'Hello Server!';
            socket.send(message);
            window.boubleEvent("messageRecieved", {
                from: "client",
                value: message
            });
        });

        // Listen for messages
        socket.addEventListener('message', function(event) {
            console.log('Message from server ', event.data);
            window.boubleEvent("messageRecieved", {
                from: "server",
                value: event.data
            });
        });

        `);
 
```
<a name="module_WevViewBridge..webView"></a>

### WevViewBridge~webView
WebView Instace which has been bridged

**Kind**: inner property of [<code>WevViewBridge</code>](#module_WevViewBridge)  
**Access**: public  
**Read only**: true  
**Properties**

| Type |
| --- |
| <code>UI.WebView</code> | 

<a name="module_WevViewBridge..loadedScriptNames"></a>

### WevViewBridge~loadedScriptNames
list of loaded script names

**Kind**: inner property of [<code>WevViewBridge</code>](#module_WevViewBridge)  
**Access**: public  
**Read only**: true  
**Properties**

| Type |
| --- |
| <code>Array.&lt;string&gt;</code> | 

<a name="module_WevViewBridge..ready"></a>

### WevViewBridge~ready
Promise for WebView is ready for execution

**Kind**: inner property of [<code>WevViewBridge</code>](#module_WevViewBridge)  
**Access**: public  
**Read only**: true  
**Properties**

| Type |
| --- |
| <code>Promise</code> | 

<a name="module_WevViewBridge..source"></a>

### WevViewBridge~source
The source value which has been set

**Kind**: inner property of [<code>WevViewBridge</code>](#module_WevViewBridge)  
**Access**: public  
**Read only**: true  
**Properties**

| Type |
| --- |
| <code>string</code> \| <code>IO.File</code> | 

<a name="module_WevViewBridge..parseResponses"></a>

### WevViewBridge~parseResponses
Gets or Sets WebView.evalueJS to parse the responses. False value makes the execution faster, but the responses will not parsed, instead constant null value will be response of the execution. When true, executed code will be wrapped inside an immediate function

**Kind**: inner property of [<code>WevViewBridge</code>](#module_WevViewBridge)  
**Default**: <code>false</code>  
**Access**: public  
**Properties**

| Type |
| --- |
| <code>boolean</code> | 

<a name="module_WevViewBridge..loadScripts"></a>

### WevViewBridge~loadScripts()
Loads script files into WebView. Files loaded relative to the source.

**Kind**: inner method of [<code>WevViewBridge</code>](#module_WevViewBridge)  
**Access**: public  
**Read only**: true  

| Type | Description |
| --- | --- |
| <code>string</code> \| <code>Array.&lt;string&gt;</code> | List of script names. |

<a name="module_WevViewBridge..refresh"></a>

### WevViewBridge~refresh()
Inserts WebViewBridge code inside WebPage

**Kind**: inner method of [<code>WevViewBridge</code>](#module_WevViewBridge)  
**Access**: public  
**Read only**: true  
<a name="module_WevViewBridge..evaluateJS"></a>

### WevViewBridge~evaluateJS()
Calls a specific version of evaluateJS for faster execution if parseResponses is false

**Kind**: inner method of [<code>WevViewBridge</code>](#module_WevViewBridge)  
**Access**: public  
**Read only**: true  