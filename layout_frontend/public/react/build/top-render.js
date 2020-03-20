var top_index = 0;

TopUI.Render = function () {
    Render.prototype = Object.create(TopUI.prototype);
    Render.prototype.constructor = Render;

    Render.topWidgets = {
        'top-absolutelayout': TopAbsolutelayoutUI,
        // 'top-accordionlayout': TopAccordionlayout,
        // 'top-accordiontab': TopAccordionTab,
        'top-alarmbadge': TopAlarmbadgeUI,
        'top-breadcrumb': TopBreadcrumbUI,
        'top-button': TopButtonUI,
        'top-chart': TopChartUI,
        'top-checkbox': TopCheckboxUI,
        'top-chip': TopChipUI,
        'top-codeeditor': TopCodeeditorUI,
        'top-colorpicker': TopColorpickerUI,
        // 'top-contextmenu': TopContextmenu,
        // 'top-dashboard': TopDashboard,
        'top-datepicker': TopDatepickerUI,
        // 'top-dialog': TopDialog,
        // 'top-docklayout': TopDocklayout,
        'top-flowlayout': TopFlowlayoutUI,
        // 'top-foldinglayout': TopFoldinglayout,
        // 'top-form': TopForm,
        // 'top-framelayout': TopFramelayout,
        // 'top-gridlayout': TopGridlayout,
        'top-htmleditor': TopHtmleditorUI,
        'top-icon': TopIconUI,
        'top-imagebutton': TopImagebuttonUI,
        'top-imageslider': TopImagesliderUI,
        'top-imageview': TopImageviewUI,
        'top-layout': TopLayoutUI,
        'top-linearlayout': TopLinearlayoutUI,
        'top-listview': TopListviewUI,
        'top-menu': TopMenuUI,
        // 'top-notification': TopNotification,
        // 'top-page': TopPage,
        'top-pagination': TopPaginationUI,
        // 'top-panel': TopPanel,
        // 'top-popover': TopPopover,
        'top-progressbar': TopProgressbarUI,
        'top-radiobutton': TopRadiobuttonUI,
        // 'top-scrolllayout': TopScrolllayout,
        'top-selectbox': TopSelectboxUI,
        // 'top-sidemenu': TopSidemenu,
        'top-slider': TopSliderUI,
        'top-stepper': TopStepperUI,
        'top-spinner': TopSpinnerUI,
        'top-splitterlayout': TopSplitterlayoutUI,
        'top-switch': TopSwitchUI,
        'top-tablayout': TopTablayoutUI,
        'top-tableview': TopTableviewUI,
        'top-textarea': TopTextareaUI,
        'top-textfield': TopTextfieldUI,
        'top-textview': TopTextviewUI,
        // 'top-timer': TopTimer,
        'top-toggle': TopToggleUI,
        'top-treeview': TopTreeviewUI,
        'top-videoview': TopVideoviewUI,
        'top-webview': TopWebviewUI,
        'top-widgetitem': TopWidgetitemUI,
        'top-rowitem': TopRowitemUI,
        'top-columnitem': TopColumnitemUI,
        'top-tableheader': TopTableheaderUI,
        'top-headerrow': TopHeaderrowUI,
        'top-headercolumn': TopHeadercolumnUI
    };

    function Render() {}

    Render.renderDom = function (root, callback) {
        var _this = this;
        var navData = window.performance.getEntriesByType("navigation");
        TopUI.Util.__gatherPropertyAliases();
        if (navData.length > 0 && navData[0].loadEventEnd > 0) {
            ReactDOM.render(this.createNode(root), root);
            if (typeof callback === 'function') callback();
        } else {
            $(window).bind('load', function () {
                ReactDOM.render(_this.createNode(root), root);
                if (typeof callback === 'function') callback();
            });
        }
    };

    Render.createNode = function (node) {
        var attrs = Array.prototype.slice.call(node.attributes);
        var props = {
            key: node.tagName + '-' + top_index
        };
        top_index++;

        attrs.map(function (attr) {
            return props[TopUI.Util.toCamelCase(attr.name)] = attr.value;
        });

        if (!props.id) {
            props.id = TopUI.Util.guid();
        }

        if (!!props.class) {
            props.className = props.class;
            delete props.class;
        }

        var children = [];
        for (var i = 0; i < node.children.length; i++) {
            var child = this.createNode(node.children[i]);
            children.push(child);
        }
        props.children = children;

        var Comp = TopUI.Render.topWidgets[node.tagName.toLowerCase()];
        if (!Comp) Comp = TopLayoutEditor;
        return React.createElement(Comp, props, children);
    };

    return Render;
}();