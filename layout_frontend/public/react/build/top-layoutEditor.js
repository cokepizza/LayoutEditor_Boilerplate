var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopLayoutEditor = function (_React$Component) {
    _inherits(TopLayoutEditor, _React$Component);

    function TopLayoutEditor(props) {
        _classCallCheck(this, TopLayoutEditor);

        var _this = _possibleConstructorReturn(this, (TopLayoutEditor.__proto__ || Object.getPrototypeOf(TopLayoutEditor)).call(this, props));

        _this.state = {};
        for (var key in _this.props) {
            _this.state[key] = _this.props[key];
        }
        TopUI.Render.LayoutEditorDom = _this;
        return _this;
    }

    _createClass(TopLayoutEditor, [{
        key: 'getElement',
        value: function getElement() {
            return ReactDOM.findDOMNode(this).parentNode;
        }
    }, {
        key: 'render',
        value: function render() {
            return this.state.children;
        }
    }, {
        key: 'addWidget',
        value: function addWidget(widget) {
            this.setState(function (state, props) {
                var changedchilds = [];
                Object.assign(changedchilds, state.children);
                if (widget.reactElement) {
                    changedchilds.push(widget.reactElement);
                } else {
                    changedchilds.push(React.createElement(TopUI.Render.topWidgets[widget.template.props.tagName], widget.template.state, widget.template.state.children));
                }
                return {
                    children: changedchilds
                };
            });
            if (!widget.template) widget.template = TopUI.Dom.__selectImpl(this.getElement().querySelector(widget.reactElement.props.tagName + '#' + widget.reactElement.props.id));
        }
    }]);

    return TopLayoutEditor;
}(React.Component);