var redditSvg;
var previousData;

var POLL_SPEED = 2000;

function redditVis() {
  // setup a poll requesting data, and make an immediate request
  setInterval(requestData,POLL_SPEED);
  requestData();

  // initial setup only needs to happen once 
  // - we don't want to append multiple svg elements
  redditSvg = d3.select("body")
        .append("svg")
        .attr("width",document.body.clientWidth - 50)
        .attr("height",document.body.clientWidth -50)
}

function requestData() {
  // our jsonp url, with a cache-busting query parameter
  d3.jsonp("http://www.reddit.com/.json?jsonp=runVis&noCache=" + Math.random());
}


//////// PLEASE EDIT runVis /////////
/////////////////////////////////////
/////////////////////////////////////

function runVis(data) {

  // d3 never does anything automagical to your data
  // so we'll need to get data into the right format, with the
  // previous values attached
  var formatted = formatRedditData(data,previousData);

  // select our stories, pulling in previous ones to update
  // by selecting on the stories' class name
  var circle = redditSvg
     .selectAll("circle")
     // the return value of data() is the update context - so the 'stories' var is
     // how we refence the update context from now on
     .data(formatted,function(d) {
       // prints out data in your console id, score, diff from last pulling, text
       
       // console.log(d.id,d.score,d.diff,d.title);

       // use a key function to ensure elements are always bound to the same 
       // story (especially important when data enters/exits)
       return d.id;
     });

	// ENTER context
   circle.enter()
  	.append("svg:circle")
  	.style("opacity","0.4")
  	.attr("fill", function() { return "hsl(" + Math.random() * 360 + ", 100%, 75%)" })
  	.style("stroke", "black")
  	.style("stroke-width", 1)
  	.attr("cx",document.body.clientWidth/2 )
  	.attr("cy",(document.body.clientWidth/2))
  	.attr("r", function(d){return (d.score*0.15)})
  	.on("mouseover", function() {
  			d3.select(".tooltip")
  				.transition()
      			.duration(500)
      			.style("opacity", 1);
		})
  	.on("mousemove", function(d){
  		var coordinates = d3.mouse(this);
  		d3.select(".tooltip")
      		.text(d.score+" "+d.title)
      		.style("width",d.title.width)
      		.style("height", d.title.height)
      		.style("left", coordinates[0] + "px")
      		.style("top", coordinates[1] + "px");
  		})
   .on("mouseout",  function(){
   		d3.select(".tooltip")
   	  		.transition()
      		.duration(500)
      		.style("opacity", 0);})
  
  // UPDATE + ENTER context
  // elements added via enter() will then be available on the update context, so
  // we can set attributes once, for entering and updating elements, here
  circle.transition()
  .duration(200)
  .attr("r", function(d){return (d.score*0.15)})

  circle.exit()
  .remove()   
}


//////// PLEASE EDI runVis() /////////
/////////////////////////////////////
/////////////////////////////////////


function formatRedditData(data) {
  // dig through reddit's data structure to get a flat list of stories
  var formatted = data.data.children.map(function(story) {
    return story.data;
  });
  // make a map of storyId -> previousData
  var previousDataById = (previousData || []).reduce(function(all,d) {
    all[d.id] = d;
    return all;
  },{});
  // for each present story, see if it has a previous value,
  // attach it and calculate the diff
  formatted.forEach(function(d) {
    d.previous = previousDataById[d.id];
    d.diff = 0;
    if(d.previous) {
      d.diff = d.score - d.previous.score;
    }
  });
  // our new data will be the previousData next time


formatted.sort(function(a,b) { return parseFloat(b.score) - parseFloat(a.score) } );



  previousData = formatted;
  return formatted;
}

redditVis();