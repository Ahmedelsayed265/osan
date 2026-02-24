$(document).ready(function () {
  var loading = false;
  var currentPage = 1;
  var $loadMoreButton = $("#load-more-button");
  var maxPages = parseInt($loadMoreButton.data("pages")) || 1;

  if (currentPage >= maxPages) {
    $loadMoreButton.hide();
  }

  $loadMoreButton.on("click", function () {
    if (loading || currentPage >= maxPages) return;

    loading = true;
    currentPage++;

    $loadMoreButton.find(".btn-loader").removeClass("d-none");
    $loadMoreButton.find(".btn-label").addClass("d-none");

    var url = new URL(window.location.href);
    url.searchParams.set("page", currentPage);

    $.ajax({
      url: url.toString(),
      method: "GET",
      success: function (htmlStr) {
        var html = $.parseHTML(htmlStr);
        var $newProducts = $("#products-list", html).html();

        $("#products-list").append($newProducts);

        loading = false;
        $loadMoreButton.find(".btn-loader").addClass("d-none");
        $loadMoreButton.find(".btn-label").removeClass("d-none");

        if (currentPage >= maxPages) {
          $loadMoreButton.hide();
        }

        // If any formatting needs re-applying
        if (typeof formatPrices === "function") formatPrices();
      },
      error: function () {
        loading = false;
        $loadMoreButton.find(".btn-loader").addClass("d-none");
        $loadMoreButton.find(".btn-label").removeClass("d-none");
      },
    });
  });
});
