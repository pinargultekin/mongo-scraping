//Scrape Articles for client to check
$(document).on("click", "#scrape-button", function() {
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
  window.location.replace("/scrape");
});

//Delete an article
$(document).on("click", ".delete-article", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "DELETE",
      url: "/saved/" + thisId
    })
    .then(function(data) {
      // Log the response
      console.log(data);
      location.reload();
    });
});

//Save an article
$(document).on("click", ".save-article", function() {
  var thisId = $(this).attr("data-id");
  $(this).hide();
  var data = {}
  data.title =  $("#title-" + thisId).text();
  data.link = $("#link-" + thisId).text();
  data.summary = $("#summary-" + thisId).text();
  $.ajax({
    method: "POST",
    dataType: "json",
    url: "/api/saved",
    data: data
  })
});

//Go to the notes page for a particular article
$(document).on("click", ".note-comment", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
  window.location.replace("/articles/" + thisId);
});

  // Submit a note
  $(document).on("click", "#submit-note", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
      // Run a POST request to save the note
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#title-note").val(),
        // Value taken from note textarea
        body: $("#note-description").val()
      }
    })
      .then(function(data) {
        // Log the response
        console.log(data);
        window.location.replace("/articles/" + data._id);
      });  
      // Also, remove the values entered in the input and textarea for note entry
      $("#title-note").val("");
      $("#note-description").val("");
  });
  
  //delete a note
  $(document).on("click", ".delete-note", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "DELETE",
      url: "/articles/" + thisId
    })
    .then(function(data) {
      // Log the response
      console.log(data);
      location.reload();
    }); 
});
