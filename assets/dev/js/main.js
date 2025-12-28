/*
 * Main
 * Some functions don't use exceptions to prevent script failure, although this is not always correct.
 */
$(document).ready(function () {
 
    try {
        var postHeaderContainers = $(".post-body-header");
        if (postHeaderContainers && postHeaderContainers.length && postHeaderContainers.length > 0) {
            postHeaderContainers.each(function (index) {
                var postHeaderContainer = $(this);
                var postHeaderDateContainer = postHeaderContainer.find(".post-header-date");
                var postHeaderDateEditedContainer = postHeaderContainer.find(".post-header-date-edited");
                addTimeAgoBlockAfterTime(postHeaderDateContainer, ".post-datetime-text");
                addTimeAgoBlockAfterTime(postHeaderDateEditedContainer, ".post-datetime-text-edited");
            });
        }

    } catch (e) {
        logError(e);
    }

    try {
        var isTouch = ('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
        if (!isTouch) {
            $('[data-toggle="tooltip"]').tooltip();
        }
    } catch (e) {
        //TODO check is object
        logError(e);
    }

    window.Prism = window.Prism || {};
    window.Prism.manual = true;

    var isDebug = false;

    setCurrentYearInBlock("#copyright-date");

    var windowObject = $(window);
    var windowStartWidth = windowObject.width();

    var smallScreenWidth = 768;

    var navigationBlockClass = ".navigation-pages";
    var navigationBlockClassForVertical = "btn-group-vertical";
    var navigationBlock = $(navigationBlockClass);

    if (navigationBlock.length) {
        setVerticalNavigationOnSmallScreen(navigationBlock, navigationBlockClassForVertical, windowStartWidth, smallScreenWidth, isDebug);
    }

    windowObject.resize(function () {

        var windowWidth = windowObject.width();
        if (isDebug) {
            logInfo("Window resize, width: " + windowWidth);
        }

        //There may be a bug when the panels collapse when switching to the tab
        //showOrHideSectionsOnSmallScreen(windowWidth, smallScreenWidth, collapseBlocks, isDebug);

        if (navigationBlock.length) {
            setVerticalNavigationOnSmallScreen(navigationBlock, navigationBlockClassForVertical, windowWidth, smallScreenWidth, isDebug);
        }
    });

    var buttonUpSelector = "#page-up-trigger";
    var buttonUp = $(buttonUpSelector);
    if (!buttonUp || !buttonUp.length) {
        logError("Not found back to top button with selector: " + buttonUpSelector);
    } else {
        buttonUp.on('click', function (e) {
            scrollTop();
        });

        var scrollDistance = 600;
        $(window).on('scroll', function () {
            showBackToTopButton(windowObject, buttonUp, scrollDistance);
        });
        showBackToTopButton(windowObject, buttonUp, scrollDistance);
    }

    var mobileButtonUpSelector = "#mobile-page-up-trigger";
    var mobileButtonUp = $(mobileButtonUpSelector);
    if (!mobileButtonUp || !mobileButtonUp.length) {
        logError("Not found mobile back to top button with selector: " + mobileButtonUpSelector);
    } else {
        mobileButtonUp.on('click', function (e) {
            scrollTop();
        });
    }
})

function addTimeAgoBlockAfterTime(timeContainerBlock, timeTextContainerId) {
    if (!timeContainerBlock || !timeContainerBlock.length || timeContainerBlock.length < 1) {
        return;
    }
    var timeTextContainer = timeContainerBlock.find(timeTextContainerId);
    if (timeTextContainer && timeTextContainer.length === 1) {
        var dateIsoString = timeTextContainer.attr('data-iso-time');
        var timeAgo = timeago.format(dateIsoString, "ru");
        if (timeAgo) {
            //class='d-block d-xs-inline'
            var timeAgoBlock = $("<span></span>").text(" (" + timeAgo + ")");
            timeAgoBlock.insertAfter(timeTextContainer);
        }
    }
}

/*
 * Utilities
 */

function logInfo(message) {
    console.log(message);
}

function logError(errorMessage) {
    console.error(errorMessage);
}

function formatAnyValueInfo(value) {
    var info = "type: " + typeof (value) + ", value: " + value;
    return info;
}

function validateNotEmptyString(value, valueDescription) {
    if (!value || !(typeof value === 'string') || !value.length) {
        logError(valueDescription + " must be a not empty string, but received " + formatAnyValueInfo(value));
        return false;
    }

    return true;
}

function validatePositiveNumber(value, valueDescription) {
    if (!value || !(typeof value === 'number') || value < 0) {
        logError(valueDescription + " must be a positive number, but received " + formatAnyValueInfo(value));
        return false;
    }

    return true;
}

function validateJQueryObject(value, valueDescription) {
    if (!value || !(value instanceof jQuery)) {
        logError(valueDescription + " must be a JQuery object, but received " + formatAnyValueInfo(value));
        return false;
    }

    return true;
}

/*
 * Scroll top
 */

function scrollTop() {
    //todo cache?
    $('html,body').animate({
        scrollTop: 0
    }, 250);
}

function showBackToTopButton(windowObject, buttonUp, scrollDistance) {

    if (!validateJQueryObject(windowObject, "Window object for showing button up")) {
        return;
    }

    if (!validatePositiveNumber(scrollDistance, "Scroll distance for top button")) {
        return;
    }

    if (!validateJQueryObject(buttonUp, "Button for scroll to top")) {
        return;
    }

    if (!buttonUp.is(":visible") || buttonUp.is(':animated')) {
        return;
    }

    var scrollTop = windowObject.scrollTop();
    var currentOpacityStringValue = buttonUp.css('opacity');
    //unsafe parsing
    var currentOpacityValue = parseFloat(currentOpacityStringValue);

    //TODO extract settings
    var animationType = 'fast'; //200ms
    var opacityForHide = 0;
    var opacityForShow = 0.7;

    var buttonOpacity = opacityForHide;

    if (scrollTop > scrollDistance) {
        if (currentOpacityValue >= opacityForShow) {
            return;
        }
        buttonOpacity = opacityForShow;
    } else {
        if (currentOpacityValue <= opacityForHide) {
            return;
        }
        buttonOpacity = opacityForHide;
    }
    buttonUp.fadeTo(animationType, buttonOpacity);
}
/*
 * Adaptation to small screens
 */

function setVerticalNavigationOnSmallScreen(navigationBlock, navBlockClassForVertical, screenWidth, smallScreenWidth, isDebug) {

    if (!validateJQueryObject(navigationBlock, "Block for vertical navigation")) {
        return;
    }

    if (navigationBlock.length === 0) {
        logError("Navigation block received, but node collection is empty");
        return;
    }

    if (!validateNotEmptyString(navBlockClassForVertical, "Navigation block class for toggle vertical")) {
        return;
    }

    if (!validatePositiveNumber(smallScreenWidth, "Small screen width for vertical navigation")) {
        return;
    }

    if (!validatePositiveNumber(screenWidth, "Screen width for vertical navigation")) {
        return;
    }

    var navsCount = navigationBlock.length;

    if (screenWidth <= smallScreenWidth) {
        if (navsCount && !navigationBlock.hasClass(navBlockClassForVertical)) {
            navigationBlock.addClass(navBlockClassForVertical);
            if (isDebug) {
                logInfo("Window screen is small. Add class for vertical orientation: " + navBlockClassForVertical + " on " + navsCount + " blocks");
            }
        }
    } else {
        if (navigationBlock.hasClass(navBlockClassForVertical)) {
            navigationBlock.removeClass(navBlockClassForVertical);
            if (isDebug) {
                logInfo("Remove class for vertical orientation: " + navBlockClassForVertical);
            }
        }

    }
}

//TODO validate input
function showCollapseBlocks(isCollapse, blocksCollection) {
    var collapseValue = isCollapse ? "show" : "hide";
    var blockCount = blocksCollection.length;
    if (blockCount) {
        blocksCollection.each(function (index) {
            try {
                $(this).collapse(collapseValue);
            } catch (error) {
                logError("Can't change collapse block. " + error.message);
            }
        });
    }
}

/*
 * Some usability fixes
 */

function setCurrentYearInBlock(yearBlockSelector) {

    if (!validateNotEmptyString(yearBlockSelector, "Current year block selector")) {
        return;
    }

    var currentYear = new Date().getFullYear();
    var yearContainer = $(yearBlockSelector);
    if (!yearContainer || !yearContainer.length) {
        logError("Not found block for current year with selector: " + yearBlockSelector);
        return;
    }
    yearContainer.text(currentYear);
}

function setOpenExternalLinksInNewWindow() {
    $("a[href^=http]:not(:has(img))").each(function () {
        if (location && location.hostname) {
            if (this.href.indexOf(location.hostname) === -1) {
                $(this).attr({
                    target: "_blank",
                    rel: 'noopener'
                });

                $(this).after("<span class='external-link-icon align-middle'></span>");
            }
        }

    })
}