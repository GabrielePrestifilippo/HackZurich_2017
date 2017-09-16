/**
 * Created by Adrian on 3/11/2017.
 */
$(".meter > span").each(function() {
    $(this)
        .data("origWidth", $(this).width())
        .width(0)
        .animate({
            width: $(this).data("origWidth") // or + "%" if fluid
        }, 1200);
});